// Copyright (c) Microsoft. All rights reserved.

using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using System;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using Microsoft.SemanticKernel.ChatCompletion;
using CopilotChat.WebApi.Plugins.NativePlugins.StyleGuide.Prompts;
using Newtonsoft.Json.Linq;
using DocumentFormat.OpenXml.Wordprocessing;
using System.ComponentModel;
using Microsoft.Azure.Cosmos;
using System.Linq;
using Newtonsoft.Json;
using CopilotChat.WebApi.Plugins.NativePlugins.StyleGuide.Pipeline;
using Microsoft.Extensions.Configuration;

namespace StyleGuide;

public interface ICosmosDBService
{
    Task<string?> SearchAsync(
        string sqlQuery,
        CancellationToken cancellationToken = default);
}


public class CosmosDBService(CosmosClient cosmosClient, IConfiguration config) : ICosmosDBService
{
    public async Task<string?> SearchAsync(string query, CancellationToken cancellationToken = default)
    {
        List<dynamic> allResults = new List<dynamic>();



        Database database = cosmosClient.GetDatabase(config.GetSection("StyleGuide").GetSection("CosmosDB_Database").Value);
        Microsoft.Azure.Cosmos.Container container = database.GetContainer(config.GetSection("StyleGuide").GetSection("CosmosDB_Container").Value);
        QueryDefinition queryDefinition = new QueryDefinition(query);
        FeedIterator<dynamic> queryResultSetIterator = container.GetItemQueryIterator<dynamic>(queryDefinition);


        while (queryResultSetIterator.HasMoreResults)
        {
            FeedResponse<dynamic> currentResultSet = await queryResultSetIterator.ReadNextAsync();

            allResults = allResults.Concat(currentResultSet).ToList();

        }

        return JsonConvert.SerializeObject(allResults, Formatting.Indented); ;
    }
}


public class StyleGuideResultsPlugin(Kernel kernel, ICosmosDBService cosmosDBService)
{

    private Kernel _kernel = kernel;
    private ICosmosDBService _cosmosDBService = cosmosDBService;


    [KernelFunction("SearchStyleGuide"), Description("Get answers about style guide, like rules, chunks,text, files processed, suggested text.")]
    public async Task<string?> SearchAsync(string userQuestion, CancellationToken cancellationToken = default)
    {
        ////1. Get translate the user question to a CosmosDB SQL query from AOAI
        ////2. Call the CosmosDB service to get the results
        ///


        KernelFunction[] kernelFunctionsToPipe = await this.BuildKernelFunctions().ConfigureAwait(false);

        KernelFunction pipeline = SKPipeLineManager.Pipe(kernelFunctionsToPipe, "pipeline");
        KernelArguments pipeArgs = new()
        {
            ["userQuestion"] = userQuestion

        };
        FunctionResult result = await pipeline.InvokeAsync(kernel, pipeArgs).ConfigureAwait(false);


        //return results;
        return result.ToString();
    }


    private async Task<KernelFunction[]> BuildKernelFunctions()
    {
        //Get SQL query from user question
        KernelFunction kernelFunctionGetNLToSQl = KernelFunctionFactory.CreateFromMethod(async (string userQuestion) =>
        {
            return await this.GetNLToSQl(userQuestion).ConfigureAwait(false);
        });


        //Get the answer from CosmosDB for the SQL query
        KernelFunction kernelFunctionGetQueyResults = KernelFunctionFactory.CreateFromMethod(async (string sqlQuery) =>
        {
            return await this.GetQueryResults(sqlQuery).ConfigureAwait(false);
        });


        //Build the Pipeline

        IList<KernelFunction> functions = new List<KernelFunction>();
        functions.Add(kernelFunctionGetNLToSQl);
        functions.Add(kernelFunctionGetQueyResults);


        return functions.ToArray();
    }




    private async Task<ChatHistory> BuildChatHistory(Kernel kernel, string userQuestion)
    {
        const string TABLE_ARGUMENT = "{{tableName}}";

        var promptTemplateFactory = new KernelPromptTemplateFactory();


        KernelArguments arguments = new()
        {
            ["tableName"] = "results"
        };

        //Add system prompt
        string systemMessage = await promptTemplateFactory.Create(new PromptTemplateConfig(PromptManager.SYSTEM_PROMPT_TEMPLATE.Replace(TABLE_ARGUMENT, "results"))).RenderAsync(kernel, arguments);

        var chatHistory = new ChatHistory(systemMessage);

        //Add few shot examples
        JArray fewShotExamples = JArray.Parse(PromptManager.SYSTEM_PROMPT_FEW_SHOT_EXAMPLES);
        if (fewShotExamples != null)
        {
            foreach (var example in fewShotExamples)
            {
                chatHistory.AddUserMessage(example["user"].ToString());
                chatHistory.AddAssistantMessage(example["assistant"].ToString());
            }
        }

        // Add user question
        chatHistory.AddUserMessage(userQuestion);
        return chatHistory;
    }

    private OpenAIPromptExecutionSettings GetChatSettings()
    {
        var settings = new OpenAIPromptExecutionSettings()
        {
            MaxTokens = 3000,// Convert.ToInt32(Environment.GetEnvironmentVariable("AZURE_OPNEAI_MAX_TOKENS")),
            Temperature = 0,
            TopP = 1,

        };


        return settings;
    }



    #region Kernel functions for pipelining
    private async Task<string> GetQueryResults(string sqlQuery)
    {
        string results = await this._cosmosDBService.SearchAsync(sqlQuery).ConfigureAwait(false);
        return results;

    }

    private async Task<string> GetNLToSQl(string userQuestion)
    {
        OpenAIPromptExecutionSettings chatSettings = this.GetChatSettings();

        var chatCompletion = this._kernel.GetRequiredService<IChatCompletionService>();


        ChatMessageContent answer = null;
        try
        {
            var chatHistory = await this.BuildChatHistory(this._kernel, userQuestion).ConfigureAwait(false);

            answer = await chatCompletion.GetChatMessageContentAsync(chatHistory, chatSettings, this._kernel).ConfigureAwait(false);



        }
        catch (Exception ex)
        {

        }
        return answer.ToString();
    }
    #endregion

}



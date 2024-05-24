// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Net.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.KernelMemory;
using Microsoft.SemanticKernel;

namespace CopilotChat.WebApi.Services;

/// <summary>
/// Extension methods for registering Semantic Kernel related services.
/// </summary>
public sealed class SemanticKernelProvider
{
    private readonly IKernelBuilder _builderChat;
    private static AzureOpenAIConfig? _azureAIOptions;
    private static HttpClient? _httpClient;

    public SemanticKernelProvider(IServiceProvider serviceProvider, IConfiguration configuration, IHttpClientFactory httpClientFactory, string? deploymentName)
    {
        this._builderChat = InitializeCompletionKernel(serviceProvider, configuration, httpClientFactory, deploymentName);
    }

    /// <summary>
    /// Produce semantic-kernel with only completion services for chat.
    /// </summary>
    public Kernel GetCompletionKernel(string? deploymentName) =>
        this._builderChat.AddAzureOpenAIChatCompletion((deploymentName != null) ? deploymentName : _azureAIOptions.Deployment, // User can switch AI deployment name
                    _azureAIOptions.Endpoint,
                    _azureAIOptions.APIKey,
                    serviceId: deploymentName + "_service", // uniquely ID this service for later lookup
                    httpClient: _httpClient).Build();

    private static IKernelBuilder InitializeCompletionKernel(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        string? deploymentName)
    {
        var builder = Kernel.CreateBuilder();

        builder.Services.AddLogging();

        _httpClient = httpClientFactory.CreateClient();

        var memoryOptions = serviceProvider.GetRequiredService<IOptions<KernelMemoryConfig>>().Value;

        switch (memoryOptions.TextGeneratorType)
        {
            case string x when x.Equals("AzureOpenAI", StringComparison.OrdinalIgnoreCase):
            case string y when y.Equals("AzureOpenAIText", StringComparison.OrdinalIgnoreCase):
                _azureAIOptions = memoryOptions.GetServiceConfig<AzureOpenAIConfig>(configuration, "AzureOpenAIText");
#pragma warning disable CA2000 // No need to dispose of HttpClient instances from IHttpClientFactory
                // gpt-35-turbro service
                builder.AddAzureOpenAIChatCompletion((deploymentName != null) ? deploymentName : _azureAIOptions.Deployment, // User can switch AI deployment name
                    _azureAIOptions.Endpoint,
                    _azureAIOptions.APIKey,
                    serviceId: "gpt-35-turbo", // uniquely ID this service for later lookup
                    httpClient: _httpClient);
                break;

            case string x when x.Equals("OpenAI", StringComparison.OrdinalIgnoreCase):
                var openAIOptions = memoryOptions.GetServiceConfig<OpenAIConfig>(configuration, "OpenAI");
                builder.AddOpenAIChatCompletion(
                    openAIOptions.TextModel,
                    openAIOptions.APIKey,
                    httpClient: httpClientFactory.CreateClient());
#pragma warning restore CA2000
                break;

            default:
                throw new ArgumentException($"Invalid {nameof(memoryOptions.TextGeneratorType)} value in 'KernelMemory' settings.");
        }

        return builder;
    }
}

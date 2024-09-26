<!-- omit in toc -->
# Style Guide Plugin
This is a plugin to chat against the style guide parser generated data.

Table of Contents
=================

- [Table of Contents](#table-of-contents)
  - [Pre-requisites](#pre-requisites)
  - [Data source Structure](#data-source-structure)
  - [Functionality](#functionality)
  - [Style Guide Plugin Folder  structure](#style-guide-plugin-folder--structure)
  - [Configuration needed to enable the plugin](#configuration-needed-to-enable-the-plugin)
    - [App Settings in the WebAPI](#app-settings-in-the-webapi)
  - [How to run](#how-to-run)
    - [1. Add the plugin to the solution](#1-add-the-plugin-to-the-solution)
    - [2. Run locally](#2-run-locally)


## Pre-requisites
1. Azure Cosmos DB
    1. **Note:** The Cosmos DB should have a container with the partition key as `/fileName`
2. Azure GPT4-o model deployed
2. Data source with the structure as mentioned in the [Data source Structure](#data-source-structure) already in CosmosDB


## Data source Structure

Below is generated data that has details about the original text, the transformed text, the style guide rules applied and others. Below is the sample structure of the data that this plugin can chat with.

   
    ```json
    {
    "id": "05b8d2f5-db06-4986-989d-fb96d9aa4dd7",
    "createdOn": "2024-02-01T21:31:05.7851616Z",
    "fileName": "SOME FILE.docx",
    "numberOfChunks": 1,
    "chunks":[
        {
            "chunkId": "e501e8c8-02a8-45c7-9bad-e6efc46d370e",
            "chunkIndex": 1,
            "originalText": "",
            "finalSuggestedText": "",
            "details": [
                {
                    "originalText": "",
                    "suggestedText": "",
                    "ruleCount": 1,
                    "rulesApplied": [
                        {
                            "url": "https://testwebsite/style-guide/capitalization",
                            "title": "Capitalization",
                            "rules": [
                                {
                                    "rule": "Use sentence case capitalization"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
    }
    ```

## Functionality
Once the target text is formatted as per the style guide rules, you can chat about it here. Some of the sample questions that you can ask - 


*1. What are the style guide rules applied on the file <file name>?*

*2. How many rules were applied on the file <file name>?*

*3. Describe the differences between originalText suggestedText and the rules applied to chunk 1 for the file <file name>?*



## Style Guide Plugin Folder  structure

The Style guide folder is under "NativePlugins" folder. The structure is as below

| Folder/File Name | Description |
|--------------|----------|
| StyleGuide | Folder containing the Style Guide Plugin |   
| - Prompts | Folder containing the prompts for the Style Guide Plugin |
| - - PromptManager.cs | Struct containing the prompts|
| - Pipeline | Folder cotaining the code for Semantic Kernel Pipelining |
| - - SKPipeLineManager.cs | Class containing the code for pipelining |
| - StyleGuideResultsPlugin.cs | Class containing the code for the Style Guide Plugin |
| - README | Readme file for the Style Guide Plugin |


## Configuration needed to enable the plugin
### App Settings in the WebAPI

1. Update the WebAPI `appsettings.json` file with a new section as shown below
    ```json
    "StyleGuide": {    
        "CosmosDB_Endpoint": "ENTER COSMOS DB ENDOINT",
        "CosmosDB_Key": "ENTER COSMOS DB KEY",
        "CosmosDB_Database": "ENTER COSMOS DB DATABASE NAME",
        "CosmosDB_Container": "ENTER COSMOS DB CONTAINER NAME",
        "StyleGuideStorage": "ENTER THE AZURE STORAGE NAME THAT HAS THE STYLE GUIDE CONTENT",
        "Input_Container": "input"
    }
    ```


2. In the WebAPI `appSettings.json` file, uncomment the line ` "NativePluginsDirectory": "./Plugins/NativePlugins"`


## How to run

### 1. Add the plugin to the solution
1. Make sure all the [Pre-requisites](#pre-requisites) are met.
2. Make sure the all the code for the plugin is inside the NativePlugins folder. 
3. Open the solution in Visual Studio
4. Add the [Configuration needed to enable the plugin](#configuration-needed-to-enable-the-plugin) to the `appsettings.json` file of the WebApi project.
5. Register the interfaces and classes for DI in the file `SemanticKernelExtensions.cs` in the `WebAPI\Extensions` folder.
6. Add configuration settings, if any, in the file `SemanticKernelExtensions.cs` in the `WebAPI\Extensions` folder.

### 2. Run locally

1. Go to the solution folder in the terminal
2. Go the `Scripts` sub folder 
3. Run the PowerShell script `Config.ps1` to configure the Azure OpenAI connections. Below is the command
3. ```powershell
    .\Config.ps1 -AIService AzureOpenAI -APIKey ENTER_API_KEY -Endpoint ENTER_AZURE_OPENAI_ENDPOINT -CompletionModel ENTER_GPT4-O_DEPLOYMENT_NAME -EmbeddingModel ENTER_EMBEDDING_MODEL_DEPLOYMENT_NAME
    ```
4. From Visual Studio, set the WebAPI project as the startup project and run the solution. Copy the Url of the WebAPI
5. In the solution folder, go to `WebApp` folder and create a `.env` file. Add the below content to the file
    ```
    REACT_APP_API_URL=ENTER_WEB_API_URL
    ```
6. Go to `Scripts` folder and run the below command to start the React App
    ```
    .\Start-FrontEnd.ps1
    ```

At this point you should have the WebAPI and the React App running. You can now navigate to the React App and start using the plugin by asking the [questions above](#Functionality).
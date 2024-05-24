// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Threading.Tasks;
using CopilotChat.WebApi.Auth;
using CopilotChat.WebApi.Hubs;
using CopilotChat.WebApi.Models.Response;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Options;
using CopilotChat.WebApi.Plugins.Chat;
using CopilotChat.WebApi.Services;
using CopilotChat.WebApi.Storage;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.KernelMemory;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Plugins.Core;

namespace CopilotChat.WebApi.Extensions;

/// <summary>
/// Extension methods for registering Semantic Kernel related services.
/// </summary>
internal static class SemanticKernelExtensions
{
    public enum SemanticProvider
    {
        gpt35turbo = 0,
        gpt4 = 1
    }

    /// <summary>
    /// Delegate to register functions with a Semantic Kernel
    /// </summary>
    public delegate Task RegisterFunctionsWithKernel(IServiceProvider sp, Kernel kernel);

    /// <summary>
    /// Delegate for any complimentary setup of the kernel, i.e., registering custom plugins, etc.
    /// See webapi/README.md#Add-Custom-Setup-to-Chat-Copilot's-Kernel for more details.
    /// </summary>
    public delegate Task KernelSetupHook(IServiceProvider sp, Kernel kernel);

    public delegate Task<UserSettings?> UserSettingsDelegate(IServiceProvider sp);

    /// <summary>
    /// Add Semantic Kernel services
    /// </summary>
    public static WebApplicationBuilder AddSemanticKernelServices(this WebApplicationBuilder builder)
    {
        builder.InitializeKernelProvider(null);

        // Semantic Kernel
        builder.Services.AddScoped<Kernel>(
            (sp) =>
            {
                var provider = sp.GetRequiredService<SemanticKernelProvider>();

                string? deploymentName = null;
                UserSettings? settings = sp.GetService<UserSettingsDelegate>()?.Invoke(sp).Result;
                if (settings != null)
                {
                    if ((bool)settings.DeploymentGPT35)
                    {
                        deploymentName = "gpt-35-turbo";
                    }
                    else if ((bool)settings.DeploymentGPT4)
                    {
                        deploymentName = "gpt-4";
                    }
                }

                deploymentName = null; // For now, keep null until switcher tested fully
                var kernel = provider.GetCompletionKernel(deploymentName);

                sp.GetRequiredService<RegisterFunctionsWithKernel>()(sp, kernel);

                // If KernelSetupHook is not null, invoke custom kernel setup.
                sp.GetService<KernelSetupHook>()?.Invoke(sp, kernel);
                return kernel;
            });

        // Azure Content Safety
        builder.Services.AddContentSafety();

        // Register plugins
        builder.Services.AddScoped<RegisterFunctionsWithKernel>(sp => RegisterChatCopilotFunctionsAsync);

        // Add any additional setup needed for the kernel.
        // Uncomment the following line and pass in a custom hook for any complimentary setup of the kernel.
        builder.Services.AddKernelSetupHook(RegisterPluginsAsync);

        // Service to retrieve user settings
        builder.Services.AddScoped<UserSettingsDelegate>(sp => RetrieveUserSettings);

        return builder;
    }

    /// <summary>
    /// Add embedding model
    /// </summary>
    public static WebApplicationBuilder AddBotConfig(this WebApplicationBuilder builder)
    {
        builder.Services.AddScoped(sp => sp.WithBotConfig(builder.Configuration));

        return builder;
    }

    /// <summary>
    /// Register custom hook for any complimentary setup of the kernel.
    /// </summary>
    /// <param name="hook">The delegate to perform any additional setup of the kernel.</param>
    public static IServiceCollection AddKernelSetupHook(this IServiceCollection services, KernelSetupHook hook)
    {
        // Add the hook to the service collection
        services.AddScoped<KernelSetupHook>(sp => hook);
        return services;
    }

    /// <summary>
    /// Register the chat plugin with the kernel.
    /// </summary>
    public static Kernel RegisterChatPlugin(this Kernel kernel, IServiceProvider sp)
    {
        // Chat plugin
        kernel.ImportPluginFromObject(
            new ChatPlugin(
                kernel,
                memoryClient: sp.GetRequiredService<IKernelMemory>(),
                chatMessageRepository: sp.GetRequiredService<ChatMessageRepository>(),
                chatSessionRepository: sp.GetRequiredService<ChatSessionRepository>(),
                messageRelayHubContext: sp.GetRequiredService<IHubContext<MessageRelayHub>>(),
                promptOptions: sp.GetRequiredService<IOptions<PromptsOptions>>(),
                documentImportOptions: sp.GetRequiredService<IOptions<DocumentMemoryOptions>>(),
                contentSafety: sp.GetService<AzureContentSafety>(),
                logger: sp.GetRequiredService<ILogger<ChatPlugin>>()),
            nameof(ChatPlugin));

        return kernel;
    }

    public static void ReplaceKernelServices(this IServiceCollection services, string deploymentName)
    {
        var config = services.BuildServiceProvider().GetService<IConfiguration>()?.GetSection("AzureOpenAIText").Get(typeof(IConfiguration));
        if (config == null)
        {
            return;
        }

        //IConfiguration config = services.BuildServiceProvider().GetService<IConfiguration>();  //?.GetSection("AzureOpenAIText").Get<PluginConfig>();

        // Swap out the kernel provider service with this one to use a different Azure OpenAI Deployment Name updated by the user
        ServiceDescriptor descriptorProvider = ServiceDescriptor.Singleton(typeof(SemanticKernelProvider),
                                        sp => new SemanticKernelProvider(sp, (IConfiguration)config, sp.GetRequiredService<IHttpClientFactory>(), deploymentName));
        services.Replace(descriptorProvider);

        // Swap out the kernel service
        ServiceDescriptor descriptorKernel = ServiceDescriptor.Scoped(typeof(Kernel), sp =>
            {
                var provider = sp.GetRequiredService<SemanticKernelProvider>();
                var kernel = provider.GetCompletionKernel(deploymentName);

                sp.GetRequiredService<RegisterFunctionsWithKernel>()(sp, kernel);

                // If KernelSetupHook is not null, invoke custom kernel setup.
                sp.GetService<KernelSetupHook>()?.Invoke(sp, kernel);
                return kernel;
            });

        services.Replace(descriptorKernel);
    }

    private static void InitializeKernelProvider(this WebApplicationBuilder builder, string? deploymentName)
    {
        builder.Services.AddSingleton(sp => new SemanticKernelProvider(sp, builder.Configuration, sp.GetRequiredService<IHttpClientFactory>(), deploymentName));
        //builder.Services.AddTransient(sp => new SemanticKernelProvider(sp, builder.Configuration, sp.GetRequiredService<IHttpClientFactory>(), deploymentName));
        //builder.Services.AddKeyedSingleton<SemanticKernelProvider>("gpt-35-turbo", (sp, ConfigurationManager) => new SemanticKernelProvider(sp, builder.Configuration, sp.GetRequiredService<IHttpClientFactory>(), "gpt-35-turbo"));
        //builder.Services.AddKeyedSingleton<SemanticKernelProvider>("gpt-4", (sp, ConfigurationManager) => new SemanticKernelProvider(sp, builder.Configuration, sp.GetRequiredService<IHttpClientFactory>(), "gpt-4"));
    }

    private static async Task<UserSettings?> RetrieveUserSettings(IServiceProvider sp)
    {
        string userID = "";

        try
        {
            var auth = sp.GetService<IAuthInfo>();

            userID = auth.UserId;
        }
        catch (Exception)
        {
            userID = "c05c61eb-65e4-4223-915a-fe72b0c9ece1"; // Default user
        }

        UserSettingsRepository userSettingsRepo = sp.GetService<UserSettingsRepository>();
        IEnumerable<UserSettings> settings = await userSettingsRepo.FindSettingsByUserIdAsync(userID);

        foreach (var setting in settings)
        {
            return setting;
        }

        return null;
    }

    /// <summary>
    /// Register functions with the main kernel responsible for handling Chat Copilot requests.
    /// </summary>
    private static Task RegisterChatCopilotFunctionsAsync(IServiceProvider sp, Kernel kernel)
    {
        // Chat Copilot functions
        kernel.RegisterChatPlugin(sp);

        // Time plugin
        kernel.ImportPluginFromObject(new TimePlugin(), nameof(TimePlugin));

        return Task.CompletedTask;
    }

    /// <summary>
    /// Register plugins with a given kernel.
    /// </summary>
    private static Task RegisterPluginsAsync(IServiceProvider sp, Kernel kernel)
    {
        var logger = kernel.LoggerFactory.CreateLogger(nameof(Kernel));

        // Semantic plugins
        ServiceOptions options = sp.GetRequiredService<IOptions<ServiceOptions>>().Value;
        if (!string.IsNullOrWhiteSpace(options.SemanticPluginsDirectory))
        {
            foreach (string subDir in Directory.GetDirectories(options.SemanticPluginsDirectory))
            {
                try
                {
                    kernel.ImportPluginFromPromptDirectory(options.SemanticPluginsDirectory, Path.GetFileName(subDir)!);
                }
                catch (KernelException ex)
                {
                    logger.LogError("Could not load plugin from {Directory}: {Message}", subDir, ex.Message);
                }
            }
        }

        // Native plugins
        if (!string.IsNullOrWhiteSpace(options.NativePluginsDirectory))
        {
            // Loop through all the files in the directory that have the .cs extension
            var pluginFiles = Directory.GetFiles(options.NativePluginsDirectory, "*.cs");
            foreach (var file in pluginFiles)
            {
                // Parse the name of the class from the file name (assuming it matches)
                var className = Path.GetFileNameWithoutExtension(file);

                // Get the type of the class from the current assembly
                var assembly = Assembly.GetExecutingAssembly();
                var classType = assembly.GetTypes().FirstOrDefault(t => t.Name.Contains(className, StringComparison.CurrentCultureIgnoreCase));

                // If the type is found, create an instance of the class using the default constructor
                if (classType != null)
                {
                    try
                    {
                        var plugin = Activator.CreateInstance(classType);
                        kernel.ImportPluginFromObject(plugin!, classType.Name!);
                    }
                    catch (KernelException ex)
                    {
                        logger.LogError("Could not load plugin from file {File}: {Details}", file, ex.Message);
                    }
                }
                else
                {
                    logger.LogError("Class type not found. Make sure the class type matches exactly with the file name {FileName}", className);
                }
            }
        }

        return Task.CompletedTask;
    }

    /// <summary>
    /// Adds Azure Content Safety
    /// </summary>
    internal static void AddContentSafety(this IServiceCollection services)
    {
        IConfiguration configuration = services.BuildServiceProvider().GetRequiredService<IConfiguration>();
        var options = configuration.GetSection(ContentSafetyOptions.PropertyName).Get<ContentSafetyOptions>() ?? new ContentSafetyOptions { Enabled = false };
        services.AddSingleton<IContentSafetyService>(sp => new AzureContentSafety(options.Endpoint, options.Key));
    }

    /// <summary>
    /// Get the embedding model from the configuration.
    /// </summary>
    private static ChatArchiveEmbeddingConfig WithBotConfig(this IServiceProvider provider, IConfiguration configuration)
    {
        var memoryOptions = provider.GetRequiredService<IOptions<KernelMemoryConfig>>().Value;

        switch (memoryOptions.Retrieval.EmbeddingGeneratorType)
        {
            case string x when x.Equals("AzureOpenAI", StringComparison.OrdinalIgnoreCase):
            case string y when y.Equals("AzureOpenAIEmbedding", StringComparison.OrdinalIgnoreCase):
                var azureAIOptions = memoryOptions.GetServiceConfig<AzureOpenAIConfig>(configuration, "AzureOpenAIEmbedding");
                return
                    new ChatArchiveEmbeddingConfig
                    {
                        AIService = ChatArchiveEmbeddingConfig.AIServiceType.AzureOpenAIEmbedding,
                        DeploymentOrModelId = azureAIOptions.Deployment,
                    };

            case string x when x.Equals("OpenAI", StringComparison.OrdinalIgnoreCase):
                var openAIOptions = memoryOptions.GetServiceConfig<OpenAIConfig>(configuration, "OpenAI");
                return
                    new ChatArchiveEmbeddingConfig
                    {
                        AIService = ChatArchiveEmbeddingConfig.AIServiceType.OpenAI,
                        DeploymentOrModelId = openAIOptions.EmbeddingModel,
                    };

            default:
                throw new ArgumentException($"Invalid {nameof(memoryOptions.Retrieval.EmbeddingGeneratorType)} value in 'SemanticMemory' settings.");
        }
    }
}

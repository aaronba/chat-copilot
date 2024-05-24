namespace CopilotChat.WebApi.Options;

/// <summary>
/// Configuration options for Azure OpenAI Text service.
/// </summary>
public sealed class AzureOpenAITextOptions
{
    public const string PropertyName = "AzureOpenAIText";

    public string Auth { get; set; } = string.Empty;
    public string APIKey { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
    public string Deployment { get; set; } = string.Empty;
    public string APIType { get; set; } = string.Empty;
    public int MaxRetries { get; set; } = 0;
}

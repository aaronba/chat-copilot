using System.Text.Json.Serialization;

namespace CopilotChat.WebApi.Models.Request;

/// <summary>
/// Parameters for updating App Config.
/// </summary>
public class AppConfigParameters
{
    /// <summary>
    /// Force configuration reload
    /// </summary>
    [JsonPropertyName("force")]
    public bool force { get; set; }

    /// <summary>
    /// AI Deployment Model Name
    /// </summary>
    [JsonPropertyName("deploymentName")]
    public string? deploymentName { get; set; }
}

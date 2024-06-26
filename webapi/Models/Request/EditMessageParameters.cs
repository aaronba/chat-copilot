﻿using System.Text.Json.Serialization;

namespace CopilotChat.WebApi.Models.Request;

/// <summary>
/// Parameters for editing particular message.
/// </summary>
public class EditMessageParameters
{
    public enum UserFeedbackTypes
    {
        Unknown,
        Requested,
        Positive,
        Negative
    }

    /// <summary>
    /// Message ID
    /// </summary>
    [JsonPropertyName("id")]
    public string? id { get; set; }

    /// <summary>
    /// User Feedback
    /// </summary>
    [JsonPropertyName("userFeedback")]
    public UserFeedbackTypes? userFeedback { get; set; }
}

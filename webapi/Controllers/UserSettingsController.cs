﻿// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Threading.Tasks;
using CopilotChat.WebApi.Hubs;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Storage;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace CopilotChat.WebApi.Controllers;

/// <summary>
/// Controller for managing retrieving/updating user settings.
/// </summary>
[ApiController]
public class UserSettingsController : ControllerBase
{
    private readonly ILogger<UserSettingsController> _logger;
    private readonly UserSettingsRepository _userSettingsRepository;

    /// <summary>
    /// Initializes a new instance of the <see cref="UserSettingsController"/> class.
    /// </summary>
    /// <param name="logger">The logger.</param>
    /// <param name="userSettingsRepository">The user settings repository.</param>
    public UserSettingsController(
        ILogger<UserSettingsController> logger,
        UserSettingsRepository userSettingsRepository)
    {
        this._logger = logger;
        this._userSettingsRepository = userSettingsRepository;
    }

    /// <summary>
    /// Get all settings for a user.
    /// </summary>
    /// <param name="userId">The user id to retrieve settings for.</param>
    [HttpGet]
    [Route("settings/{userId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserSettingsAsync(Guid userId)
    {
        var settings = await this._userSettingsRepository.FindSettingsByUserIdAsync(userId.ToString());

        foreach (var setting in settings)
        {
            UserSettings us = new(setting.UserId, setting.DarkMode, setting.Planners, setting.Personas, setting.SimplifiedChatExperience,
            setting.AzureContentSafety, setting.AzureAISearch, setting.ExportChatSessions, setting.LiveChatSessionSharing,
            setting.FeedbackFromUser, setting.DeploymentGPT35, setting.DeploymentGPT4);
            return this.Ok(us);  // Only 1 record per user id
        }

        return this.NotFound("Did not find any user specific settings.");
    }

    /// <summary>
    /// Update user settings.
    /// </summary>
    /// <param name="msgParameters">Params to update settings.</param>
    [HttpPatch]
    [Route("settings/{userId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserSettingsAsync(
        [FromBody] EditUserSettingsParameters msgParameters,
        [FromRoute] Guid userId)
    {
        if (msgParameters.userId != null)
        {
            var settings = await this._userSettingsRepository.FindSettingsByUserIdAsync(userId.ToString());

            foreach (var setting in settings)
            {
                // Update existing settings record for this user
                setting!.DarkMode = msgParameters.darkMode;
                setting!.Planners = msgParameters.planners;
                setting!.Personas = msgParameters.personas;
                setting!.SimplifiedChatExperience = msgParameters.simplifiedChatExperience;
                setting!.AzureContentSafety = msgParameters.azureContentSafety;
                setting!.AzureAISearch = msgParameters.azureAISearch;
                setting!.ExportChatSessions = msgParameters.exportChatSessions;
                setting!.LiveChatSessionSharing = msgParameters.liveChatSessionSharing;
                setting!.FeedbackFromUser = msgParameters.feedbackFromUser;
                setting!.DeploymentGPT35 = msgParameters.deploymentGPT35;
                setting!.DeploymentGPT4 = msgParameters.deploymentGPT4;
                await this._userSettingsRepository.UpsertAsync(setting);

                return this.Ok(setting);
            }

            // Create a new settings record for this user 
            var newUserSettings = new UserSettings(msgParameters.userId, msgParameters.darkMode, msgParameters.planners, msgParameters.personas,
            msgParameters.simplifiedChatExperience, msgParameters.azureContentSafety, msgParameters.azureAISearch, msgParameters.exportChatSessions,
            msgParameters.liveChatSessionSharing, msgParameters.feedbackFromUser, msgParameters.deploymentGPT35, msgParameters.deploymentGPT4);
            await this._userSettingsRepository.CreateAsync(newUserSettings);

            return this.Ok(newUserSettings);
        }

        return this.NotFound("User ID was not sent to update user settings'.");
    }
}

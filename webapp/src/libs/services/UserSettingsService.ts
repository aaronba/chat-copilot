// Copyright (c) Microsoft. All rights reserved.

import { IUserSettings } from '../models/UserSettings';
import { BaseService } from './BaseService';

export class UserSettingsService extends BaseService {
    public updateUserSettingsAsync = async (
        userId: string,
        darkMode: boolean,
        planners: boolean,
        personas: boolean,
        simplifiedChatExperience: boolean,
        azureContentSafety: boolean,
        azureAISearch: boolean,
        exportChatSessions: boolean,
        liveChatSessionSharing: boolean,
        feedbackFromUser: boolean,
        deploymentGPT35: boolean,
        deploymentGPT4: boolean,
        accessToken: string,
    ): Promise<IUserSettings> => {
        const body = {
            userId,
            darkMode,
            planners,
            personas,
            simplifiedChatExperience,
            azureContentSafety,
            azureAISearch,
            exportChatSessions,
            liveChatSessionSharing,
            feedbackFromUser,
            deploymentGPT35,
            deploymentGPT4,
        };

        const result = await this.getResponseAsync<IUserSettings>(
            {
                commandPath: `settings/${userId}`,
                method: 'POST',
                body,
            },
            accessToken,
        );

        return result;
    };

    public getUserSettingsAsync = async (userId: string, accessToken: string): Promise<IUserSettings> => {
        const result = await this.getResponseAsync<IUserSettings>(
            {
                commandPath: `settings/${userId}`,
                method: 'GET',
            },
            accessToken,
        );

        return result;
    };

    public reloadAppConfiguration = async (
        force: boolean,
        deploymentName: string,
        accessToken: string,
    ): Promise<boolean> => {
        const body = {
            force: force,
            deploymentName: deploymentName,
        };
        const result = await this.getResponseAsync<boolean>(
            {
                commandPath: `configuration/reload`,
                method: 'POST',
                body,
            },
            accessToken,
        );

        return result;
    };
}

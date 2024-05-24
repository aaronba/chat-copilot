// Copyright (c) Microsoft. All rights reserved.

import { useMsal } from '@azure/msal-react';
import { getErrorDetails } from '../../components/utils/TextUtils';
import { useAppDispatch } from '../../redux/app/hooks';
import { addAlert } from '../../redux/features/app/appSlice';
import { AuthHelper } from '../auth/AuthHelper';
import { AlertType } from '../models/AlertType';
import { UserSettingsService } from '../services/UserSettingsService';

export const useUserSettings = () => {
    const dispatch = useAppDispatch();
    const { instance, inProgress } = useMsal();
    const userSettingsService = new UserSettingsService();

    const updateUserSettings = async (
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
    ) => {
        try {
            return await userSettingsService.updateUserSettingsAsync(
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
                await AuthHelper.getSKaaSAccessToken(instance, inProgress),
            );
        } catch (e: any) {
            const errorMessage = `Unable to update settings record for user. Details: ${getErrorDetails(e)}`;
            dispatch(addAlert({ message: errorMessage, type: AlertType.Error }));
        }

        return undefined;
    };

    const getUserSettings = async (userId: string) => {
        try {
            return await userSettingsService.getUserSettingsAsync(
                userId,
                await AuthHelper.getSKaaSAccessToken(instance, inProgress),
            );
        } catch (e: any) {
            const errorMessage = `Unable to get user settings. Details: ${getErrorDetails(e)}`;
            dispatch(addAlert({ message: errorMessage, type: AlertType.Error }));
        }

        return undefined;
    };

    const reloadAppConfig = async (force: boolean, deploymentName: string) => {
        try {
            return await userSettingsService.reloadAppConfiguration(
                force,
                deploymentName,
                await AuthHelper.getSKaaSAccessToken(instance, inProgress),
            );
        } catch (e: any) {
            const errorMessage = `Unable to reload application configuration during runtime. Details: ${getErrorDetails(e)}`;
            dispatch(addAlert({ message: errorMessage, type: AlertType.Error }));
        }

        return undefined;
    };

    return {
        updateUserSettings,
        getUserSettings,
        reloadAppConfig,
    };
};

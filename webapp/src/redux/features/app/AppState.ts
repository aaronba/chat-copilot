// Copyright (c) Microsoft. All rights reserved.

import { AuthConfig } from '../../../libs/auth/AuthHelper';
import { FrontendConfig } from '../../../libs/frontend/FrontendHelper';
import { AlertType } from '../../../libs/models/AlertType';
import { IChatUser } from '../../../libs/models/ChatUser';
import { ServiceInfo } from '../../../libs/models/ServiceInfo';
import { TokenUsage } from '../../../libs/models/TokenUsage';

// This is the default user information when authentication is set to 'None'.
// It must match what is defined in PassthroughAuthenticationHandler.cs on the backend.
export const DefaultChatUser: IChatUser = {
    id: 'c05c61eb-65e4-4223-915a-fe72b0c9ece1',
    emailAddress: 'user@contoso.com',
    fullName: 'Default User',
    online: true,
    isTyping: false,
};

export const DefaultActiveUserInfo: ActiveUserInfo = {
    id: DefaultChatUser.id,
    email: DefaultChatUser.emailAddress,
    username: DefaultChatUser.fullName,
};

export interface ActiveUserInfo {
    id: string;
    email: string;
    username: string;
}

export interface Alert {
    message: string;
    type: AlertType;
    id?: string;
    onRetry?: () => void;
}

interface Feature {
    enabled: boolean; // Whether to show the feature in the UX
    label: string;
    inactive?: boolean; // Set to true if you don't want the user to control the visibility of this feature or there's no backend support
    description?: string;
}

export interface Setting {
    title: string;
    description?: string;
    features: FeatureKeys[];
    stackVertically?: boolean;
    learnMoreLink?: string;
}

export interface UserSettings {
    darkMode: boolean;
    planners: boolean;
    personas: boolean;
    simplifiedChatExperience: boolean;
    azureContentSafety: boolean;
    azureAISearch: boolean;
    exportChatSessions: boolean;
    liveChatSessionSharing: boolean;
    feedbackFromUser: boolean;
    deploymentGPT35: boolean;
    deploymentGPT4: boolean;
}

export interface AppState {
    alerts: Alert[];
    activeUserInfo?: ActiveUserInfo;
    authConfig?: AuthConfig | null;
    frontendSettings?: FrontendConfig | null;
    tokenUsage: TokenUsage;
    features: Record<FeatureKeys, Feature>;
    settings: Setting[];
    serviceInfo: ServiceInfo;
    isMaintenance: boolean;
    userSettings?: UserSettings | null;
}

export enum FeatureKeys {
    DarkMode,
    SimplifiedExperience,
    Planners,
    Personas,
    AzureContentSafety,
    AzureAISearch,
    BotAsDocs,
    MultiUserChat,
    ExportChatSessions,
    LiveChatSessionSharing,
    RLHF, // Reinforcement Learning from Human Feedback
    DeploymentGPT35,
    DeploymentGPT4,
}

export const Features = {
    [FeatureKeys.DarkMode]: {
        enabled: false,
        label: 'Dark Mode',
        inactive: false,
    },
    [FeatureKeys.SimplifiedExperience]: {
        enabled: true,
        label: 'Simplified Chat Experience',
        inactive: false,
    },
    [FeatureKeys.Planners]: {
        enabled: false,
        label: 'Planners',
        description: 'The Plans tab is hidden until you turn this on',
        inactive: false,
    },
    [FeatureKeys.Personas]: {
        enabled: false,
        label: 'Personas',
        description: 'The Persona tab is hidden until you turn this on',
        inactive: false,
    },
    [FeatureKeys.AzureContentSafety]: {
        enabled: false,
        label: 'Azure Content Safety',
        inactive: true,
    },
    [FeatureKeys.AzureAISearch]: {
        enabled: false,
        label: 'Azure AI Search',
        inactive: true,
    },
    [FeatureKeys.BotAsDocs]: {
        enabled: false,
        label: 'Export Chat Sessions',
        inactive: false,
    },
    [FeatureKeys.MultiUserChat]: {
        enabled: false,
        label: 'Live Chat Session Sharing',
        inactive: false,
        description: 'Enable multi-user chat sessions. Not available when authorization is disabled.',
    },
    [FeatureKeys.ExportChatSessions]: {
        enabled: false,
        label: 'Export Chat Sessions',
        inactive: false,
        description: 'Enable chat session export.',
    },
    [FeatureKeys.LiveChatSessionSharing]: {
        enabled: false,
        label: 'Live Chat Sesssion Sharing',
        inactive: false,
        description: 'Enable chat session sharing.',
    },
    [FeatureKeys.RLHF]: {
        enabled: true,
        label: 'Reinforcement Learning from Human Feedback',
        inactive: false,
        description: 'Enable users to vote on model-generated responses. For demonstration purposes only.',
        // TODO: [Issue #42] Send and store feedback in backend
    },
    [FeatureKeys.DeploymentGPT35]: {
        enabled: false,
        label: 'gpt-35-turbo',
        inactive: true,
    },
    [FeatureKeys.DeploymentGPT4]: {
        enabled: false,
        label: 'gpt-4',
        inactive: true,
    },
};

export const Settings = [
    {
        // Basic settings has to stay at the first index. Add all new settings to end of array.
        title: 'Basic',
        features: [FeatureKeys.DarkMode, FeatureKeys.Planners, FeatureKeys.Personas],
        stackVertically: true,
    },
    {
        title: 'Display',
        features: [FeatureKeys.SimplifiedExperience],
        stackVertically: true,
    },
    {
        title: 'Azure AI',
        features: [FeatureKeys.AzureContentSafety, FeatureKeys.AzureAISearch],
        stackVertically: true,
    },
    {
        title: 'Experimental',
        description: 'The related icons and menu options are hidden until you turn this on',
        features: [
            FeatureKeys.BotAsDocs,
            FeatureKeys.MultiUserChat,
            FeatureKeys.RLHF,
            FeatureKeys.DeploymentGPT35,
            FeatureKeys.DeploymentGPT4,
        ],
    },
];

export const initialState: AppState = {
    alerts: [],
    activeUserInfo: DefaultActiveUserInfo,
    authConfig: {} as AuthConfig,
    frontendSettings: {} as FrontendConfig,
    tokenUsage: {},
    features: Features,
    settings: Settings,
    serviceInfo: {
        memoryStore: { types: [], selectedType: '' },
        availablePlugins: [],
        version: '',
        isContentSafetyEnabled: false,
    },
    isMaintenance: false,
    userSettings: {} as UserSettings,
};

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
    text?: string; // Text to display in the feature (if applicable)
}

export interface Setting {
    title: string;
    description?: string;
    features: FeatureKeys[];
    stackVertically?: boolean;
    learnMoreLink?: string;
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
}

export enum FeatureKeys {
    DarkMode,
    SimplifiedExperience,
    Planners,
    Personas,
    GlobalDocumentUpload,
    LocalDocumentUpload,
    AzureContentSafety,
    AzureAISearch,
    BotAsDocs,
    MultiUserChat,
    ExportChatSessions,
    LiveChatSessionSharing,
    RLHF, // Reinforcement Learning from Human Feedback
    HeaderTitle,
    HeaderTitleColor,
    HeaderBackgroundColor,
    DisclaimerText,
}

export const Features = {
    [FeatureKeys.DarkMode]: {
        enabled: false,
        label: 'Dark Mode',
    },
    [FeatureKeys.SimplifiedExperience]: {
        enabled: true,
        label: 'Simplified Chat Experience',
    },
    [FeatureKeys.Planners]: {
        enabled: false,
        label: 'Planners',
        description: 'The Plans tab is hidden until you turn this on',
        inactive: false,
    },
    [FeatureKeys.GlobalDocumentUpload]: {
        enabled: process.env.REACT_APP_GLOBAL_DOCUMENT_UPLOAD_ENABLED === 'true',
        label: 'GlobalDocumentUpload',
        description: 'The Documents tab is hidden until you turn this on',
        inactive: false,
    },
    [FeatureKeys.LocalDocumentUpload]: {
        enabled: process.env.REACT_APP_LOCAL_DOCUMENT_UPLOAD_ENABLED === 'true',
        label: 'LocalDocumentUpload',
        description: 'The paperclip icon is hidden until you turn this on, not allowing local file uploads',
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
    },
    [FeatureKeys.MultiUserChat]: {
        enabled: false,
        label: 'Live Chat Session Sharing',
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
        description: 'Enable users to vote on model-generated responses. For demonstration purposes only.',
        // TODO: [Issue #42] Send and store feedback in backend
        inactive: false,
    },
    [FeatureKeys.HeaderTitle]: {
        enabled: true,
        label: 'Chat Header Title',
        inactive: false,
        description: 'Set chat header title text.',
        text: process.env.REACT_APP_HEADER_TITLE,
    },
    [FeatureKeys.HeaderTitleColor]: {
        enabled: true,
        label: 'Chat Header Title Color',
        inactive: false,
        description: 'Set chat header title color.',
        text: process.env.REACT_APP_HEADER_TITLE_COLOR,
    },
    [FeatureKeys.HeaderBackgroundColor]: {
        enabled: true,
        label: 'Chat Header Background Color',
        inactive: false,
        description: 'Set chat header background color.',
        text: process.env.REACT_APP_HEADER_BACKGROUND_COLOR,
    },
    [FeatureKeys.DisclaimerText]: {
        enabled: true,
        label: 'Chat Disclaimer Text',
        inactive: false,
        description: 'Set disclaimer text at top of chat.',
        text: process.env.REACT_APP_DISCLAIMER_TEXT,
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
        features: [FeatureKeys.BotAsDocs, FeatureKeys.MultiUserChat, FeatureKeys.RLHF],
    },
];

export const initialState: AppState = {
    alerts: [],
    activeUserInfo: DefaultActiveUserInfo,
    authConfig: {} as AuthConfig,
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
};

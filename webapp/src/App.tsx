// Copyright (c) Microsoft. All rights reserved.

import { AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated, useMsal } from '@azure/msal-react';
import { FluentProvider, makeStyles, shorthands, tokens } from '@fluentui/react-components';

import * as React from 'react';
import { useEffect } from 'react';

import logo from './assets/frontend-icons/yourLogo.png';
import { UserSettingsMenu } from './components/header/UserSettingsMenu';
import { PluginGallery } from './components/open-api-plugins/PluginGallery';
import { BackendProbe, ChatView, Error, Loading, Login } from './components/views';
import { AuthHelper } from './libs/auth/AuthHelper';
import { useChat, useFile } from './libs/hooks';
import { useUserSettings } from './libs/hooks/useUserSettings';
import { AlertType } from './libs/models/AlertType';
import { useAppDispatch, useAppSelector } from './redux/app/hooks';
import { RootState, store } from './redux/app/store';
import { DefaultChatUser, FeatureKeys } from './redux/features/app/AppState';
import {
    addAlert,
    setActiveUserInfo,
    setServiceInfo,
    setUserSettings,
    toggleFeatureFlag,
} from './redux/features/app/appSlice';
import { semanticKernelDarkTheme, semanticKernelLightTheme } from './styles';

export const useClasses = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        ...shorthands.overflow('hidden'),
    },
    header: {
        alignItems: 'center',
        backgroundColor: tokens.colorBrandForeground2,
        color: tokens.colorNeutralForegroundOnBrand,
        display: 'flex',
        '& h1': {
            paddingLeft: tokens.spacingHorizontalXL,
            display: 'flex',
        },
        height: '48px',
        justifyContent: 'space-between',
        width: '100%',
    },
    persona: {
        marginRight: tokens.spacingHorizontalXXL,
    },
    cornerItems: {
        display: 'flex',
        ...shorthands.gap(tokens.spacingHorizontalS),
    },
});

enum AppState {
    ProbeForBackend,
    SettingUserInfo,
    ErrorLoadingChats,
    ErrorLoadingUserInfo,
    LoadingChats,
    Chat,
    SigningOut,
    UserSettings,
}

const App = () => {
    const classes = useClasses();

    const [appState, setAppState] = React.useState(AppState.ProbeForBackend);
    const dispatch = useAppDispatch();
    const pageTitle = store.getState().app.frontendSettings?.headerTitle;

    const { instance, inProgress } = useMsal();
    const { features, isMaintenance } = useAppSelector((state: RootState) => state.app);
    const isAuthenticated = useIsAuthenticated();
    const userSettingsHandler = useUserSettings();

    const chat = useChat();
    const file = useFile();

    if (logo) null;

    useEffect(() => {
        if (isMaintenance && appState !== AppState.ProbeForBackend) {
            setAppState(AppState.ProbeForBackend);
            return;
        }

        if (isAuthenticated && appState === AppState.SettingUserInfo) {
            const account = instance.getActiveAccount();
            if (!account) {
                setAppState(AppState.ErrorLoadingUserInfo);
            } else {
                dispatch(
                    setActiveUserInfo({
                        id: `${account.localAccountId}.${account.tenantId}`,
                        email: account.username, // username is the email address
                        username: account.name ?? account.username,
                    }),
                );

                // Privacy disclaimer for internal Microsoft users
                if (account.username.split('@')[1] === 'microsoft.com') {
                    dispatch(
                        addAlert({
                            message:
                                'By using Chat Copilot, you agree to protect sensitive data, not store it in chat, and allow chat history collection for service improvements. This tool is for internal use only.',
                            type: AlertType.Info,
                        }),
                    );
                }

                setAppState(AppState.UserSettings);
                void userSettingsHandler.getUserSettings(account.homeAccountId).then((us) => {
                    if (us !== undefined) {
                        dispatch(setUserSettings(us));
                        if (us.darkMode) dispatch(toggleFeatureFlag(FeatureKeys.DarkMode)); // Turn on
                        if (us.planners) dispatch(toggleFeatureFlag(FeatureKeys.Planners)); // Turn on
                        if (us.personas) dispatch(toggleFeatureFlag(FeatureKeys.Personas)); // Turn on
                        if (us.simplifiedChatExperience) dispatch(toggleFeatureFlag(FeatureKeys.SimplifiedExperience)); // Turn on
                        if (us.azureContentSafety) dispatch(toggleFeatureFlag(FeatureKeys.AzureContentSafety)); // Turn on
                        if (us.azureAISearch) dispatch(toggleFeatureFlag(FeatureKeys.AzureAISearch)); // Turn on
                        if (us.exportChatSessions) dispatch(toggleFeatureFlag(FeatureKeys.ExportChatSessions)); // Turn on
                        if (us.liveChatSessionSharing) dispatch(toggleFeatureFlag(FeatureKeys.LiveChatSessionSharing)); // Turn on
                        // if (us.feedbackFromUser) dispatch(toggleFeatureFlag(FeatureKeys.RLHF)); // Turn on
                        if (us.deploymentGPT35) dispatch(toggleFeatureFlag(FeatureKeys.DeploymentGPT35)); // Turn on
                        if (us.deploymentGPT4) dispatch(toggleFeatureFlag(FeatureKeys.DeploymentGPT4)); // Turn on
                    }
                });

                setAppState(AppState.LoadingChats);
            }
        }

        if ((isAuthenticated || !AuthHelper.isAuthAAD()) && appState === AppState.LoadingChats) {
            void Promise.all([
                // Load all chats from memory
                chat
                    .loadChats()
                    .then(() => {
                        setAppState(AppState.Chat);
                    })
                    .catch(() => {
                        setAppState(AppState.ErrorLoadingChats);
                    }),

                // Check if content safety is enabled
                file.getContentSafetyStatus(),

                // Load service information
                chat.getServiceInfo().then((serviceInfo) => {
                    if (serviceInfo) {
                        dispatch(setServiceInfo(serviceInfo));
                    }
                }),
            ]);

            if (!AuthHelper.isAuthAAD()) {
                setAppState(AppState.UserSettings);
                // Use default User ID
                void userSettingsHandler.getUserSettings(DefaultChatUser.id).then((us) => {
                    if (us !== undefined) {
                        dispatch(setUserSettings(us));
                        if (us.darkMode) dispatch(toggleFeatureFlag(FeatureKeys.DarkMode)); // Turn on
                        if (us.planners) dispatch(toggleFeatureFlag(FeatureKeys.Planners)); // Turn on
                        if (us.personas) dispatch(toggleFeatureFlag(FeatureKeys.Personas)); // Turn on
                        if (us.simplifiedChatExperience) dispatch(toggleFeatureFlag(FeatureKeys.SimplifiedExperience)); // Turn on
                        if (us.azureContentSafety) dispatch(toggleFeatureFlag(FeatureKeys.AzureContentSafety)); // Turn on
                        if (us.azureAISearch) dispatch(toggleFeatureFlag(FeatureKeys.AzureAISearch)); // Turn on
                        if (us.exportChatSessions) dispatch(toggleFeatureFlag(FeatureKeys.ExportChatSessions)); // Turn on
                        if (us.liveChatSessionSharing) dispatch(toggleFeatureFlag(FeatureKeys.LiveChatSessionSharing)); // Turn on
                        //  if (us.feedbackFromUser) dispatch(toggleFeatureFlag(FeatureKeys.RLHF)); // Turn on
                        if (us.deploymentGPT35) dispatch(toggleFeatureFlag(FeatureKeys.DeploymentGPT35)); // Turn on
                        if (us.deploymentGPT4) dispatch(toggleFeatureFlag(FeatureKeys.DeploymentGPT4)); // Turn on
                    }
                });
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instance, inProgress, isAuthenticated, appState, isMaintenance]);

    useEffect(() => {
        const title = pageTitle ?? 'Chat Copilot';

        document.title = title;
    }, [pageTitle]);

    const content = <Chat classes={classes} appState={appState} setAppState={setAppState} />;
    return (
        <FluentProvider
            className="app-container"
            theme={features[FeatureKeys.DarkMode].enabled ? semanticKernelDarkTheme : semanticKernelLightTheme}
        >
            {AuthHelper.isAuthAAD() ? (
                <>
                    <UnauthenticatedTemplate>
                        <div className={classes.container}>
                            <div
                                style={{
                                    color: store.getState().app.frontendSettings?.headerTitleColor,
                                    background: store.getState().app.frontendSettings?.headerBackgroundColor,
                                    fontSize: 24,
                                    paddingBottom: 5,
                                    display: 'table',
                                }}
                            >
                                <img width="400" height="80" aria-label="Header Logo" src={logo}></img>
                                <div style={{ display: 'table-cell', verticalAlign: 'middle', width: '57%' }}>
                                    {store.getState().app.frontendSettings?.headerTitle}
                                </div>
                            </div>
                            {appState === AppState.SigningOut && <Loading text="Signing you out..." />}
                            {appState !== AppState.SigningOut && <Login />}
                        </div>
                    </UnauthenticatedTemplate>
                    <AuthenticatedTemplate>{content}</AuthenticatedTemplate>
                </>
            ) : (
                content
            )}
        </FluentProvider>
    );
};

const Chat = ({
    classes,
    appState,
    setAppState,
}: {
    classes: ReturnType<typeof useClasses>;
    appState: AppState;
    setAppState: (state: AppState) => void;
}) => {
    const onBackendFound = React.useCallback(() => {
        setAppState(
            AuthHelper.isAuthAAD()
                ? // if AAD is enabled, we need to set the active account before loading chats
                  AppState.SettingUserInfo
                : // otherwise, we can load chats immediately
                  AppState.LoadingChats,
        );
    }, [setAppState]);

    return (
        <div className={classes.container}>
            <div
                style={{
                    color: store.getState().app.frontendSettings?.headerTitleColor,
                    background: store.getState().app.frontendSettings?.headerBackgroundColor,
                    fontSize: 18,
                    paddingLeft: 5,
                    paddingBottom: 5,
                    display: 'table',
                }}
            >
                <div style={{ display: 'table-cell', verticalAlign: 'middle', width: '85%' }}>
                    {store.getState().app.frontendSettings?.headerTitle}
                </div>

                {appState > AppState.SettingUserInfo && (
                    <div className={classes.cornerItems}>
                        <div className={classes.cornerItems}>
                            <PluginGallery />
                            <UserSettingsMenu
                                setLoadingState={() => {
                                    setAppState(AppState.SigningOut);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
            {appState === AppState.ProbeForBackend && <BackendProbe onBackendFound={onBackendFound} />}
            {appState === AppState.SettingUserInfo && (
                <Loading text={'Hang tight while we fetch your information...'} />
            )}
            {appState === AppState.UserSettings && <Loading text={'Please wait while we fetch your settings...'} />}
            {appState === AppState.ErrorLoadingUserInfo && (
                <Error text={'Unable to load user info. Please try signing out and signing back in.'} />
            )}
            {appState === AppState.ErrorLoadingChats && (
                <Error text={'Unable to load chats. Please try refreshing the page.'} />
            )}
            {appState === AppState.LoadingChats && <Loading text="Loading chats..." />}
            {appState === AppState.Chat && <ChatView />}
        </div>
    );
};

export default App;

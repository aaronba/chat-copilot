import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import ReactDOM from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import App from './App';
import { Constants } from './Constants';
import './index.css';
import { AuthConfig, AuthHelper } from './libs/auth/AuthHelper';
import { FrontendConfig } from './libs/frontend/FrontendHelper';
import { store } from './redux/app/store';
import { FeatureKeys } from './redux/features/app/AppState';

import React from 'react';
import { BackendServiceUrl } from './libs/services/BaseService';
import { setAuthConfig, setFrontendConfig, toggleFeatureState } from './redux/features/app/appSlice';

if (!localStorage.getItem('debug')) {
    localStorage.setItem('debug', `${Constants.debug.root}:*`);
}

let container: HTMLElement | null = null;
let root: ReactDOM.Root | undefined = undefined;
let msalInstance: PublicClientApplication | undefined;

document.addEventListener('DOMContentLoaded', () => {
    if (!container) {
        container = document.getElementById('root');
        if (!container) {
            throw new Error('Could not find root element');
        }
        root = ReactDOM.createRoot(container);

        renderApp();
    }
});

export function renderApp() {
    fetch(new URL('frontendConfig', BackendServiceUrl))
        .then((response) => (response.ok ? (response.json() as Promise<FrontendConfig>) : Promise.reject()))
        .then((frontendConfig) => {
            store.dispatch(setFrontendConfig(frontendConfig));

            const lockControl = !store.getState().app.frontendSettings?.headerSettingsEnabled;
            store.dispatch(
                toggleFeatureState({
                    feature: FeatureKeys.DarkMode,
                    deactivate: false, // Leave this option always available
                    enable: false,
                }),
            );
            store.dispatch(
                toggleFeatureState({
                    feature: FeatureKeys.SimplifiedExperience,
                    deactivate: lockControl,
                    enable: false,
                }),
            );
            store.dispatch(
                toggleFeatureState({
                    feature: FeatureKeys.Planners,
                    deactivate: lockControl,
                    enable: false,
                }),
            );
            store.dispatch(
                toggleFeatureState({
                    feature: FeatureKeys.Personas,
                    deactivate: lockControl,
                    enable: false,
                }),
            );
            store.dispatch(
                toggleFeatureState({
                    feature: FeatureKeys.SimplifiedExperience,
                    deactivate: lockControl,
                    enable: false,
                }),
            );
            store.dispatch(
                toggleFeatureState({
                    feature: FeatureKeys.AzureContentSafety,
                    deactivate: lockControl,
                    enable: false,
                }),
            );
            store.dispatch(
                toggleFeatureState({
                    feature: FeatureKeys.AzureAISearch,
                    deactivate: lockControl,
                    enable: false,
                }),
            );
            store.dispatch(
                toggleFeatureState({
                    feature: FeatureKeys.BotAsDocs,
                    deactivate: lockControl,
                    enable: false,
                }),
            );
            store.dispatch(
                toggleFeatureState({
                    feature: FeatureKeys.MultiUserChat,
                    deactivate: lockControl,
                    enable: false,
                }),
            );
            store.dispatch(
                toggleFeatureState({
                    feature: FeatureKeys.ExportChatSessions,
                    deactivate: lockControl,
                    enable: false,
                }),
            );
            store.dispatch(
                toggleFeatureState({
                    feature: FeatureKeys.LiveChatSessionSharing,
                    deactivate: lockControl,
                    enable: false,
                }),
            );
            store.dispatch(
                toggleFeatureState({
                    feature: FeatureKeys.RLHF,
                    deactivate: lockControl,
                    enable: true,
                }),
            );

            store.dispatch(
                toggleFeatureState({
                    feature: FeatureKeys.DeploymentGPT35,
                    deactivate: true, // For now, leave disabled
                    enable: false,
                }),
            );

            store.dispatch(
                toggleFeatureState({
                    feature: FeatureKeys.DeploymentGPT4,
                    deactivate: true, // For now, leave disabled
                    enable: false,
                }),
            );

            fetch(new URL('authConfig', BackendServiceUrl))
                .then((response) => (response.ok ? (response.json() as Promise<AuthConfig>) : Promise.reject()))
                .then(async (authConfig) => {
                    store.dispatch(setAuthConfig(authConfig));

                    if (AuthHelper.isAuthAAD()) {
                        if (!msalInstance) {
                            msalInstance = new PublicClientApplication(AuthHelper.getMsalConfig(authConfig));
                            await msalInstance.initialize();
                            await msalInstance.handleRedirectPromise().then((response) => {
                                if (response) {
                                    msalInstance?.setActiveAccount(response.account);
                                } else {
                                    const activeAccount = msalInstance?.getAllAccounts()[0];
                                    if (activeAccount) {
                                        msalInstance?.setActiveAccount(activeAccount);
                                    }
                                }
                            });
                        }

                        // render with the MsalProvider if AAD is enabled
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        root!.render(
                            <React.StrictMode>
                                <ReduxProvider store={store}>
                                    <MsalProvider instance={msalInstance}>
                                        <App />
                                    </MsalProvider>
                                </ReduxProvider>
                            </React.StrictMode>,
                        );
                    }
                })
                .catch(() => {
                    store.dispatch(setAuthConfig(undefined));
                });
        })
        .catch(() => {
            store.dispatch(setFrontendConfig(undefined));
        });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    root!.render(
        <React.StrictMode>
            <ReduxProvider store={store}>
                <App />
            </ReduxProvider>
        </React.StrictMode>,
    );
}

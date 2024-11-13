import { store } from '../../redux/app/store';

export interface FrontendConfig {
    headerTitle: string;
    headerTitleColor: string;
    headerBackgroundColor: string;
    headerIcon: string;
    headerSettingsEnabled: boolean;
    headerPluginsEnabled: boolean;
    documentLocalUploadEnabled: boolean;
    documentGlobalUploadEnabled: boolean;
    createNewChat: boolean;
    disclaimerMsg: string;
}

const getFrontendConfig = () => store.getState().app.frontendSettings;

export const FrontendHelper = {
    getFrontendConfig,
};

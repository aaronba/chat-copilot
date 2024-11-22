import React from 'react';
import { AuthHelper } from '../..//libs/auth/AuthHelper';
import { AppState, useClasses } from '../../App';
import logo from '../../assets/frontend-icons/logo.png'; // Adjust the path as needed
import { FeatureKeys, Features } from '../../redux/features/app/AppState';
import { UserSettingsMenu } from '../header/UserSettingsMenu';
import { BackendProbe, ChatView, Error, Loading } from '../views';

const disclaimerText =
    Features[FeatureKeys.BannerText].text !== '' ? Features[FeatureKeys.BannerText].text : 'Unclassified';
const headerTitle =
    Features[FeatureKeys.HeaderTitle].text !== '' ? Features[FeatureKeys.HeaderTitle].text : 'Chat-Copilot';

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
                  AppState.LoadChats,
        );
    }, [setAppState]);
    return (
        <div className={classes.container}>
            <div className={classes.banner}>
                <strong>{disclaimerText}</strong>
            </div>
            <div className={classes.header}>
                <img width="200" height="40" aria-label={headerTitle} src={logo}></img>
                {appState > AppState.SettingUserInfo && (
                    <div className={classes.cornerItems}>
                        <div className={classes.cornerItems}>
                            {/* <PluginGallery /> */}
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
export default Chat;

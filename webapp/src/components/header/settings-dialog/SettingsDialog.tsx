// Copyright (c) Microsoft. All rights reserved.

import {
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    Body1,
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogOpenChangeData,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Divider,
    Label,
    makeStyles,
    shorthands,
    tokens,
} from '@fluentui/react-components';
import React, { useCallback } from 'react';
import { useUserSettings } from '../../../libs/hooks/useUserSettings';
import { useAppSelector } from '../../../redux/app/hooks';
import { RootState } from '../../../redux/app/store';
import { FeatureKeys } from '../../../redux/features/app/AppState';
import { SharedStyles, useDialogClasses } from '../../../styles';
import { TokenUsageGraph } from '../../token-usage/TokenUsageGraph';
import { SettingSection } from './SettingSection';

const useClasses = makeStyles({
    root: {
        ...shorthands.overflow('hidden'),
        display: 'flex',
        flexDirection: 'column',
        height: '600px',
    },
    outer: {
        paddingRight: tokens.spacingVerticalXS,
    },
    content: {
        height: '100%',
        ...SharedStyles.scroll,
        paddingRight: tokens.spacingVerticalL,
    },
    footer: {
        paddingTop: tokens.spacingVerticalL,
    },
});

interface ISettingsDialogProps {
    open: boolean;
    closeDialog: () => void;
}

export const SettingsDialog: React.FC<ISettingsDialogProps> = ({ open, closeDialog }) => {
    const classes = useClasses();
    const userSettingsHandler = useUserSettings();
    const dialogClasses = useDialogClasses();
    const { serviceInfo, settings, tokenUsage } = useAppSelector((state: RootState) => state.app);
    const { activeUserInfo, features } = useAppSelector((state: RootState) => state.app);

    const onSaveUserSettings = useCallback(() => {
        if (activeUserInfo != undefined) {
            void userSettingsHandler
                .updateUserSettings(
                    activeUserInfo.id,
                    features[FeatureKeys.DarkMode].enabled,
                    features[FeatureKeys.Planners].enabled,
                    features[FeatureKeys.Personas].enabled,
                    features[FeatureKeys.SimplifiedExperience].enabled,
                    features[FeatureKeys.AzureContentSafety].enabled,
                    features[FeatureKeys.AzureAISearch].enabled,
                    features[FeatureKeys.ExportChatSessions].enabled,
                    features[FeatureKeys.LiveChatSessionSharing].enabled,
                    features[FeatureKeys.RLHF].enabled,
                    features[FeatureKeys.DeploymentGPT35].enabled,
                    features[FeatureKeys.DeploymentGPT4].enabled,
                )
                .then(() => {});
        } else {
            console.error('Unable to save user settings.');
        }
    }, [activeUserInfo, features, userSettingsHandler]);

    return (
        <Dialog
            open={open}
            onOpenChange={(_ev: any, data: DialogOpenChangeData) => {
                if (!data.open) closeDialog();
            }}
        >
            <DialogSurface className={classes.outer}>
                <DialogBody className={classes.root}>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogContent className={classes.content}>
                        <TokenUsageGraph tokenUsage={tokenUsage} />
                        <Accordion collapsible multiple defaultOpenItems={['basic']}>
                            <AccordionItem value="basic">
                                <AccordionHeader expandIconPosition="end">
                                    <h3>Basic</h3>
                                </AccordionHeader>
                                <AccordionPanel>
                                    <SettingSection key={settings[0].title} setting={settings[0]} contentOnly />
                                </AccordionPanel>
                            </AccordionItem>
                            <Divider />
                            <AccordionItem value="advanced">
                                <AccordionHeader expandIconPosition="end" data-testid="advancedSettingsFoldup">
                                    <h3>Advanced</h3>
                                </AccordionHeader>
                                <AccordionPanel>
                                    <Body1 color={tokens.colorNeutralForeground3}>
                                        Some settings are disabled by default as they are not fully supported yet.
                                    </Body1>
                                    {settings.slice(1).map((setting) => {
                                        return <SettingSection key={setting.title} setting={setting} />;
                                    })}
                                </AccordionPanel>
                            </AccordionItem>
                            <Divider />
                            <AccordionItem value="about">
                                <AccordionHeader expandIconPosition="end">
                                    <h3>About</h3>
                                </AccordionHeader>
                                <AccordionPanel>
                                    <Body1 color={tokens.colorNeutralForeground3}>
                                        Backend version: {serviceInfo.version}
                                        <br />
                                        Frontend version: {process.env.REACT_APP_SK_VERSION ?? '-'}
                                        <br />
                                        {process.env.REACT_APP_SK_BUILD_INFO}
                                    </Body1>
                                </AccordionPanel>
                            </AccordionItem>
                            <Divider />
                        </Accordion>
                    </DialogContent>
                </DialogBody>
                <DialogActions position="start" className={dialogClasses.footer}>
                    <Label size="small" color="brand" className={classes.footer}>
                        Join the Semantic Kernel open source community!{' '}
                        <a href="https://aka.ms/semantic-kernel" target="_blank" rel="noreferrer">
                            Learn More
                        </a>
                    </Label>
                    <DialogTrigger disableButtonEnhancement>
                        <Button
                            appearance="secondary"
                            data-testid="userSettingsCloseButton"
                            onClick={onSaveUserSettings}
                        >
                            Close
                        </Button>
                    </DialogTrigger>
                </DialogActions>
            </DialogSurface>
        </Dialog>
    );
};

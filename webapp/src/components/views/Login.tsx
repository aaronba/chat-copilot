// Copyright (c) Microsoft. All rights reserved.

import { useMsal } from '@azure/msal-react';
import { Button, Title3 } from '@fluentui/react-components';
import React from 'react';
import { useSharedClasses } from '../../styles';
import { getErrorDetails } from '../utils/TextUtils';

export const Login: React.FC = () => {
    const { instance } = useMsal();
    const classes = useSharedClasses();

    return (
        <div className={classes.informativeView}>
            <Title3>Sign in with Azure Entra ID</Title3>
            <Button
                style={{ padding: 5, border: '1px solid #000' }}
                appearance="transparent"
                onClick={() => {
                    instance.loginRedirect().catch((e: unknown) => {
                        alert(`Error signing in: ${getErrorDetails(e)}`);
                    });
                }}
                data-testid="signinButton"
            >
                Sign in
            </Button>
        </div>
    );
};

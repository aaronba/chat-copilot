/* eslint-disable @typescript-eslint/no-unused-vars */
import { ContextualMenu, IContextualMenuItem } from '@fluentui/react';
import * as React from 'react';

const ChatMenuDropdown: React.FunctionComponent = () => {
    const menuItems: IContextualMenuItem[] = [
        {
            key: 'global',
            text: 'Global',
            iconProps: { iconName: 'Globe' },
            onClick: () => {
                console.log('global upload clicked');
                setChatId('00000000-0000-0000-0000-000000000000');
            },
        },
        {
            key: 'local',
            text: 'Local',
            iconProps: { iconName: 'Edit' },
            onClick: () => {
                console.log('local upload clicked');
                setChatId('11111111-1111-1111-1111-111111111111');
            },
        },
        {
            key: 'cloud',
            text: 'Cloud',
            iconProps: { iconName: 'Delete' },
            onClick: () => {
                console.log('cloud upload clicked');
                setChatId('33333333-3333-3333-3333-333333333333');
            },
        },
    ];
    const [isContextMenuVisible, setContextMenuVisible] = React.useState(false);
    const [target, setTarget] = React.useState<HTMLElement | null>(null);
    const [chatId, setChatId] = React.useState('');

    const onContextMenu = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        setTarget(event.currentTarget);
        setContextMenuVisible(true);
    };

    const onDismiss = () => {
        setContextMenuVisible(false);
        setTarget(null);
    };

    return (
        <div onContextMenu={onContextMenu}>
            {/* <ChatMenuDropdown></ChatMenuDropdown> */}
            <span>Mode :{chatId} </span>
            {isContextMenuVisible && <ContextualMenu items={menuItems} target={target} onDismiss={onDismiss} />}
        </div>
    );
};

export default ChatMenuDropdown;

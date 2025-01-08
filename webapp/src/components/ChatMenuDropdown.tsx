/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { Dropdown, IDropdownOption, IRenderFunction, ISelectableOption } from '@fluentui/react';
import * as React from 'react';

// Initialize icons
initializeIcons();

const options: IDropdownOption[] = [
    { key: 'Chat', text: 'Chat', data: { icon: 'Mail' } },
    { key: 'Global', text: 'Global', data: { icon: 'Globe' } },
    { key: 'Catalog', text: 'Catalog', data: { icon: 'People' } },
];

const setSessionStorage = (key: string, value: string) => {
    sessionStorage.setItem(key, value);
};

const onRenderOption: IRenderFunction<ISelectableOption> = (option) => {
    if (!option) return null;
    return (
        <div>
            <i className={`ms-Icon ms-Icon--${option.data?.icon}`} aria-hidden="true"></i>
            <span>{option.text}</span>
        </div>
    );
};

const onChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    setSessionStorage('mode', option?.text.toLowerCase() ?? '');
    console.log(option, 'test option');
    console.log(event);
};

const ChatMenuDropdown: React.FC = () => {
    return (
        <Dropdown placeholder="Select a mode" options={options} onChange={onChange} onRenderOption={onRenderOption} />
    );
};

export default ChatMenuDropdown;

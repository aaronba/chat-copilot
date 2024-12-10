// Copyright (c) Microsoft. All rights reserved.

import { makeStyles } from '@fluentui/react-components';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IChatMessage } from '../../../libs/models/ChatMessage';
import * as utils from './../../utils/TextUtils';
const useClasses = makeStyles({
    content: {
        wordBreak: 'break-word', // Break long words
    },
    markdown: {
        '& pre': {
            wordBreak: 'break-word', // Break long words
            overflowWrap: 'anywhere', // Allow breaking within long sequences
            whiteSpace: 'pre-wrap', // Preserve line breaks but allow wrapping
            maxWidth: '100%', // Constrain to container width
            overflow: 'auto', // Add vertical scroll if necessary
            backgroundColor: '#f4f4f4', // Optional: give it a subtle background
            padding: '8px', // Optional: add padding for better readability
            borderRadius: '4px', // Optional: rounded corners
        },
        '& code': {
            wordBreak: 'break-word', // Break long words
            overflowWrap: 'anywhere', // Allow breaking within long sequences
            whiteSpace: 'pre-wrap', // Preserve line breaks but allow wrapping
            maxWidth: '100%', // Prevent overflow
            backgroundColor: '#f4f4f4', // Optional: give it a subtle background
            padding: '2px 4px', // Optional: add padding for inline code
            borderRadius: '4px', // Optional: rounded corners
        },
    },
});

interface ChatHistoryTextContentProps {
    message: IChatMessage;
}

export const ChatHistoryTextContent: React.FC<ChatHistoryTextContentProps> = ({ message }) => {
    const classes = useClasses();
    const content = utils.replaceCitationLinksWithIndices(utils.formatChatTextContent(message.content), message);

    return (
        <div className={classes.content}>
            <div className={classes.markdown}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};

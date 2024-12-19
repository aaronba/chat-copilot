// Copyright (c) Microsoft. All rights reserved.

import { IChatMessage } from '../models/ChatMessage';
import { ServiceInfo } from '../models/ServiceInfo';
import { BaseService } from './BaseService';

export class DocumentImportService extends BaseService {
    public importDocumentAsync = async (
        catalog: string,
        chatId: string,
        documents: File[],
        useContentSafety: boolean,
        accessToken: string,
        uploadToGlobal: boolean,
    ) => {
        const formData = new FormData();
        formData.append('Catalog', catalog);
        formData.append('useContentSafety', useContentSafety.toString());
        for (const document of documents) {
            formData.append('formFiles', document);
        }

        return await this.getResponseAsync<IChatMessage>(
            {
                commandPath: uploadToGlobal ? `documents` : `chats/${chatId}/documents`,
                method: 'POST',
                body: formData,
            },
            accessToken,
        );
    };

    public getContentSafetyStatusAsync = async (accessToken: string): Promise<boolean> => {
        const formData = new FormData();
        formData.append('Catalog', 'Global');
        const serviceInfo = await this.getResponseAsync<ServiceInfo>(
            {
                commandPath: 'info',
                method: 'GET',
                body: formData,
            },
            accessToken,
        );

        return serviceInfo.isContentSafetyEnabled;
    };
}

// Copyright (c) Microsoft. All rights reserved.


using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using CopilotChat.WebApi.Models.Storage;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;

namespace CopilotChat.WebApi.Storage;


public interface IStyleGuideBlobStorageContext
{
    Task UploadToBlobAsync(string fileName, Stream fileToUpload);
    Task<IEnumerable<MemorySource>> GetChatUploadedFiles();
}

public class StyleGuideBlobStorageContext(IConfiguration config) : IStyleGuideBlobStorageContext
{



    public async Task UploadToBlobAsync(string fileName, Stream fileToUpload)
    {
        // Name of the container to add the blob to
        string containerName = config.GetSection("StyleGuide").GetSection("Input_Container").Value;
        string connectionString = config.GetSection("StyleGuide").GetSection("StyleGuideStorage").Value;

        // Create a BlobServiceClient object using the connection string
        BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);
        // Get a reference to the container
        BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(containerName);
        BlobClient blobClient = containerClient.GetBlobClient(fileName);
        await blobClient.UploadAsync(fileToUpload, true).ConfigureAwait(false);


    }
    public async Task<IEnumerable<MemorySource>> GetChatUploadedFiles()
    {

        string containerName = config.GetSection("StyleGuide").GetSection("Input_Container").Value;
        string connectionString = config.GetSection("StyleGuide").GetSection("StyleGuideStorage").Value;

        // Create a BlobServiceClient object using the connection string
        BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);
        // Get a reference to the container
        BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(containerName);

        IList<MemorySource> files = new List<MemorySource>();
        await foreach (BlobItem item in containerClient.GetBlobsAsync())
        {
            files.Add(new()
            {
                ChatId = Guid.Empty.ToString(),
                Name = item.Name,
                Size = (long)item.Properties.ContentLength,
                CreatedOn = DateTimeOffset.Parse(item.Properties.CreatedOn.ToString())


            });
        }

        return files;
    }

}


// Copyright (c) Microsoft. All rights reserved.


using System.IO;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Microsoft.Extensions.Configuration;

namespace CopilotChat.WebApi.Storage;


public interface IBlobStorageContext
{
    Task UploadToBlobAsync(string fileName, Stream fileToUpload);
}

public class BlobStorageContext(IConfiguration config) : IBlobStorageContext
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

}

using System.Net;
using System.Web;
using Azure.Storage.Blobs;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

public class GetContests
{
    private readonly HttpClient _httpClient = new();

    [Function("GetContests")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req, FunctionContext executionContext)
    {
        var response = req.CreateResponse();
        try
        {
            string connectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage");
            string containerName = "contestdata";
            string fileName = "contestdata.json";
            var blobServiceClient = new BlobServiceClient(connectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
            var blobClient = containerClient.GetBlobClient(fileName);
            if (!await blobClient.ExistsAsync())
            {
                response.StatusCode = System.Net.HttpStatusCode.NotFound;
                await response.WriteStringAsync($"Blob '{fileName}' not found.");
                return response;
            }

            var downloadInfo = await blobClient.DownloadAsync();
            using var reader = new StreamReader(downloadInfo.Value.Content);
            string content = await reader.ReadToEndAsync();

            response.StatusCode = System.Net.HttpStatusCode.OK;
            response.Headers.Add("Content-Type", "application/json");
            await response.WriteStringAsync(content);

            return response;

        }
        catch (Exception ex)
        {
            response.StatusCode = HttpStatusCode.InternalServerError;
            await response.WriteStringAsync($"Error: {ex.Message}");
            return response;
        }
    }
}

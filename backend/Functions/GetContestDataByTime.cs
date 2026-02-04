using System;
using System.Text;
using System.Web;
using Azure.Storage.Blobs;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace CPContest;

public class GetContestDataByTime
{
    private readonly ILogger _logger;
    private readonly HttpClient _httpClient = new();

    public GetContestDataByTime(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<GetContestDataByTime>();
    }

    [Function("GetContestDataByTime")]
    public async Task Run([TimerTrigger("0 0 0 * * *")] TimerInfo myTimer)
    {
        _logger.LogInformation("C# Timer trigger function execution started at: {executionTime}", DateTime.Now);
        string platforms = "codeforces.com,codechef.com,leetcode.com,atcoder.jp,topcoder.com,hackerrank.com";
        string from = DateTime.Today.ToString("yyyy-MM-dd");
        string to   = DateTime.Today.AddDays(30).ToString("yyyy-MM-dd");

        string username = Environment.GetEnvironmentVariable("CLIST_USERNAME")!;
        string apiKey   = Environment.GetEnvironmentVariable("CLIST_API_KEY")!;

        var clistQuery = HttpUtility.ParseQueryString(string.Empty);
        clistQuery["username"] = username;
        clistQuery["api_key"] = apiKey;
        clistQuery["resource__in"] = platforms;
        clistQuery["order_by"] = "start";
        clistQuery["limit"] = "50";

        if (!string.IsNullOrEmpty(from))
            clistQuery["start__gte"] = from;

        if (!string.IsNullOrEmpty(to))
            clistQuery["start__lte"] = to;

        string clistUrl =
            "https://clist.by/api/v2/contest/?" + clistQuery.ToString();

        var clistResponse = await _httpClient.GetAsync(clistUrl);
        string json = await clistResponse.Content.ReadAsStringAsync();
        string connectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage");
        string fileName = "contestdata.json";
        string containerName = "contestdata";
         var blobServiceClient = new BlobServiceClient(connectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
            await containerClient.CreateIfNotExistsAsync();

            var blobClient = containerClient.GetBlobClient(fileName);

            using var ms = new MemoryStream(Encoding.UTF8.GetBytes(json));
            await blobClient.UploadAsync(ms, overwrite: true);

            _logger.LogInformation($"JSON file written to blob: {fileName}");
        _logger.LogInformation("C# Timer trigger function execution ended at: {endTime}", DateTime.Now);
        
        if (myTimer.ScheduleStatus is not null)
        {
            _logger.LogInformation("Next timer schedule at: {nextSchedule}", myTimer.ScheduleStatus.Next);
        }
    }
}
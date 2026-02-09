using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Web;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace CPContest
{
    public class GetContestDataByTime
    {
        private readonly ILogger _logger;

        public GetContestDataByTime(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<GetContestDataByTime>();
        }

        [Function("GetContestDataByTime")]
        public async Task Run([TimerTrigger("0 9 7 * * *")] TimerInfo myTimer)
        {
            _logger.LogInformation(
                "Function execution started at: {time}",
                DateTime.UtcNow
            );

            string platforms =
                "codeforces.com,codechef.com,leetcode.com,atcoder.jp,topcoder.com,hackerrank.com";

            string from = DateTime.UtcNow.Date.ToString("yyyy-MM-dd");
            string to   = DateTime.UtcNow.Date.AddDays(30).ToString("yyyy-MM-dd");

            string username = Environment.GetEnvironmentVariable("CLIST_USERNAME")!;
            string apiKey   = Environment.GetEnvironmentVariable("CLIST_API_KEY")!;

            var query = HttpUtility.ParseQueryString(string.Empty);
            query["username"] = username;
            query["api_key"] = apiKey;
            query["resource__in"] = platforms;
            query["order_by"] = "start";
            query["limit"] = "50";
            query["start__gte"] = from;
            query["start__lte"] = to;
            query["_"] = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();

            string clistUrl =
                "https://clist.by/api/v2/contest/?" + query.ToString();

            using var httpClient = new HttpClient();

            var request = new HttpRequestMessage(HttpMethod.Get, clistUrl);

            request.Headers.CacheControl = new CacheControlHeaderValue
            {
                NoCache = true,
                NoStore = true,
                MustRevalidate = true
            };

            request.Headers.Pragma.ParseAdd("no-cache");
            request.Headers.IfNoneMatch.Clear();
            request.Headers.IfModifiedSince = null;

            request.Headers.UserAgent.ParseAdd(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            );

            HttpResponseMessage response = await httpClient.SendAsync(request);

            _logger.LogInformation(
                "CLIST response status: {status}",
                response.StatusCode
            );

            response.EnsureSuccessStatusCode();

            string json = await response.Content.ReadAsStringAsync();

            string connectionString =
                Environment.GetEnvironmentVariable("AzureWebJobsStorage")!;

            string containerName = "contestdata";
            string fileName = "contestdata.json";

            var blobServiceClient = new BlobServiceClient(connectionString);
            var containerClient =
                blobServiceClient.GetBlobContainerClient(containerName);

            await containerClient.CreateIfNotExistsAsync();

            var blobClient = containerClient.GetBlobClient(fileName);

            using var ms = new MemoryStream(Encoding.UTF8.GetBytes(json));
            await blobClient.UploadAsync(ms, overwrite: true);

            _logger.LogInformation(
                "JSON file successfully written to blob: {file}",
                fileName
            );

            _logger.LogInformation(
                "Function execution finished at: {time}",
                DateTime.UtcNow
            );

            if (myTimer.ScheduleStatus is not null)
            {
                _logger.LogInformation(
                    "Next timer schedule at: {next}",
                    myTimer.ScheduleStatus.Next
                );
            }
        }
    }
}
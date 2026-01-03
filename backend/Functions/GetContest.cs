using System.Net;
using System.Web;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

public class GetContests
{
    private readonly HttpClient _httpClient = new();

    [Function("GetContests")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
    {
        var query = HttpUtility.ParseQueryString(req.Url.Query);

        string platforms = query["platforms"] ?? "codeforces.com,codechef.com";
        string from = query["from"]; 
        string to   = query["to"];  

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

        var response = req.CreateResponse(HttpStatusCode.OK);
        response.Headers.Add("Content-Type", "application/json");
        await response.WriteStringAsync(json);

        return response;
    }
}

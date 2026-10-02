namespace RouteAnalytics.Domain.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public T? Err { get; set; }

    public static ApiResponse<T> CreateSuccess(string message, T? data = default)
    {
        return new ApiResponse<T> {Success = true, Message = message, Data = data};
    }

    public static ApiResponse<T> CreateFailure(string message, T? err = default)
    {
        return new ApiResponse<T> {Success = false, Message = message, Err = err};
    }
}
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Data.Common;

namespace API.Infrastructure;

// Logs any database command that takes longer than the configured threshold.
// Register once in Program.cs; fires automatically for every EF Core command.
// Useful in production to identify queries that degrade under load without
// adding timing code to every repository method.
public class SlowQueryInterceptor(
    ILogger<SlowQueryInterceptor> logger,
    int thresholdMs = 50) : DbCommandInterceptor
{
    // Called after a reader command completes (SELECT queries).
    public override DbDataReader ReaderExecuted(
        DbCommand command,
        CommandExecutedEventData eventData,
        DbDataReader result)
    {
        LogIfSlow(eventData.Duration, command.CommandText);
        return result;
    }

    public override ValueTask<DbDataReader> ReaderExecutedAsync(
        DbCommand command,
        CommandExecutedEventData eventData,
        DbDataReader result,
        CancellationToken cancellationToken = default)
    {
        LogIfSlow(eventData.Duration, command.CommandText);
        return ValueTask.FromResult(result);
    }

    private void LogIfSlow(TimeSpan duration, string sql)
    {
        if (duration.TotalMilliseconds >= thresholdMs)
            logger.LogWarning(
                "Slow query detected ({DurationMs}ms):\n{Sql}",
                (int)duration.TotalMilliseconds,
                sql);
    }
}

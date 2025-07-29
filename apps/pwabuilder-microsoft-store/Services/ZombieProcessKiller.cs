using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Services
{
    /// <summary>
    /// Kills a process after a specified period of time.
    /// </summary>
    public sealed class ZombieProcessKiller : IDisposable
    {
        private readonly ConcurrentDictionary<int, ProcWithKillDate> monitoredProcs = new();
        private readonly Timer timer;
        private readonly ILogger<ZombieProcessKiller> logger;

        public ZombieProcessKiller(ILogger<ZombieProcessKiller> logger)
        {
            this.logger = logger;
            this.timer = new Timer(_ => CheckProcsToKill(), null, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(1));
        }

        public void KillProcessAfter(Process proc, TimeSpan timeSpan)
        {
            var procWithKill = new ProcWithKillDate(proc, DateTimeOffset.UtcNow.Add(timeSpan));
            monitoredProcs.AddOrUpdate(procWithKill.GetHashCode(), procWithKill, (i, p) => p);
        }

        private void CheckProcsToKill()
        {
            foreach (var (id, procWithKillDate) in monitoredProcs.ToArray())
            {
                if (procWithKillDate.KillDate <= DateTimeOffset.UtcNow)
                {
                    TryKillProcess(procWithKillDate.Proc);
                    monitoredProcs.Remove(id, out _);
                }
            }
        }

        private void TryKillProcess(Process proc)
        {
            // Are we already dead?
            try
            {
                proc.Kill(entireProcessTree: true);
            }
            catch (Exception error)
            {
                if (error.Message != "No process is associated with this object.")
                {
                    logger.LogError(error, "Error killing zombie process");
                }
            }
        }

        public void Dispose()
        {
            this.timer.Dispose();
        }

        public record ProcWithKillDate(Process Proc, DateTimeOffset KillDate);
    }
}

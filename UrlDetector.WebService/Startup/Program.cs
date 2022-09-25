using System;
using System.Configuration;
using System.Diagnostics;
using System.Text;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.EventLog;

using lingvo.urls;

namespace UrlDetector.WebService
{
    /// <summary>
    /// 
    /// </summary>
    internal static class Config
    {
        public static readonly string URL_DETECTOR_RESOURCES_XML_FILENAME = ConfigurationManager.AppSettings[ "URL_DETECTOR_RESOURCES_XML_FILENAME"  ];
        public static readonly int    CONCURRENT_FACTORY_INSTANCE_COUNT   = (int.TryParse( ConfigurationManager.AppSettings[ "CONCURRENT_FACTORY_INSTANCE_COUNT" ], out var x ) ? Math.Max( 1, x ) : Environment.ProcessorCount);
    }

    /// <summary>
    /// 
    /// </summary>
    internal static class Program
    {
        public const string SERVICE_NAME = "UrlDetector.WebService";

        private static async Task Main( string[] args )
        {
            var hostApplicationLifetime = default(IHostApplicationLifetime);
            var logger                  = default(ILogger);
            try
            {
                Encoding.RegisterProvider( CodePagesEncodingProvider.Instance );

                var config            = new UrlDetectorConfig( Config.URL_DETECTOR_RESOURCES_XML_FILENAME );
                var concurrentFactory = new ConcurrentFactory( config, Config.CONCURRENT_FACTORY_INSTANCE_COUNT );
                //---------------------------------------------------------------//

                var host = Host.CreateDefaultBuilder( args )
                               .ConfigureLogging( loggingBuilder => loggingBuilder.ClearProviders().AddDebug().AddConsole().AddEventSourceLogger()
                                                              .AddEventLog( new EventLogSettings() { LogName = SERVICE_NAME, SourceName = SERVICE_NAME } ) )
                               //---.UseWindowsService()
                               .ConfigureServices( (hostContext, services) => services.AddSingleton( concurrentFactory ) )
                               .ConfigureWebHostDefaults( webBuilder => webBuilder.UseStartup< Startup >() )
                               .Build();
                hostApplicationLifetime = host.Services.GetService< IHostApplicationLifetime >();
                logger                  = host.Services.GetService< ILoggerFactory >()?.CreateLogger( SERVICE_NAME );
                await host.RunAsync();
            }
            catch ( OperationCanceledException ex ) when ((hostApplicationLifetime?.ApplicationStopping.IsCancellationRequested).GetValueOrDefault())
            {
                Debug.WriteLine( ex ); //suppress
            }
            catch ( Exception ex ) when (logger != null)
            {
                logger.LogCritical( ex, "Global exception handler" );
            }
        }
    }
}

using System;
using System.Configuration;
using System.Web;

using lingvo.urls;
using Newtonsoft.Json;

namespace lingvo
{
    /// <summary>
    /// 
    /// </summary>
    internal static class Config
    {
        public static readonly string URL_DETECTOR_RESOURCES_XML_FILENAME  = ConfigurationManager.AppSettings[ "URL_DETECTOR_RESOURCES_XML_FILENAME"  ];

        public static readonly int    MAX_INPUTTEXT_LENGTH              = int.Parse( ConfigurationManager.AppSettings[ "MAX_INPUTTEXT_LENGTH" ] );
        public static readonly int    CONCURRENT_FACTORY_INSTANCE_COUNT = int.Parse( ConfigurationManager.AppSettings[ "CONCURRENT_FACTORY_INSTANCE_COUNT" ] );
    }
}

namespace lingvo.core
{
    /// <summary>
    /// Summary description for RESTProcessHandler
    /// </summary>
    public sealed class RESTProcessHandler : IHttpHandler
    {
        /// <summary>
        /// 
        /// </summary>
        private struct result
        {
            public result( Exception ex ) : this()
            {
                exceptionMessage = ex.ToString();
            }
            public result( url_t[] _urls ) : this()
            {
                urls = _urls;
            }

            [JsonProperty(PropertyName="err")]
            public string exceptionMessage
            {
                get;
                private set;
            }

            [JsonProperty(PropertyName="urls")] public url_t[] urls
            {
                get;
                set;
            }
        }

        /// <summary>
        /// 
        /// </summary>
        private struct http_context_data
        {
            private static readonly object _SyncLock = new object();
            private readonly HttpContext _Context;

            public http_context_data( HttpContext context ) : this()
            {
                _Context = context;
            }

            /*private ConcurrentFactory _ConcurrentFactory
            {
                get { return ((ConcurrentFactory) _Context.Cache[ "_ConcurrentFactory" ]); }
                set
                {                    
                    if ( value != null )
                        _Context.Cache[ "_ConcurrentFactory" ] = value;
                    else
                        _Context.Cache.Remove( "_ConcurrentFactory" );
                }
            }*/

            private static ConcurrentFactory _ConcurrentFactory;

            public ConcurrentFactory GetConcurrentFactory()
            {
                var f = _ConcurrentFactory;
                if ( f == null )
                {
                    lock ( _SyncLock )
                    {
                        f = _ConcurrentFactory;
                        if ( f == null )
                        {
                            var config = new UrlDetectorConfig( Config.URL_DETECTOR_RESOURCES_XML_FILENAME )
                            {
                                UrlExtractMode = UrlDetector.UrlExtractModeEnum.Position,
                            };
                            f = new ConcurrentFactory( config, Config.CONCURRENT_FACTORY_INSTANCE_COUNT );
                            _ConcurrentFactory = f;
                        }
                    }
                }
                return (f);
            }
        }

        static RESTProcessHandler()
        {
            Environment.CurrentDirectory = HttpContext.Current.Server.MapPath( "~/" );
        }

        public bool IsReusable
        {
            get { return (true); }
        }

        public void ProcessRequest( HttpContext context )
        {
            try
            {
                var text = context.GetRequestStringParam( "text", Config.MAX_INPUTTEXT_LENGTH );
                var hcd = new http_context_data( context );
                var factory = hcd.GetConcurrentFactory();

                var urls = factory.Run( text );

                SendJsonResponse( context, urls );
            }
            catch ( Exception ex )
            {
                SendJsonResponse( context, ex );
            }
        }

        private static void SendJsonResponse( HttpContext context, url_t[] urls )
        {
            SendJsonResponse( context, new result( urls ) );
        }
        private static void SendJsonResponse( HttpContext context, Exception ex )
        {
            SendJsonResponse( context, new result( ex ) );
        }
        private static void SendJsonResponse( HttpContext context, result result )
        {
            context.Response.ContentType = "application/json";
            //---context.Response.Headers.Add( "Access-Control-Allow-Origin", "*" );

            var json = JsonConvert.SerializeObject( result );
            context.Response.Write( json );
        }
    }

    /// <summary>
    /// 
    /// </summary>
    internal static class Extensions
    {
        public static bool Try2Boolean( this string value, bool defaultValue )
        {
            if ( value != null )
            {
                var result = default(bool);
                if ( bool.TryParse( value, out result ) )
                    return (result);
            }
            return (defaultValue);
        }

        public static string GetRequestStringParam( this HttpContext context, string paramName, int maxLength )
        {
            var value = context.Request[ paramName ];
            if ( (value != null) && (maxLength < value.Length) && (0 < maxLength) )
            {
                return (value.Substring( 0, maxLength ));
            }
            return (value);
        }
    }
}
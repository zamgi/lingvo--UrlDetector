using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

using Newtonsoft.Json;

namespace lingvo.core
{
    /// <summary>
    /// Summary description for LoadTextHandler
    /// </summary>
    public sealed class LoadTextHandler : IHttpHandler
    {
        /// <summary>
        /// 
        /// </summary>
        public struct result_info
        {
            public string text
            {
                get;
                set;
            }
        }

        public bool IsReusable
        {
            get { return (true); }
        }

        public void ProcessRequest( HttpContext context )
        {
            context.Response.ContentType = "application/json";
            //context.Response.Headers.Add( "Access-Control-Allow-Origin", "*" );

            var path = context.Server.MapPath( "~/App_Data" );
            var result = new result_info()
            {
                text = File.ReadAllText( Path.Combine( path, "text.txt" ) ),
            };
            var json = JsonConvert.SerializeObject( result );
            context.Response.Write( json );
        }

        private static int TryGetNgramLength( string path )
        {
            try
            {
                var ngramLength = int.Parse( File.ReadAllText( Path.Combine( path, "ngramLength.txt" ) ) );
                return (ngramLength);
            }
            catch
            {
                return (4);
            }
        }

        public static void SaveNoThrow( HttpContext context, string text )
        {
            try
            {
                var path = context.Server.MapPath( "~/App_Data" );
                if ( !Directory.Exists( path ) )
                {
                    Directory.CreateDirectory( path );
                }

                File.WriteAllText( Path.Combine( path, "text.txt" ), text );
            }
            catch ( Exception ex )
            {
                System.Diagnostics.Debug.WriteLine( ex );
            }
        }
    }
}
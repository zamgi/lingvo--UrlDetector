using System;

using lingvo.urls;
using JP = System.Text.Json.Serialization.JsonPropertyNameAttribute;

namespace UrlDetector.WebService
{
    /// <summary>
    /// 
    /// </summary>
    public struct InitParamsVM
    {
        public string Text { get; set; }

#if DEBUG
        public override string ToString() => Text;
#endif
    }

    /// <summary>
    /// 
    /// </summary>
    internal readonly struct ResultVM
    {
        /// <summary>
        /// 
        /// </summary>
        public readonly struct value_t
        {
            [JP( "startIndex")] public int    startIndex { get; init; }
            [JP( "length")    ] public int    length     { get; init; }
#if DEBUG
            [JP("value")      ] public string value      { get; init; }
#endif
        }

        public ResultVM( in InitParamsVM m, Exception ex ) : this() => (InitParams, ExceptionMessage) = (m, ex.ToString());
        public ResultVM( in InitParamsVM m, in url_t[] urls ) : this()
        {
            InitParams = m;
            Values     = new value_t[ urls.Length ];
            for ( int i = 0, len = urls.Length; i < len; i++ )
            {
                var url = urls[ i ];
                Values[ i ] = new value_t()
                {
                    startIndex = url.startIndex,
                    length     = url.length,
#if DEBUG
                    value      = url.value,
#endif
                };
            }
        }

        [JP("ip")  ] public InitParamsVM InitParams       { get; }
        [JP("err") ] public string       ExceptionMessage { get; }
        [JP("urls")] public value_t[]    Values           { get; }
    }
}

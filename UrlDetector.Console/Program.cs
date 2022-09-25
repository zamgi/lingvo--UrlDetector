using System;
using System.Configuration;
using System.Linq;

using lingvo.urls;

namespace ConsoleApplication1
{
    /// <summary>
    /// 
    /// </summary>
    internal static class Program
    {
        public static readonly string URL_DETECTOR_RESOURCES_XML_FILENAME = ConfigurationManager.AppSettings[ "URL_DETECTOR_RESOURCES_XML_FILENAME" ];

        private static void Main( string[] args )
        {
            try
            {
                var config = new UrlDetectorConfig( URL_DETECTOR_RESOURCES_XML_FILENAME, UrlDetector.UrlExtractModeEnum.ValueAndPosition );
                using var urlDetector = new UrlDetector( config );

                var urls = urlDetector.AllocateUrls( " .ac   .net framework v4.7      ms.net framework v4.7" );
                /*var urls = urlDetector.AllocateUrls( @"http://ru.wikipedia.org/wiki/Уильямс_(команда_Формулы-1)
    Газета.ru
    Газета.ру
    ...тильных предприятий, сообщает vb.kg. ru. Сейчас в Кыргызстане piece-of-shit.com необходимо vb.kg.ru развивать те...
    ...обычи платины в стране, пишет КаталогМинералов.ру со ссылкой на Дэвида Бинни, генерального менеджер..." );
                */

                Console.WriteLine( urls.Any() ? string.Join("\r\n", urls) : "url\'s not found" );
            }
            catch ( Exception ex )
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine( ex );
                Console.ResetColor();
            }
            Console.WriteLine( Environment.NewLine + "[.....finita fusking comedy.....]" );
            Console.ReadLine();
        }
    }
}

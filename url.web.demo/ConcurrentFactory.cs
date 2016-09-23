using System;
using System.Linq;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Threading;

using lingvo.urls;

namespace lingvo.core
{
    /// <summary>
    /// 
    /// </summary>
	internal sealed class ConcurrentFactory
	{
		private Semaphore                      _Semaphore;
        private ConcurrentStack< UrlDetector > _Stack;

        public ConcurrentFactory( UrlDetectorConfig config, int instanceCount )
		{
            if ( instanceCount <= 0 ) throw (new ArgumentException("instanceCount"));

            _Semaphore = new Semaphore( instanceCount, instanceCount );
            _Stack = new ConcurrentStack< UrlDetector >();
			for ( int i = 0; i < instanceCount; i++ )
			{
                _Stack.Push( new UrlDetector( config ) );
			}			
		}

        public url_t[] Run( string text )
		{
			_Semaphore.WaitOne();
			var worker = default(UrlDetector);
			try
			{
                worker = _Stack.Pop();
                if ( worker == null )
                {
                    for ( var i = 0; ; i++ )
                    {
                        worker = _Stack.Pop();
                        if ( worker != null )
                            break;

                        Thread.Sleep( 25 ); //SpinWait.SpinUntil(

                        if ( 10000 <= i )
                            throw (new InvalidOperationException( this.GetType().Name + ": no (fusking) worker item in queue" ));
                    }
                }

                var result = worker.AllocateUrls( text ).ToArray();
                return (result);
			}
			finally
			{
				if ( worker != null )
				{
					_Stack.Push( worker );
				}
				_Semaphore.Release();
			}

            throw (new InvalidOperationException( this.GetType().Name + ": nothing to return (fusking)" ));
		}
	}

    /// <summary>
    /// 
    /// </summary>
    internal static class ConcurrentFactoryExtensions
    {
        public static T Pop< T >( this ConcurrentStack< T > stack )
        {
            var t = default(T);
            if ( stack.TryPop( out t ) )
                return (t);
            return (default(T));
        }
    }
}

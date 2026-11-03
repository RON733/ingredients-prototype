import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance = null;

export function initEcho() {
  if (typeof window === 'undefined') return null;
  if (echoInstance) return echoInstance;

  try {
    const isHttps = window.location.protocol === 'https:';
    const wsHost = window.GST_REVERB_HOST || window.location.hostname || '127.0.0.1';
    const defaultPort = isHttps ? 443 : 8080;
    const wsPort = window.GST_REVERB_PORT || defaultPort;
    const wssPort = window.GST_REVERB_PORT || defaultPort;

    window.Pusher = Pusher;
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: window.GST_REVERB_KEY || 'aap9fufewjheyroh7txe',
      wsHost: wsHost,
      wsPort: wsPort,
      wssPort: wssPort,
      forceTLS: isHttps,
      enabledTransports: ['ws', 'wss'],
    });

    window.Echo = echoInstance;
    console.log(`⚡ [Reverb] Real-Time WebSocket connected (${isHttps ? 'WSS' : 'WS'}) via ${wsHost}:${isHttps ? wssPort : wsPort}`);
    return echoInstance;
  } catch (err) {
    console.warn('⚠️ [Reverb] Failed to initialize Echo:', err);
    return null;
  }
}

export default initEcho;

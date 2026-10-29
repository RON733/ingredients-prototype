// Initialize Laravel Echo for Laravel Reverb
(function() {
  if (typeof Pusher !== 'undefined' && typeof Echo !== 'undefined') {
    try {
      const isHttps = window.location.protocol === 'https:';
      const wsHost = window.GST_REVERB_HOST || window.location.hostname || '127.0.0.1';
      // In production (HTTPS), WebSockets use standard WSS on port 443 (or custom port)
      // In local development (HTTP), WebSockets connect to Reverb port 8080
      const defaultPort = isHttps ? 443 : 8080;
      const wsPort = window.GST_REVERB_PORT || defaultPort;
      const wssPort = window.GST_REVERB_PORT || defaultPort;

      window.Pusher = Pusher;
      window.Echo = new Echo({
        broadcaster: 'reverb',
        key: window.GST_REVERB_KEY || 'aap9fufewjheyroh7txe',
        wsHost: wsHost,
        wsPort: wsPort,
        wssPort: wssPort,
        forceTLS: isHttps,
        enabledTransports: ['ws', 'wss'],
      });
      console.log(`⚡ [Reverb] Real-Time WebSocket connected (${isHttps ? 'WSS' : 'WS'}) via ${wsHost}:${isHttps ? wssPort : wsPort}`);
    } catch (err) {
      console.warn('⚠️ [Reverb] Failed to initialize Echo:', err);
    }
  }
})();

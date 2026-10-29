// Initialize Laravel Echo for Laravel Reverb
(function() {
  if (typeof Pusher !== 'undefined' && typeof Echo !== 'undefined') {
    try {
      window.Pusher = Pusher;
      window.Echo = new Echo({
        broadcaster: 'reverb',
        key: 'aap9fufewjheyroh7txe',
        wsHost: window.location.hostname || '127.0.0.1',
        wsPort: 8080,
        wssPort: 8080,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
      });
      console.log('⚡ [Reverb] Real-Time WebSocket connected on port 8080');
    } catch (err) {
      console.warn('⚠️ [Reverb] Failed to initialize Echo:', err);
    }
  }
})();
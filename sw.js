const CACHE_NAME = 'freelance-route-v6';
const ASSETS = ['./', './index.html', './style.css', './manifest.json', './assets/parcours.jpeg', './assets/pixel.ttf',
    ...['config', 'utils', 'data', 'storage', 'audio', 'characters', 'world', 'player', 'controls', 'ui', 'progression', 'interactions', 'challenges', 'main'].map(name => `./js/${name}.js`)];
self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('freelance-route-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
            const response = await fetch(request);
            if (response.ok) await cache.put(request, response.clone());
            return response;
        } catch (error) {
            const cached = await cache.match(request);
            if (cached) return cached;
            if (request.mode === 'navigate') return await cache.match('./index.html') || Response.error();
            return Response.error();
        }
    })());
});

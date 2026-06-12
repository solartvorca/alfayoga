const CACHE_NAME = 'raduga-luna-v22';

const STATIC_ASSETS = [
    'index.html',
    'login.html',
    'marathon.html',
    'profile.html',
    'wishes.html',
    'rating.html',
    'courses.html',
    'course.html',
    'lesson.html',
    'dice.html',
    'lifestyle.html',
    'planner.html',
    'notifications.html',
    'habits.html',
    'shop.html',
    'removed.html',
    'games.html',
    'welcome.html',
    'view-profile.html',
    'base.html',
    'styles.css',
    'app.js',
    'kukuet-kukushka.mp3',
    'auth.js',
    'ai.js',
    'mobile-nav.js',
    'firebase-config.js',
    'icon.png',
    'manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.allSettled(
                STATIC_ASSETS.map(url => cache.add(url).catch(() => {}))
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const url = event.request.url;

    // Firebase и внешние API — только сеть (без кеширования)
    if (url.includes('firestore.googleapis.com') ||
        url.includes('googleapis.com') ||
        url.includes('gstatic.com') ||
        url.includes('firebase') ||
        url.includes('chrome-extension') ||
        url.includes('huggingface.co') ||
        url.includes('openrouter.ai') ||
        url.includes('stability.ai') ||
        url.includes('pollinations.ai') ||
        url.includes('generativelanguage.googleapis.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cached => {
            const networkFetch = fetch(event.request).then(response => {
                if (response && response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => cached);

            // Для HTML — сначала сеть (свежий контент), для остального — кэш первым
            if (event.request.destination === 'document') {
                return networkFetch;
            }
            return cached || networkFetch;
        })
    );
});

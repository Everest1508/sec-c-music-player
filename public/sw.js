const CACHE_NAME = 'secc-music-v1'
const AUDIO_CACHE_NAME = 'secc-music-audio-v1'

// Cache essential app resources
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/App.vue',
  '/icons/web-app-manifest-192x192.png',
  '/icons/web-app-manifest-512x512.png'
]

self.addEventListener('install', (event) => {
  console.log('Service Worker Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell')
        return cache.addAll(urlsToCache)
      })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== AUDIO_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Handle audio files with special caching strategy
  if (request.url.includes('audio') || request.url.includes('.mp3') || request.url.includes('.m4a')) {
    event.respondWith(
      caches.open(AUDIO_CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            console.log('Serving audio from cache:', request.url)
            return response
          }
          
          return fetch(request).then((fetchResponse) => {
            // Only cache successful responses
            if (fetchResponse.status === 200) {
              cache.put(request, fetchResponse.clone())
            }
            return fetchResponse
          })
        })
      })
    )
    return
  }
  
  // Handle API requests
  if (url.hostname === 'song-scraper.riteshmahale15.workers.dev') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            // Serve from cache but also fetch fresh data in background
            fetch(request).then((fetchResponse) => {
              if (fetchResponse.status === 200) {
                cache.put(request, fetchResponse.clone())
              }
            }).catch(() => {})
            return response
          }
          
          return fetch(request).then((fetchResponse) => {
            if (fetchResponse.status === 200) {
              cache.put(request, fetchResponse.clone())
            }
            return fetchResponse
          }).catch(() => {
            // Return a basic error response if offline
            return new Response(JSON.stringify({ error: 'Offline' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            })
          })
        })
      })
    )
    return
  }
  
  // Default caching strategy for other requests
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request)
    })
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  event.notification.close()
  
  // Focus or open the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let client of clientList) {
        if (client.url === self.registration.scope && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered')
    // Handle any offline actions here
  }
})

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icons/web-app-manifest-192x192.png',
      badge: '/icons/web-app-manifest-144x144.png',
      vibrate: [100, 50, 100],
      data: data.data || {}
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})
  
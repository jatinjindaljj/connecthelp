// Service Worker for ConnectKeep
const CACHE_NAME = 'connectkeep-v1';

// Files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Push notification event
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body || 'Check your birthday reminders today!',
    icon: '/notification-icon.png',
    badge: '/notification-badge.png',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ConnectKeep Reminder', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Schedule daily notification at 12 AM
self.addEventListener('periodicsync', event => {
  if (event.tag === 'daily-birthday-reminder') {
    event.waitUntil(showDailyNotification());
  }
});

// Function to show daily notification
async function showDailyNotification() {
  const title = 'ConnectKeep Daily Reminder';
  const options = {
    body: 'Check for birthday wishes and special events today!',
    icon: '/notification-icon.png',
    badge: '/notification-badge.png',
    data: {
      url: '/contacts'
    }
  };
  
  return self.registration.showNotification(title, options);
}

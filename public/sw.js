/* OnCall Clinic — Service Worker — Round 17-F.
 *
 * Minimal SW: only handles 'push' + 'notificationclick' events.
 * Does NOT cache anything (Next.js static + ISR handles its own
 * caching; adding sw caching here would create cache-vs-deploy bugs).
 *
 * Deployed at /sw.js (root scope). Registered by
 * components/shared/PushSubscriber.tsx via navigator.serviceWorker
 * .register('/sw.js'). Updates auto-fetched by browser when
 * Vercel re-deploys (sw.js byte change → SW.update → new install
 * fires → activate when no clients).
 */

self.addEventListener('install', (event) => {
  // Take over immediately on first install / on update — no need to
  // wait for all tabs to close.
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch (e) {
    payload = { title: 'OnCall Clinic', body: event.data.text() || 'Notificación' }
  }

  const title = payload.title || 'OnCall Clinic'
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icon.png',
    badge: payload.badge || '/icon.png',
    tag: payload.tag || 'oncall-default', // collapses duplicates per tag
    data: { url: payload.url || '/' },
    requireInteraction: !!payload.requireInteraction,
    vibrate: [100, 50, 100], // mobile feedback (ignored on desktop)
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // If a tab is already on the same origin, focus it + navigate
        for (const client of windowClients) {
          if ('focus' in client) {
            client.focus()
            if ('navigate' in client) {
              try {
                client.navigate(url)
              } catch (e) {
                // older browsers
              }
            }
            return
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url)
        }
      }),
  )
})

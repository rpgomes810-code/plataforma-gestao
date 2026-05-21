self.addEventListener('push', function(event) {
  const data = event.data?.json() || {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'DARPE', {
      body: data.body || 'Nova notificação',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '/dashboard' }
    })
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  const url = event.notification.data?.url || '/dashboard'
  event.waitUntil(clients.openWindow(url))
})
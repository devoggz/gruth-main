// public/sw.js
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body:    data.body,
            icon:    '/icons/icon-192.png',
            badge:   '/icons/icon-192.png',
            data:    { url: data.url ?? '/dashboard' },
            tag:     data.tag ?? 'gruth-notification',   // replaces duplicate notifications
            renotify: true,
        })
    );
});

// Tap notification → open/focus the correct page
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url ?? '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If app already open, focus and navigate
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.focus();
                        client.navigate(url);
                        return;
                    }
                }
                // Otherwise open a new window
                if (clients.openWindow) return clients.openWindow(url);
            })
    );
});
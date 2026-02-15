// Force activate new versions immediately
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Claim existing pages
self.addEventListener("activate", () => {
  console.log("Service Worker activated");
  self.clients.claim();
});

// Push event handler
self.addEventListener("push", event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error("Push parse error:", e);
  }

  const title = data.title || "THV Alert";
  const body = data.body || "New notification";

  // Always default to the PWA area, never /
  const url = data.url || "/pwa/";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/pwa/icons/icon-192.png",
      data: { url }
    })
  );
});

// When notification is tapped
self.addEventListener("notificationclick", event => {
  event.notification.close();

  const url = event.notification.data?.url || "/pwa/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(all => {
        for (const client of all) {
          if (client.url.includes("/pwa/") && "focus" in client) {
            client.focus();
            return;
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// The preview has moved to /apps/scripturebridge/. This worker removes itself.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  await self.registration.unregister();
  for (const c of await self.clients.matchAll({ type: 'window' })) c.navigate('/apps/scripturebridge/');
})()));

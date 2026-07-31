/* Service Worker — Plataforma Estamos Contigo (PWA)
   Estrategia: precache del app-shell + cache-first con actualización en segundo plano.
   Permite abrir y operar la plataforma sin conexión (modo offline de las Bases Técnicas);
   los registros hechos sin señal se encolan en la app y se sincronizan al volver la conexión. */
const CACHE = "estamos-contigo-v1";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      const red = fetch(req)
        .then((res) => {
          if (res && res.ok && new URL(req.url).origin === location.origin) {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
          }
          return res;
        })
        .catch(() => hit || caches.match("./index.html"));
      return hit || red;
    })
  );
});

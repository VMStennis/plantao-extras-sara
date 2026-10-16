// Plantão & Extras — funciona offline. Troque a versão a cada novo deploy.
const CACHE = 'plantao-extras-v4';
// Caminhos relativos ao escopo: funciona na raiz (Netlify) e em subpasta (GitHub Pages)
const BASE = self.registration.scope;
const CORE = ['', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'].map(p => BASE + p);
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Página: tenta a rede primeiro (pega atualizações), cai no cache sem internet
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(BASE + 'index.html', c)); return r; }).catch(() => caches.match(BASE + 'index.html')));
    return;
  }
  // Ícones, manifesto, fontes e SDK do Firebase (URL com versão): cache primeiro
  if (url.origin === location.origin || url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com') || url.href.startsWith('https://www.gstatic.com/firebasejs/')) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; })));
  }
});

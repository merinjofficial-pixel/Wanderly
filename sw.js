const CACHE='wanderly-startup-fix-v13';
const CORE=['./index.html','./camera.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{const cache=await caches.open(CACHE);await Promise.allSettled(CORE.map(url=>cache.add(url)));await self.skipWaiting()})());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('wanderly-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})());
});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin)return;
 if(req.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname.endsWith('/camera.js')){
  event.respondWith((async()=>{
   try{const fresh=await fetch(req,{cache:'no-store'});if(fresh.ok){const c=await caches.open(CACHE);event.waitUntil(c.put(req,fresh.clone()))}return fresh}
   catch(e){return await caches.match(req)||await caches.match('./index.html')||Response.error()}
  })());return;
 }
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{
  if(response.ok)event.waitUntil(caches.open(CACHE).then(c=>c.put(req,response.clone())));
  return response;
 })));
});

var CACHE = 'restaurant_cache';
var urlsToCache = [
  '/',
  '/css/styles.css',
  '/images',
  '/images_35',
  'img',
  '/js/main.js',
  '/js/dbhelper.js',
  '/js/restaurant_info.js',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js'
];

self.addEventListener('install', function(event) {
  console.log('install process... iniciated');
  caches.open(CACHE).then(function(cache) {
      console.log('Opened cache restaurant');
      return cache.addAll(urlsToCache);
    });
});

self.addEventListener('active', function(event){

});

self.addEventListener('fetch', function(event) {
  event.waitUntil(
      event.respondWith(
        caches.match(event.request).then(function(response) {
          if (response) {
            return response;
          }
          var request = event.request.clone();
            return fetch(request).then(function(response){
              if(!response || response !==200){
                return response;
              }
                var responseCache = response.clone();
                caches.open(CACHE).then(function(cache){
                  cache.put(event.request,responseCache);
                });
                return response;
            });
        })
    )
  );
});

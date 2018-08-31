import { set, get } from 'idb-keyval';
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
  '/js/register.js',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css'
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

function jsonBD(request) {
	return get('restaurants')
		.then(restaurants => {
			return ( restaurants || fetch(request)
				.then(response => response.json())
				.then(restaurantsJ => {
					set('restaurants', restaurantsJ);
					restaurantsJ.forEach(function(rest){
						set(rest.id, rest);
					});
					return restaurantsJ;
				})
			);
		})
		.then(response => new Response(JSON.stringify(response)));
}

self.addEventListener('fetch', function(event) {
	let reqUrl = new URL(event.request.url);

	if(reqUrl.port ==='1337'){
		event.respondWith( jsonBD(event.request))
	}
	else {
    if (reqUrl.origin === location.origin) {
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
  }
	}
});

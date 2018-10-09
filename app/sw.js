import { set, get } from 'idb-keyval';
var CACHE = 'restaurant_cache';
var urlsToCache = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/restaurant.html?id=1',
  '/restaurant.html?id=2',
  '/restaurant.html?id=3',
  '/restaurant.html?id=4',
  '/restaurant.html?id=5',
  '/restaurant.html?id=6',
  '/restaurant.html?id=7',
  '/restaurant.html?id=8',
  '/restaurant.html?id=9',
  '/restaurant.html?id=10',
  '/css/styles.css',
  '/img',
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
  if (request.url.indexOf('reviews') > -1) {

    return fetch(request)
    .then(response => response.json())
    .then(reviewsj => {
      set('reviews', reviewsj);
      return (reviewsj || get('reviews').then(rev=>{return rev;}));
    }).then(response => new Response(JSON.stringify(response)));

    /*return get('reviews')
      .then(rev => {
        return ( rev || fetch(request)
        .then(response => response.json())
        .then(reviewsj => {
          set('reviews', reviewsj);
          return reviewsj;
        })
      );
    }).then(response => new Response(JSON.stringify(response)));*/

  } else {
	return get('restaurants')
		.then(restaurants => {
			return ( restaurants || fetch(request)
				.then(response => response.json())
				.then(restaurantsJ => {
					set('restaurants', restaurantsJ);
					return restaurantsJ;
				})
			);
		})
		.then(response => new Response(JSON.stringify(response)));
  }
}

function cacheResponse(event){
  event.respondWith(
    caches.match(event.request).then(response => {
        return response || fetch(event.request).then(responseF =>{
          return caches.open(CACHE).then(cache => {
            cache.put(event.request, responseF.clone());
            return responseF;
          });
        });
    })
 );
}

self.addEventListener('fetch', function(event) {
	let reqUrl = new URL(event.request.url);

	if(reqUrl.port ==='1337'){
    if(event.request.method !== 'GET'){
      return fetch(event.request).then(resp => resp.json())
     .then(respjson => respjson);
    }else{
      event.respondWith(jsonBD(event.request));
    }

	}
	else {
		event.waitUntil(
				cacheResponse(event)
			);
	}
});

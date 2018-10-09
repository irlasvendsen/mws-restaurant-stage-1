(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _idbKeyval = require("idb-keyval");

var CACHE = 'restaurant_cache';
var urlsToCache = ['/', '/index.html', '/restaurant.html', '/restaurant.html?id=1', '/restaurant.html?id=2', '/restaurant.html?id=3', '/restaurant.html?id=4', '/restaurant.html?id=5', '/restaurant.html?id=6', '/restaurant.html?id=7', '/restaurant.html?id=8', '/restaurant.html?id=9', '/restaurant.html?id=10', '/css/styles.css', '/img', '/js/main.js', '/js/dbhelper.js', '/js/restaurant_info.js', '/js/register.js', 'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js', 'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css'];
self.addEventListener('install', function (event) {
  console.log('install process... iniciated');
  caches.open(CACHE).then(function (cache) {
    console.log('Opened cache restaurant');
    return cache.addAll(urlsToCache);
  });
});
self.addEventListener('active', function (event) {});

function jsonBD(request) {
  if (request.url.indexOf('reviews') > -1) {
    return fetch(request).then(function (response) {
      return response.json();
    }).then(function (reviewsj) {
      (0, _idbKeyval.set)('reviews', reviewsj);
      return reviewsj || (0, _idbKeyval.get)('reviews').then(function (rev) {
        return rev;
      });
    }).then(function (response) {
      return new Response(JSON.stringify(response));
    });
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
    return (0, _idbKeyval.get)('restaurants').then(function (restaurants) {
      return restaurants || fetch(request).then(function (response) {
        return response.json();
      }).then(function (restaurantsJ) {
        (0, _idbKeyval.set)('restaurants', restaurantsJ);
        return restaurantsJ;
      });
    }).then(function (response) {
      return new Response(JSON.stringify(response));
    });
  }
}

function cacheResponse(event) {
  event.respondWith(caches.match(event.request).then(function (response) {
    return response || fetch(event.request).then(function (responseF) {
      return caches.open(CACHE).then(function (cache) {
        cache.put(event.request, responseF.clone());
        return responseF;
      });
    });
  }));
}

self.addEventListener('fetch', function (event) {
  var reqUrl = new URL(event.request.url);

  if (reqUrl.port === '1337') {
    if (event.request.method !== 'GET') {
      return fetch(event.request).then(function (resp) {
        return resp.json();
      }).then(function (respjson) {
        return respjson;
      });
    } else {
      event.respondWith(jsonBD(event.request));
    }
  } else {
    event.waitUntil(cacheResponse(event));
  }
});

},{"idb-keyval":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class Store {
    constructor(dbName = 'keyval-store', storeName = 'keyval') {
        this.storeName = storeName;
        this._dbp = new Promise((resolve, reject) => {
            const openreq = indexedDB.open(dbName, 1);
            openreq.onerror = () => reject(openreq.error);
            openreq.onsuccess = () => resolve(openreq.result);
            // First time setup: create an empty object store
            openreq.onupgradeneeded = () => {
                openreq.result.createObjectStore(storeName);
            };
        });
    }
    _withIDBStore(type, callback) {
        return this._dbp.then(db => new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, type);
            transaction.oncomplete = () => resolve();
            transaction.onabort = transaction.onerror = () => reject(transaction.error);
            callback(transaction.objectStore(this.storeName));
        }));
    }
}
let store;
function getDefaultStore() {
    if (!store)
        store = new Store();
    return store;
}
function get(key, store = getDefaultStore()) {
    let req;
    return store._withIDBStore('readonly', store => {
        req = store.get(key);
    }).then(() => req.result);
}
function set(key, value, store = getDefaultStore()) {
    return store._withIDBStore('readwrite', store => {
        store.put(value, key);
    });
}
function del(key, store = getDefaultStore()) {
    return store._withIDBStore('readwrite', store => {
        store.delete(key);
    });
}
function clear(store = getDefaultStore()) {
    return store._withIDBStore('readwrite', store => {
        store.clear();
    });
}
function keys(store = getDefaultStore()) {
    const keys = [];
    return store._withIDBStore('readonly', store => {
        // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
        // And openKeyCursor isn't supported by Safari.
        (store.openKeyCursor || store.openCursor).call(store).onsuccess = function () {
            if (!this.result)
                return;
            keys.push(this.result.key);
            this.result.continue();
        };
    }).then(() => keys);
}

exports.Store = Store;
exports.get = get;
exports.set = set;
exports.del = del;
exports.clear = clear;
exports.keys = keys;

},{}]},{},[1]);

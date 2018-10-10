/**
 * Common database helper functions.
 */
class DBHelper {


    static get PORT() {
      const port = 1337;
      return port;
    }
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
  //  const port = 1337; // Change this to your server port
    return `http://localhost:${DBHelper.PORT}/restaurants`;
  }

  static get favoriteRestaurants(){
    return `${DBHelper.DATABASE_URL}?is_favorite=true`;
  }

  static favoriteRestaurant(restaurant_id, is_favorite){
    return `${DBHelper.DATABASE_URL}/${restaurant_id}/?is_favorite=${is_favorite}`;
  }

  static restaurantByID(restaurant_id){
    return `${DBHelper.DATABASE_URL}/${restaurant_id}`;
  }
  static get allRestaurantReviews(){
    return `http://localhost:${DBHelper.PORT}/reviews/`;
  }
  static allReviewsRestaurant(restaurant_id){
    return `${DBHelper.allRestaurantReviews}?restaurant_id=${restaurant_id}`;
  }

  static restaurtantByReview(review_id){
    return `${DBHelper.allRestaurantReviews}/${review_id}`;
  }

  static get restaurant_id(){
    const url = window.location.pathname;
    const id = url.substring(url.lastIndexOf('/') + 1);
    return id;
  }

  static saveReview(id, rating, comments, name, callback){
    let reviewPending = []
    reviewPending.length = 0;
    let review = {id, rating, comments, name};
    reviewPending.push(review);
    fetch(DBHelper.allRestaurantReviews,{
     method: 'POST',
     mode:'cors',
     headers: { 'Content-Type': 'application/json; charset=utf-8'
        },
        body:JSON.stringify({restaurant_id: id,
                    name: name,
                    rating: rating,
                    comments: comments
                  })
    }).then(response => {
      console.log(response);
      if(!response.ok){
        console.log('error response not ok');
        iKeyVal.get('reviews_pending').then(val => {
          if (val == undefined){
              console.log(val);
              iKeyVal.set('reviews_pending',reviewPending);
          }else{
            val.push(review);
            iKeyVal.set('reviews_pending',val);
          }
        });
        callback('You are offline, your review will be uploaded when you get online', null);
      }
      else{
        console.log('response ok');
        return response.json();
      }}).then(json => {
        callback(null, json);
      })
    .catch( error => {
        iKeyVal.get('reviews_pending').then(val => {
          if (val == undefined){
              console.log(val);
              iKeyVal.set('reviews_pending',reviewPending);
          }else{
            val.push(review);
            iKeyVal.set('reviews_pending',val);
          }
        });
           callback('You are offline, your review will be uploaded when you get online', null);
    });
  }

  static setFavorite(id, is_favorite, callback){
    fetch(DBHelper.favoriteRestaurant(id,is_favorite),{
      method:'POST',
      mode:'cors',
      headers: { 'Content-Type': 'application/json; charset=utf-8'
         }
    }).then(response =>{
      console.log(response.json());
    });

    callback(null, null);
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
		fetch(DBHelper.DATABASE_URL)
			.then(response => response.json())
			.then(function(data){

				//console.log(data);
				callback(null, data);
			}).catch(e => callback(e, null));
  }

  static fetchReviewByRestaurantId(id, callback) {

    fetch(DBHelper.allReviewsRestaurant(id),{method:'GET'}).then(resp => {
      if (!resp.ok) {
        iKeyVal.get('reviews').then(val => {
          if (val != undefined){
              console.log(val);
              callback(null, val);
          }else{
            throw 'error no reviews';
          }
        });
      }
      resp.json().then(reviews => {
        iKeyVal.set('reviews', reviews);
        callback(null, reviews);
        });
    }).catch(error => callback(error, null));

  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if(restaurant.photograph === undefined)
    {
      return (`/img/default_square.png`)
    }
    return (`/img/${restaurant.photograph}.jpg`);
  }

  static imageUrlForRestaurant50(restaurant){
    if(restaurant.photograph === undefined)
    {
      return (`/img/default_square.png`)
    }
    return(`/img/${restaurant.photograph}-50pc.jpg`);
  }

    static imageUrlForRestaurant35(restaurant){
      if(restaurant.photograph === undefined)
      {
        return (`/img/default_square.png`)
      }
      return(`/img/${restaurant.photograph}-35pc.jpg`);
    }
  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}

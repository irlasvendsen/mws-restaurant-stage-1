let restaurant;
var newMap;

function restaurant_id(){
  if (self.restaurant) { // restaurant already fetched!
    return self.restaurant.id;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    return undefined;
  }
  return id;
}
/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiaXJsYXN2ZW5kc2VuIiwiYSI6ImNqazRzcnh0MDA0ODUzcm4xcjNobGQ0NnoifQ.7gdxkgIy7AGuPiZufxaKOg',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const favorite = document.getElementById('is_favorite');
  favorite.value = restaurant.is_favorite;
  if(restaurant.is_favorite == 'true'){
    favorite.checked = true;
  } else{
      favorite.checked = false;
  }

  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.name;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  DBHelper.fetchReviewByRestaurantId(restaurant.id, fillReviewsHTML);
}

saveReview = () => {
  let rating = document.getElementById('rating');
  let comments = document.getElementById('comments');
  let user_name = document.getElementById('name');
  const message = document.getElementById('message');
  const error = DBHelper.saveReview(self.restaurant.id, rating.value, comments.value, user_name.value, (error, result) =>{
    if(error){
      const p = document.createElement('p');
      p.innerHTML = error;
      message.appendChild(p);
      user_name.value = '';
      comments.value = '';
      let radios = document.getElementsByClassName('rating');
      for(let i = 0; i < radios.length; i++)
      {
        radios[i].checked = false;
      }
      return;
    }
    else{
      window.location.href = '/restaurant.html?id=' + self.restaurant.id;
    }
  });
  if(error){
    console.log(error);
  }
}

set_favorite = (checkbox) => {
  const checked = checkbox.checked ===true ? 'true':'false';
  DBHelper.setFavorite(self.restaurant.id, checked, (error, result) => {
    self.restaurant.is_favorite = checked;
    window.location.href = '/restaurant.html?id=' + self.restaurant.id;
  });

}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (error, reviews) => {
  self.restaurant.reviews = reviews;
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  const updated = review.updatedAt;
  date.innerHTML = new Date(updated);
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}



/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.setAttribute("aria-current","page");
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

window.addEventListener('load', function() {

  function updateOnlineStatus(event) {
    var condition = navigator.onLine ? "online" : "offline";
    if(condition == "online")
    {
      iKeyVal.get('reviews_pending').then(val => {
        if (val != undefined){
          val.forEach(rev =>{
            fetch(DBHelper.allRestaurantReviews,{
             method: 'POST',
             mode:'cors',
             headers: { 'Content-Type': 'application/json; charset=utf-8'
                },
                body:JSON.stringify({restaurant_id: rev.id,
                            name: rev.name,
                            rating: rev.rating,
                            comments: rev.comments
                          })
            }).then(response => {
              }).then(json =>json).catch( error => {

            });
          });
        }
      });
      iKeyVal.get('reviews_pending').then(val => {
        if (val != undefined){
        iKeyVal.del('reviews_pending');
        }
      });
      window.location.href = '/restaurant.html?id=' + self.restaurant.id;
    }
  }

  window.addEventListener('online',  updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});
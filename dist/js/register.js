if ('serviceWorker' in navigator) {
  self.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log('ServiceWorker registered! ', registration.scope);
    }, function(error) {
      console.log('ServiceWorker failed to register!: ', error);
    });
  });
}

window.openEidHelper = function() {
  const elements = document.querySelectorAll('[href^="e-id://"]');
  elements.forEach(function (el) {
    if (!el.hasAttribute('data-href')) {
      el.setAttribute('data-href', el.getAttribute('href'));
      var url = new URL(el.getAttribute('href'));
      if (url.host === '') {
        var newUrl = new URL(location.href);
        newUrl.protocol = 'e-id';
        newUrl.search = url.search;
        newUrl.hash = url.hash;
        Object.keys(el.dataset).forEach(function (key) {
          console.log(key);
          if (key.startsWith('eId')) {
            newUrl.searchParams.set('e-id-' + key.substring(3).toLowerCase(), el.dataset[key]);
          }
        });
        url = new URL(newUrl.href + (url.href.endsWith('#') ? '#' : ''));
      }
      el.setAttribute('href', url.href);
    }
  });
}

window.addEventListener('load', function() {
  window.openEidHelper();
});

window.addEventListener('DOMContentLoaded', function() {
  window.openEidHelper();
});

window.addEventListener('DOMContentInserted', function() {
  window.openEidHelper();
});
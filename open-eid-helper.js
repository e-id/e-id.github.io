window.openEidHelperCallbacks = [];

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
          if (key.startsWith('eId')) {
            newUrl.searchParams.set('e-id-' + key.substring(3).toLowerCase(), el.dataset[key]);
          }
        });
        url = new URL(newUrl.href + (url.href.endsWith('#') ? '#' : ''));
      }
      el.setAttribute('href', url.href);
      el.addEventListener('click', function(e) {
        var url = new URL(e.target.closest('a').getAttribute('href'));
        if (url.searchParams.has('e-id-callback')) {
          var callback = url.searchParams.get('e-id-callback');
          if (callback in window) {
            window.openEidHelperCallbacks.push({ caller: e.target, callback: window[callback] });
          }
        }
      });
    }
  });
}

window.addEventListener('load', function() {
  window.openEidHelper();
  var result = decodeURIComponent(new String(location.hash).substring(1));
  if (result !== '') {
    var eid = null;
    try { eid = JSON.parse(result); } catch(e) { eid = null; }
    if (eid === null || typeof eid !== 'object') {
      return;
    }
    window.localStorage.setItem('e-id-data', result);
    var url = new URL(location.href);
    if (url.searchParams.has('e-id-hidden') && url.searchParams.get('e-id-hidden') === '1' ||
    url.searchParams.has('e-id-app') && url.searchParams.get('e-id-app') === '1') {
      document.getElementById('content').classList.add('is-hidden');
      document.getElementById('loading').classList.remove('is-hidden');
      var w = 512;
      var h = 512;
      window.resizeTo(w, h)
      var left = (screen.width / 2) - (w/2);
      var top = (screen.height / 2) - (h/2);
      window.moveTo(left, top);
      setTimeout(function() {
        window.close();
        document.getElementById('loading').classList.add('is-hidden');
        document.getElementById('close').classList.remove('is-hidden');
      }, 2000);
    } else {
      if (url.searchParams.has('e-id-callback')) {
        var callback = url.searchParams.get('e-id-callback');
        if (callback in window) {
          window[callback](eid);
        }
      }
    }
  } else {
    window.localStorage.setItem('e-id-data', null);
  }
});

window.addEventListener('storage', function(event) {
  if (event.key === 'e-id-data') {
    window.openEidHelperCallbacks.forEach(function(callback, index) {
      callback.callback(JSON.parse(event.newValue));
      delete window.openEidHelperCallbacks[index];
    })
  }
});

window.addEventListener('DOMContentLoaded', function() {
  window.openEidHelper();
});

window.addEventListener('DOMContentInserted', function() {
  window.openEidHelper();
});
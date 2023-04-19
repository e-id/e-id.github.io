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
      document.body.innerText = '';
      if (document.querySelectorAll('head > link[href$="bulma.min.css"]').length === 0) {
        var link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css');
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      var button = document.createElement('button');
      button.setAttribute('class', 'button is-large is-rounded is-primary is-loading');
      button.setAttribute('style',  'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);');
      button.innerText = 'Loading...';
      document.body.appendChild(button);
      var close = document.createElement('a');
      close.setAttribute('class', 'button is-rounded centered');
      close.setAttribute('onclick', 'window.close()');
      close.setAttribute('style',  'position: fixed; margin-top: 100px; top: 50%; left: 50%; transform: translate(-50%, -50%);');
      close.innerText = 'You can close this window';
      document.body.appendChild(close);
      var w = 512;
      var h = 512;
      window.resizeTo(w, h)
      var left = (screen.width / 2) - (w/2);
      var top = (screen.height / 2) - (h/2);
      window.moveTo(left, top);
      setTimeout(function() {
        window.close();
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
  setTimeout(function() {
    window.localStorage.setItem('e-id-data', null);
  }, 3000);
});

window.addEventListener('storage', function(event) {
  if (event.key === 'e-id-data') {
    window.openEidHelperCallbacks.forEach(function(callback, index) {
      callback.callback(JSON.parse(event.newValue));
      delete window.openEidHelperCallbacks[index];
      window.localStorage.setItem('e-id-data', null);
    })
    window.focus();
  }
});

window.addEventListener('DOMContentLoaded', function() {
  window.openEidHelper();
});

window.addEventListener('DOMContentInserted', function() {
  window.openEidHelper();
});
/* Route first-time visitors to the best Yomi locale and remember manual choice. */
(function () {
  var root = document.documentElement;
  var storageKey = 'rk-locale';

  function getPreference() {
    try { return localStorage.getItem(storageKey); } catch (_) { return null; }
  }

  function setPreference(locale) {
    try { localStorage.setItem(storageKey, locale); } catch (_) {}
  }

  var preferred = getPreference();
  var languages = navigator.languages || [navigator.language || ''];
  var browserPrefersChinese = languages.some(function (language) {
    return /^zh(?:-|$)/i.test(language);
  });

  if (
    root.hasAttribute('data-locale-autodetect') &&
    root.dataset.localeAlternate &&
    (preferred === 'zh-Hant-TW' || (!preferred && browserPrefersChinese))
  ) {
    window.location.replace(root.dataset.localeAlternate + window.location.search + window.location.hash);
    return;
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('[data-locale-target]');
    if (link) setPreference(link.dataset.localeTarget);
  });

  window.rkSetLocalePreference = setPreference;
})();

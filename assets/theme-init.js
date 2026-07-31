/* Apply persisted display preferences before first paint. */
(function () {
  try {
    var root = document.documentElement;
    if (localStorage.getItem('rk-theme') === 'sumi') root.setAttribute('data-theme', 'sumi');
    if (root.dataset.pageLanguageMode === 'toggle' && localStorage.getItem('rk-lang') === 'zh') {
      root.setAttribute('data-lang', 'zh');
      root.setAttribute('lang', 'zh-Hant');
    }
  } catch (_) {}
})();

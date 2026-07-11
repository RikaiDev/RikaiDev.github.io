/* ============================================================
   RikaiDev — nav controls: light/dark theme + EN/中 language
   Both toggles render into any .rk-controls slot in the nav.
   State persists in localStorage and applies via <html> attrs:
     data-theme="sumi"  → dark
     data-lang="zh"     → Chinese (absent = English default)
   ============================================================ */
(function () {
  var root = document.documentElement;
  var K = { theme: 'rk-theme', lang: 'rk-lang' };
  function get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function theme() { return root.getAttribute('data-theme') === 'sumi' ? 'sumi' : 'washi'; }
  function lang()  { return root.getAttribute('data-lang')  === 'zh'   ? 'zh'   : 'en'; }

  function applyTheme(t) {
    if (t === 'sumi') root.setAttribute('data-theme', 'sumi');
    else root.removeAttribute('data-theme');
    set(K.theme, t);
  }
  function applyLang(l) {
    if (l === 'zh') { root.setAttribute('data-lang', 'zh'); root.setAttribute('lang', 'zh-Hant'); }
    else { root.removeAttribute('data-lang'); root.setAttribute('lang', 'en'); }
    set(K.lang, l);
  }

  var slots = [];
  function syncAll() {
    slots.forEach(function (s) {
      s.tb.textContent = theme() === 'sumi' ? '☀' : '☾';
      s.tb.setAttribute('aria-label', theme() === 'sumi' ? 'Switch to light theme' : 'Switch to dark theme');
      s.lb.textContent = lang() === 'zh' ? 'EN' : '中';
      s.lb.setAttribute('aria-label', lang() === 'zh' ? 'Switch to English' : '切換為中文');
    });
  }

  function build() {
    document.querySelectorAll('.rk-controls').forEach(function (slot) {
      slot.innerHTML = '';
      var lb = document.createElement('button');
      lb.type = 'button'; lb.className = 'rk-ctrl rk-ctrl-lang';
      var tb = document.createElement('button');
      tb.type = 'button'; tb.className = 'rk-ctrl rk-ctrl-theme';
      slot.appendChild(lb); slot.appendChild(tb);
      lb.addEventListener('click', function () { applyLang(lang() === 'zh' ? 'en' : 'zh'); syncAll(); });
      tb.addEventListener('click', function () { applyTheme(theme() === 'sumi' ? 'washi' : 'sumi'); syncAll(); });
      slots.push({ tb: tb, lb: lb });
    });
    syncAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();

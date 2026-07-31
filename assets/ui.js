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
      if (!s.lb) return;
      if (s.languageHref) {
        s.lb.textContent = s.languageLabel;
        s.lb.setAttribute('aria-label', 'Switch language to ' + s.languageLabel);
        return;
      }
      s.lb.textContent = lang() === 'zh' ? 'EN' : '中';
      s.lb.setAttribute('aria-label', lang() === 'zh' ? 'Switch to English' : '切換為中文');
    });
  }

  function build() {
    document.querySelectorAll('.rk-controls').forEach(function (slot) {
      slot.innerHTML = '';
      var lb = null;
      var tb = document.createElement('button');
      tb.type = 'button'; tb.className = 'rk-ctrl rk-ctrl-theme';
      if (!slot.hasAttribute('data-theme-only')) {
        lb = document.createElement('button');
        lb.type = 'button'; lb.className = 'rk-ctrl rk-ctrl-lang';
        slot.appendChild(lb);
        lb.addEventListener('click', function () {
          if (slot.dataset.languageHref) window.location.assign(slot.dataset.languageHref);
          else { applyLang(lang() === 'zh' ? 'en' : 'zh'); syncAll(); }
        });
      }
      slot.appendChild(tb);
      tb.addEventListener('click', function () { applyTheme(theme() === 'sumi' ? 'washi' : 'sumi'); syncAll(); });
      slots.push({ tb: tb, lb: lb, languageHref: slot.dataset.languageHref, languageLabel: slot.dataset.languageLabel });
    });
    syncAll();
  }

  function reveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  function mobileNav() {
    document.querySelectorAll('[data-mobile-nav]').forEach(function (header) {
      var button = header.querySelector('.rk-menu-toggle');
      var menu = header.querySelector('.rk-mobile-menu');
      if (!button || !menu) return;

      function close() {
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', button.dataset.labelOpen || 'Open navigation menu');
        menu.hidden = true;
        document.body.classList.remove('rk-menu-open');
        document.querySelectorAll('main, body > footer').forEach(function (node) {
          node.inert = false;
        });
      }
      button.addEventListener('click', function () {
        var open = button.getAttribute('aria-expanded') === 'true';
        if (open) close();
        else {
          button.setAttribute('aria-expanded', 'true');
          button.setAttribute('aria-label', button.dataset.labelClose || 'Close navigation menu');
          menu.hidden = false;
          document.body.classList.add('rk-menu-open');
          document.querySelectorAll('main, body > footer').forEach(function (node) {
            node.inert = true;
          });
          menu.querySelector('a')?.focus();
        }
      });
      menu.addEventListener('click', function (event) {
        if (event.target.closest('a')) close();
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !menu.hidden) {
          close();
          button.focus();
        }
        if (event.key === 'Tab' && !menu.hidden) {
          var links = Array.from(menu.querySelectorAll('a[href]'));
          if (!links.length) return;
          var first = links[0];
          var last = links[links.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      });
      window.addEventListener('resize', function () {
        if (window.innerWidth >= 768) close();
      });
    });
  }

  function init() { build(); reveal(); mobileNav(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

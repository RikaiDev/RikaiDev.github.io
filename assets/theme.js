/* ============================================================
   RikaiDev — theme / accent / grain switcher
   Persists to localStorage and applies to <html>, so the choice
   carries across the landing page and the brand-system page.
   The no-flash inline snippet in each <head> applies stored
   values before paint; this file builds the control panel.
   ============================================================ */
(function () {
  var root = document.documentElement;
  var LS = {
    theme:  'rk-theme',   // 'washi' | 'sumi'
    accent: 'rk-accent',  // hex
    grain:  'rk-grain',   // 'on' | 'off'
    panel:  'rk-panel'    // 'open' | 'closed'
  };

  var ACCENTS = [
    { hex: '#B23A28', name: '朱' },  // shu   — vermilion (default)
    { hex: '#2E4A63', name: '藍' },  // ai    — indigo
    { hex: '#3B5E4A', name: '緑' }   // midori — pine green
  ];

  function get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function currentTheme()  { return root.getAttribute('data-theme') === 'sumi' ? 'sumi' : 'washi'; }
  function currentAccent() {
    var v = root.style.getPropertyValue('--color-accent').trim();
    return v || get(LS.accent, '#B23A28');
  }
  function grainOn()  { return root.getAttribute('data-grain') !== 'off'; }

  function applyTheme(t) {
    if (t === 'sumi') root.setAttribute('data-theme', 'sumi');
    else root.removeAttribute('data-theme');
    set(LS.theme, t);
  }
  function applyAccent(hex) { root.style.setProperty('--color-accent', hex); set(LS.accent, hex); }
  function applyGrain(on)   { if (on) root.removeAttribute('data-grain'); else root.setAttribute('data-grain', 'off'); set(LS.grain, on ? 'on' : 'off'); }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function build() {
    var panel = el('div', 'rk-switch');
    panel.setAttribute('aria-label', '主題設定 Theme controls');

    // handle (collapse)
    var handle = el('button', 'rk-switch__handle', '主題 · Theme');
    handle.type = 'button';

    // theme row
    var themeRow = el('div', 'rk-switch__row');
    themeRow.appendChild(el('span', 'rk-switch__label', '主題'));
    var seg = el('div', 'rk-switch__seg');
    var bWashi = el('button', null, '紙 washi'); bWashi.type = 'button';
    var bSumi  = el('button', null, '墨 sumi');  bSumi.type  = 'button';
    seg.appendChild(bWashi); seg.appendChild(bSumi);
    themeRow.appendChild(seg);

    // accent row
    var accRow = el('div', 'rk-switch__row');
    accRow.appendChild(el('span', 'rk-switch__label', '朱'));
    var sw = el('div', 'rk-switch__swatches');
    var swatchBtns = ACCENTS.map(function (a) {
      var b = el('button', 'rk-switch__swatch');
      b.type = 'button';
      b.style.background = a.hex;
      b.title = a.name + ' ' + a.hex;
      b.setAttribute('aria-label', '強調色 ' + a.name);
      b.dataset.hex = a.hex;
      sw.appendChild(b);
      return b;
    });
    accRow.appendChild(sw);

    // grain row
    var grainRow = el('div', 'rk-switch__row');
    grainRow.appendChild(el('span', 'rk-switch__label', '紙紋'));
    var grainBtn = el('button', 'rk-switch__toggle', '紙紋 grain'); grainBtn.type = 'button';
    grainRow.appendChild(grainBtn);

    panel.appendChild(handle);
    panel.appendChild(themeRow);
    panel.appendChild(accRow);
    panel.appendChild(grainRow);
    document.body.appendChild(panel);

    function sync() {
      var t = currentTheme(), a = currentAccent(), g = grainOn();
      bWashi.setAttribute('aria-pressed', String(t === 'washi'));
      bSumi.setAttribute('aria-pressed',  String(t === 'sumi'));
      swatchBtns.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.hex.toLowerCase() === a.toLowerCase()));
      });
      grainBtn.setAttribute('aria-pressed', String(g));
    }

    bWashi.addEventListener('click', function () { applyTheme('washi'); sync(); });
    bSumi.addEventListener('click',  function () { applyTheme('sumi');  sync(); });
    swatchBtns.forEach(function (b) {
      b.addEventListener('click', function () { applyAccent(b.dataset.hex); sync(); });
    });
    grainBtn.addEventListener('click', function () { applyGrain(!grainOn()); sync(); });

    handle.addEventListener('click', function () {
      var collapsed = panel.getAttribute('data-collapsed') === 'true';
      panel.setAttribute('data-collapsed', String(!collapsed));
      set(LS.panel, collapsed ? 'open' : 'closed');
    });
    if (get(LS.panel, 'open') === 'closed') panel.setAttribute('data-collapsed', 'true');

    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();

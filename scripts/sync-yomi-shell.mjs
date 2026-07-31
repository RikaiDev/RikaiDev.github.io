#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');

const pages = [
  {
    file: 'yomi/index.html',
    locale: 'en',
    page: 'home',
    languageHref: '',
    languageLabel: '',
  },
  {
    file: 'yomi/line-mcp/index.html',
    locale: 'en',
    page: 'guide',
    languageHref: '/yomi/zh-tw/line-mcp/',
    languageLabel: '繁中',
  },
  {
    file: 'yomi/zh-tw/line-mcp/index.html',
    locale: 'zh-Hant-TW',
    page: 'guide',
    languageHref: '/yomi/line-mcp/',
    languageLabel: 'English',
  },
];

const t = (locale, en, zh) => locale.startsWith('zh') ? zh : en;

function brand() {
  return `<a href="/yomi/" class="rk-shell-brand flex items-center gap-3" aria-label="Yomi home">
      <img src="/logos/yomi.svg" alt="" width="28" height="28">
      <span class="font-mono font-bold text-[14px]">yomi · 読み</span>
    </a>`;
}

function homeNavigation() {
  return `<span class="rk-controls" role="group" aria-label="Site controls"></span>
      <a href="#install" class="hidden md:inline hover:text-ink transition-colors"><span data-t lang="en">Install</span><span data-t lang="zh">安裝</span></a>
      <a href="#how" class="hidden md:inline hover:text-ink transition-colors"><span data-t lang="en">How it works</span><span data-t lang="zh">運作</span></a>
      <a href="#faq" class="hidden sm:inline hover:text-ink transition-colors"><span data-t lang="en">FAQ</span><span data-t lang="zh">問答</span></a>
      <a href="/yomi/line-mcp/" class="rk-wide-nav hover:text-ink transition-colors" data-t lang="en">LINE MCP guide</a>
      <a href="/yomi/zh-tw/line-mcp/" class="rk-wide-nav hover:text-ink transition-colors" data-t lang="zh">LINE MCP 指南</a>`;
}

function guideNavigation(config) {
  const compare = t(config.locale, 'Compare', '三種做法');
  const install = t(config.locale, 'Install', '安裝');
  const home = t(config.locale, 'Product home', '產品首頁');
  return `<span class="rk-controls" role="group" aria-label="${t(config.locale, 'Site controls', '網站控制')}" data-language-href="${config.languageHref}" data-language-label="${config.languageLabel}"></span>
      <a href="#compare" class="hidden sm:inline hover:text-ink">${compare}</a>
      <a href="#install" class="hidden sm:inline hover:text-ink">${install}</a>
      <a href="/yomi/" class="rk-wide-nav hover:text-ink">${home}</a>`;
}

function mobileLinks(config) {
  const utilities = config.page === 'home'
    ? '<span class="rk-controls rk-mobile-utilities" role="group" aria-label="Site controls"></span>'
    : `<span class="rk-controls rk-mobile-utilities" role="group" aria-label="${t(config.locale, 'Display controls', '顯示控制')}" data-theme-only></span>`;
  if (config.page === 'home') {
    return `${utilities}
      <a href="#install"><span data-t lang="en">Install</span><span data-t lang="zh">安裝</span></a>
      <a href="#how"><span data-t lang="en">How it works</span><span data-t lang="zh">運作方式</span></a>
      <a href="#faq"><span data-t lang="en">FAQ</span><span data-t lang="zh">問答</span></a>
      <a href="/yomi/line-mcp/" data-t lang="en">LINE MCP guide</a>
      <a href="/yomi/zh-tw/line-mcp/" data-t lang="zh">LINE MCP 指南</a>
      <a href="https://github.com/RikaiDev/yomi">GitHub</a>`;
  }
  return `${utilities}
      <a href="#compare">${t(config.locale, 'Compare approaches', '三種做法')}</a>
      <a href="#install">${t(config.locale, 'Install', '安裝')}</a>
      <a href="/yomi/">${t(config.locale, 'Product home', '產品首頁')}</a>
      <a href="${config.languageHref}" hreflang="${config.locale.startsWith('zh') ? 'en' : 'zh-Hant-TW'}">${config.languageLabel}</a>
      <a href="https://github.com/RikaiDev/yomi">GitHub</a>`;
}

function header(config) {
  const zh = config.locale.startsWith('zh');
  const nav = config.page === 'home' ? homeNavigation() : guideNavigation(config);
  const menuTitle = config.page === 'home' ? 'Navigate · 導覽' : t(config.locale, 'Yomi field guide', 'Yomi 使用指南');
  const menuNote = config.page === 'home' ? 'YOMI · PERSONAL LINE MCP · RIKAIDEV' : t(config.locale, 'PERSONAL LINE · MODEL CONTEXT PROTOCOL', '個人 LINE · MODEL CONTEXT PROTOCOL');
  const open = zh ? '開啟導覽選單' : 'Open navigation menu';
  const close = zh ? '關閉導覽選單' : 'Close navigation menu';
  return `<!-- YOMI_SHELL:HEADER:START -->
  <header class="site-header sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 py-[15px] backdrop-blur-md border-b border-line" data-mobile-nav data-shell-page="${config.page}" data-shell-locale="${config.locale}">
    ${brand()}
    <nav class="rk-desktop-nav flex items-center gap-4 sm:gap-6 font-mono text-[12px] tracking-[0.06em] text-sub" aria-label="${zh ? '主要導覽' : 'Primary navigation'}">
      ${nav}
      <a href="https://github.com/RikaiDev/yomi" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 bg-ink text-paper px-[13px] py-[7px] rounded-[5px] hover:opacity-90 transition-opacity">★ GitHub</a>
    </nav>
    <button class="rk-menu-toggle" type="button" aria-expanded="false" aria-controls="yomi-mobile-menu" aria-label="${open}" data-label-open="${open}" data-label-close="${close}"><span class="rk-menu-icon" aria-hidden="true"></span></button>
    <nav class="rk-mobile-menu" id="yomi-mobile-menu" aria-label="${zh ? '手機導覽' : 'Mobile navigation'}" data-menu-title="${menuTitle}" data-menu-note="${menuNote}" hidden>
      ${mobileLinks(config)}
    </nav>
  </header>
  <!-- YOMI_SHELL:HEADER:END -->`;
}

function footer(config) {
  const zh = config.locale.startsWith('zh');
  const tagline = config.page === 'home'
    ? '<span data-t lang="en">Read your LINE — and the context around it.</span><span data-t lang="zh">讀懂你的 LINE，也讀懂脈絡。</span>'
    : (zh ? '讀懂你的 LINE，也讀懂脈絡。' : 'Read your LINE — and the context around it.');
  const homeLink = config.page === 'home'
    ? '<a href="/yomi/" class="hover:text-accent"><span data-t lang="en">Product home</span><span data-t lang="zh">產品首頁</span></a>'
    : `<a href="/yomi/" class="hover:text-accent">${zh ? '產品首頁' : 'Product home'}</a>`;
  const languageLink = config.page === 'home'
    ? '<a href="/yomi/line-mcp/" class="hover:text-accent" data-t lang="en">LINE MCP guide</a><a href="/yomi/zh-tw/line-mcp/" class="hover:text-accent" data-t lang="zh">LINE MCP 指南</a>'
    : `<a href="${config.languageHref}" class="hover:text-accent">${config.languageLabel}</a>`;
  return `<!-- YOMI_SHELL:FOOTER:START -->
  <footer class="guide-footer bg-deep2 text-ondarksub">
    <div class="mx-auto max-w-[1100px] px-6 md:px-10 py-12 flex justify-between flex-wrap gap-6">
      <div>
        <p class="font-mono text-[13px] text-ondark">yomi · 読み</p>
        <p class="font-mono text-[11px] mt-2">${tagline}</p>
      </div>
      <p class="font-mono text-[11.5px]">${homeLink} · ${languageLink} · <a href="https://github.com/RikaiDev/yomi" class="hover:text-accent">GitHub</a> · MIT</p>
    </div>
  </footer>
  <!-- YOMI_SHELL:FOOTER:END -->`;
}

function replaceRegion(source, name, rendered) {
  const pattern = new RegExp(`(?:<!-- YOMI_SHELL:${name}:START -->\\n)?  <${name === 'HEADER' ? 'header' : 'footer'}[\\s\\S]*?</${name === 'HEADER' ? 'header' : 'footer'}>(?:\\n  <!-- YOMI_SHELL:${name}:END -->)?`);
  if (!pattern.test(source)) throw new Error(`Missing ${name.toLowerCase()} region`);
  return source.replace(pattern, rendered);
}

let stale = false;
for (const config of pages) {
  const file = path.join(root, config.file);
  const original = fs.readFileSync(file, 'utf8');
  let next = replaceRegion(original, 'HEADER', header(config));
  next = replaceRegion(next, 'FOOTER', footer(config));
  if (next === original) continue;
  if (check) {
    console.error(`${config.file} has stale generated shell markup`);
    stale = true;
  } else {
    fs.writeFileSync(file, next);
    console.log(`updated ${config.file}`);
  }
}

if (stale) process.exit(1);

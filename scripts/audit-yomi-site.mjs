#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const pages = [
  { file: 'yomi/index.html', lang: 'en', canonical: 'https://rikaidev.github.io/yomi/', guide: false },
  { file: 'yomi/line-mcp/index.html', lang: 'en', canonical: 'https://rikaidev.github.io/yomi/line-mcp/', guide: true },
  { file: 'yomi/zh-tw/line-mcp/index.html', lang: 'zh-Hant-TW', canonical: 'https://rikaidev.github.io/yomi/zh-tw/line-mcp/', guide: true },
];

const errors = [];
const guideStructures = [];
const count = (source, text) => source.split(text).length - 1;
const requireText = (source, text, file, message) => {
  if (!source.includes(text)) errors.push(`${file}: ${message}`);
};

for (const page of pages) {
  const source = fs.readFileSync(path.join(root, page.file), 'utf8');
  requireText(source, `<html lang="${page.lang}" data-page-language-mode="${page.guide ? 'route' : 'toggle'}">`, page.file, `expected language mode for ${page.lang}`);
  requireText(source, `<link rel="canonical" href="${page.canonical}">`, page.file, 'canonical URL is missing or wrong');
  requireText(source, '<!-- YOMI_SHELL:HEADER:START -->', page.file, 'generated header marker missing');
  requireText(source, '<!-- YOMI_SHELL:FOOTER:START -->', page.file, 'generated footer marker missing');
  requireText(source, 'data-mobile-nav', page.file, 'mobile navigation contract missing');
  requireText(source, 'id="yomi-mobile-menu"', page.file, 'standard mobile menu id missing');
  requireText(source, '/assets/ui.js', page.file, 'shared UI runtime missing');
  requireText(source, '/assets/theme-init.js', page.file, 'shared pre-paint preference bootstrap missing');
  requireText(source, '/assets/yomi-release.js', page.file, 'live release metadata runtime missing');
  if (count(source, '<header ') !== 1) errors.push(`${page.file}: expected exactly one header`);
  if (count(source, '<footer ') !== 1) errors.push(`${page.file}: expected exactly one footer`);
  if (page.guide) {
    requireText(source, 'hreflang="en"', page.file, 'English hreflang missing');
    requireText(source, 'hreflang="zh-Hant-TW"', page.file, 'Traditional Chinese hreflang missing');
    requireText(source, 'hreflang="x-default"', page.file, 'x-default hreflang missing');
    requireText(source, 'data-language-href=', page.file, 'route-based language switch missing');
    if (source.includes('data-t lang=')) errors.push(`${page.file}: guide content must not use client-side language swapping`);
    const main = source.match(/<main>([\s\S]*?)<\/main>/)?.[1] || '';
    const structure = Array.from(main.matchAll(/<(\/)?([a-z0-9-]+)([^>]*)>/gi)).map(function (match) {
      const attrs = match[3];
      const id = attrs.match(/\sid="([^"]+)"/)?.[1] || '';
      const classes = attrs.match(/\sclass="([^"]+)"/)?.[1] || '';
      return `${match[1] ? '/' : ''}${match[2].toLowerCase()}#${id}.${classes}`;
    });
    guideStructures.push({ file: page.file, structure });
  }
}

if (guideStructures.length === 2 && JSON.stringify(guideStructures[0].structure) !== JSON.stringify(guideStructures[1].structure)) {
  errors.push(`${guideStructures[0].file} and ${guideStructures[1].file}: localized guide structures have drifted`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Yomi architecture audit passed (${pages.length} pages)`);

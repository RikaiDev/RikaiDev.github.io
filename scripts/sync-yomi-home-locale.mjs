#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const sourceFile = path.join(root, 'yomi/index.html');
const targetFile = path.join(root, 'yomi/zh-tw/index.html');
const check = process.argv.includes('--check');

function normalizeShell(source) {
  return source
    .replace(/<!-- YOMI_SHELL:HEADER:START -->[\s\S]*?<!-- YOMI_SHELL:HEADER:END -->/, '{{HEADER}}')
    .replace(/<!-- YOMI_SHELL:FOOTER:START -->[\s\S]*?<!-- YOMI_SHELL:FOOTER:END -->/, '{{FOOTER}}');
}

function shellFrom(source, name) {
  return source.match(new RegExp(`<!-- YOMI_SHELL:${name}:START -->[\\s\\S]*?<!-- YOMI_SHELL:${name}:END -->`))?.[0] || '';
}

const english = fs.readFileSync(sourceFile, 'utf8');
let expected = english
  .replace('<html lang="en" data-page-language-mode="route">', '<html lang="zh-Hant-TW" data-page-language-mode="route" data-lang="zh">')
  .replace('<title>LINE MCP Server for Personal Chats — Yomi by RikaiDev</title>', '<title>個人 LINE MCP Server — Yomi by RikaiDev</title>')
  .replace('content="Yomi is the open-source personal LINE MCP server for Claude and local AI agents. Read, reply, send images, and search existing LINE conversations with local E2EE decryption."', 'content="Yomi 是開源的個人 LINE MCP server，讓 Claude 與本機 AI agent 讀取、回覆、傳圖並搜尋既有 LINE 對話，E2EE 全程在本機解密。"')
  .replace('<link rel="canonical" href="https://rikaidev.github.io/yomi/">', '<link rel="canonical" href="https://rikaidev.github.io/yomi/zh-tw/">')
  .replace('<meta property="og:title" content="Yomi — the personal LINE MCP server">', '<meta property="og:title" content="Yomi — 個人 LINE MCP server">')
  .replace('<meta property="og:locale" content="en_US">', '<meta property="og:locale" content="zh_TW">')
  .replace('<meta property="og:description" content="Connect Claude or another local AI agent to your personal LINE chats. Read, reply, send images, and search conversations locally.">', '<meta property="og:description" content="把 Claude 或其他本機 AI agent 接上你的個人 LINE，讀取、回覆、傳圖並在本機搜尋對話。">')
  .replace('<meta property="og:url" content="https://rikaidev.github.io/yomi/">', '<meta property="og:url" content="https://rikaidev.github.io/yomi/zh-tw/">')
  .replace('<meta name="twitter:title" content="Yomi — the personal LINE MCP server">', '<meta name="twitter:title" content="Yomi — 個人 LINE MCP server">')
  .replace('<meta name="twitter:description" content="One-file Claude Desktop install. Read, reply, send images, and search your own LINE from an AI agent. Open source and local-first.">', '<meta name="twitter:description" content="一個檔案安裝到 Claude Desktop，讓 AI agent 讀取、回覆、傳圖並搜尋你的個人 LINE。開源且 local-first。">');

if (check) {
  if (!fs.existsSync(targetFile)) {
    console.error('yomi/zh-tw/index.html is missing');
    process.exit(1);
  }
  const actual = fs.readFileSync(targetFile, 'utf8');
  if (normalizeShell(actual) !== normalizeShell(expected)) {
    console.error('yomi/zh-tw/index.html is stale; regenerate the localized home page');
    process.exit(1);
  }
} else {
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  const header = shellFrom(english, 'HEADER');
  const footer = shellFrom(english, 'FOOTER');
  expected = expected.replace(shellFrom(expected, 'HEADER'), header).replace(shellFrom(expected, 'FOOTER'), footer);
  fs.writeFileSync(targetFile, expected);
  console.log('updated yomi/zh-tw/index.html');
}

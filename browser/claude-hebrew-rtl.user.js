// ==UserScript==
// @name         Claude Hebrew RTL
// @namespace    https://github.com/YoYo2506/RTL-in-Hebrew
// @version      1.0.0
// @description  Shows Hebrew paragraphs, lists, headings, quotes and tables right-to-left and right-aligned on claude.ai, including Claude Code on the web. English stays left-to-right and code blocks are never touched.
// @match        https://claude.ai/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

// The script only reads the text already on the page to decide each block's
// direction. It makes no network requests and stores nothing.
(() => {
  'use strict';

  const BLOCKS = 'p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th, ul, ol, table, textarea, [contenteditable="true"]';
  const SKIP = 'pre, code, kbd, samp, .katex, svg';
  const LETTER = /[\p{L}‎‏]/u;
  const RTL = /[֐-ࣿ‏יִ-﷿ﹰ-﻿]/;

  // Direction of the first letter in the element's text, as the Unicode bidi
  // algorithm would pick it. Text inside code blocks is not considered.
  function firstStrong(el) {
    if (el.tagName === 'TEXTAREA') {
      const m = el.value.match(LETTER);
      return m ? (RTL.test(m[0]) ? 'rtl' : 'ltr') : null;
    }
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) =>
        node.parentElement && node.parentElement.closest(SKIP) && el.contains(node.parentElement.closest(SKIP))
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT,
    });
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const m = node.data.match(LETTER);
      if (m) return RTL.test(m[0]) ? 'rtl' : 'ltr';
    }
    return null;
  }

  function apply(el) {
    if (el.closest(SKIP)) return;
    const dir = firstStrong(el);
    const s = el.style;
    if (dir === 'rtl') {
      if ((el.tagName === 'UL' || el.tagName === 'OL') && !el.dataset.rtlIndent) {
        el.dataset.rtlIndent = getComputedStyle(el).paddingLeft;
      }
      s.setProperty('direction', 'rtl', 'important');
      s.setProperty('text-align', 'right', 'important');
      if (el.tagName === 'UL' || el.tagName === 'OL') {
        // Lists are usually indented with padding-left; move it to the right
        // so the bullets and numbers sit on the right side. The indent is read
        // while the list is still left-to-right.
        s.setProperty('padding-right', el.dataset.rtlIndent, 'important');
        s.setProperty('padding-left', '0', 'important');
      }
      if (el.tagName === 'TABLE') s.setProperty('margin-left', 'auto', 'important');
      el.dataset.rtl = '1';
    } else if (el.dataset.rtl) {
      for (const p of ['direction', 'text-align', 'padding-right', 'padding-left', 'margin-left']) s.removeProperty(p);
      delete el.dataset.rtl;
    }
  }

  function scan() {
    document.querySelectorAll(BLOCKS).forEach(apply);
  }

  // Replies stream in, so re-scan shortly after the page changes.
  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    setTimeout(() => {
      pending = false;
      scan();
    }, 150);
  }

  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  document.addEventListener('input', schedule, true);
  scan();
})();

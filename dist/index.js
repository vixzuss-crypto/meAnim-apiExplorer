import { clientCache } from "./middlewares/cache.js";
import appConfig from "./configs/app.config.js";
import express from "express";
import errorHandler from "./middlewares/errorHandler.js";
import otakudesuRouter from "./routes/otakudesu.routes.js";
import samehadakuRouter from "./routes/samehadaku.routes.js";
import kuramanimeRouter from "./routes/kuramanime.routes.js";
import oploverzRouter from "./routes/oploverz.routes.js";
import cors from "cors";
const { PORT } = appConfig;
const app = express();
app.use(cors());
app.use(clientCache(1));
const explorerHTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MEANIM API Explorer</title>
  <style>
    :root {
      --bg-base:     #0d1117;
      --bg-surface:  #161b22;
      --bg-card:     #1c2330;
      --bg-hover:    #212936;
      --border:      #2d3748;
      --border-soft: #1e2a3a;

      --accent:      #5c5ff5;
      --accent-glow: rgba(92, 95, 245, 0.25);
      --accent-dim:  rgba(92, 95, 245, 0.12);

      --green:       #39d98a;
      --green-bg:    rgba(57, 217, 138, 0.12);
      --yellow:      #f5c842;
      --yellow-bg:   rgba(245, 200, 66, 0.12);
      --red:         #f56565;
      --red-bg:      rgba(245, 101, 101, 0.12);
      --blue:        #63b3ed;
      --blue-bg:     rgba(99, 179, 237, 0.12);

      --text-primary:   #e2e8f0;
      --text-secondary: #8892a4;
      --text-muted:     #4a5568;
      --text-code:      #93c5fd;

      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 16px;

      --font-sans: 'Inter', 'Segoe UI', system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-sans);
      background: var(--bg-base);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
    }

    /* ── TOPBAR ───────────────────────────────────── */
    .topbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(13, 17, 23, 0.85);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--border-soft);
      padding: 0 28px;
      height: 58px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-icon {
      width: 32px; height: 32px;
      background: var(--accent);
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 13px; color: #fff; letter-spacing: -0.5px;
      box-shadow: 0 0 12px var(--accent-glow);
    }
    .logo-text { font-weight: 700; font-size: 17px; letter-spacing: -0.3px; }
    .topbar-badge {
      font-size: 11px; font-weight: 600;
      background: var(--accent-dim);
      color: var(--accent);
      border: 1px solid rgba(92, 95, 245, 0.3);
      border-radius: 20px;
      padding: 2px 10px;
      margin-left: 2px;
    }
    .topbar-right {
      margin-left: auto;
      display: flex; align-items: center; gap: 8px;
    }
    .server-badge {
      font-size: 12px; font-family: var(--font-mono);
      color: var(--green);
      background: var(--green-bg);
      border: 1px solid rgba(57, 217, 138, 0.25);
      border-radius: var(--radius-sm);
      padding: 4px 10px;
    }

    /* ── LAYOUT ───────────────────────────────────── */
    .layout {
      display: grid;
      grid-template-columns: 240px 1fr;
      min-height: calc(100vh - 58px);
    }

    /* ── SIDEBAR ──────────────────────────────────── */
    .sidebar {
      border-right: 1px solid var(--border-soft);
      padding: 20px 0;
      position: sticky;
      top: 58px;
      height: calc(100vh - 58px);
      overflow-y: auto;
    }
    .sidebar::-webkit-scrollbar { width: 4px; }
    .sidebar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

    .sidebar-section { margin-bottom: 8px; }
    .sidebar-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; color: var(--text-muted);
      padding: 8px 20px 4px;
    }
    .sidebar-item {
      display: flex; align-items: center; gap: 10px;
      padding: 7px 20px;
      cursor: pointer;
      border-radius: 0;
      transition: background 0.15s;
      font-size: 13.5px;
      color: var(--text-secondary);
      border-left: 2px solid transparent;
      text-decoration: none;
    }
    .sidebar-item:hover { background: var(--bg-hover); color: var(--text-primary); }
    .sidebar-item.active {
      background: var(--accent-dim);
      color: var(--accent);
      border-left-color: var(--accent);
    }
    .sidebar-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
    }
    .sidebar-count {
      margin-left: auto;
      font-size: 11px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 1px 7px;
      color: var(--text-muted);
    }

    /* ── MAIN CONTENT ─────────────────────────────── */
    .main { padding: 32px; overflow-x: hidden; }

    .page { display: none; }
    .page.active { display: block; }

    /* ── HERO / INTRO ─────────────────────────────── */
    .hero {
      background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-card) 100%);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-lg);
      padding: 36px 40px;
      margin-bottom: 28px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 80% 0%, var(--accent-glow) 0%, transparent 55%);
      pointer-events: none;
    }
    .hero-title {
      font-size: 26px; font-weight: 800; letter-spacing: -0.6px;
      margin-bottom: 6px;
    }
    .hero-desc {
      font-size: 14px; color: var(--text-secondary);
      max-width: 520px; margin-bottom: 20px;
    }
    .hero-stats {
      display: flex; gap: 28px; flex-wrap: wrap;
    }
    .stat { display: flex; flex-direction: column; gap: 2px; }
    .stat-value { font-size: 22px; font-weight: 700; color: var(--accent); }
    .stat-label { font-size: 12px; color: var(--text-muted); }

    /* ── SECTION TITLE ────────────────────────────── */
    .section-title {
      font-size: 18px; font-weight: 700;
      margin-bottom: 16px;
      display: flex; align-items: center; gap: 10px;
    }
    .section-title .pill {
      font-size: 12px; font-weight: 600;
      background: var(--accent-dim);
      color: var(--accent);
      border: 1px solid rgba(92, 95, 245, 0.25);
      border-radius: 20px; padding: 2px 10px;
    }

    /* ── ENDPOINT CARD ────────────────────────────── */
    .endpoint-group { margin-bottom: 28px; }
    .endpoint-group-title {
      font-size: 13px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.8px; color: var(--text-muted);
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-soft);
    }

    .endpoint-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      margin-bottom: 8px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .endpoint-card:hover { border-color: var(--border); }

    .endpoint-header {
      display: flex; align-items: center; gap: 12px;
      padding: 13px 16px;
      cursor: pointer;
      user-select: none;
    }
    .method-badge {
      font-size: 11px; font-weight: 700; font-family: var(--font-mono);
      padding: 3px 9px; border-radius: 5px; letter-spacing: 0.3px;
      flex-shrink: 0;
    }
    .method-GET    { background: var(--green-bg);  color: var(--green);  border: 1px solid rgba(57,217,138,.3); }
    .method-POST   { background: var(--yellow-bg); color: var(--yellow); border: 1px solid rgba(245,200,66,.3); }
    .method-DELETE { background: var(--red-bg);    color: var(--red);    border: 1px solid rgba(245,101,101,.3); }

    .endpoint-path {
      font-family: var(--font-mono);
      font-size: 13.5px; color: var(--text-code);
      flex: 1; word-break: break-all;
    }
    .path-param { color: var(--yellow); }
    .endpoint-desc {
      font-size: 12.5px; color: var(--text-muted);
      margin-left: auto; flex-shrink: 0;
      max-width: 200px; text-align: right;
    }
    .chevron {
      width: 18px; height: 18px; flex-shrink: 0;
      color: var(--text-muted);
      transition: transform 0.25s;
    }
    .endpoint-card.open .chevron { transform: rotate(180deg); }

    .endpoint-body {
      display: none;
      padding: 0 16px 16px;
      border-top: 1px solid var(--border-soft);
    }
    .endpoint-card.open .endpoint-body { display: block; }

    /* params table */
    .param-group { margin-top: 14px; }
    .param-group-label {
      font-size: 11px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.6px; color: var(--text-muted); margin-bottom: 8px;
    }
    .param-row {
      display: grid; grid-template-columns: 160px 1fr auto;
      gap: 12px; align-items: center;
      padding: 8px 10px;
      background: var(--bg-card);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-sm);
      margin-bottom: 5px;
      font-size: 13px;
    }
    .param-key { font-family: var(--font-mono); color: var(--text-code); }
    .param-type { color: var(--text-secondary); font-size: 12.5px; }
    .param-badge {
      font-size: 10.5px; font-weight: 600; border-radius: 4px; padding: 2px 7px;
    }
    .required  { background: var(--red-bg);   color: var(--red);   }
    .optional  { background: var(--blue-bg);  color: var(--blue);  }

    /* ── CODE BLOCK ───────────────────────────────── */
    .code-block {
      background: #0a0e16;
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      margin-top: 14px;
      overflow: hidden;
    }
    .code-header {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 14px;
      background: rgba(255,255,255,0.03);
      border-bottom: 1px solid var(--border-soft);
    }
    .code-lang {
      font-size: 11px; font-weight: 600; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .copy-btn {
      margin-left: auto;
      background: transparent; border: 1px solid var(--border);
      color: var(--text-secondary); font-size: 11.5px;
      padding: 3px 10px; border-radius: 5px; cursor: pointer;
      transition: all 0.15s; font-family: var(--font-sans);
    }
    .copy-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
    .copy-btn.copied { color: var(--green); border-color: rgba(57,217,138,.4); }
    pre {
      font-family: var(--font-mono);
      font-size: 13px; line-height: 1.7;
      padding: 16px;
      overflow-x: auto;
      white-space: pre;
    }
    .tk-kw   { color: #c792ea; }
    .tk-fn   { color: #82aaff; }
    .tk-str  { color: #c3e88d; }
    .tk-num  { color: #f78c6c; }
    .tk-cmt  { color: #546e7a; font-style: italic; }
    .tk-key  { color: var(--blue); }

    /* ── FETCH DEMO ───────────────────────────────── */
    .fetch-demo {
      background: var(--bg-surface);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-lg);
      margin-top: 24px;
      overflow: hidden;
    }
    .fetch-demo-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-soft);
      display: flex; align-items: center; gap: 10px;
    }
    .fetch-demo-title { font-weight: 700; font-size: 15px; }
    .fetch-demo-body { padding: 20px; }

    .input-row {
      display: flex; gap: 10px; margin-bottom: 14px;
    }
    .url-input {
      flex: 1;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-primary);
      font-family: var(--font-mono);
      font-size: 13px;
      padding: 9px 14px;
      border-radius: var(--radius-sm);
      outline: none;
      transition: border-color 0.2s;
    }
    .url-input:focus { border-color: var(--accent); }
    .url-input::placeholder { color: var(--text-muted); }

    .fetch-btn {
      background: var(--accent);
      color: #fff;
      border: none;
      font-size: 13.5px; font-weight: 600;
      padding: 9px 20px; border-radius: var(--radius-sm);
      cursor: pointer;
      transition: opacity 0.15s, box-shadow 0.2s;
      white-space: nowrap;
      font-family: var(--font-sans);
    }
    .fetch-btn:hover { opacity: 0.9; box-shadow: 0 0 12px var(--accent-glow); }
    .fetch-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .preset-row {
      display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 16px;
    }
    .preset-btn {
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-size: 12px; font-family: var(--font-mono);
      padding: 5px 11px; border-radius: var(--radius-sm);
      cursor: pointer; transition: all 0.15s;
    }
    .preset-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }

    .response-area {
      background: #0a0e16;
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .response-header {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 14px;
      background: rgba(255,255,255,.03);
      border-bottom: 1px solid var(--border-soft);
    }
    .response-status {
      font-size: 12px; font-weight: 700; font-family: var(--font-mono);
      padding: 2px 8px; border-radius: 4px;
    }
    .status-ok  { background: var(--green-bg); color: var(--green); }
    .status-err { background: var(--red-bg);   color: var(--red); }
    .response-time { font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); }
    .response-pre {
      font-family: var(--font-mono);
      font-size: 12.5px; line-height: 1.65;
      padding: 14px;
      overflow: auto;
      max-height: 440px;
      white-space: pre;
      color: var(--text-primary);
    }
    .json-key    { color: var(--blue); }
    .json-str    { color: #c3e88d; }
    .json-num    { color: #f78c6c; }
    .json-bool   { color: #c792ea; }
    .json-null   { color: var(--text-muted); }
    .json-punct  { color: var(--text-secondary); }

    /* ── GUIDE PAGE ───────────────────────────────── */
    .guide-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    @media (max-width: 960px) { .guide-grid { grid-template-columns: 1fr; } }

    .guide-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      padding: 20px;
    }
    .guide-card-title {
      font-weight: 700; font-size: 14.5px;
      margin-bottom: 12px;
      display: flex; align-items: center; gap: 8px;
    }
    .guide-icon {
      width: 28px; height: 28px;
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px;
    }
    .icon-js  { background: var(--yellow-bg); }
    .icon-ts  { background: var(--blue-bg); }
    .icon-py  { background: var(--green-bg); }
    .icon-curl{ background: var(--accent-dim); }

    /* ── TABS ─────────────────────────────────────── */
    .tabs {
      display: flex; gap: 2px;
      background: var(--bg-card);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-sm);
      padding: 3px;
      width: fit-content;
      margin-bottom: 16px;
    }
    .tab-btn {
      background: transparent; border: none;
      color: var(--text-muted); font-size: 12.5px; font-weight: 600;
      padding: 6px 14px; border-radius: 4px;
      cursor: pointer; transition: all 0.15s;
      font-family: var(--font-sans);
    }
    .tab-btn.active { background: var(--accent); color: #fff; }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }

    /* loading spinner */
    .spinner {
      display: inline-block;
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      vertical-align: middle; margin-right: 6px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .placeholder-text {
      color: var(--text-muted); font-size: 13px;
      padding: 28px 14px; text-align: center;
    }

    /* response structure table */
    .structure-table {
      width: 100%; border-collapse: collapse;
      font-size: 13px; margin-top: 12px;
    }
    .structure-table th {
      background: var(--bg-card);
      border: 1px solid var(--border-soft);
      padding: 8px 12px;
      text-align: left; font-size: 11px; text-transform: uppercase;
      letter-spacing: 0.5px; color: var(--text-muted);
    }
    .structure-table td {
      border: 1px solid var(--border-soft);
      padding: 8px 12px;
      color: var(--text-secondary);
    }
    .structure-table td:first-child { font-family: var(--font-mono); color: var(--text-code); }
    .structure-table tr:hover td { background: var(--bg-hover); }

    /* ── UTIL ─────────────────────────────────────── */
    .mt-8  { margin-top: 8px; }
    .mt-16 { margin-top: 16px; }
    .mt-24 { margin-top: 24px; }
    .flex-center { display: flex; align-items: center; gap: 8px; }

    /* ── FOOTER ───────────────────────────────────── */
    .footer {
      border-top: 1px solid var(--border-soft);
      padding: 18px 32px;
      display: flex; align-items: center; justify-content: space-between;
      font-size: 12.5px; color: var(--text-muted);
    }
    .footer-left { display: flex; align-items: center; gap: 8px; }
    .footer-logo {
      width: 20px; height: 20px;
      background: var(--accent);
      border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      font-size: 9px; font-weight: 800; color: #fff;
    }
  </style>
</head>
<body>

<!-- TOPBAR -->
<header class="topbar">
  <div class="logo-icon">ME</div>
  <span class="logo-text">MEANIM</span>
  <span class="topbar-badge">API Explorer</span>
  <div class="topbar-right">
    <span class="server-badge">me-anim-api-explorer.vercel.app</span>
  </div>
</header>

<div class="layout">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="sidebar-section">
      <div class="sidebar-label">Overview</div>
      <a class="sidebar-item active" onclick="navigate('home', this)">
        <span class="sidebar-dot"></span>
        Beranda
      </a>
      <a class="sidebar-item" onclick="navigate('guide', this)">
        <span class="sidebar-dot"></span>
        Panduan Fetch
      </a>
      <a class="sidebar-item" onclick="navigate('demo', this)">
        <span class="sidebar-dot"></span>
        Live Demo
      </a>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-label">Sumber</div>
      <a class="sidebar-item" onclick="navigate('otakudesu', this)">
        <span class="sidebar-dot"></span>
        Otakudesu
        <span class="sidebar-count">11</span>
      </a>
      <a class="sidebar-item" onclick="navigate('kuramanime', this)">
        <span class="sidebar-dot"></span>
        Kuramanime
        <span class="sidebar-count">8</span>
      </a>
      <a class="sidebar-item" onclick="navigate('oploverz', this)">
        <span class="sidebar-dot"></span>
        Oploverz
        <span class="sidebar-count">7</span>
      </a>
      <a class="sidebar-item" onclick="navigate('samehadaku', this)">
        <span class="sidebar-dot"></span>
        Samehadaku
        <span class="sidebar-count">1</span>
      </a>
    </div>
  </aside>

  <!-- MAIN -->
  <main class="main">

    <!-- HOME PAGE -->
    <div id="page-home" class="page active">
      <div class="hero">
        <div class="hero-title">MEANIM Scraping API</div>
        <div class="hero-desc">
          REST API untuk mengambil data anime dari berbagai sumber Indonesia. Dibangun dengan Express.js + TypeScript, berbasis web scraping real-time.
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-value">4</span><span class="stat-label">Sumber Data</span></div>
          <div class="stat"><span class="stat-value">27</span><span class="stat-label">Total Endpoint</span></div>
          <div class="stat"><span class="stat-value">GET</span><span class="stat-label">Method Utama</span></div>
          <div class="stat"><span class="stat-value">JSON</span><span class="stat-label">Format Response</span></div>
        </div>
      </div>

      <div class="section-title">Struktur Response <span class="pill">Standard</span></div>
      <div class="code-block">
        <div class="code-header">
          <span class="code-lang">JSON</span>
          <button class="copy-btn" onclick="copyCode(this)">Salin</button>
        </div>
        <pre>{
  <span class="json-key">"statusCode"</span><span class="json-punct">:</span> <span class="json-num">200</span><span class="json-punct">,</span>
  <span class="json-key">"message"</span><span class="json-punct">:</span> <span class="json-str">"Success"</span><span class="json-punct">,</span>
  <span class="json-key">"data"</span><span class="json-punct">: {</span>
    <span class="json-key">"..."</span><span class="json-punct">:</span> <span class="json-str">"payload sesuai endpoint"</span>
  <span class="json-punct">},</span>
  <span class="json-key">"pagination"</span><span class="json-punct">: {</span>        <span class="json-key tk-cmt">// hanya di endpoint berhalaman</span>
    <span class="json-key">"currentPage"</span><span class="json-punct">:</span> <span class="json-num">1</span><span class="json-punct">,</span>
    <span class="json-key">"hasPrevPage"</span><span class="json-punct">:</span> <span class="json-bool">false</span><span class="json-punct">,</span>
    <span class="json-key">"prevPage"</span><span class="json-punct">:</span> <span class="json-null">null</span><span class="json-punct">,</span>
    <span class="json-key">"hasNextPage"</span><span class="json-punct">:</span> <span class="json-bool">true</span><span class="json-punct">,</span>
    <span class="json-key">"nextPage"</span><span class="json-punct">:</span> <span class="json-num">2</span>
  <span class="json-punct">}</span>
<span class="json-punct">}</span></pre>
      </div>

      <div class="section-title mt-24">Base URL</div>
      <div class="code-block">
        <div class="code-header">
          <span class="code-lang">HTTP</span>
          <button class="copy-btn" onclick="copyCode(this)">Salin</button>
        </div>
        <pre><span class="tk-kw">https://me-anim-api-explorer.vercel.app</span></pre>
      </div>

      <div class="section-title mt-24">Quick Reference</div>
      <table class="structure-table">
        <thead><tr><th>Sumber</th><th>Prefix</th><th>Fitur Utama</th><th>Endpoint</th></tr></thead>
        <tbody>
          <tr><td>Otakudesu</td><td>/otakudesu</td><td>Home, Search, Genre, Ongoing, Completed, Episode, Server</td><td>11</td></tr>
          <tr><td>Kuramanime</td><td>/kuramanime</td><td>Home, Anime, Schedule, Properties, Episode, Batch</td><td>8</td></tr>
          <tr><td>Oploverz</td><td>/oploverz</td><td>Home, Schedule, Anime Directory, Search, Episode</td><td>7</td></tr>
          <tr><td>Samehadaku</td><td>/samehadaku</td><td>Root (WIP)</td><td>1</td></tr>
        </tbody>
      </table>
    </div>

    <!-- GUIDE PAGE -->
    <div id="page-guide" class="page">
      <div class="section-title">Panduan Pemanggilan API</div>

      <div class="tabs">
        <button class="tab-btn active" onclick="switchTab('guide', 'js', this)">JavaScript</button>
        <button class="tab-btn" onclick="switchTab('guide', 'ts', this)">TypeScript</button>
        <button class="tab-btn" onclick="switchTab('guide', 'py', this)">Python</button>
        <button class="tab-btn" onclick="switchTab('guide', 'curl', this)">cURL</button>
      </div>

      <!-- JavaScript -->
      <div id="guide-tab-js" class="tab-panel active">
        <div class="guide-grid">
          <div class="guide-card">
            <div class="guide-card-title">
              <div class="guide-icon icon-js">📦</div>
              Basic Fetch
            </div>
            <div class="code-block">
              <div class="code-header"><span class="code-lang">JavaScript</span><button class="copy-btn" onclick="copyCode(this)">Salin</button></div>
              <pre><span class="tk-cmt">// Ambil home otakudesu</span>
<span class="tk-kw">const</span> <span class="tk-fn">fetchAnime</span> = <span class="tk-kw">async</span> () => {
  <span class="tk-kw">const</span> res = <span class="tk-kw">await</span> fetch(
    <span class="tk-str">'https://me-anim-api-explorer.vercel.app/otakudesu/home'</span>
  );
  <span class="tk-kw">const</span> json = <span class="tk-kw">await</span> res.json();
  console.log(json.data);
};

fetchAnime();</pre>
            </div>
          </div>

          <div class="guide-card">
            <div class="guide-card-title">
              <div class="guide-icon icon-js">🔍</div>
              Search Anime
            </div>
            <div class="code-block">
              <div class="code-header"><span class="code-lang">JavaScript</span><button class="copy-btn" onclick="copyCode(this)">Salin</button></div>
              <pre><span class="tk-cmt">// Cari anime berdasarkan kata kunci</span>
<span class="tk-kw">const</span> query = <span class="tk-str">'demon slayer'</span>;
<span class="tk-kw">const</span> url = <span class="tk-kw">new</span> URL(
  <span class="tk-str">'https://me-anim-api-explorer.vercel.app/otakudesu/search'</span>
);
url.searchParams.set(<span class="tk-str">'q'</span>, query);

<span class="tk-kw">const</span> res = <span class="tk-kw">await</span> fetch(url);
<span class="tk-kw">const</span> { data } = <span class="tk-kw">await</span> res.json();
console.log(data.animeList);</pre>
            </div>
          </div>

          <div class="guide-card">
            <div class="guide-card-title">
              <div class="guide-icon icon-js">📄</div>
              Dengan Pagination
            </div>
            <div class="code-block">
              <div class="code-header"><span class="code-lang">JavaScript</span><button class="copy-btn" onclick="copyCode(this)">Salin</button></div>
              <pre><span class="tk-cmt">// Ongoing anime halaman 2</span>
<span class="tk-kw">const</span> <span class="tk-fn">getOngoing</span> = <span class="tk-kw">async</span> (page = <span class="tk-num">1</span>) => {
  <span class="tk-kw">const</span> res = <span class="tk-kw">await</span> fetch(
    <span class="tk-str">\`https://me-anim-api-explorer.vercel.app/otakudesu/ongoing?page=\${page}\`</span>
  );
  <span class="tk-kw">const</span> json = <span class="tk-kw">await</span> res.json();
  <span class="tk-kw">return</span> {
    list: json.data.animeList,
    next: json.pagination?.nextPage
  };
};

<span class="tk-kw">const</span> { list, next } = <span class="tk-kw">await</span> <span class="tk-fn">getOngoing</span>(<span class="tk-num">2</span>);
console.log(<span class="tk-str">\`Next page: \${next}\`</span>);</pre>
            </div>
          </div>

          <div class="guide-card">
            <div class="guide-card-title">
              <div class="guide-icon icon-js">🎬</div>
              Detail Anime
            </div>
            <div class="code-block">
              <div class="code-header"><span class="code-lang">JavaScript</span><button class="copy-btn" onclick="copyCode(this)">Salin</button></div>
              <pre><span class="tk-cmt">// Detail anime dari otakudesu</span>
<span class="tk-kw">const</span> animeId = <span class="tk-str">'kimetsu-no-yaiba'</span>;
<span class="tk-kw">const</span> res = <span class="tk-kw">await</span> fetch(
  <span class="tk-str">\`https://me-anim-api-explorer.vercel.app/otakudesu/anime/\${animeId}\`</span>
);
<span class="tk-kw">const</span> { data } = <span class="tk-kw">await</span> res.json();
<span class="tk-kw">const</span> anime = data.details;

console.log(anime.title);
console.log(anime.score);
console.log(anime.episodeList.length);</pre>
            </div>
          </div>
        </div>

        <div class="guide-card">
          <div class="guide-card-title">
            <div class="guide-icon icon-js">⚙️</div>
            Helper Reusable
          </div>
          <div class="code-block">
            <div class="code-header"><span class="code-lang">JavaScript</span><button class="copy-btn" onclick="copyCode(this)">Salin</button></div>
            <pre><span class="tk-cmt">// meanim-api.js — helper reusable buat semua source</span>
<span class="tk-kw">const</span> BASE = <span class="tk-str">'https://me-anim-api-explorer.vercel.app'</span>;

<span class="tk-kw">const</span> api = {
  <span class="tk-fn">get</span>: <span class="tk-kw">async</span> (path, params = {}) => {
    <span class="tk-kw">const</span> url = <span class="tk-kw">new</span> URL(BASE + path);
    Object.entries(params).forEach(([k, v]) =>
      url.searchParams.set(k, v)
    );
    <span class="tk-kw">const</span> res = <span class="tk-kw">await</span> fetch(url);
    <span class="tk-kw">if</span> (!res.ok) <span class="tk-kw">throw new</span> Error(<span class="tk-str">\`HTTP \${res.status}\`</span>);
    <span class="tk-kw">return</span> res.json();
  },

  <span class="tk-cmt">// Otakudesu</span>
  otakudesu: {
    home:      ()       => api.get(<span class="tk-str">'/otakudesu/home'</span>),
    ongoing:   (page=<span class="tk-num">1</span>) => api.get(<span class="tk-str">'/otakudesu/ongoing'</span>, { page }),
    search:    (q)      => api.get(<span class="tk-str">'/otakudesu/search'</span>, { q }),
    anime:     (id)     => api.get(<span class="tk-str">\`/otakudesu/anime/\${id}\`</span>),
    episode:   (id)     => api.get(<span class="tk-str">\`/otakudesu/episode/\${id}\`</span>),
  },

  <span class="tk-cmt">// Kuramanime</span>
  kuramanime: {
    home:      ()            => api.get(<span class="tk-str">'/kuramanime/home'</span>),
    schedule:  (day=<span class="tk-str">'all'</span>)  => api.get(<span class="tk-str">'/kuramanime/schedule'</span>, { day }),
    anime:     (id, slug)    => api.get(<span class="tk-str">\`/kuramanime/anime/\${id}/\${slug}\`</span>),
  },

  <span class="tk-cmt">// Oploverz</span>
  oploverz: {
    home:     () => api.get(<span class="tk-str">'/oploverz/home'</span>),
    schedule: () => api.get(<span class="tk-str">'/oploverz/schedule'</span>),
    search:   (q) => api.get(<span class="tk-str">'/oploverz/search'</span>, { q }),
  },
};

<span class="tk-kw">export default</span> api;

<span class="tk-cmt">// Contoh pemakaian:</span>
<span class="tk-kw">const</span> home = <span class="tk-kw">await</span> api.otakudesu.home();
<span class="tk-kw">const</span> results = <span class="tk-kw">await</span> api.otakudesu.search(<span class="tk-str">'naruto'</span>);</pre>
          </div>
        </div>
      </div>

      <!-- TypeScript -->
      <div id="guide-tab-ts" class="tab-panel">
        <div class="guide-card">
          <div class="guide-card-title">
            <div class="guide-icon icon-ts">🔷</div>
            TypeScript dengan Interface
          </div>
          <div class="code-block">
            <div class="code-header"><span class="code-lang">TypeScript</span><button class="copy-btn" onclick="copyCode(this)">Salin</button></div>
            <pre><span class="tk-cmt">// types/meanim.ts</span>
<span class="tk-kw">interface</span> ApiResponse&lt;T&gt; {
  statusCode: <span class="tk-str">number</span>;
  message: <span class="tk-str">string</span>;
  data: T;
  pagination?: {
    currentPage: <span class="tk-str">number</span>;
    hasPrevPage: <span class="tk-str">boolean</span>;
    prevPage: <span class="tk-str">number</span> | <span class="tk-kw">null</span>;
    hasNextPage: <span class="tk-str">boolean</span>;
    nextPage: <span class="tk-str">number</span> | <span class="tk-kw">null</span>;
  };
}

<span class="tk-kw">interface</span> AnimeCard {
  animeId: <span class="tk-str">string</span>;
  title: <span class="tk-str">string</span>;
  poster: <span class="tk-str">string</span>;
  episodes: <span class="tk-str">string</span>;
  releaseDay: <span class="tk-str">string</span>;
  latestReleaseDate: <span class="tk-str">string</span>;
  otakudesuUrl?: <span class="tk-str">string</span>;
}

<span class="tk-kw">interface</span> OngoingData {
  animeList: AnimeCard[];
}

<span class="tk-cmt">// Pemakaian</span>
<span class="tk-kw">const</span> <span class="tk-fn">getOngoing</span> = <span class="tk-kw">async</span> (): Promise&lt;ApiResponse&lt;{ animeList: AnimeCard[] }&gt;&gt; => {
  <span class="tk-kw">const</span> res = <span class="tk-kw">await</span> fetch(<span class="tk-str">'https://me-anim-api-explorer.vercel.app/otakudesu/ongoing'</span>);
  <span class="tk-kw">return</span> res.json();
};

<span class="tk-kw">const</span> { data } = <span class="tk-kw">await</span> <span class="tk-fn">getOngoing</span>();
data.animeList.forEach((anime) => console.log(anime.title));</pre>
          </div>
        </div>
      </div>

      <!-- Python -->
      <div id="guide-tab-py" class="tab-panel">
        <div class="guide-card">
          <div class="guide-card-title">
            <div class="guide-icon icon-py">🐍</div>
            Python dengan requests
          </div>
          <div class="code-block">
            <div class="code-header"><span class="code-lang">Python</span><button class="copy-btn" onclick="copyCode(this)">Salin</button></div>
            <pre><span class="tk-kw">import</span> requests

BASE_URL = <span class="tk-str">"https://me-anim-api-explorer.vercel.app"</span>

<span class="tk-kw">def</span> <span class="tk-fn">get_ongoing</span>(page: <span class="tk-str">int</span> = <span class="tk-num">1</span>):
    res = requests.get(
        f<span class="tk-str">"{BASE_URL}/otakudesu/ongoing"</span>,
        params={<span class="tk-str">"page"</span>: page}
    )
    res.raise_for_status()
    data = res.json()
    <span class="tk-kw">return</span> data[<span class="tk-str">"data"</span>][<span class="tk-str">"animeList"</span>]

<span class="tk-kw">def</span> <span class="tk-fn">search_anime</span>(query: <span class="tk-str">str</span>):
    res = requests.get(
        f<span class="tk-str">"{BASE_URL}/otakudesu/search"</span>,
        params={<span class="tk-str">"q"</span>: query}
    )
    <span class="tk-kw">return</span> res.json()[<span class="tk-str">"data"</span>][<span class="tk-str">"animeList"</span>]

<span class="tk-kw">def</span> <span class="tk-fn">get_anime_detail</span>(anime_id: <span class="tk-str">str</span>):
    res = requests.get(f<span class="tk-str">"{BASE_URL}/otakudesu/anime/{anime_id}"</span>)
    <span class="tk-kw">return</span> res.json()[<span class="tk-str">"data"</span>][<span class="tk-str">"details"</span>]

<span class="tk-cmt"># Contoh pemakaian</span>
ongoing = get_ongoing(page=<span class="tk-num">1</span>)
<span class="tk-kw">for</span> anime <span class="tk-kw">in</span> ongoing[:5]:
    print(f<span class="tk-str">"{anime['title']} - Eps: {anime['episodes']}"</span>)

results = search_anime(<span class="tk-str">"attack on titan"</span>)
print(<span class="tk-str">f"Ditemukan: {len(results)} anime"</span>)</pre>
          </div>
        </div>
      </div>

      <!-- cURL -->
      <div id="guide-tab-curl" class="tab-panel">
        <div class="guide-card">
          <div class="guide-card-title">
            <div class="guide-icon icon-curl">🔧</div>
            cURL Commands
          </div>
          <div class="code-block">
            <div class="code-header"><span class="code-lang">Shell</span><button class="copy-btn" onclick="copyCode(this)">Salin</button></div>
            <pre><span class="tk-cmt"># Home otakudesu</span>
<span class="tk-fn">curl</span> <span class="tk-str">"https://me-anim-api-explorer.vercel.app/otakudesu/home"</span>

<span class="tk-cmt"># Search anime</span>
<span class="tk-fn">curl</span> <span class="tk-str">"https://me-anim-api-explorer.vercel.app/otakudesu/search?q=naruto"</span>

<span class="tk-cmt"># Ongoing halaman 2</span>
<span class="tk-fn">curl</span> <span class="tk-str">"https://me-anim-api-explorer.vercel.app/otakudesu/ongoing?page=2"</span>

<span class="tk-cmt"># Detail anime</span>
<span class="tk-fn">curl</span> <span class="tk-str">"https://me-anim-api-explorer.vercel.app/otakudesu/anime/kimetsu-no-yaiba"</span>

<span class="tk-cmt"># Kuramanime schedule hari senin</span>
<span class="tk-fn">curl</span> <span class="tk-str">"https://me-anim-api-explorer.vercel.app/kuramanime/schedule?day=monday"</span>

<span class="tk-cmt"># Oploverz search</span>
<span class="tk-fn">curl</span> <span class="tk-str">"https://me-anim-api-explorer.vercel.app/oploverz/search?q=one+piece"</span>

<span class="tk-cmt"># Format JSON rapi pakai jq</span>
<span class="tk-fn">curl</span> -s <span class="tk-str">"https://me-anim-api-explorer.vercel.app/otakudesu/home"</span> | jq .data</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- LIVE DEMO PAGE -->
    <div id="page-demo" class="page">
      <div class="section-title">Live Demo</div>
      <div class="fetch-demo">
        <div class="fetch-demo-header">
          <div style="width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green)"></div>
          <div class="fetch-demo-title">Fetch Endpoint Langsung</div>
        </div>
        <div class="fetch-demo-body">
          <div class="preset-row">
            <button class="preset-btn" onclick="setUrl('https://me-anim-api-explorer.vercel.app/otakudesu/home')">/otakudesu/home</button>
            <button class="preset-btn" onclick="setUrl('https://me-anim-api-explorer.vercel.app/otakudesu/ongoing?page=1')">/otakudesu/ongoing</button>
            <button class="preset-btn" onclick="setUrl('https://me-anim-api-explorer.vercel.app/otakudesu/search?q=naruto')">/otakudesu/search</button>
            <button class="preset-btn" onclick="setUrl('https://me-anim-api-explorer.vercel.app/kuramanime/home')">/kuramanime/home</button>
            <button class="preset-btn" onclick="setUrl('https://me-anim-api-explorer.vercel.app/kuramanime/schedule?day=all')">/kuramanime/schedule</button>
            <button class="preset-btn" onclick="setUrl('https://me-anim-api-explorer.vercel.app/oploverz/home')">/oploverz/home</button>
            <button class="preset-btn" onclick="setUrl('https://me-anim-api-explorer.vercel.app/oploverz/schedule')">/oploverz/schedule</button>
          </div>
          <div class="input-row">
            <input id="urlInput" class="url-input" type="text" value="https://me-anim-api-explorer.vercel.app/otakudesu/home" placeholder="Masukkan URL endpoint..." />
            <button class="fetch-btn" id="fetchBtn" onclick="doFetch()">▶ Fetch</button>
          </div>
          <div class="response-area">
            <div class="response-header">
              <span class="response-status" id="responseStatus">—</span>
              <span class="response-time" id="responseTime"></span>
            </div>
            <div class="response-pre" id="responseBody"><span style="color:var(--text-muted);font-size:13px;">Tekan tombol Fetch untuk melihat response...</span></div>
          </div>
        </div>
      </div>

      <!-- Structure explanation -->
      <div class="section-title mt-24">Contoh Objek Response</div>
      <div class="tabs">
        <button class="tab-btn active" onclick="switchTab('demo', 'home', this)">Home</button>
        <button class="tab-btn" onclick="switchTab('demo', 'ongoing', this)">Ongoing</button>
        <button class="tab-btn" onclick="switchTab('demo', 'detail', this)">Anime Detail</button>
        <button class="tab-btn" onclick="switchTab('demo', 'episode', this)">Episode</button>
      </div>
      <div id="demo-tab-home" class="tab-panel active">
        <div class="code-block">
          <div class="code-header"><span class="code-lang">JSON — /otakudesu/home</span><button class="copy-btn" onclick="copyCode(this)">Salin</button></div>
          <pre>{
  <span class="json-key">"statusCode"</span><span class="json-punct">:</span> <span class="json-num">200</span><span class="json-punct">,</span>
  <span class="json-key">"data"</span><span class="json-punct">: {</span>
    <span class="json-key">"ongoing"</span><span class="json-punct">: {</span>
      <span class="json-key">"animeList"</span><span class="json-punct">: [</span>
        <span class="json-punct">{</span>
          <span class="json-key">"animeId"</span><span class="json-punct">:</span>             <span class="json-str">"kimetsu-no-yaiba-hashira-geiko-hen"</span><span class="json-punct">,</span>
          <span class="json-key">"title"</span><span class="json-punct">:</span>              <span class="json-str">"Kimetsu no Yaiba: Hashira Geiko-hen"</span><span class="json-punct">,</span>
          <span class="json-key">"poster"</span><span class="json-punct">:</span>             <span class="json-str">"https://otakudesu.cloud/wp-content/.../poster.jpg"</span><span class="json-punct">,</span>
          <span class="json-key">"episodes"</span><span class="json-punct">:</span>           <span class="json-str">"8"</span><span class="json-punct">,</span>
          <span class="json-key">"releaseDay"</span><span class="json-punct">:</span>         <span class="json-str">"Minggu"</span><span class="json-punct">,</span>
          <span class="json-key">"latestReleaseDate"</span><span class="json-punct">:</span> <span class="json-str">"27 June 2024"</span>
        <span class="json-punct">}</span>
      <span class="json-punct">]</span>
    <span class="json-punct">},</span>
    <span class="json-key">"completed"</span><span class="json-punct">: {</span>
      <span class="json-key">"animeList"</span><span class="json-punct">: [</span>
        <span class="json-punct">{</span>
          <span class="json-key">"animeId"</span><span class="json-punct">:</span>       <span class="json-str">"mushoku-tensei-isekai-ittara-honki-dasu"</span><span class="json-punct">,</span>
          <span class="json-key">"title"</span><span class="json-punct">:</span>        <span class="json-str">"Mushoku Tensei: Isekai Ittara Honki Dasu"</span><span class="json-punct">,</span>
          <span class="json-key">"poster"</span><span class="json-punct">:</span>       <span class="json-str">"https://..."</span><span class="json-punct">,</span>
          <span class="json-key">"episodes"</span><span class="json-punct">:</span>     <span class="json-str">"23"</span><span class="json-punct">,</span>
          <span class="json-key">"score"</span><span class="json-punct">:</span>        <span class="json-str">"8.50"</span><span class="json-punct">,</span>
          <span class="json-key">"lastReleaseDate"</span><span class="json-punct">:</span> <span class="json-str">"10 June 2024"</span>
        <span class="json-punct">}</span>
      <span class="json-punct">]</span>
    <span class="json-punct">}</span>
  <span class="json-punct">}</span>
<span class="json-punct">}</span></pre>
        </div>
      </div>
      <div id="demo-tab-ongoing" class="tab-panel">
        <div class="code-block">
          <div class="code-header"><span class="code-lang">JSON — /otakudesu/ongoing?page=1</span><button class="copy-btn" onclick="copyCode(this)">Salin</button></div>
          <pre>{
  <span class="json-key">"statusCode"</span><span class="json-punct">:</span> <span class="json-num">200</span><span class="json-punct">,</span>
  <span class="json-key">"data"</span><span class="json-punct">: {</span>
    <span class="json-key">"animeList"</span><span class="json-punct">: [</span>
      <span class="json-punct">{</span>
        <span class="json-key">"animeId"</span><span class="json-punct">:</span>             <span class="json-str">"blue-lock-vs-u-20-japan"</span><span class="json-punct">,</span>
        <span class="json-key">"title"</span><span class="json-punct">:</span>              <span class="json-str">"Blue Lock vs. U-20 Japan"</span><span class="json-punct">,</span>
        <span class="json-key">"poster"</span><span class="json-punct">:</span>             <span class="json-str">"https://..."</span><span class="json-punct">,</span>
        <span class="json-key">"episodes"</span><span class="json-punct">:</span>           <span class="json-str">"5"</span><span class="json-punct">,</span>
        <span class="json-key">"releaseDay"</span><span class="json-punct">:</span>         <span class="json-str">"Sabtu"</span><span class="json-punct">,</span>
        <span class="json-key">"latestReleaseDate"</span><span class="json-punct">:</span> <span class="json-str">"29 June 2024"</span>
      <span class="json-punct">}</span>
    <span class="json-punct">]</span>
  <span class="json-punct">},</span>
  <span class="json-key">"pagination"</span><span class="json-punct">: {</span>
    <span class="json-key">"currentPage"</span><span class="json-punct">:</span> <span class="json-num">1</span><span class="json-punct">,</span>
    <span class="json-key">"hasPrevPage"</span><span class="json-punct">:</span> <span class="json-bool">false</span><span class="json-punct">,</span>
    <span class="json-key">"prevPage"</span><span class="json-punct">:</span>    <span class="json-null">null</span><span class="json-punct">,</span>
    <span class="json-key">"hasNextPage"</span><span class="json-punct">:</span> <span class="json-bool">true</span><span class="json-punct">,</span>
    <span class="json-key">"nextPage"</span><span class="json-punct">:</span>    <span class="json-num">2</span>
  <span class="json-punct">}</span>
<span class="json-punct">}</span></pre>
        </div>
      </div>
      <div id="demo-tab-detail" class="tab-panel">
        <div class="code-block">
          <div class="code-header"><span class="code-lang">JSON — /otakudesu/anime/:animeId</span><button class="copy-btn" onclick="copyCode(this)">Salin</button></div>
          <pre>{
  <span class="json-key">"data"</span><span class="json-punct">: {</span>
    <span class="json-key">"details"</span><span class="json-punct">: {</span>
      <span class="json-key">"title"</span><span class="json-punct">:</span>      <span class="json-str">"Kimetsu no Yaiba"</span><span class="json-punct">,</span>
      <span class="json-key">"japanese"</span><span class="json-punct">:</span>  <span class="json-str">"鬼滅の刃"</span><span class="json-punct">,</span>
      <span class="json-key">"score"</span><span class="json-punct">:</span>     <span class="json-str">"8.54"</span><span class="json-punct">,</span>
      <span class="json-key">"producers"</span><span class="json-punct">:</span> <span class="json-str">"Aniplex, Shueisha"</span><span class="json-punct">,</span>
      <span class="json-key">"type"</span><span class="json-punct">:</span>      <span class="json-str">"TV"</span><span class="json-punct">,</span>
      <span class="json-key">"status"</span><span class="json-punct">:</span>    <span class="json-str">"Completed"</span><span class="json-punct">,</span>
      <span class="json-key">"episodes"</span><span class="json-punct">:</span>  <span class="json-str">"26"</span><span class="json-punct">,</span>
      <span class="json-key">"duration"</span><span class="json-punct">:</span>  <span class="json-str">"23 min/ep"</span><span class="json-punct">,</span>
      <span class="json-key">"aired"</span><span class="json-punct">:</span>     <span class="json-str">"Apr 6, 2019 to Sep 28, 2019"</span><span class="json-punct">,</span>
      <span class="json-key">"studios"</span><span class="json-punct">:</span>   <span class="json-str">"ufotable"</span><span class="json-punct">,</span>
      <span class="json-key">"poster"</span><span class="json-punct">:</span>    <span class="json-str">"https://..."</span><span class="json-punct">,</span>
      <span class="json-key">"synopsis"</span><span class="json-punct">: {</span>
        <span class="json-key">"paragraphList"</span><span class="json-punct">:</span> <span class="json-punct">[</span><span class="json-str">"Tanjiro Kamado..."</span><span class="json-punct">]</span>
      <span class="json-punct">},</span>
      <span class="json-key">"genreList"</span><span class="json-punct">: [</span>
        <span class="json-punct">{</span> <span class="json-key">"genreId"</span><span class="json-punct">:</span> <span class="json-str">"action"</span><span class="json-punct">,</span> <span class="json-key">"title"</span><span class="json-punct">:</span> <span class="json-str">"Action"</span> <span class="json-punct">}</span>
      <span class="json-punct">],</span>
      <span class="json-key">"episodeList"</span><span class="json-punct">: [</span>
        <span class="json-punct">{</span> <span class="json-key">"episodeId"</span><span class="json-punct">:</span> <span class="json-str">"kimetsu-episode-26"</span><span class="json-punct">,</span> <span class="json-key">"title"</span><span class="json-punct">:</span> <span class="json-str">"Episode 26"</span> <span class="json-punct">}</span>
      <span class="json-punct">],</span>
      <span class="json-key">"recommendedAnimeList"</span><span class="json-punct">: [...]</span>
    <span class="json-punct">}</span>
  <span class="json-punct">}</span>
<span class="json-punct">}</span></pre>
        </div>
      </div>
      <div id="demo-tab-episode" class="tab-panel">
        <div class="code-block">
          <div class="code-header"><span class="code-lang">JSON — /otakudesu/episode/:episodeId</span><button class="copy-btn" onclick="copyCode(this)">Salin</button></div>
          <pre>{
  <span class="json-key">"data"</span><span class="json-punct">: {</span>
    <span class="json-key">"details"</span><span class="json-punct">: {</span>
      <span class="json-key">"title"</span><span class="json-punct">:</span>              <span class="json-str">"Kimetsu no Yaiba Episode 1"</span><span class="json-punct">,</span>
      <span class="json-key">"animeId"</span><span class="json-punct">:</span>           <span class="json-str">"kimetsu-no-yaiba"</span><span class="json-punct">,</span>
      <span class="json-key">"releaseTime"</span><span class="json-punct">:</span>       <span class="json-str">"6 April 2019"</span><span class="json-punct">,</span>
      <span class="json-key">"defaultStreamingUrl"</span><span class="json-punct">:</span> <span class="json-str">"https://..."</span><span class="json-punct">,</span>
      <span class="json-key">"hasPrevEpisode"</span><span class="json-punct">:</span>    <span class="json-bool">false</span><span class="json-punct">,</span>
      <span class="json-key">"prevEpisode"</span><span class="json-punct">:</span>       <span class="json-null">null</span><span class="json-punct">,</span>
      <span class="json-key">"hasNextEpisode"</span><span class="json-punct">:</span>    <span class="json-bool">true</span><span class="json-punct">,</span>
      <span class="json-key">"nextEpisode"</span><span class="json-punct">: {</span>
        <span class="json-key">"episodeId"</span><span class="json-punct">:</span> <span class="json-str">"kimetsu-episode-2"</span><span class="json-punct">,</span>
        <span class="json-key">"title"</span><span class="json-punct">:</span>     <span class="json-str">"Episode 2"</span>
      <span class="json-punct">},</span>
      <span class="json-key">"server"</span><span class="json-punct">: {</span>
        <span class="json-key">"qualityList"</span><span class="json-punct">: [</span>
          <span class="json-punct">{</span> <span class="json-key">"title"</span><span class="json-punct">:</span> <span class="json-str">"360p"</span><span class="json-punct">,</span> <span class="json-key">"serverList"</span><span class="json-punct">: [{</span><span class="json-key">"serverId"</span><span class="json-punct">:</span><span class="json-str">"..."</span><span class="json-punct">,</span><span class="json-key">"title"</span><span class="json-punct">:</span><span class="json-str">"Desu"</span><span class="json-punct">}]</span> <span class="json-punct">}</span>
        <span class="json-punct">]</span>
      <span class="json-punct">},</span>
      <span class="json-key">"download"</span><span class="json-punct">: {</span>
        <span class="json-key">"qualityList"</span><span class="json-punct">: [...]</span>
      <span class="json-punct">}</span>
    <span class="json-punct">}</span>
  <span class="json-punct">}</span>
<span class="json-punct">}</span></pre>
        </div>
      </div>
    </div>

    <!-- OTAKUDESU PAGE -->
    <div id="page-otakudesu" class="page">
      <div class="hero" style="padding:24px 32px;margin-bottom:24px;">
        <div style="font-size:20px;font-weight:800;margin-bottom:4px;">Otakudesu</div>
        <div style="font-size:13px;color:var(--text-secondary);">Prefix: <code style="font-family:var(--font-mono);color:var(--text-code);">/otakudesu</code> · 11 Endpoint · Scraper: otakudesu.cloud</div>
      </div>

      <div id="endpoints-otakudesu"></div>
    </div>

    <!-- KURAMANIME PAGE -->
    <div id="page-kuramanime" class="page">
      <div class="hero" style="padding:24px 32px;margin-bottom:24px;">
        <div style="font-size:20px;font-weight:800;margin-bottom:4px;">Kuramanime</div>
        <div style="font-size:13px;color:var(--text-secondary);">Prefix: <code style="font-family:var(--font-mono);color:var(--text-code);">/kuramanime</code> · 8 Endpoint · Scraper: kuramanime.gratis</div>
      </div>
      <div id="endpoints-kuramanime"></div>
    </div>

    <!-- OPLOVERZ PAGE -->
    <div id="page-oploverz" class="page">
      <div class="hero" style="padding:24px 32px;margin-bottom:24px;">
        <div style="font-size:20px;font-weight:800;margin-bottom:4px;">Oploverz</div>
        <div style="font-size:13px;color:var(--text-secondary);">Prefix: <code style="font-family:var(--font-mono);color:var(--text-code);">/oploverz</code> · 7 Endpoint · Scraper: oploverz.me</div>
      </div>
      <div id="endpoints-oploverz"></div>
    </div>

    <!-- SAMEHADAKU PAGE -->
    <div id="page-samehadaku" class="page">
      <div class="hero" style="padding:24px 32px;margin-bottom:24px;">
        <div style="font-size:20px;font-weight:800;margin-bottom:4px;">Samehadaku</div>
        <div style="font-size:13px;color:var(--text-secondary);">Prefix: <code style="font-family:var(--font-mono);color:var(--text-code);">/samehadaku</code> · 1 Endpoint · WIP</div>
      </div>
      <div id="endpoints-samehadaku"></div>
    </div>

  </main>
</div>

<footer class="footer">
  <div class="footer-left">
    <div class="footer-logo">ME</div>
    <span>MEANIM API Explorer</span>
  </div>
  <span>Express.js · TypeScript · me-anim-api-explorer.vercel.app</span>
</footer>

<script>
/* ──────────────────────────────────────────────────
   DATA
──────────────────────────────────────────────────── */
const ENDPOINTS = {
  otakudesu: [
    {
      method: 'GET', path: '/otakudesu', desc: 'Root – daftar semua endpoint',
      pathParams: [], queryParams: []
    },
    {
      method: 'GET', path: '/otakudesu/home', desc: 'Halaman utama (ongoing + completed)',
      pathParams: [], queryParams: []
    },
    {
      method: 'GET', path: '/otakudesu/schedule', desc: 'Jadwal rilis mingguan',
      pathParams: [], queryParams: []
    },
    {
      method: 'GET', path: '/otakudesu/anime', desc: 'Daftar semua anime (A-Z)',
      pathParams: [], queryParams: []
    },
    {
      method: 'GET', path: '/otakudesu/genre', desc: 'Daftar semua genre',
      pathParams: [], queryParams: []
    },
    {
      method: 'GET', path: '/otakudesu/ongoing', desc: 'Anime sedang tayang',
      pathParams: [],
      queryParams: [{ key: 'page', type: 'number', default: '1', required: false }]
    },
    {
      method: 'GET', path: '/otakudesu/completed', desc: 'Anime selesai tayang',
      pathParams: [],
      queryParams: [{ key: 'page', type: 'number', default: '1', required: false }]
    },
    {
      method: 'GET', path: '/otakudesu/search', desc: 'Cari anime berdasarkan keyword',
      pathParams: [],
      queryParams: [{ key: 'q', type: 'string', default: null, required: true }]
    },
    {
      method: 'GET', path: '/otakudesu/genre/{genreId}', desc: 'Anime berdasarkan genre',
      pathParams: [{ key: 'genreId', type: 'string', default: null, required: true, example: 'action' }],
      queryParams: [{ key: 'page', type: 'number', default: '1', required: false }]
    },
    {
      method: 'GET', path: '/otakudesu/anime/{animeId}', desc: 'Detail anime',
      pathParams: [{ key: 'animeId', type: 'string', default: null, required: true, example: 'kimetsu-no-yaiba' }],
      queryParams: []
    },
    {
      method: 'GET', path: '/otakudesu/episode/{episodeId}', desc: 'Detail episode + server streaming',
      pathParams: [{ key: 'episodeId', type: 'string', default: null, required: true, example: 'kimetsu-episode-1' }],
      queryParams: []
    },
  ],
  kuramanime: [
    {
      method: 'GET', path: '/kuramanime', desc: 'Root – daftar semua endpoint',
      pathParams: [], queryParams: []
    },
    {
      method: 'GET', path: '/kuramanime/home', desc: 'Halaman utama (ongoing + completed + movie)',
      pathParams: [], queryParams: []
    },
    {
      method: 'GET', path: '/kuramanime/anime', desc: 'Daftar anime dengan filter & sort',
      pathParams: [],
      queryParams: [
        { key: 'search', type: 'string', default: null, required: false },
        { key: 'status', type: '"ongoing"|"completed"|"upcoming"|"movie"', default: null, required: false },
        { key: 'sort', type: '"a-z"|"z-a"|"oldest"|"latest"|"popular"|"most_viewed"|"updated"', default: '"latest"', required: false },
        { key: 'page', type: 'number', default: '1', required: false },
      ]
    },
    {
      method: 'GET', path: '/kuramanime/schedule', desc: 'Jadwal rilis per hari',
      pathParams: [],
      queryParams: [
        { key: 'day', type: '"all"|"monday"|"tuesday"|"wednesday"|"thursday"|"friday"|"saturday"|"sunday"', default: '"all"', required: false },
        { key: 'page', type: 'number', default: '1', required: false },
      ]
    },
    {
      method: 'GET', path: '/kuramanime/properties/{propertyType}', desc: 'Daftar properti (genre/season/studio/dll)',
      pathParams: [{ key: 'propertyType', type: '"genre"|"season"|"studio"|"type"|"quality"|"source"|"country"', default: null, required: true, example: 'genre' }],
      queryParams: []
    },
    {
      method: 'GET', path: '/kuramanime/properties/{propertyType}/{propertyId}', desc: 'Anime berdasarkan properti',
      pathParams: [
        { key: 'propertyType', type: '"genre"|"season"|"studio"|...', default: null, required: true, example: 'genre' },
        { key: 'propertyId', type: 'string', default: null, required: true, example: 'action' },
      ],
      queryParams: []
    },
    {
      method: 'GET', path: '/kuramanime/anime/{animeId}/{animeSlug}', desc: 'Detail anime',
      pathParams: [
        { key: 'animeId', type: 'string', default: null, required: true, example: '1' },
        { key: 'animeSlug', type: 'string', default: null, required: true, example: 'kimetsu-no-yaiba' },
      ],
      queryParams: []
    },
    {
      method: 'GET', path: '/kuramanime/episode/{animeId}/{animeSlug}/{episodeId}', desc: 'Detail episode + server',
      pathParams: [
        { key: 'animeId', type: 'string', default: null, required: true, example: '1' },
        { key: 'animeSlug', type: 'string', default: null, required: true, example: 'kimetsu-no-yaiba' },
        { key: 'episodeId', type: 'string', default: null, required: true, example: '1' },
      ],
      queryParams: []
    },
  ],
  oploverz: [
    {
      method: 'GET', path: '/oploverz', desc: 'Root – daftar semua endpoint',
      pathParams: [], queryParams: []
    },
    {
      method: 'GET', path: '/oploverz/home', desc: 'Halaman utama (popular + latest)',
      pathParams: [], queryParams: []
    },
    {
      method: 'GET', path: '/oploverz/schedule', desc: 'Jadwal rilis anime per hari',
      pathParams: [], queryParams: []
    },
    {
      method: 'GET', path: '/oploverz/anime', desc: 'Direktori anime A-Z + filter',
      pathParams: [],
      queryParams: [
        { key: 'genre', type: 'string (comma-sep)', default: null, required: false },
        { key: 'season', type: 'string (comma-sep)', default: null, required: false },
        { key: 'studio', type: 'string (comma-sep)', default: null, required: false },
        { key: 'status', type: '"ongoing"|"completed"|"upcoming"|"hiatus"', default: null, required: false },
        { key: 'type', type: '"tv"|"movie"|"ova"|"ona"|"special"', default: null, required: false },
        { key: 'order', type: '"title"|"update"|"latest"|"popular"|"rating"', default: null, required: false },
      ]
    },
    {
      method: 'GET', path: '/oploverz/anime/{animeId}', desc: 'Detail anime berdasarkan slug',
      pathParams: [{ key: 'animeId', type: 'string (slug)', default: null, required: true, example: 'kimetsu-no-yaiba' }],
      queryParams: []
    },
    {
      method: 'GET', path: '/oploverz/episode/{episodeId}', desc: 'Detail episode + streaming',
      pathParams: [{ key: 'episodeId', type: 'string (slug)', default: null, required: true, example: 'kimetsu-no-yaiba-episode-1' }],
      queryParams: []
    },
    {
      method: 'GET', path: '/oploverz/search', desc: 'Cari anime',
      pathParams: [],
      queryParams: [{ key: 'q', type: 'string', default: null, required: true }]
    },
  ],
  samehadaku: [
    {
      method: 'GET', path: '/samehadaku', desc: 'Root – WIP',
      pathParams: [], queryParams: []
    },
  ],
};

/* ──────────────────────────────────────────────────
   RENDER ENDPOINTS
──────────────────────────────────────────────────── */
function formatPath(path) {
  return path.replace(/\\{(\\w+)\\}/g, '<span class="path-param">{$1}</span>');
}

function renderEndpoints(source) {
  const container = document.getElementById(\`endpoints-\${source}\`);
  if (!container) return;
  const eps = ENDPOINTS[source];
  if (!eps) return;

  let html = '';
  eps.forEach((ep, idx) => {
    const hasParams = ep.pathParams.length > 0 || ep.queryParams.length > 0;
    const methodClass = ep.method.includes('GET') ? 'method-GET' : 'method-POST';

    let paramHtml = '';
    if (ep.pathParams.length > 0) {
      paramHtml += \`<div class="param-group">
        <div class="param-group-label">Path Params</div>\`;
      ep.pathParams.forEach(p => {
        paramHtml += \`<div class="param-row">
          <span class="param-key">:\${p.key}</span>
          <span class="param-type">\${p.type}\${p.example ? \` <span style="color:var(--text-muted)">contoh: \${p.example}</span>\` : ''}</span>
          <span class="param-badge required">required</span>
        </div>\`;
      });
      paramHtml += \`</div>\`;
    }
    if (ep.queryParams.length > 0) {
      paramHtml += \`<div class="param-group">
        <div class="param-group-label">Query Params</div>\`;
      ep.queryParams.forEach(p => {
        paramHtml += \`<div class="param-row">
          <span class="param-key">?\${p.key}</span>
          <span class="param-type">\${p.type}\${p.default ? \` <span style="color:var(--text-muted)">(default: \${p.default})</span>\` : ''}</span>
          <span class="param-badge \${p.required ? 'required' : 'optional'}">\${p.required ? 'required' : 'optional'}</span>
        </div>\`;
      });
      paramHtml += \`</div>\`;
    }

    // Build example URL
    let examplePath = ep.path.replace(/\\{(\\w+)\\}/g, (_, k) => {
      const found = ep.pathParams.find(p => p.key === k);
      return found?.example || \`{\${k}}\`;
    });
    const exUrlCode = \`https://me-anim-api-explorer.vercel.app\${examplePath}\${ep.queryParams.filter(p=>p.required).map((p,i)=>\`\${i===0?'?':'&'}\${p.key}=example\`).join('')}\`;

    paramHtml += \`
      <div class="param-group">
        <div class="param-group-label">Contoh Penggunaan</div>
        <div class="code-block">
          <div class="code-header"><span class="code-lang">JavaScript</span><button class="copy-btn" onclick="copyCode(this)">Salin</button></div>
          <pre><span class="tk-kw">const</span> res = <span class="tk-kw">await</span> fetch(<span class="tk-str">'\${exUrlCode}'</span>);\\n<span class="tk-kw">const</span> { data } = <span class="tk-kw">await</span> res.json();\\nconsole.log(data);</pre>
        </div>
      </div>\`;

    html += \`
      <div class="endpoint-card" id="ep-\${source}-\${idx}">
        <div class="endpoint-header" onclick="toggleEndpoint('ep-\${source}-\${idx}')">
          <span class="method-badge \${methodClass}">\${ep.method}</span>
          <span class="endpoint-path">\${formatPath(ep.path)}</span>
          <span class="endpoint-desc">\${ep.desc}</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div class="endpoint-body">
          \${hasParams ? paramHtml : '<div style="padding-top:12px;color:var(--text-muted);font-size:13px;">Tidak ada parameter.</div>'}
        </div>
      </div>\`;
  });

  container.innerHTML = html;
}

/* ──────────────────────────────────────────────────
   NAVIGATION
──────────────────────────────────────────────────── */
function navigate(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));

  const target = document.getElementById(\`page-\${page}\`);
  if (target) target.classList.add('active');
  if (el) el.classList.add('active');

  // lazy render endpoints
  const srcPages = ['otakudesu','kuramanime','oploverz','samehadaku'];
  if (srcPages.includes(page)) {
    const cont = document.getElementById(\`endpoints-\${page}\`);
    if (cont && cont.innerHTML.trim() === '') renderEndpoints(page);
  }
}

function toggleEndpoint(id) {
  const card = document.getElementById(id);
  if (card) card.classList.toggle('open');
}

/* ──────────────────────────────────────────────────
   TABS
──────────────────────────────────────────────────── */
function switchTab(group, tab, btn) {
  const panels = document.querySelectorAll(\`[id^="\${group}-tab-"]\`);
  panels.forEach(p => p.classList.remove('active'));
  const target = document.getElementById(\`\${group}-tab-\${tab}\`);
  if (target) target.classList.add('active');

  btn.closest('.tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ──────────────────────────────────────────────────
   FETCH DEMO
──────────────────────────────────────────────────── */
function setUrl(url) {
  document.getElementById('urlInput').value = url;
}

async function doFetch() {
  const url = document.getElementById('urlInput').value.trim();
  if (!url) return;

  const btn = document.getElementById('fetchBtn');
  const statusEl = document.getElementById('responseStatus');
  const timeEl = document.getElementById('responseTime');
  const bodyEl = document.getElementById('responseBody');

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Loading...';
  statusEl.className = 'response-status';
  statusEl.textContent = '...';
  timeEl.textContent = '';
  bodyEl.innerHTML = '<span style="color:var(--text-muted)">Fetching...</span>';

  const start = Date.now();
  try {
    const res = await fetch(url);
    const elapsed = Date.now() - start;
    const json = await res.json();

    statusEl.textContent = \`\${res.status} \${res.statusText}\`;
    statusEl.className = \`response-status \${res.ok ? 'status-ok' : 'status-err'}\`;
    timeEl.textContent = \`\${elapsed}ms\`;
    bodyEl.innerHTML = syntaxHighlight(JSON.stringify(json, null, 2));
  } catch (err) {
    const elapsed = Date.now() - start;
    statusEl.textContent = 'ERROR';
    statusEl.className = 'response-status status-err';
    timeEl.textContent = \`\${elapsed}ms\`;
    bodyEl.innerHTML = \`<span style="color:var(--red)">\${err.message}\\n\\nPastikan server berjalan di https://me-anim-api-explorer.vercel.app</span>\`;
  } finally {
    btn.disabled = false;
    btn.textContent = '▶ Fetch';
  }
}

function syntaxHighlight(json) {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(\\\\u[a-zA-Z0-9]{4}|\\\\[^u]|[^\\\\"])*"(\\s*:)?|\\b(true|false|null)\\b|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)/g, (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return \`<span class="json-key">\${match}</span>\`;
        return \`<span class="json-str">\${match}</span>\`;
      }
      if (/true|false/.test(match)) return \`<span class="json-bool">\${match}</span>\`;
      if (/null/.test(match)) return \`<span class="json-null">\${match}</span>\`;
      return \`<span class="json-num">\${match}</span>\`;
    });
}

/* ──────────────────────────────────────────────────
   COPY
──────────────────────────────────────────────────── */
function copyCode(btn) {
  const pre = btn.closest('.code-block').querySelector('pre');
  const text = pre.innerText || pre.textContent;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✓ Disalin!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Salin';
      btn.classList.remove('copied');
    }, 1800);
  });
}

/* Enter key to fetch */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.activeElement?.id === 'urlInput') doFetch();
});
</script>
</body>
</html>
`;
app.get("/", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(explorerHTML);
});
app.use("/otakudesu", otakudesuRouter);
app.use("/kuramanime", kuramanimeRouter);
app.use("/samehadaku", samehadakuRouter);
app.use("/oploverz", oploverzRouter);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});

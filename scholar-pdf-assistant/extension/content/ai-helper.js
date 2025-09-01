// content/ai-helper.js  —— Gemini 版 + Chat 交互 + 仅滚动面板（按钮 + 面板内悬浮滚动条）

/* ===================== 可配置区域 ===================== */
const AIH_THEME = "dark"; // "dark" 或 "light"

// Gemini REST API（Generative Language API v1beta）
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
// 模型候选（按顺序尝试；Free Tier 通常可用 1.5-flash）
const GEMINI_MODEL_CHAIN = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro-latest"];

const TEMPERATURE = 0.2;
const MAX_CHARS_PER_MESSAGE = 120000; // 超出即分块（整文分析使用）
const PREFETCH_ON_LOAD = true;        // 页面就绪后预抽全文
const DOC_SUMMARY_MAX_CHARS = 40000;  // 对话上下文的文档摘要输入上限

// 面板滚动参数（仅作用于 AI Helper 面板）
const PANEL_SCROLL_SCREEN_RATIO = 0.9; // 单次“滚动一屏”的比例
const PANEL_SCROLL_SMOOTH = false;     // 是否平滑滚动
/* ===================================================== */

await waitForPDFApp();

const panel = ensureResultPanel();
applyPanelTheme(panel, panel._header, panel._body);
const aiBtn = ensureAIButton();

// 在 panel 就绪后初始化“面板内悬浮滚动条”，并做一次布局计算
ensurePanelScrollOverlay();
layoutPanel();              // << 关键：给 body 设定像素高度
setTimeout(updatePanelScrollOverlay, 0);

let cachedText = null;
let docSummary = null;
const chatHistory = [];

if (PREFETCH_ON_LOAD) prefetchWhenReady().catch(console.warn);

// 绑定交互
aiBtn.addEventListener("click", onClickAI);
panel._sendBtn.addEventListener("click", handleSendFromUI);
panel._input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSendFromUI();
  }
});
addGlobalScrollHotkeys(panel);

// 监听窗口尺寸变化，始终保持可滚
window.addEventListener("resize", () => { layoutPanel(); updatePanelScrollOverlay(); });

/* ===================== 主流程：一次性整文分析 ===================== */
async function onClickAI() {
  try {
    aiBtn.disabled = true;
    setPanelVisible(true);
    clearPanel();
    logLine("⏳ 正在准备调用 AI……");

    const apiKey = await ensureGeminiKey();
    if (!apiKey) {
      logLine("❌ 未提供 Gemini API Key，已取消。");
      return;
    }

    const fullText = cachedText || (await extractFullPdfText());
    cachedText = fullText;
    logLine(`📄 已获取全文，长度约 ${fullText.length.toLocaleString()} 字符。`);

    const output = await analyzeWholeDocWithGemini(fullText, apiKey);
    logLine("");
    logLine("✅ AI 分析完成（可复制）：");
    appendBlock(output);

    try { await ensureDocSummary(apiKey); } catch {}
  } catch (err) {
    console.error(err);
    logLine(`❌ 出错：${err?.message || String(err)}`);
  } finally {
    aiBtn.disabled = false;
  }
}

/* ===================== Chat 交互 ===================== */
async function handleSendFromUI() {
  const text = (panel._input.value || "").trim();
  if (!text) return;

  panel._input.value = "";
  appendChatBubble("user", text);
  chatHistory.push({ role: "user", text });

  try {
    panel._sendBtn.disabled = true;

    const apiKey = await ensureGeminiKey();
    if (!apiKey) {
      appendChatBubble("model", "❌ 未提供 Gemini API Key。");
      return;
    }

    const fullText = cachedText || (await extractFullPdfText());
    cachedText = fullText;

    await ensureDocSummary(apiKey);

    const reply = await chatOnceWithGemini(apiKey);
    appendChatBubble("model", reply);
    chatHistory.push({ role: "model", text: reply });
  } catch (e) {
    console.error(e);
    appendChatBubble("model", `❌ 出错：${e?.message || String(e)}`);
  } finally {
    panel._sendBtn.disabled = false;
    panel._input.focus();
  }
}

async function chatOnceWithGemini(apiKey) {
  const contents = [];
  const summaryPrefix =
    "以下是本 PDF 文档的摘要（对后续问答仅作参考，不等于全文）：\n" +
    (docSummary || "（摘要生成失败）") +
    "\n——请结合以上摘要与对话历史回答用户问题。";
  contents.push({ role: "user", parts: [{ text: summaryPrefix }] });
  chatHistory.forEach((m) => contents.push({ role: m.role, parts: [{ text: m.text }] }));

  return await geminiChatWithFallback({ contents, apiKey });
}

/* ===================== UI：按钮与面板 ===================== */
function ensureAIButton() {
  const container = document.getElementById("toolbarViewerRight") || document.body;
  let btn = document.getElementById("aiHelperButton");
  if (btn) return btn;

  btn = document.createElement("button");
  btn.id = "aiHelperButton";
  btn.className = "toolbarButton";
  btn.type = "button";
  btn.title = "AI Helper";
  btn.textContent = "AI Helper";
  container.appendChild(btn);
  return btn;
}

function ensureResultPanel() {
  let panel = document.getElementById("aiHelperPanel");
  if (panel) return panel;

  panel = document.createElement("div");
  panel.id = "aiHelperPanel";
  Object.assign(panel.style, {
    position: "fixed",
    right: "12px",
    bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
    width: "520px",
    height: "min(70vh, 560px)",
    boxSizing: "border-box",          // 确保像素高度计算准确
    overflow: "hidden",               // 容器不滚动
    background: "#141414",
    color: "#eee",
    border: "1px solid #333",
    boxShadow: "0 8px 24px rgba(0,0,0,.35)",
    borderRadius: "10px",
    display: "none",
    zIndex: 99999,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    display: "flex",
    flexDirection: "column",
  });

  // 顶部栏（固定）
  const header = document.createElement("div");
  Object.assign(header.style, {
    padding: "10px 12px",
    fontWeight: "700",
    borderBottom: "1px solid #333",
    background: "#1a1a1a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    userSelect: "none",
    cursor: "move",
    flex: "0 0 auto",
    position: "sticky",
    top: "0",
    zIndex: "2",
  });

  const headerLeft = document.createElement("div");
  headerLeft.textContent = "AI Helper";
  headerLeft.style.fontWeight = "700";

  const tools = document.createElement("div");
  tools.style.display = "flex";
  tools.style.gap = "8px";

  const themeBtn = document.createElement("button");
  Object.assign(themeBtn.style, btnStyle());
  themeBtn.title = "切换主题";
  themeBtn.textContent = AIH_THEME === "dark" ? "☀️" : "🌙";

  const copyBtn = document.createElement("button");
  Object.assign(copyBtn.style, btnStyle());
  copyBtn.title = "复制内容";
  copyBtn.textContent = "复制";

  const clearBtn = document.createElement("button");
  Object.assign(clearBtn.style, btnStyle());
  clearBtn.title = "清空";
  clearBtn.textContent = "清空";

  const closeBtn = document.createElement("button");
  Object.assign(closeBtn.style, btnStyle());
  closeBtn.title = "关闭";
  closeBtn.textContent = "×";

  tools.appendChild(themeBtn);
  tools.appendChild(copyBtn);
  tools.appendChild(clearBtn);
  tools.appendChild(closeBtn);

  header.appendChild(headerLeft);
  header.appendChild(tools);

  // 中间内容区（唯一可滚）—— 像素高度由 layoutPanel() 设定
  const body = document.createElement("div");
  body.id = "aiHelperOutput";
  Object.assign(body.style, {
    margin: 0,
    padding: "12px 14px 12px 14px",
    fontSize: "12px",
    lineHeight: "1.55",
    whiteSpace: "pre-wrap",
    overflowY: "auto",
    overflowX: "hidden",
    flex: "0 0 auto",                // 交给 height 控制，不依赖 flex 自动
    minHeight: 0,
    scrollbarGutter: "stable both-edges",
    background: "transparent",
  });

  // 底部输入区（固定） + ↑/↓
  const footer = document.createElement("div");
  Object.assign(footer.style, {
    borderTop: "1px solid #333",
    padding: "8px",
    background: "#181818",
    display: "flex",
    gap: "8px",
    alignItems: "flex-end",
    flex: "0 0 auto",
    position: "sticky",
    bottom: "0",
    zIndex: "2",
  });

  const scrollGroup = document.createElement("div");
  Object.assign(scrollGroup.style, {
    display: "flex",
    gap: "6px",
    alignItems: "center",
    flex: "0 0 auto",
  });

  const upBtn = document.createElement("button");
  upBtn.textContent = "↑";
  upBtn.title = "向上滚动一屏（Alt+↑ / Alt+PgUp / Alt+K）";
  Object.assign(upBtn.style, btnStyle(), { padding: "6px 10px" });
  upBtn.addEventListener("click", () => scrollPanelScreen(-1));

  const downBtn = document.createElement("button");
  downBtn.textContent = "↓";
  downBtn.title = "向下滚动一屏（Alt+↓ / Alt+PgDn / Alt+J）";
  Object.assign(downBtn.style, btnStyle(), { padding: "6px 10px" });
  downBtn.addEventListener("click", () => scrollPanelScreen(1));

  scrollGroup.appendChild(upBtn);
  scrollGroup.appendChild(downBtn);

  const input = document.createElement("textarea");
  input.placeholder = "向 AI 提问（Enter 发送，Shift+Enter 换行）";
  Object.assign(input.style, {
    flex: "1 1 auto",
    minHeight: "36px",
    maxHeight: "120px",
    resize: "vertical",
    padding: "8px 10px",
    fontSize: "12px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    border: "1px solid #333",
    borderRadius: "6px",
    outline: "none",
    background: "#101010",
    color: "#eee",
  });

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "发送";
  Object.assign(sendBtn.style, btnStyle(), {
    padding: "6px 12px",
    fontWeight: "600",
  });

  footer.appendChild(scrollGroup);
  footer.appendChild(input);
  footer.appendChild(sendBtn);

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(footer);
  document.body.appendChild(panel);

  // 拖拽
  makeDraggable(panel, header);

  // 引用挂载
  panel._header = header;
  panel._body = body;
  panel._input = input;
  panel._sendBtn = sendBtn;
  panel._footer = footer;
  panel.dataset.theme = AIH_THEME;

  // 事件
  themeBtn.addEventListener("click", () => {
    const now = panel.dataset.theme === "dark" ? "light" : "dark";
    panel.dataset.theme = now;
    themeBtn.textContent = now === "dark" ? "☀️" : "🌙";
    applyPanelTheme(panel, header, body);
    layoutPanel();               // 主题切换后也重新计算高度（边框/字体可能变）
    updatePanelScrollOverlay();
  });
  copyBtn.addEventListener("click", () => {
    const txt = body.textContent || "";
    navigator.clipboard.writeText(txt).then(
      () => toast("已复制"),
      () => toast("复制失败")
    );
  });
  clearBtn.addEventListener("click", () => {
    body.textContent = "";
    try { chatHistory.length = 0; } catch {}
    layoutPanel();
    updatePanelScrollOverlay();
  });
  closeBtn.addEventListener("click", () => setPanelVisible(false));

  return panel;
}

function btnStyle() {
  return {
    fontSize: "12px",
    padding: "4px 8px",
    border: "1px solid rgba(255,255,255,.15)",
    borderRadius: "6px",
    background: "transparent",
    color: "inherit",
    cursor: "pointer",
  };
}

function applyPanelTheme(panel, header, body) {
  const theme = panel.dataset.theme || "light";
  if (theme === "dark") {
    Object.assign(panel.style, { background: "#141414", color: "#eee", border: "1px solid #333", boxShadow: "0 8px 24px rgba(0,0,0,.35)" });
    Object.assign(header.style, { background: "#1a1a1a", color: "#fff", borderBottom: "1px solid #333" });
    Object.assign(body.style,   { color: "#eee", background: "transparent" });
    Object.assign(panel._footer.style, { background: "#181818", borderTop: "1px solid #333" });
  } else {
    Object.assign(panel.style, { background: "#fff", color: "#111", border: "1px solid #ddd", boxShadow: "0 8px 24px rgba(0,0,0,.15)" });
    Object.assign(header.style, { background: "#f6f7f9", color: "#111", borderBottom: "1px solid #eee" });
    Object.assign(body.style,   { color: "#111", background: "transparent" });
    Object.assign(panel._footer.style, { background: "rgba(0,0,0,0.02)", borderTop: "1px solid #eee" });
  }
  refreshPanelOverlayColors();
}


function layoutPanel() {
  if (!panel || !panel._body) return;
  const headerH = panel._header?.offsetHeight || 0;
  const footerH = panel._footer?.offsetHeight || 0;
  const paddings = 0; // 如有需要可加入 body 的 padding 调整
  const h = Math.max(24, panel.clientHeight - headerH - footerH - paddings);
  panel._body.style.height = h + "px";
}

function setPanelVisible(visible) {
  panel.style.display = visible ? "block" : "none";
  if (visible) {
    layoutPanel();
    updatePanelScrollOverlay();
    panel._input?.focus();
  }
}

function clearPanel() { panel._body.textContent = ""; layoutPanel(); updatePanelScrollOverlay(); }

function logLine(text) {
  const line = document.createElement("div");
  line.textContent = (panel._body.textContent ? "\n" : "") + text;
  panel._body.appendChild(line);
  panel._body.scrollTop = panel._body.scrollHeight + 32;
  layoutPanel();
  updatePanelScrollOverlay();
}
function appendBlock(text) {
  const pre = document.createElement("pre");
  pre.textContent = text;
  pre.style.margin = "8px 0";
  pre.style.whiteSpace = "pre-wrap";
  panel._body.appendChild(pre);
  panel._body.scrollTop = panel._body.scrollHeight + 32;
  pre.textContent = text + "\n\n\n\n\n";
  pre.style.margin = "8px 0";
  pre.style.whiteSpace = "pre-wrap";
  panel._body.appendChild(pre);
  panel._body.scrollTop = panel._body.scrollHeight + 32;
  layoutPanel();
  updatePanelScrollOverlay();
}

// 聊天气泡
function appendChatBubble(role, text) {
  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.margin = "6px 0";

  const bubble = document.createElement("div");
  const finalText = role === "model" ? (text + "\n\n\n") : text;
  bubble.textContent = finalText;
  Object.assign(bubble.style, {
    maxWidth: "85%",
    whiteSpace: "pre-wrap",
    padding: "6px 8px",
    borderRadius: "8px",
    lineHeight: "1.5",
    border: "1px solid rgba(255,255,255,.15)",
  });

  if ((panel.dataset.theme || AIH_THEME) === "dark") {
    bubble.style.background = "rgba(255,255,255,0.08)";
  } else {
    bubble.style.border = "1px solid rgba(0,0,0,.12)";
    bubble.style.background = "rgba(0,0,0,0.05)";
  }

  if (role === "user") {
    wrap.style.justifyContent = "flex-end";
    bubble.style.background = "rgba(99,153,255,0.12)";
  } else {
    wrap.style.justifyContent = "flex-start";
  }

  panel._body.appendChild(wrap);
  wrap.appendChild(bubble);
  panel._body.scrollTop = panel._body.scrollHeight + 32;
  layoutPanel();
  updatePanelScrollOverlay();
}

function toast(msg) {
  const tip = document.createElement("div");
  tip.textContent = msg;
  Object.assign(tip.style, {
    position: "fixed",
    right: "20px",
    bottom: "90px",
    padding: "8px 12px",
    background: "rgba(0,0,0,.8)",
    color: "#fff",
    borderRadius: "6px",
    fontSize: "12px",
    zIndex: 100000,
  });
  document.body.appendChild(tip);
  setTimeout(() => tip.remove(), 1200);
}

function makeDraggable(panel, handle) {
  let isDown = false;
  let startX, startY, startRight, startBottom;
  handle.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.clientX; startY = e.clientY;
    startRight = parseInt(panel.style.right, 10);
    startBottom = parseInt(panel.style.bottom, 10);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
  function onMove(e) {
    if (!isDown) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    panel.style.right = Math.max(0, startRight - dx) + "px";
    panel.style.bottom = Math.max(0, startBottom + dy) + "px";
  }
  function onUp() {
    isDown = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  }
}

/* ===================== 仅滚动面板：按钮/快捷键/面板内悬浮滚动条 ===================== */
function getPanelScroller() {
  return panel?._body || document.getElementById("aiHelperOutput");
}
function scrollPanelBy(delta) {
  const sc = getPanelScroller();
  if (!sc) return;
  try {
    sc.scrollBy({ top: delta, left: 0, behavior: PANEL_SCROLL_SMOOTH ? "smooth" : "auto" });
  } catch {
    sc.scrollTop = Math.max(0, Math.min(sc.scrollHeight - sc.clientHeight, sc.scrollTop + delta));
  }
}
function scrollPanelScreen(dir) {
  const sc = getPanelScroller();
  if (!sc) return;
  const screen = sc.clientHeight * PANEL_SCROLL_SCREEN_RATIO;
  scrollPanelBy(dir * screen);
}
function scrollPanelToTop() {
  const sc = getPanelScroller();
  if (!sc) return;
  sc.scrollTo ? sc.scrollTo({ top: 0, behavior: PANEL_SCROLL_SMOOTH ? "smooth" : "auto" }) : (sc.scrollTop = 0);
}
function scrollPanelToBottom() {
  const sc = getPanelScroller();
  if (!sc) return;
  const max = sc.scrollHeight - sc.clientHeight;
  sc.scrollTo ? sc.scrollTo({ top: max, behavior: PANEL_SCROLL_SMOOTH ? "smooth" : "auto" }) : (sc.scrollTop = max);
}

// 面板内悬浮滚动条
function ensurePanelScrollOverlay() {
  if (document.getElementById("aihPanelScroll")) return;

  const track = document.createElement("div");
  track.id = "aihPanelScroll";
  Object.assign(track.style, {
    position: "absolute",
    right: "6px",
    width: "6px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    zIndex: 3, // 高于 body 内容，低于 header/footer
    cursor: "pointer",
  });

  const thumb = document.createElement("div");
  thumb.id = "aihPanelThumb";
  Object.assign(thumb.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: "100%",
    height: "32px",
    borderRadius: "999px",
    background: "rgba(140,180,255,0.8)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    cursor: "grab",
  });

  track.appendChild(thumb);
  panel.appendChild(track);

  // 拖拽
  let dragging = false, startY = 0, startTop = 0;
  thumb.addEventListener("mousedown", (e) => {
    dragging = true;
    startY = e.clientY;
    startTop = parseInt(thumb.style.top || "0", 10);
    thumb.style.cursor = "grabbing";
    document.addEventListener("mousemove", onDragMove);
    document.addEventListener("mouseup", onDragUp);
    e.preventDefault();
  });
  function onDragMove(e) {
    if (!dragging) return;
    const trackRect = track.getBoundingClientRect();
    const thumbH = thumb.offsetHeight;
    const maxTop = trackRect.height - thumbH;
    let newTop = startTop + (e.clientY - startY);
    newTop = Math.max(0, Math.min(maxTop, newTop));
    thumb.style.top = newTop + "px";

    const sc = getPanelScroller();
    if (!sc) return;
    const ratio = newTop / (maxTop || 1);
    const maxScroll = sc.scrollHeight - sc.clientHeight;
    sc.scrollTop = ratio * maxScroll;
  }
  function onDragUp() {
    dragging = false;
    thumb.style.cursor = "grab";
    document.removeEventListener("mousemove", onDragMove);
    document.removeEventListener("mouseup", onDragUp);
  }

  // 点击轨道
  track.addEventListener("mousedown", (e) => {
    if (e.target === thumb) return;
    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const thumbH = thumb.offsetHeight;
    const maxTop = rect.height - thumbH;
    const newTop = Math.max(0, Math.min(maxTop, clickY - thumbH / 2));
    thumb.style.top = newTop + "px";

    const sc = getPanelScroller();
    if (!sc) return;
    const ratio = newTop / (maxTop || 1);
    const maxScroll = sc.scrollHeight - sc.clientHeight;
    sc.scrollTop = ratio * maxScroll;
  });

  // 同步更新
  getPanelScroller()?.addEventListener("scroll", updatePanelScrollOverlay, { passive: true });
  window.addEventListener("resize", updatePanelScrollOverlay);

  refreshPanelOverlayColors();
}

function updatePanelScrollOverlay() {
  const track = document.getElementById("aihPanelScroll");
  const thumb = document.getElementById("aihPanelThumb");
  if (!track || !thumb || !panel) return;

  const headerH = panel._header?.offsetHeight || 0;
  const footerH = panel._footer?.offsetHeight || 0;
  const panelH  = panel.clientHeight;
  const top = headerH + 6;
  const height = Math.max(24, panelH - headerH - footerH - 12);

  track.style.top = top + "px";
  track.style.height = height + "px";

  const sc = getPanelScroller();
  if (!sc) return;

  const trackH = height;
  const ratio = sc.clientHeight / Math.max(sc.scrollHeight, 1);
  const thumbH = Math.max(24, Math.floor(trackH * ratio));
  const maxTop = trackH - thumbH;

  const posRatio = sc.scrollTop / Math.max(sc.scrollHeight - sc.clientHeight, 1);
  const t = Math.max(0, Math.min(maxTop, Math.floor(posRatio * maxTop)));

  thumb.style.height = thumbH + "px";
  thumb.style.top = t + "px";

  track.style.display = (sc.scrollHeight <= sc.clientHeight + 2) ? "none" : "block";
}

function refreshPanelOverlayColors() {
  const track = document.getElementById("aihPanelScroll");
  const thumb = document.getElementById("aihPanelThumb");
  if (!track || !thumb) return;

  const isDark = (panel?.dataset.theme || AIH_THEME) === "dark";
  track.style.background = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  thumb.style.background = isDark ? "rgba(140,180,255,0.8)" : "rgba(99,153,255,0.7)";
}

// 快捷键：只滚动面板
function addGlobalScrollHotkeys(panel) {
  document.addEventListener("keydown", (e) => {
    if (panel.style.display !== "block") return;
    const altOnly = e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey;
    if (!altOnly) return;

    if (["ArrowDown", "PageDown", "j", "J"].includes(e.key)) { e.preventDefault(); scrollPanelScreen(1); return; }
    if (["ArrowUp", "PageUp", "k", "K"].includes(e.key))   { e.preventDefault(); scrollPanelScreen(-1); return; }
    if (e.key === "Home") { e.preventDefault(); scrollPanelToTop(); return; }
    if (e.key === "End")  { e.preventDefault(); scrollPanelToBottom(); return; }
  });
}

/* ===================== PDF.js 抽取 ===================== */
function waitForPDFApp() {
  return new Promise((resolve) => {
    const tick = () => (window.PDFViewerApplication ? resolve() : setTimeout(tick, 100));
    tick();
  });
}
async function prefetchWhenReady() {
  const app = window.PDFViewerApplication;
  while (!app.pdfDocument) await sleep(200);
  cachedText = await extractFullPdfText();
}
async function extractFullPdfText() {
  const app = window.PDFViewerApplication;
  while (!app.pdfDocument) await sleep(200);
  const pdf = app.pdfDocument;
  const num = pdf.numPages;

  const parts = [];
  for (let i = 1; i <= num; i++) {
    logLine(`⏳ 正在抽取第 ${i}/${num} 页文本…`);
    try {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent({ normalizeWhitespace: true });
      const text = tc.items.map((it) => it.str).join(" ");
      parts.push(`\n\n===== Page ${i}/${num} =====\n${text}`);
    } catch (e) {
      parts.push(`\n\n===== Page ${i}/${num} =====\n[读取失败：${e?.message || e}]`);
      logLine(`❌ 第 ${i} 页读取失败`);
    }
    await sleep(0);
  }
  return parts.join("\n");
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

/* ===================== 对话摘要（上下文） ===================== */
async function ensureDocSummary(apiKey) {
  if (docSummary) return docSummary;
  if (!cachedText) return null;
  const shortText = cachedText.slice(0, DOC_SUMMARY_MAX_CHARS);
  const sys =
    "请将给定文本总结为一段 300~600 字的中文摘要，突出主题、关键术语、方法与结论，便于后续问答引用。尽量去除公式/乱码。";
  const summary = await geminiGenerateWithFallback({
    systemPrompt: sys,
    userText: shortText,
    apiKey,
  });
  docSummary = summary;
  return docSummary;
}

/* ===================== Gemini 调用 ===================== */
async function ensureGeminiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["gemini_api_key"], (res) => {
      let key = res.gemini_api_key;
      if (key) return resolve(key);
      key = prompt("请输入 Google Gemini API Key（仅首次，保存在 chrome.storage.sync）");
      if (key) chrome.storage.sync.set({ gemini_api_key: key }, () => resolve(key));
      else resolve(null);
    });
  });
}

// 单次 generateContent（兼容两种：字符串 或 contents 多轮）
async function geminiGenerate({ systemPrompt, userText, contents, apiKey, model }) {
  const url = `${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let body;
  if (Array.isArray(contents) && contents.length) {
    body = { contents, generationConfig: { temperature: TEMPERATURE } };
    if (systemPrompt && body.contents[0]?.role === "user") {
      const t = body.contents[0].parts?.[0]?.text || "";
      body.contents[0].parts[0].text = `${systemPrompt}\n\n${t}`;
    }
  } else {
    body = {
      contents: [{ role: "user", parts: [{ text: `${systemPrompt ? systemPrompt + "\n\n" : ""}${userText || ""}` }] }],
      generationConfig: { temperature: TEMPERATURE },
    };
  }

  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const errText = await res.text();
  if (!res.ok) throw new Error(`Gemini API 错误：${res.status} ${errText}`);

  let data; try { data = JSON.parse(errText); } catch { data = {}; }
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map(p => p.text || "").join("").trim();
  return { text, modelUsed: model };
}

async function geminiGenerateWithFallback({ systemPrompt, userText, apiKey }) {
  let lastErr;
  for (const model of GEMINI_MODEL_CHAIN) {
    try {
      logLine(`🔎 尝试模型：${model} …`);
      const { text, modelUsed } = await geminiGenerate({ systemPrompt, userText, apiKey, model });
      if (modelUsed !== GEMINI_MODEL_CHAIN[0]) logLine(`ℹ️ 已自动降级到可用模型：${modelUsed}`);
      return text;
    } catch (e) { lastErr = e; logLine(`⚠️ 模型不可用：${e.message.split("\n")[0]}`); }
  }
  throw lastErr || new Error("所有候选模型均不可用。");
}

async function geminiChatWithFallback({ contents, apiKey, systemPrompt = "" }) {
  let lastErr;
  for (const model of GEMINI_MODEL_CHAIN) {
    try {
      logLine(`🔎 尝试模型：${model} …`);
      const { text, modelUsed } = await geminiGenerate({ contents, apiKey, model, systemPrompt });
      if (modelUsed !== GEMINI_MODEL_CHAIN[0]) logLine(`ℹ️ 已自动降级到可用模型：${modelUsed}`);
      return text;
    } catch (e) { lastErr = e; logLine(`⚠️ 模型不可用：${e.message.split("\n")[0]}`); }
  }
  throw lastErr || new Error("所有候选模型均不可用。");
}

/* ===================== 整文/分块分析 ===================== */
function splitByLength(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLen) chunks.push(text.slice(i, i + maxLen));
  return chunks;
}

async function analyzeWholeDocWithGemini(fullText, apiKey) {
  const system_single =
    "你是学术 PDF 助手。请：1) 提取/猜测标题；2) 推断研究领域；3) 总结核心问题、方法、结论；4) 识别参考文献区段（若有）；5) 输出适合写在高亮旁的简短注释建议（子弹点）。用中文，结构清晰。";

  const chunks = splitByLength(fullText, MAX_CHARS_PER_MESSAGE);

  if (chunks.length === 1) {
    return await geminiGenerateWithFallback({
      systemPrompt: system_single,
      userText: `以下是整篇 PDF 的文本，请通读：\n${fullText}`,
      apiKey,
    });
  }

  logLine(`📦 文档较大，分为 ${chunks.length} 块进行处理…`);

  const chunkSummaries = [];
  for (let i = 0; i < chunks.length; i++) {
    logLine(`⏳ 分块 ${i + 1}/${chunks.length} 分析中…`);
    const text = await geminiGenerateWithFallback({
      systemPrompt:
        "你是学术 PDF 助手。请对收到的这一分块写要点摘要，标出关键术语、可能的章节标题，以及若出现“参考文献/References/Bibliography”等线索请记录。",
      userText: `PDF 分块 ${i + 1}/${chunks.length}：\n${chunks[i]}`,
      apiKey,
    });
    chunkSummaries.push(`=== Chunk ${i + 1} Summary ===\n${text}`);
  }

  logLine("🔗 正在汇总所有分块结果…");
  return await geminiGenerateWithFallback({
    systemPrompt:
      "把这些分块摘要合并为完整报告：1) 论文标题（若不确定给候选）；2) 研究领域；3) 主要贡献与结论；4) 方法/实验要点；5) 参考文献区段与条目线索；6) 适合贴在高亮旁的简短注释建议（要点列出）。用中文，结构清晰。",
    userText: chunkSummaries.join("\n\n"),
    apiKey,
  });
}

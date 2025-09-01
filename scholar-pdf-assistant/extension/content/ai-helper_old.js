// // // content/ai-helper.js
// // // chatgpt版本

// // /* ===================== 可配置区域 ===================== */
// // const AIH_THEME = "dark";               // "dark" 或 "light"
// // const OPENAI_API_BASE = "https://api.openai.com/v1/chat/completions";
// // const OPENAI_MODEL = "gpt-5";           // 也可用 "gpt-5-chat-latest"
// // const MAX_CHARS_PER_MESSAGE = 120000;   // 避免消息过长，超出则自动分块
// // const PREFETCH_ON_LOAD = true;          // 页面就绪后预先抽取全文，点击更快
// // /* ===================================================== */

// // await waitForPDFApp();

// // const panel = ensureResultPanel();
// // applyPanelTheme(panel, panel._header, panel._body); // 初始主题
// // const aiBtn = ensureAIButton();
// // let cachedText = null;

// // if (PREFETCH_ON_LOAD) {
// //   prefetchWhenReady().catch(console.warn);
// // }

// // // 绑定点击
// // aiBtn.addEventListener("click", onClickAI);

// // /* ===================== 事件处理 ===================== */

// // async function onClickAI() {
// //   try {
// //     aiBtn.disabled = true;
// //     setPanelVisible(true);
// //     clearPanel();
// //     logLine("⏳ 正在准备调用 AI……");

// //     const apiKey = await ensureApiKey();
// //     if (!apiKey) {
// //       logLine("❌ 未提供 API Key，已取消。");
// //       return;
// //     }

// //     const fullText = cachedText || (await extractFullPdfText());
// //     cachedText = fullText;

// //     logLine(`📄 已获取全文，长度约 ${fullText.length.toLocaleString()} 字符。`);
// //     const analysis = await analyzeWholeDocWithGPT(fullText, apiKey);

// //     logLine("");
// //     logLine("✅ AI 分析完成（可复制）：");
// //     appendBlock(analysis);
// //   } catch (err) {
// //     console.error(err);
// //     logLine(`❌ 出错：${err?.message || String(err)}`);
// //   } finally {
// //     aiBtn.disabled = false;
// //   }
// // }

// // /* ===================== UI：按钮与面板 ===================== */

// // function ensureAIButton() {
// //   const container = document.getElementById("toolbarViewerRight") || document.body;
// //   let btn = document.getElementById("aiHelperButton");
// //   if (btn) return btn;

// //   btn = document.createElement("button");
// //   btn.id = "aiHelperButton";
// //   btn.className = "toolbarButton";
// //   btn.type = "button";
// //   btn.title = "AI Helper";
// //   btn.textContent = "AI Helper";
// //   container.appendChild(btn);
// //   return btn;
// // }

// // function ensureResultPanel() {
// //   let panel = document.getElementById("aiHelperPanel");
// //   if (panel) return panel;

// //   panel = document.createElement("div");
// //   panel.id = "aiHelperPanel";
// //   Object.assign(panel.style, {
// //     position: "fixed",
// //     right: "12px",
// //     bottom: "12px",
// //     width: "520px",
// //     maxHeight: "70vh",
// //     background: "#fff", // 主题会覆盖
// //     color: "#111",
// //     border: "1px solid #ddd",
// //     boxShadow: "0 8px 24px rgba(0,0,0,.15)",
// //     borderRadius: "10px",
// //     display: "none",
// //     zIndex: 99999,
// //     overflow: "hidden",
// //     fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
// //   });

// //   // 头部
// //   const header = document.createElement("div");
// //   Object.assign(header.style, {
// //     padding: "10px 12px",
// //     fontWeight: "700",
// //     borderBottom: "1px solid #eee",
// //     background: "#f6f7f9",
// //     color: "#111",
// //     display: "flex",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     userSelect: "none",
// //     cursor: "move",
// //   });
// //   header.textContent = "AI Helper";

// //   // 头部右侧工具区
// //   const tools = document.createElement("div");
// //   tools.style.display = "flex";
// //   tools.style.gap = "8px";

// //   // 主题切换
// //   const themeBtn = document.createElement("button");
// //   themeBtn.title = "切换主题";
// //   Object.assign(themeBtn.style, btnStyle());
// //   themeBtn.textContent = AIH_THEME === "dark" ? "☀️" : "🌙";
// //   themeBtn.addEventListener("click", () => {
// //     const now = panel.dataset.theme === "dark" ? "light" : "dark";
// //     panel.dataset.theme = now;
// //     themeBtn.textContent = now === "dark" ? "☀️" : "🌙";
// //     applyPanelTheme(panel, header, body);
// //   });

// //   // 复制
// //   const copyBtn = document.createElement("button");
// //   copyBtn.title = "复制内容";
// //   Object.assign(copyBtn.style, btnStyle());
// //   copyBtn.textContent = "复制";
// //   copyBtn.addEventListener("click", () => {
// //     const txt = body.textContent || "";
// //     navigator.clipboard.writeText(txt).then(
// //       () => toast("已复制"),
// //       () => toast("复制失败")
// //     );
// //   });

// //   // 清空
// //   const clearBtn = document.createElement("button");
// //   clearBtn.title = "清空";
// //   Object.assign(clearBtn.style, btnStyle());
// //   clearBtn.textContent = "清空";
// //   clearBtn.addEventListener("click", clearPanel);

// //   // 关闭
// //   const closeBtn = document.createElement("button");
// //   closeBtn.title = "关闭";
// //   Object.assign(closeBtn.style, btnStyle());
// //   closeBtn.textContent = "×";
// //   closeBtn.addEventListener("click", () => setPanelVisible(false));

// //   tools.appendChild(themeBtn);
// //   tools.appendChild(copyBtn);
// //   tools.appendChild(clearBtn);
// //   tools.appendChild(closeBtn);

// //   const headerLeft = document.createElement("div");
// //   headerLeft.textContent = "AI Helper";
// //   headerLeft.style.fontWeight = "700";

// //   header.textContent = "";
// //   header.appendChild(headerLeft);
// //   header.appendChild(tools);

// //   // 正文
// //   const body = document.createElement("pre");
// //   body.id = "aiHelperOutput";
// //   Object.assign(body.style, {
// //     margin: 0,
// //     padding: "12px 14px",
// //     fontSize: "12px",
// //     lineHeight: "1.55",
// //     whiteSpace: "pre-wrap",
// //     overflow: "auto",
// //     maxHeight: "calc(70vh - 48px)",
// //   });

// //   panel.appendChild(header);
// //   panel.appendChild(body);
// //   document.body.appendChild(panel);

// //   // 拖拽
// //   makeDraggable(panel, header);

// //   // 对外保存引用
// //   panel._header = header;
// //   panel._body = body;
// //   panel.dataset.theme = AIH_THEME;

// //   return panel;
// // }

// // function btnStyle() {
// //   return {
// //     fontSize: "12px",
// //     padding: "4px 8px",
// //     border: "1px solid rgba(0,0,0,.1)",
// //     borderRadius: "6px",
// //     background: "transparent",
// //     cursor: "pointer",
// //   };
// // }

// // function applyPanelTheme(panel, header, body) {
// //   const theme = panel.dataset.theme || "light";
// //   if (theme === "dark") {
// //     Object.assign(panel.style, {
// //       background: "#111",
// //       color: "#eee",
// //       border: "1px solid #333",
// //       boxShadow: "0 8px 24px rgba(0,0,0,.35)",
// //     });
// //     Object.assign(header.style, {
// //       background: "#1a1a1a",
// //       color: "#fff",
// //       borderBottom: "1px solid #333",
// //     });
// //     Object.assign(body.style, { color: "#eee" });
// //   } else {
// //     Object.assign(panel.style, {
// //       background: "#fff",
// //       color: "#111",
// //       border: "1px solid #ddd",
// //       boxShadow: "0 8px 24px rgba(0,0,0,.15)",
// //     });
// //     Object.assign(header.style, {
// //       background: "#f6f7f9",
// //       color: "#111",
// //       borderBottom: "1px solid #eee",
// //     });
// //     Object.assign(body.style, { color: "#111" });
// //   }
// // }

// // function setPanelVisible(visible) {
// //   panel.style.display = visible ? "block" : "none";
// // }

// // function clearPanel() {
// //   panel._body.textContent = "";
// // }

// // function logLine(text) {
// //   panel._body.textContent += (panel._body.textContent ? "\n" : "") + text;
// //   panel._body.scrollTop = panel._body.scrollHeight;
// // }

// // function appendBlock(text) {
// //   panel._body.textContent += (panel._body.textContent ? "\n" : "") + text;
// //   panel._body.scrollTop = panel._body.scrollHeight;
// // }

// // function toast(msg) {
// //   const tip = document.createElement("div");
// //   tip.textContent = msg;
// //   Object.assign(tip.style, {
// //     position: "fixed",
// //     right: "20px",
// //     bottom: "90px",
// //     padding: "8px 12px",
// //     background: "rgba(0,0,0,.8)",
// //     color: "#fff",
// //     borderRadius: "6px",
// //     fontSize: "12px",
// //     zIndex: 100000,
// //   });
// //   document.body.appendChild(tip);
// //   setTimeout(() => tip.remove(), 1200);
// // }

// // function makeDraggable(panel, handle) {
// //   let isDown = false;
// //   let startX, startY, startRight, startBottom;
// //   handle.addEventListener("mousedown", (e) => {
// //     isDown = true;
// //     startX = e.clientX;
// //     startY = e.clientY;
// //     startRight = parseInt(panel.style.right, 10);
// //     startBottom = parseInt(panel.style.bottom, 10);
// //     document.addEventListener("mousemove", onMove);
// //     document.addEventListener("mouseup", onUp);
// //   });
// //   function onMove(e) {
// //     if (!isDown) return;
// //     const dx = e.clientX - startX;
// //     const dy = e.clientY - startY;
// //     panel.style.right = Math.max(0, startRight - dx) + "px";
// //     panel.style.bottom = Math.max(0, startBottom + dy) + "px";
// //   }
// //   function onUp() {
// //     isDown = false;
// //     document.removeEventListener("mousemove", onMove);
// //     document.removeEventListener("mouseup", onUp);
// //   }
// // }

// // /* ===================== PDF.js 抽取 ===================== */

// // function waitForPDFApp() {
// //   return new Promise((resolve) => {
// //     const tick = () => {
// //       if (window.PDFViewerApplication) resolve();
// //       else setTimeout(tick, 100);
// //     };
// //     tick();
// //   });
// // }

// // async function prefetchWhenReady() {
// //   const app = window.PDFViewerApplication;
// //   while (!app.pdfDocument) await sleep(200);
// //   cachedText = await extractFullPdfText();
// // }

// // async function extractFullPdfText() {
// //   const app = window.PDFViewerApplication;
// //   while (!app.pdfDocument) await sleep(200);

// //   const pdf = app.pdfDocument;
// //   const num = pdf.numPages;

// //   let parts = [];
// //   for (let i = 1; i <= num; i++) {
// //     logLine(`⏳ 正在抽取第 ${i}/${num} 页文本…`);
// //     try {
// //       const page = await pdf.getPage(i);
// //       const tc = await page.getTextContent({ normalizeWhitespace: true });
// //       const text = tc.items.map((it) => it.str).join(" ");
// //       parts.push(`\n\n===== Page ${i}/${num} =====\n${text}`);
// //     } catch (e) {
// //       parts.push(`\n\n===== Page ${i}/${num} =====\n[读取失败：${e?.message || e}]`);
// //       logLine(`❌ 第 ${i} 页读取失败`);
// //     }
// //     await sleep(0); // 让出主线程
// //   }
// //   return parts.join("\n");
// // }

// // function sleep(ms) {
// //   return new Promise((r) => setTimeout(r, ms));
// // }

// // /* ===================== OpenAI 调用 ===================== */

// // async function ensureApiKey() {
// //   return new Promise((resolve) => {
// //     chrome.storage.sync.get(["openai_api_key"], (res) => {
// //       let key = res.openai_api_key;
// //       if (key) return resolve(key);

// //       // 简易输入框（你也可以做成自定义弹窗）
// //       key = prompt("扩展程序 Scholar PDF Assistant 提示：\n请输入 OpenAI API Key（仅首次，保存在 chrome.storage.sync ）");
// //       if (key) {
// //         chrome.storage.sync.set({ openai_api_key: key }, () => resolve(key));
// //       } else {
// //         resolve(null);
// //       }
// //     });
// //   });
// // }

// // function splitByLength(text, maxLen) {
// //   if (text.length <= maxLen) return [text];
// //   const chunks = [];
// //   for (let i = 0; i < text.length; i += maxLen) {
// //     chunks.push(text.slice(i, i + maxLen));
// //   }
// //   return chunks;
// // }

// // async function chatComplete(messages, apiKey) {
// //   const res = await fetch(OPENAI_API_BASE, {
// //     method: "POST",
// //     headers: {
// //       "Content-Type": "application/json",
// //       Authorization: `Bearer ${apiKey}`,
// //     },
// //     body: JSON.stringify({
// //       model: OPENAI_MODEL,
// //       temperature: 0.2,
// //       messages,
// //     }),
// //   });
// //   if (!res.ok) {
// //     const err = await res.text().catch(() => "");
// //     throw new Error(`OpenAI API 错误：${res.status} ${err}`);
// //   }
// //   const data = await res.json();
// //   return data?.choices?.[0]?.message?.content?.trim() || "";
// // }

// // async function analyzeWholeDocWithGPT(fullText, apiKey) {
// //   const chunks = splitByLength(fullText, MAX_CHARS_PER_MESSAGE);

// //   // 单块：直接整文分析
// //   if (chunks.length === 1) {
// //     const messages = [
// //       {
// //         role: "system",
// //         content:
// //           "你是学术 PDF 助手。请：1) 提取/猜测标题；2) 推断研究领域；3) 总结核心问题、方法、结论；4) 识别参考文献区段（若有）；5) 输出适合写在高亮旁的简短注释建议（子弹点）。用中文，结构清晰。",
// //       },
// //       {
// //         role: "user",
// //         content: `以下是整篇 PDF 的文本，请通读：\n${fullText}`,
// //       },
// //     ];
// //     return await chatComplete(messages, apiKey);
// //   }

// //   // 多块：分块摘要 → 汇总
// //   logLine(`📦 文档较大，分为 ${chunks.length} 块进行处理…`);
// //   const summaries = [];
// //   for (let i = 0; i < chunks.length; i++) {
// //     logLine(`⏳ 分块 ${i + 1}/${chunks.length} 分析中…`);
// //     const messages = [
// //       {
// //         role: "system",
// //         content:
// //           "你是学术 PDF 助手。请对收到的这一分块写要点摘要，标出关键术语、可能的章节标题，以及若出现“参考文献/References/Bibliography”等线索请记录。",
// //       },
// //       { role: "user", content: `PDF 分块 ${i + 1}/${chunks.length}：\n${chunks[i]}` },
// //     ];
// //     const s = await chatComplete(messages, apiKey);
// //     summaries.push(`=== Chunk ${i + 1} Summary ===\n${s}`);
// //   }

// //   logLine("🔗 正在汇总所有分块结果…");
// //   const mergeMessages = [
// //     {
// //       role: "system",
// //       content:
// //         "把这些分块摘要合并为完整报告：1) 论文标题（若不确定给候选）；2) 研究领域；3) 主要贡献与结论；4) 方法/实验要点；5) 参考文献区段与条目线索；6) 适合贴在高亮旁的简短注释建议（要点列出）。用中文，结构清晰。",
// //     },
// //     { role: "user", content: summaries.join("\n\n") },
// //   ];
// //   return await chatComplete(mergeMessages, apiKey);
// // }



// // content/ai-helper.js  —— Gemini 版
// // 在 PDF.js viewer 中插入 “AI Helper” 按钮；抽取全文并发送到 Google Gemini Free Tier 做整文分析；
// // 自带浅/深色主题与主题切换；首次点击会提示填写 API Key（保存在 chrome.storage.sync）。

// /* ===================== 可配置区域 ===================== */
// const AIH_THEME = "dark"; // "dark" 或 "light"

// // Gemini REST API（Generative Language API v1beta）
// const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
// // 模型候选（按顺序尝试，哪个可用就用哪个；Free Tier 通常可用 1.5-flash）
// const GEMINI_MODEL_CHAIN = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro-latest"];

// // 发送给模型的配置
// const TEMPERATURE = 0.2;
// const MAX_CHARS_PER_MESSAGE = 120000; // 超出即分块
// const PREFETCH_ON_LOAD = true;        // 页面就绪后预抽全文，点击更快
// /* ===================================================== */

// await waitForPDFApp();

// const panel = ensureResultPanel();
// applyPanelTheme(panel, panel._header, panel._body);
// const aiBtn = ensureAIButton();
// let cachedText = null;

// if (PREFETCH_ON_LOAD) prefetchWhenReady().catch(console.warn);

// aiBtn.addEventListener("click", onClickAI);

// /* ===================== 主流程 ===================== */
// async function onClickAI() {
//   try {
//     aiBtn.disabled = true;
//     setPanelVisible(true);
//     clearPanel();
//     logLine("⏳ 正在准备调用 AI……");

//     const apiKey = await ensureGeminiKey();
//     if (!apiKey) {
//       logLine("❌ 未提供 Gemini API Key，已取消。");
//       return;
//     }

//     const fullText = cachedText || (await extractFullPdfText());
//     cachedText = fullText;
//     logLine(`📄 已获取全文，长度约 ${fullText.length.toLocaleString()} 字符。`);

//     const output = await analyzeWholeDocWithGemini(fullText, apiKey);
//     logLine("");
//     logLine("✅ AI 分析完成（可复制）：");
//     appendBlock(output);
//   } catch (err) {
//     console.error(err);
//     logLine(`❌ 出错：${err?.message || String(err)}`);
//   } finally {
//     aiBtn.disabled = false;
//   }
// }

// /* ===================== UI：按钮与面板 ===================== */
// function ensureAIButton() {
//   const container = document.getElementById("toolbarViewerRight") || document.body;
//   let btn = document.getElementById("aiHelperButton");
//   if (btn) return btn;

//   btn = document.createElement("button");
//   btn.id = "aiHelperButton";
//   btn.className = "toolbarButton";
//   btn.type = "button";
//   btn.title = "AI Helper";
//   btn.textContent = "AI Helper";
//   container.appendChild(btn);
//   return btn;
// }

// function ensureResultPanel() {
//   let panel = document.getElementById("aiHelperPanel");
//   if (panel) return panel;

//   panel = document.createElement("div");
//   panel.id = "aiHelperPanel";
//   Object.assign(panel.style, {
//     position: "fixed",
//     right: "12px",
//     bottom: "12px",
//     width: "520px",
//     maxHeight: "70vh",
//     background: "#fff",
//     color: "#111",
//     border: "1px solid #ddd",
//     boxShadow: "0 8px 24px rgba(0,0,0,.15)",
//     borderRadius: "10px",
//     display: "none",
//     zIndex: 99999,
//     overflow: "hidden",
//     fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
//   });

//   const header = document.createElement("div");
//   Object.assign(header.style, {
//     padding: "10px 12px",
//     fontWeight: "700",
//     borderBottom: "1px solid #eee",
//     background: "#f6f7f9",
//     color: "#111",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     userSelect: "none",
//     cursor: "move",
//   });

//   const headerLeft = document.createElement("div");
//   headerLeft.textContent = "AI Helper";
//   headerLeft.style.fontWeight = "700";

//   const tools = document.createElement("div");
//   tools.style.display = "flex";
//   tools.style.gap = "8px";

//   const themeBtn = document.createElement("button");
//   Object.assign(themeBtn.style, btnStyle());
//   themeBtn.title = "切换主题";
//   themeBtn.textContent = AIH_THEME === "dark" ? "☀️" : "🌙";
//   themeBtn.addEventListener("click", () => {
//     const now = panel.dataset.theme === "dark" ? "light" : "dark";
//     panel.dataset.theme = now;
//     themeBtn.textContent = now === "dark" ? "☀️" : "🌙";
//     applyPanelTheme(panel, header, body);
//   });

//   const copyBtn = document.createElement("button");
//   Object.assign(copyBtn.style, btnStyle());
//   copyBtn.title = "复制内容";
//   copyBtn.textContent = "复制";
//   copyBtn.addEventListener("click", () => {
//     const txt = body.textContent || "";
//     navigator.clipboard.writeText(txt).then(
//       () => toast("已复制"),
//       () => toast("复制失败")
//     );
//   });

//   const clearBtn = document.createElement("button");
//   Object.assign(clearBtn.style, btnStyle());
//   clearBtn.title = "清空";
//   clearBtn.textContent = "清空";
//   clearBtn.addEventListener("click", clearPanel);

//   const closeBtn = document.createElement("button");
//   Object.assign(closeBtn.style, btnStyle());
//   closeBtn.title = "关闭";
//   closeBtn.textContent = "×";
//   closeBtn.addEventListener("click", () => setPanelVisible(false));

//   tools.appendChild(themeBtn);
//   tools.appendChild(copyBtn);
//   tools.appendChild(clearBtn);
//   tools.appendChild(closeBtn);

//   header.appendChild(headerLeft);
//   header.appendChild(tools);

//   const body = document.createElement("pre");
//   body.id = "aiHelperOutput";
//   Object.assign(body.style, {
//     margin: 0,
//     padding: "12px 14px",
//     fontSize: "12px",
//     lineHeight: "1.55",
//     whiteSpace: "pre-wrap",
//     overflow: "auto",
//     maxHeight: "calc(70vh - 48px)",
//   });

//   panel.appendChild(header);
//   panel.appendChild(body);
//   document.body.appendChild(panel);

//   makeDraggable(panel, header);

//   panel._header = header;
//   panel._body = body;
//   panel.dataset.theme = AIH_THEME;
//   return panel;
// }

// function btnStyle() {
//   return {
//     fontSize: "12px",
//     padding: "4px 8px",
//     border: "1px solid rgba(0,0,0,.1)",
//     borderRadius: "6px",
//     background: "transparent",
//     cursor: "pointer",
//   };
// }

// function applyPanelTheme(panel, header, body) {
//   const theme = panel.dataset.theme || "light";
//   if (theme === "dark") {
//     Object.assign(panel.style, {
//       background: "#111",
//       color: "#eee",
//       border: "1px solid #333",
//       boxShadow: "0 8px 24px rgba(0,0,0,.35)",
//     });
//     Object.assign(header.style, {
//       background: "#1a1a1a",
//       color: "#fff",
//       borderBottom: "1px solid #333",
//     });
//     Object.assign(body.style, { color: "#eee" });
//   } else {
//     Object.assign(panel.style, {
//       background: "#fff",
//       color: "#111",
//       border: "1px solid #ddd",
//       boxShadow: "0 8px 24px rgba(0,0,0,.15)",
//     });
//     Object.assign(header.style, {
//       background: "#f6f7f9",
//       color: "#111",
//       borderBottom: "1px solid #eee",
//     });
//     Object.assign(body.style, { color: "#111" });
//   }
// }

// function setPanelVisible(visible) {
//   panel.style.display = visible ? "block" : "none";
// }
// function clearPanel() { panel._body.textContent = ""; }
// function logLine(text) {
//   panel._body.textContent += (panel._body.textContent ? "\n" : "") + text;
//   panel._body.scrollTop = panel._body.scrollHeight;
// }
// function appendBlock(text) { logLine(text); }

// function toast(msg) {
//   const tip = document.createElement("div");
//   tip.textContent = msg;
//   Object.assign(tip.style, {
//     position: "fixed",
//     right: "20px",
//     bottom: "90px",
//     padding: "8px 12px",
//     background: "rgba(0,0,0,.8)",
//     color: "#fff",
//     borderRadius: "6px",
//     fontSize: "12px",
//     zIndex: 100000,
//   });
//   document.body.appendChild(tip);
//   setTimeout(() => tip.remove(), 1200);
// }

// function makeDraggable(panel, handle) {
//   let isDown = false;
//   let startX, startY, startRight, startBottom;
//   handle.addEventListener("mousedown", (e) => {
//     isDown = true;
//     startX = e.clientX; startY = e.clientY;
//     startRight = parseInt(panel.style.right, 10);
//     startBottom = parseInt(panel.style.bottom, 10);
//     document.addEventListener("mousemove", onMove);
//     document.addEventListener("mouseup", onUp);
//   });
//   function onMove(e) {
//     if (!isDown) return;
//     const dx = e.clientX - startX;
//     const dy = e.clientY - startY;
//     panel.style.right = Math.max(0, startRight - dx) + "px";
//     panel.style.bottom = Math.max(0, startBottom + dy) + "px";
//   }
//   function onUp() {
//     isDown = false;
//     document.removeEventListener("mousemove", onMove);
//     document.removeEventListener("mouseup", onUp);
//   }
// }

// /* ===================== PDF.js 抽取 ===================== */
// function waitForPDFApp() {
//   return new Promise((resolve) => {
//     const tick = () => (window.PDFViewerApplication ? resolve() : setTimeout(tick, 100));
//     tick();
//   });
// }
// async function prefetchWhenReady() {
//   const app = window.PDFViewerApplication;
//   while (!app.pdfDocument) await sleep(200);
//   cachedText = await extractFullPdfText();
// }
// async function extractFullPdfText() {
//   const app = window.PDFViewerApplication;
//   while (!app.pdfDocument) await sleep(200);
//   const pdf = app.pdfDocument;
//   const num = pdf.numPages;

//   const parts = [];
//   for (let i = 1; i <= num; i++) {
//     logLine(`⏳ 正在抽取第 ${i}/${num} 页文本…`);
//     try {
//       const page = await pdf.getPage(i);
//       const tc = await page.getTextContent({ normalizeWhitespace: true });
//       const text = tc.items.map((it) => it.str).join(" ");
//       parts.push(`\n\n===== Page ${i}/${num} =====\n${text}`);
//     } catch (e) {
//       parts.push(`\n\n===== Page ${i}/${num} =====\n[读取失败：${e?.message || e}]`);
//       logLine(`❌ 第 ${i} 页读取失败`);
//     }
//     await sleep(0);
//   }
//   return parts.join("\n");
// }
// function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// /* ===================== Gemini 调用 ===================== */
// // 从 storage 取/存 Gemini Key
// async function ensureGeminiKey() {
//   return new Promise((resolve) => {
//     chrome.storage.sync.get(["gemini_api_key"], (res) => {
//       let key = res.gemini_api_key;
//       if (key) return resolve(key);
//       key = prompt("请输入 Google Gemini API Key（仅首次，保存在 chrome.storage.sync）");
//       if (key) chrome.storage.sync.set({ gemini_api_key: key }, () => resolve(key));
//       else resolve(null);
//     });
//   });
// }

// // 单次 generateContent 调用
// async function geminiGenerate({ systemPrompt, userText, apiKey, model }) {
//   const url = `${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
//   const body = {
//     // system prompt：用 new property（如果不支持则并入 user 文本）
//     // 兼容做法：把 systemPrompt 拼到 user 文本前面
//     contents: [
//       {
//         role: "user",
//         parts: [{ text: `${systemPrompt ? systemPrompt + "\n\n" : ""}${userText}` }],
//       },
//     ],
//     generationConfig: { temperature: TEMPERATURE },
//   };

//   const res = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body),
//   });

//   const errText = await res.text();
//   if (!res.ok) {
//     // 常见：403（未开模型/Key 权限）、429（速率/配额）、400（超限）
//     throw new Error(`Gemini API 错误：${res.status} ${errText}`);
//   }

//   let data;
//   try { data = JSON.parse(errText); } catch { data = {}; }

//   const parts = data?.candidates?.[0]?.content?.parts || [];
//   const text = parts.map(p => p.text || "").join("").trim();
//   return { text, modelUsed: model };
// }

// // 带候选模型的降级包装
// async function geminiGenerateWithFallback({ systemPrompt, userText, apiKey }) {
//   let lastErr;
//   for (const model of GEMINI_MODEL_CHAIN) {
//     try {
//       logLine(`🔎 尝试模型：${model} …`);
//       const { text, modelUsed } = await geminiGenerate({ systemPrompt, userText, apiKey, model });
//       if (modelUsed !== GEMINI_MODEL_CHAIN[0]) logLine(`ℹ️ 已自动降级到可用模型：${modelUsed}`);
//       return text;
//     } catch (e) {
//       lastErr = e;
//       logLine(`⚠️ 模型不可用：${e.message.split("\n")[0]}`);
//       continue;
//     }
//   }
//   throw lastErr || new Error("所有候选模型均不可用。");
// }

// /* ===================== 任务封装：整文/分块分析 ===================== */
// function splitByLength(text, maxLen) {
//   if (text.length <= maxLen) return [text];
//   const chunks = [];
//   for (let i = 0; i < text.length; i += maxLen) chunks.push(text.slice(i, i + maxLen));
//   return chunks;
// }

// async function analyzeWholeDocWithGemini(fullText, apiKey) {
//   const system_single =
//     "你是学术 PDF 助手。请：1) 提取/猜测标题；2) 推断研究领域；3) 总结核心问题、方法、结论；4) 识别参考文献区段（若有）；5) 输出适合写在高亮旁的简短注释建议（子弹点）。用中文，结构清晰。";

//   const chunks = splitByLength(fullText, MAX_CHARS_PER_MESSAGE);

//   if (chunks.length === 1) {
//     return await geminiGenerateWithFallback({
//       systemPrompt: system_single,
//       userText: `以下是整篇 PDF 的文本，请通读：\n${fullText}`,
//       apiKey,
//     });
//   }

//   // 多块：分块摘要 → 汇总
//   logLine(`📦 文档较大，分为 ${chunks.length} 块进行处理…`);

//   const chunkSummaries = [];
//   for (let i = 0; i < chunks.length; i++) {
//     logLine(`⏳ 分块 ${i + 1}/${chunks.length} 分析中…`);
//     const text = await geminiGenerateWithFallback({
//       systemPrompt:
//         "你是学术 PDF 助手。请对收到的这一分块写要点摘要，标出关键术语、可能的章节标题，以及若出现“参考文献/References/Bibliography”等线索请记录。",
//       userText: `PDF 分块 ${i + 1}/${chunks.length}：\n${chunks[i]}`,
//       apiKey,
//     });
//     chunkSummaries.push(`=== Chunk ${i + 1} Summary ===\n${text}`);
//   }

//   logLine("🔗 正在汇总所有分块结果…");
//   return await geminiGenerateWithFallback({
//     systemPrompt:
//       "把这些分块摘要合并为完整报告：1) 论文标题（若不确定给候选）；2) 研究领域；3) 主要贡献与结论；4) 方法/实验要点；5) 参考文献区段与条目线索；6) 适合贴在高亮旁的简短注释建议（要点列出）。用中文，结构清晰。",
//     userText: chunkSummaries.join("\n\n"),
//     apiKey,
//   });
// }


// content/ai-helper.js  —— Gemini 版 + Chat 交互
// 功能：
// 1) 工具栏“AI Helper”按钮：整文抽取并做一次性分析（保留你原逻辑）
// 2) 面板底部输入框：与 AI 多轮对话（自动携带本 PDF 的摘要作为上下文）
// 3) 主题切换、复制、清空、关闭；修复底部遮挡（抬高 + 弹性布局 + padding）

/* ===================== 可配置区域 ===================== */
const AIH_THEME = "dark"; // "dark" 或 "light"

// Gemini REST API（Generative Language API v1beta）
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
// 模型候选（按顺序尝试，哪个可用就用哪个；Free Tier 通常可用 1.5-flash）
const GEMINI_MODEL_CHAIN = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro-latest"];

const TEMPERATURE = 0.2;
const MAX_CHARS_PER_MESSAGE = 120000; // 超出即分块（整文分析使用）
const PREFETCH_ON_LOAD = true;        // 页面就绪后预抽全文
const DOC_SUMMARY_MAX_CHARS = 40000;  // 用于对话上下文的文档摘要输入上限（节省配额）
/* ===================================================== */

await waitForPDFApp();

const panel = ensureResultPanel();            // 面板（含输入框）
applyPanelTheme(panel, panel._header, panel._body);
const aiBtn = ensureAIButton();               // 工具栏按钮（整文分析）

let cachedText = null;                        // PDF 全文缓存
let docSummary = null;                        // PDF 摘要缓存（供对话上下文用）
const chatHistory = [];                       // 与 AI 的对话历史（[{role:"user"|"model", text:"..."}]）

if (PREFETCH_ON_LOAD) prefetchWhenReady().catch(console.warn);

// 整文分析按钮
aiBtn.addEventListener("click", onClickAI);

// 输入框发送（点击按钮）
panel._sendBtn.addEventListener("click", handleSendFromUI);
// 输入框发送（按键）
panel._input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSendFromUI();
  }
});

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

    // 顺便生成/更新对话所需的摘要（后续聊天更准）
    try {
      await ensureDocSummary(apiKey);
    } catch (e) {
      console.warn("生成对话摘要失败：", e);
    }
  } catch (err) {
    console.error(err);
    logLine(`❌ 出错：${err?.message || String(err)}`);
  } finally {
    aiBtn.disabled = false;
  }
}

/* ===================== Chat 交互 ===================== */
// 从面板底部输入框读取并发送
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

    // 确保有全文（用于生成摘要）
    const fullText = cachedText || (await extractFullPdfText());
    cachedText = fullText;

    // 确保有文档摘要（对话上下文）
    await ensureDocSummary(apiKey);

    // 调用一次对话
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

// 组织对话内容并调用（Gemini 多轮）
async function chatOnceWithGemini(apiKey) {
  // contents：先放入“文档摘要”作为前置上下文，然后按顺序附上历史对话
  const contents = [];

  const summaryPrefix =
    "以下是本 PDF 文档的摘要（对后续问答仅作参考，不等于全文）：\n" +
    (docSummary || "（摘要生成失败）") +
    "\n——请结合以上摘要与对话历史回答用户问题。";

  contents.push({ role: "user", parts: [{ text: summaryPrefix }] });

  chatHistory.forEach((m) => {
    contents.push({ role: m.role, parts: [{ text: m.text }] });
  });

  // 用“(用户)”最后一条作为这次的问题；上面已经包含在 chatHistory 里，这里直接发 contents
  const reply = await geminiChatWithFallback({ contents, apiKey });
  return reply;
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
    height: "min(70vh, 560px)",  // 固定高度更稳
    background: "#fff",
    color: "#111",
    border: "1px solid #ddd",
    boxShadow: "0 8px 24px rgba(0,0,0,.15)",
    borderRadius: "10px",
    display: "none",
    zIndex: 99999,
    overflow: "hidden",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    display: "flex",             // 关键：弹性布局
    flexDirection: "column",
  });

  // 顶部栏
  const header = document.createElement("div");
  Object.assign(header.style, {
    padding: "10px 12px",
    fontWeight: "700",
    borderBottom: "1px solid #eee",
    background: "#f6f7f9",
    color: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    userSelect: "none",
    cursor: "move",
    flex: "0 0 auto",
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
  themeBtn.addEventListener("click", () => {
    const now = panel.dataset.theme === "dark" ? "light" : "dark";
    panel.dataset.theme = now;
    themeBtn.textContent = now === "dark" ? "☀️" : "🌙";
    applyPanelTheme(panel, header, body);
  });

  const copyBtn = document.createElement("button");
  Object.assign(copyBtn.style, btnStyle());
  copyBtn.title = "复制内容";
  copyBtn.textContent = "复制";
  copyBtn.addEventListener("click", () => {
    const txt = body.textContent || "";
    navigator.clipboard.writeText(txt).then(
      () => toast("已复制"),
      () => toast("复制失败")
    );
  });

  const clearBtn = document.createElement("button");
  Object.assign(clearBtn.style, btnStyle());
  clearBtn.title = "清空";
  clearBtn.textContent = "清空";
  clearBtn.addEventListener("click", () => {
    body.textContent = "";
    chatHistory.length = 0; // 清除对话历史
  });

  const closeBtn = document.createElement("button");
  Object.assign(closeBtn.style, btnStyle());
  closeBtn.title = "关闭";
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => setPanelVisible(false));

  tools.appendChild(themeBtn);
  tools.appendChild(copyBtn);
  tools.appendChild(clearBtn);
  tools.appendChild(closeBtn);

  header.appendChild(headerLeft);
  header.appendChild(tools);

  // 内容区（显示日志/AI 输出/聊天气泡）
  const body = document.createElement("div");   // 改成 div 更灵活
  body.id = "aiHelperOutput";
  Object.assign(body.style, {
    margin: 0,
    padding: "12px 14px 12px 14px",
    fontSize: "12px",
    lineHeight: "1.55",
    whiteSpace: "pre-wrap",
    overflow: "auto",
    flex: "1 1 auto",
    scrollbarGutter: "stable",
  });

  // 底部输入区
  const footer = document.createElement("div");
  Object.assign(footer.style, {
    borderTop: "1px solid #eee",
    padding: "8px",
    background: "rgba(0,0,0,0.02)",
    display: "flex",
    gap: "8px",
    alignItems: "flex-end",
    flex: "0 0 auto",
  });

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
    border: "1px solid #ddd",
    borderRadius: "6px",
    outline: "none",
  });

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "发送";
  Object.assign(sendBtn.style, btnStyle(), {
    padding: "6px 12px",
    fontWeight: "600",
  });

  footer.appendChild(input);
  footer.appendChild(sendBtn);

  // 装配
  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(footer);
  document.body.appendChild(panel);

  // 拖拽移动
  makeDraggable(panel, header);

  // 初始化主题与引用
  panel._header = header;
  panel._body = body;
  panel._input = input;
  panel._sendBtn = sendBtn;
  panel.dataset.theme = AIH_THEME;

  return panel;
}

function btnStyle() {
  return {
    fontSize: "12px",
    padding: "4px 8px",
    border: "1px solid rgba(0,0,0,.1)",
    borderRadius: "6px",
    background: "transparent",
    cursor: "pointer",
  };
}

function applyPanelTheme(panel, header, body) {
  const theme = panel.dataset.theme || "light";
  if (theme === "dark") {
    Object.assign(panel.style, {
      background: "#111",
      color: "#eee",
      border: "1px solid #333",
      boxShadow: "0 8px 24px rgba(0,0,0,.35)",
    });
    Object.assign(header.style, {
      background: "#1a1a1a",
      color: "#fff",
      borderBottom: "1px solid #333",
    });
    Object.assign(body.style, { color: "#eee" });
  } else {
    Object.assign(panel.style, {
      background: "#fff",
      color: "#111",
      border: "1px solid #ddd",
      boxShadow: "0 8px 24px rgba(0,0,0,.15)",
    });
    Object.assign(header.style, {
      background: "#f6f7f9",
      color: "#111",
      borderBottom: "1px solid #eee",
    });
    Object.assign(body.style, { color: "#111" });
  }
}

function setPanelVisible(visible) {
  panel.style.display = visible ? "block" : "none";
  if (visible) panel._input?.focus();
}
function clearPanel() { panel._body.textContent = ""; }
function logLine(text) {
  // 日志行（保持旧行为）
  const line = document.createElement("div");
  line.textContent = (panel._body.textContent ? "\n" : "") + text;
  panel._body.appendChild(line);
  panel._body.scrollTop = panel._body.scrollHeight + 32;
}
function appendBlock(text) {
  const pre = document.createElement("pre");
  pre.textContent = text;
  pre.style.margin = "8px 0";
  pre.style.whiteSpace = "pre-wrap";
  panel._body.appendChild(pre);
  panel._body.scrollTop = panel._body.scrollHeight + 32;
}

// 聊天气泡（简单样式）
function appendChatBubble(role, text) {
  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.margin = "6px 0";

  const bubble = document.createElement("div");
  bubble.textContent = text;
  Object.assign(bubble.style, {
    maxWidth: "85%",
    whiteSpace: "pre-wrap",
    padding: "6px 8px",
    borderRadius: "8px",
    lineHeight: "1.5",
    border: "1px solid rgba(0,0,0,.1)",
  });

  if (panel.dataset.theme === "dark") {
    bubble.style.border = "1px solid rgba(255,255,255,.15)";
  }

  if (role === "user") {
    wrap.style.justifyContent = "flex-end";
    bubble.style.background = "rgba(99, 153, 255, 0.12)";
  } else {
    wrap.style.justifyContent = "flex-start";
    bubble.style.background = "rgba(0,0,0,0.05)";
    if (panel.dataset.theme === "dark") {
      bubble.style.background = "rgba(255,255,255,0.08)";
    }
  }
  wrap.appendChild(bubble);
  panel._body.appendChild(wrap);
  panel._body.scrollTop = panel._body.scrollHeight + 32;
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
// 取/存 Gemini Key
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

// 单次 generateContent（兼容两种调用：字符串 或 contents 多轮）
async function geminiGenerate({ systemPrompt, userText, contents, apiKey, model }) {
  const url = `${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let body;
  if (Array.isArray(contents) && contents.length) {
    // 多轮对话：直接发 contents（role: "user"/"model"）
    body = {
      contents,
      generationConfig: { temperature: TEMPERATURE },
    };
    // 如果需要 systemPrompt，可拼到首条 user
    if (systemPrompt && body.contents[0]?.role === "user") {
      const t = body.contents[0].parts?.[0]?.text || "";
      body.contents[0].parts[0].text = `${systemPrompt}\n\n${t}`;
    }
  } else {
    // 单条：把 systemPrompt 拼接到 userText 前
    body = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt ? systemPrompt + "\n\n" : ""}${userText || ""}` }],
        },
      ],
      generationConfig: { temperature: TEMPERATURE },
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const errText = await res.text();
  if (!res.ok) {
    throw new Error(`Gemini API 错误：${res.status} ${errText}`);
  }

  let data;
  try { data = JSON.parse(errText); } catch { data = {}; }

  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map(p => p.text || "").join("").trim();
  return { text, modelUsed: model };
}

// 降级（字符串提示）
async function geminiGenerateWithFallback({ systemPrompt, userText, apiKey }) {
  let lastErr;
  for (const model of GEMINI_MODEL_CHAIN) {
    try {
      logLine(`🔎 尝试模型：${model} …`);
      const { text, modelUsed } = await geminiGenerate({ systemPrompt, userText, apiKey, model });
      if (modelUsed !== GEMINI_MODEL_CHAIN[0]) logLine(`ℹ️ 已自动降级到可用模型：${modelUsed}`);
      return text;
    } catch (e) {
      lastErr = e;
      logLine(`⚠️ 模型不可用：${e.message.split("\n")[0]}`);
      continue;
    }
  }
  throw lastErr || new Error("所有候选模型均不可用。");
}

// 降级（多轮对话）
async function geminiChatWithFallback({ contents, apiKey, systemPrompt = "" }) {
  let lastErr;
  for (const model of GEMINI_MODEL_CHAIN) {
    try {
      logLine(`🔎 尝试模型：${model} …`);
      const { text, modelUsed } = await geminiGenerate({ contents, apiKey, model, systemPrompt });
      if (modelUsed !== GEMINI_MODEL_CHAIN[0]) logLine(`ℹ️ 已自动降级到可用模型：${modelUsed}`);
      return text;
    } catch (e) {
      lastErr = e;
      logLine(`⚠️ 模型不可用：${e.message.split("\n")[0]}`);
      continue;
    }
  }
  throw lastErr || new Error("所有候选模型均不可用。");
}

/* ===================== 整文/分块分析（保留原逻辑） ===================== */
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

  // 多块：分块摘要 → 汇总
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

// disable-same-origin.js
// 只做一件事：在 PDF.js 的 “webviewerloaded” 事件触发后
// 把 disableSameOrigin 设为 true。

document.addEventListener('webviewerloaded', () => {
  // viewer.js 已加载完毕，此时 PDFViewerApplicationOptions 已可用
  window.PDFViewerApplicationOptions.set('disableSameOrigin', true);
});

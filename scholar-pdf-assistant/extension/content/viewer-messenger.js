// content/viewer-messenger.js
// 只在我们的 viewer.html 中生效
if (window.location.pathname.endsWith("/pdfjs/web/viewer.html")) {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.pdfData) {
      // 直接用二进制渲染，绕过 file 参数同源校验
      PDFViewerApplication.open({ data: msg.pdfData });
    }
  });
}

// content/selection.js
// --------------------
// 监听用户划词，将选中的文本和所在页码发送给后台 service-worker。

(() => {
  /* ---------- 0. 仅在自家 PDF.js viewer 页面执行 ---------- */
  if (!location.pathname.endsWith('/pdfjs/web/viewer.html')) {
    // 非目标页面直接 return，避免注入到普通网页
    return;
  }

  /* ---------- 1. 等待 PDF.js 完全初始化 ---------- */
  const whenViewerReady = (cb) => {
    // 新版 viewer 会在加载后设置 PDFViewerApplication.initialized = true
    if (window.PDFViewerApplication?.initialized) {
      cb();
    } else {
      // 早期版本触发 webviewerloaded 事件
      document.addEventListener(
        'webviewerloaded',
        () => cb(),
        { once: true }
      );
    }
  };

  /* ---------- 2. 监听 selectionchange 并防抖 ---------- */
  const initSelectionListener = () => {
    let lastText = '';
    let debounceTimer = null;

    document.addEventListener('selectionchange', () => {
      if (debounceTimer) clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        const selection = window.getSelection();
        const text = (selection?.toString() || '').trim();

        // 2.1 过滤空选区 / 重复选区
        if (!text || text === lastText) return;

        lastText = text;

        // 2.2 尝试解析页码：向上查找带 .page 的 div
        let page = null;
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const pageDiv = range.startContainer
            .closest?.('.page');

          if (pageDiv && pageDiv.dataset.pageNumber) {
            page = parseInt(pageDiv.dataset.pageNumber, 10);
          }
        }

        // 2.3 发送消息给后台
        chrome.runtime.sendMessage({
          type: 'SELECTION',
          text,
          page,          // 可能为 null，后台侧可根据具体需求处理
          ts: Date.now() // 时间戳，便于日志/排序
        });
      }, 200); // 200 ms debounce
    });

    console.log('[selection.js] Selection listener ready');
  };

  /* ---------- 3. 启动 ---------- */
  whenViewerReady(initSelectionListener);
})();

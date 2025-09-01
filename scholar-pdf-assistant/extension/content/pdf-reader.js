// content/pdf-reader.js
(async () => {
  // 1. 同源 fetch 本地 PDF 二进制
  const url = location.href; // e.g. file:///C:/…/foo.pdf
  let arrayBuffer;
  try {
    const res = await fetch(url);
    arrayBuffer = await res.arrayBuffer();
  } catch (err) {
    console.error("本地 PDF 读取失败:", err);
    return;
  }

  // 2. 打开 viewer.html（去掉任何 ?file= 参数）
  const viewerUrl = chrome.runtime.getURL("pdfjs/web/viewer.html");
  const tab = await chrome.tabs.create({ url: viewerUrl });

  // 3. 等待标签加载完成，再发送 PDF 数据
  chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
    if (tabId === tab.id && changeInfo.status === "complete") {
      chrome.tabs.onUpdated.removeListener(listener);
      chrome.tabs.sendMessage(tab.id, { pdfData: arrayBuffer });
    }
  });
})();

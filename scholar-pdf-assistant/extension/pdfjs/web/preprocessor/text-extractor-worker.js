// pdfjs/web/preprocessor/text-extractor-worker.js

// 1) 先 import PDF.js 的 UMD 构建
importScripts('../build/pdf.js');

// 2) Worker 收到消息后执行
self.onmessage = async (event) => {
  try {
    const { pdfData } = event.data;  // ArrayBuffer
    // 3) 用 PDF.js 加载文档
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdfDocument = await loadingTask.promise;

    const maxPages = pdfDocument.numPages;
    let fullText = '';

    // 4) 遍历每一页，提取 textContent
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();

      // 5) 合并每个 textItem.str
      for (const item of textContent.items) {
        fullText += item.str + ' ';
      }
      fullText += '\n\n';  // 每页之间加两个换行
    }

    // 6) 把结果发回主线程
    self.postMessage({ fullText });

  } catch (err) {
    // 出错时回传错误
    self.postMessage({ error: err.message });
  }
};

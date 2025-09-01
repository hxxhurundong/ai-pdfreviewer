// pdfjs/web/preprocessor/main.js

/**
 * extractFullText(pdfArrayBuffer: ArrayBuffer) => Promise<string>
 *
 * @param pdfArrayBuffer - 通过 fetch() / FileReader 得到的 PDF 二进制
 * @returns 完整的合并文本
 */
export function extractFullText(pdfArrayBuffer) {
  return new Promise((resolve, reject) => {
    // 1) 实例化 Worker（路径相对于 viewer.html 或 content script）
    const worker = new Worker('pdfjs/web/preprocessor/text-extractor-worker.js');

    // 2) 监听 Worker 消息
    worker.onmessage = (event) => {
      const { fullText, error } = event.data;
      if (error) {
        reject(new Error(error));
      } else {
        resolve(fullText);
      }
      worker.terminate();
    };

    worker.onerror = (e) => {
      reject(e.error || new Error('Worker error'));
      worker.terminate();
    };

    // 3) 发送二进制给 Worker 处理
    worker.postMessage({ pdfData: pdfArrayBuffer });
  });
}

// 用法举例（async context）：
async function demoExtract() {
  // 假设我们已经有 pdfUrl，比如通过 DNR 跳转得到的 file:///... 或远程 URL
  const response = await fetch(pdfUrl);
  const arrayBuffer = await response.arrayBuffer();

  try {
    const text = await extractFullText(arrayBuffer);
    console.log('全文提取完成：', text);
    // TODO: 把 text 存入 IndexedDB 或进一步处理
  } catch (e) {
    console.error('全文提取失败', e);
  }
}

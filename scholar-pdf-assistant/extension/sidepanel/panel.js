// sidepanel/panel.js
import { extractFullText } from '../pdfjs/web/preprocessor/main.js';

const textOutputEl = document.getElementById('text-output');
const logEl        = document.getElementById('log');

function log(msg) {
  const li = document.createElement('li');
  li.textContent = msg;
  logEl.prepend(li);
}

window.addEventListener('DOMContentLoaded', async () => {
  log('面板加载完毕，开始获取当前标签页…');

  try {
    // 1) 获取当前活动标签页
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });
    if (!tab?.url) {
      throw new Error('无法获取活动标签页 URL');
    }
    log('活动页 URL: ' + tab.url);

    // 2) 从 viewer.html 的 ?file= 参数里取 PDF 真正地址
    const viewerUrl = new URL(tab.url);
    const pdfUrl = viewerUrl.searchParams.get('file');
    if (!pdfUrl) {
      throw new Error('标签页 URL 中没有 file 参数');
    }
    log('解析到 PDF URL: ' + pdfUrl);

    // 3) 下载 PDF 二进制
    const resp = await fetch(pdfUrl);
    const buffer = await resp.arrayBuffer();
    log(`已下载 PDF (${(buffer.byteLength/1024).toFixed(1)} KB)`);

    // 4) 调用 Worker 提取纯文本
    const fullText = await extractFullText(buffer);
    log(`全文提取完成，共 ${fullText.length} 字`);

    // 5) 显示前 1000 字
    textOutputEl.textContent = fullText.slice(0, 1000) +
      (fullText.length > 1000 ? '\n…(后续省略)' : '');
  } catch (err) {
    console.error(err);
    log('出错：' + err.message);
    textOutputEl.textContent = '提取失败，请查看日志';
  }
});

// 如果你还想保留 AI “EXPLAIN” 消息
chrome.runtime.onMessage.addListener(({type, explanation}) => {
  if (type !== 'EXPLAIN') return;
  log('AI 解释：' + explanation);
});

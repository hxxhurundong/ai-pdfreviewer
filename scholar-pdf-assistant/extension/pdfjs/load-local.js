// load-local.js
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const fileUrl = params.get('file');
  if (fileUrl?.startsWith('file://')) {
    try {
      const res    = await fetch(fileUrl);
      const buffer = await res.arrayBuffer();
      // 直接打开 ArrayBuffer，不触发同源校验
      PDFViewerApplication.open({ data: buffer });
    } catch (e) {
      console.error('加载本地文件失败', e);
      PDFViewerApplication._documentError('pdfjs-loading-error', {
        message: e.message,
      });
    }
  }
});

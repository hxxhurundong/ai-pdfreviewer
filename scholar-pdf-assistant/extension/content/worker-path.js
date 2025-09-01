// content/worker-path.js
const wrk = chrome.runtime.getURL('pdfjs/build/pdf.worker.js');
window.pdfjsLib.GlobalWorkerOptions.workerSrc = wrk;

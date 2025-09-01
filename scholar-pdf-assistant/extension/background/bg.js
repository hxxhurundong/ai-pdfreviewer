// extension/background/bg.js
// 动态写入「重定向 *.pdf → viewer.html」规则（含 http/https/file 协议）

const PDF_RULE_ID = 1;   // 规则 ID，任意整数；保持唯一

async function installPdfRule() {
  // 1. 构造要写入的规则
  const rule = {
    id: PDF_RULE_ID,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        // 把整条原始 URL (\\0) 作为 file= 参数带给 viewer
        regexSubstitution:
          `chrome-extension://${chrome.runtime.id}` +
          `/pdfjs/web/viewer.html?file=\\0`
      }
    },
    condition: {
      // 同时匹配 http(s)://…/*.pdf 和 file:///…/*.pdf
      regexFilter: "^(https?|file):\\/\\/.*\\.pdf([?#].*)?$",
      resourceTypes: ["main_frame"]
    }
  };

  // 2. 注入（先删旧的再加新的）
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [PDF_RULE_ID],
    addRules: [rule]
  });

  console.log("[Scholar-PDF] DNR rule ready (http + file)");
}

// 3. 两个事件都安装：
//    - onInstalled 首次安装或版本号变化
//    - onStartup 浏览器重启 / 扩展 reload
chrome.runtime.onInstalled.addListener(installPdfRule);
chrome.runtime.onStartup.addListener(installPdfRule);

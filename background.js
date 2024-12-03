const createContextMenu = () =>{
  chrome.contextMenus.create({
    id: "rewrite-tweet",
    title: "Rewrite",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "generate-hashtags",
    title: "Generate Hashtags",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "translate-text",
    title: "Translate Text",
    contexts: ["selection"]
  });
}

const handleContextMenuClick = (info, tab) =>{
  if (info.menuItemId === "rewrite-tweet" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "rewrite",
      selectedText: info.selectionText
    }, handleMessageResponse);
  }else if (info.menuItemId === "generate-hashtags" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "generate-hashtags",
      selectedText: info.selectionText
    });
  } else if (info.menuItemId === "translate-text" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "translate-text",
      selectedText: info.selectionText
    });
}
}

const handleMessageResponse = (response) =>{
  if (chrome.runtime.lastError) {
    //console.error(chrome.runtime.lastError.message);
    console.log("df")
  }
}

chrome.runtime.onInstalled.addListener(createContextMenu);
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);
// sidebarを追加する
function insertHtmlAtBeginning(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const body = document.body;
    const firstChild = body.firstChild;

    while (tempDiv.firstChild) {
        body.insertBefore(tempDiv.firstChild, firstChild);
    }
}

var extensionId = chrome.runtime.id;
console.log(extensionId);
var iframeSrc = 'chrome-extension://' + extensionId + '/sidebar.html';
console.log(iframeSrc);
var htmlToInsert = '<iframe id="tr-sidebar" class="tr-iframe" src="' + iframeSrc + '"></iframe>';
console.log(htmlToInsert);
insertHtmlAtBeginning(htmlToInsert);

window.addEventListener('message', (event) => {
    if (event.data && event.data.url) {
        console.log('Sending message af:', event.data);
        chrome.runtime.sendMessage({type: 'openTab', url: event.data.url});
    }
});

window.addEventListener('message', function(event) {
    // 削除: Only accept messages from the same frame
    // if (event.source !== window) return;

    console.log('Received message in footer:', event.data);

    // You could examine the origin of the data for extra security
    if (typeof event.data === 'object' && event.data.type === 'FROM_PAGE' && event.data.action === 'setAlarm') {
      chrome.runtime.sendMessage({type: 'setAlarm'});
      console.log('Received message', event.data);
    }
}, false);

let iframe = document.getElementById('tr-sidebar');

function sendAlarmTime() {
    chrome.runtime.sendMessage({ type: 'getAlarmTime' }, function(response) {
        if (response.alarmSetTime && response.alarmTime) {
            console.log('Received message', response);
            let message = {
                type: 'FROM_PAGE',
                action: 'updateAlarmTime',
                alarmSetTime: response.alarmSetTime,
                alarmTime: response.alarmTime
            };
            iframe.contentWindow.postMessage(message, '*');
        }
    });
}

iframe.addEventListener('load', function() {
    sendAlarmTime();
});

// その後の定期的な実行
setInterval(sendAlarmTime, 60 * 1000);  // update every minute

// Call sendAlarmTime immediately after the page is fully loaded
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'sendAlarmTimeImmediately') {
        sendAlarmTime();
    }
});
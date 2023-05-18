let alarmSetTime;
let alarmTime;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message', message);
    if (message.type === 'openTab') {
        chrome.tabs.create({url: message.url});
    }
    else if (message.type === 'setAlarm') {
        // set an alarm that will trigger after 25 minutes
        chrome.alarms.create("openGoogle", { delayInMinutes: 3 });
        alarmSetTime = Date.now();
        alarmTime = alarmSetTime + 3 * 60 * 1000;  // 25 minutes later

        // Call sendAlarmTime function in add-footer.js
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type: 'sendAlarmTimeImmediately'});
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getAlarmTime') {
        sendResponse({ alarmSetTime: alarmSetTime, alarmTime: alarmTime });
    }
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name == "openGoogle") {
        chrome.tabs.create({ url: "http://127.0.0.1:5501/cf/whyme-js/index-trainer.html" });
        alarmSetTime = null;
        alarmTime = null;
    }
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        setTimeout(async () => {
            // jQueryの読み込み
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['jquery-3.6.4.min.js']
            });

            // add-header.jsの読み込み
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['add-header.js']
            });

            // CSSの挿入
            await chrome.scripting.insertCSS({
                target: { tabId: tabId },
                files: ['add-style.css']
            });

            // add-main.jsの実行
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['add-main.js']
            });

            // add-footer.jsの実行
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['add-footer.js']
            });
        }, 2500); // 2.5秒待つ
    }
});

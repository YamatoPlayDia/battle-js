const config = {
    apiKey: "AIzaSyAWWgTRtSNkLPYcIWiSenmO4dpfdAntrO8",
    authDomain: "whyme-js-00.firebaseapp.com",
    projectId: "whyme-js-00",
    storageBucket: "whyme-js-00.appspot.com",
    messagingSenderId: "901066502444",
    appId: "1:901066502444:web:07024a1f5875fd72bebc89"
};

  // タブを閉じる関数
function closeTab() {
    // Chromeの場合
    if (typeof chrome !== "undefined" && chrome.app && chrome.app.window) {
        chrome.app.window.current().close();
    }
    // 他のブラウザの場合
    else {
        window.close();
    }
}
// 1分間のタイマー
let timer1 = null;
// 2分間のタイマー
let timer2 = null;
// 5分間のタイマー
let timer3 = null;

firebase.initializeApp(config);

// ログイン状態の監視
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
    var userData = {
        displayName: user.displayName,
        photoUrl: user.photoURL
    };
    firebase.database().ref('users/' + user.uid).update(userData);
    console.log(userData);
    // ユーザーがログインしている場合
    document.getElementById('login-content').classList.add('d-none');
    document.getElementById('loading-content').classList.add('d-none');
    document.getElementById('user-content').classList.remove('d-none');
    // Get the reference to the user's data in Firebase Realtime Database

    // Get the user data
    firebase.database().ref('users/' + user.uid).once('value').then(function(snapshot) {
        // Get the user data from the snapshot
        var userData = snapshot.val();
        console.log(userData);
        if (userData.habit === 'video') {
            // Remove the "d-none" class from the element with the id "mode-3-video"
            document.getElementById('mode-3-video').classList.remove('d-none');
            var youtubeUrl = userData.videoUrl; // YouTubeのURL

            // YouTubeのビデオIDを抽出
            var videoId = extractVideoId(youtubeUrl);

            // 埋め込むYouTubeのURLを構築
            var embedUrl = "https://www.youtube.com/embed/" + videoId;

            // iframe要素を作成して埋め込みプレーヤーを設定
            var iframe = document.createElement("iframe");
            iframe.src = embedUrl;
            iframe.width = "560";
            iframe.height = "315";
            iframe.allowFullscreen = true;

            // 埋め込みプレーヤーを指定された要素に追加
            var targetElement = document.querySelector("#mode-3-video");
            targetElement.appendChild(iframe);

            // YouTubeのビデオIDを抽出するヘルパー関数
            function extractVideoId(url) {
                var match = url.match(/[?&]v=([^&#]+)/);
                return match ? match[1] : null;
            }
        }

        // // Get the memorizeCsvURL
        // firebase.database().ref('users/' + user.uid + '/memorizeCsvURL').once('value').then(function(snapshot) {
        //     // Get the value from the snapshot
        //     var memorizeCsvURL = snapshot.val();
        //     // Set the text
        //     document.getElementById('user-memorizeCsv').textContent = memorizeCsvURL;
        // });

        // // Get the keyboardCsvURL
        // firebase.database().ref('users/' + user.uid + '/keyboardCsvURL').once('value').then(function(snapshot) {
        //     // Get the value from the snapshot
        //     var keyboardCsvURL = snapshot.val();
        //     // Set the text
        //     document.getElementById('user-keyboardCsv').textContent = keyboardCsvURL;
        // });
    });
    loadChatDefault(user);
    // .mode-1を表示し、.mode-2と.mode-3を非表示にする
    $(".mode-1").removeClass("d-none");
    $(".mode-2, .mode-3").addClass("d-none");

    // タイマーの設定（時間はミリ秒単位で指定）
    var timer1Duration = 60000; // 60秒
    var timer2Duration = 120000; // 120秒
    var timer3Duration = 300000; // 300秒

    // カウントダウン表示の更新
    function updateTimerDisplay(timerId, timeRemaining) {
    var element = document.getElementById(timerId);
    var seconds = Math.floor(timeRemaining / 1000);
    element.textContent = seconds + "秒";
    }

    // タイマーカウントダウンの処理
    function startTimer(timerId, duration) {
    var startTime = Date.now();

    function countdown() {
        var currentTime = Date.now();
        var elapsedTime = currentTime - startTime;
        var timeRemaining = duration - elapsedTime;

        if (timeRemaining > 0) {
        updateTimerDisplay(timerId, timeRemaining);
        setTimeout(countdown, 1000); // 1秒ごとに更新
        } else {
        updateTimerDisplay(timerId, 0);
        }
    }

    countdown();
    }

    // タイマーの開始
    startTimer("timer1", timer1Duration);
    startTimer("timer2", timer2Duration);
    startTimer("timer3", timer3Duration);

    // 1分間のタイマーを開始する
    timer1 = setTimeout(async function() {
        const timestamp = new Date().getTime();
        const memoText = $('#memo1').val();
        const dataMe = { timestamp: timestamp, type: "normal", user: user.displayName , userid: user.uid, value: nl2brEx(memoText) , room: user.displayName , roomid: user.uid };
        firebase.database().ref('items').push(dataMe);
        async function getGptKey() {
            const snapshot = await firebase.database().ref('users/' + user.uid).once('value');
            const userData = snapshot.val();
            return userData.gptkey;
        }
        const key = await getGptKey();
        console.log(key);
        $('#memo1').val('');
        $('.mode-2').removeClass('d-none');
        $('.mode-1').addClass('d-none');
        $('.mode-3').addClass('d-none');
        let GPT = "";
        async function getSolution(memoText, key) {
            console.log(nl2brEx(memoText));
            const messages = [
                {
                    role: "user",
                    content: nl2brEx(memoText)
                },
                {
                    role: "system",
                    content: "日本語で答えてください。As a professional, kind, and listening-focused coach, please empathetically understand and summarize the user's problem. Finally, please propose a standard solution and playful solution to the problem."
                }
            ];
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'post',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': 'Bearer ' + key
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: messages,
                })
            });
            const data = await res.json();
            if (data.choices) {
                GPT = data.choices[0].message.content;
                console.log(GPT);
                const dataMe = { timestamp: timestamp, type: "normal", user: "GPTくん" , userid: "chatgpt", value: nl2brEx(GPT) , room: user.displayName , roomid: user.uid };
                firebase.database().ref('items').push(dataMe);
            } else {
                console.error('Unexpected response from API:', data);
                const dataMe = { timestamp: timestamp, type: "normal", user: "GPTくん" , userid: "chatgpt", value: "Unexpected response from API" , room: user.displayName , roomid: user.uid };
            }
        }
        await getSolution(memoText, key);
        console.log("timer1で送信したよ！")
    }, 60000);

    // 2分間のタイマーを開始する
    timer2 = setTimeout(function() {
        $(".mode-3").removeClass("d-none"); // .mode-3を表示する
        $(".mode-1, .mode-2").addClass("d-none"); // .mode-1と.mode-2を非表示にする
    }, 120000);

    // 5分間のタイマーを開始する
    timer3 = setTimeout(function() {
        closeTab(); // タブを閉じる
        document.getElementById(timer3) = "時間です！";
    }, 300000);

    // 送信ボタンのイベントリスナー1＃＃localStorageを変える & user: trainerのGPT応答をたす & usernameを足す
    $('#button_submit1').on('click', async function () {
        clearTimeout(timer1);
        const timestamp = new Date().getTime();
        const memoText = $('#memo1').val();
        const dataMe = { timestamp: timestamp, type: "normal", user: user.displayName , userid: user.uid, value: nl2brEx(memoText) , room: user.displayName , roomid: user.uid };
        firebase.database().ref('items').push(dataMe);
        async function getGptKey() {
            const snapshot = await firebase.database().ref('users/' + user.uid).once('value');
            const userData = snapshot.val();
            return userData.gptkey;
        }
        const key = await getGptKey();
        console.log(key);
        $('#memo1').val('');
        $('.mode-2').removeClass('d-none');
        $('.mode-1').addClass('d-none');
        $('.mode-3').addClass('d-none');
        let GPT = "";
        async function getSolution(memoText, key) {
            console.log(nl2brEx(memoText));
            const messages = [
                {
                    role: "user",
                    content: nl2brEx(memoText)
                },
                {
                    role: "system",
                    content: "日本語で答えてください。As a professional, kind, and listening-focused coach, please empathetically understand and summarize the user's problem. Finally, please propose a standard solution and playful solution to the problem."
                }
            ];
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'post',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': 'Bearer ' + key
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: messages,
                })
            });
            const data = await res.json();
            if (data.choices) {
                GPT = data.choices[0].message.content;
                console.log(GPT);
                const dataMe = { timestamp: timestamp, type: "normal", user: "GPTくん" , userid: "chatgpt", value: nl2brEx(GPT) , room: user.displayName , roomid: user.uid };
                firebase.database().ref('items').push(dataMe);
            } else {
                console.error('Unexpected response from API:', data);
                const dataMe = { timestamp: timestamp, type: "normal", user: "GPTくん" , userid: "chatgpt", value: "Unexpected response from API" , room: user.displayName , roomid: user.uid };
            }
        }
        await getSolution(memoText, key);
    });

    // ショートカットのイベントリスナー1＃＃localStorageを変える & user: trainerのGPT応答をたす & usernameを足す
    $('#memo1').on('keydown', async function (event) {
        if ((event.ctrlKey || event.metaKey) && event.keyCode == 13) {
            event.preventDefault();
            clearTimeout(timer1);
            const timestamp = new Date().getTime();
            const memoText = $('#memo1').val();
            const dataMe = { timestamp: timestamp, type: "normal", user: user.displayName , userid: user.uid, value: nl2brEx(memoText) , room: user.displayName , roomid: user.uid };
            firebase.database().ref('items').push(dataMe);
            async function getGptKey() {
                const snapshot = await firebase.database().ref('users/' + user.uid).once('value');
                const userData = snapshot.val();
                return userData.gptkey;
            }
            const key = await getGptKey();
            console.log(key);
            $('#memo1').val('');
            $('.mode-2').removeClass('d-none');
            $('.mode-1').addClass('d-none');
            $('.mode-3').addClass('d-none');
            let GPT = "";
            async function getSolution(memoText, key) {
                console.log(nl2brEx(memoText));
                const messages = [
                    {
                        role: "user",
                        content: nl2brEx(memoText)
                    },
                    {
                        role: "system",
                        content: "日本語で答えてください。As a professional, kind, and listening-focused coach, please empathetically understand and summarize the user's problem. Finally, please propose a standard solution and playful solution to the problem."
                    }
                ];
                const res = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json',
                        'Authorization': 'Bearer ' + key
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: messages,
                    })
                });
                const data = await res.json();
                if (data.choices) {
                    GPT = data.choices[0].message.content;
                    console.log(GPT);
                    const dataMe = { timestamp: timestamp, type: "normal", user: "GPTくん" , userid: "chatgpt", value: nl2brEx(GPT) , room: user.displayName , roomid: user.uid };
                    firebase.database().ref('items').push(dataMe);
                } else {
                    console.error('Unexpected response from API:', data);
                    const dataMe = { timestamp: timestamp, type: "normal", user: "GPTくん" , userid: "chatgpt", value: "Unexpected response from API" , room: user.displayName , roomid: user.uid };
                }
            }
            await getSolution(memoText, key);
        }
    });

    // 送信ボタンのイベントリスナー2＃＃localStorageを変える & user: trainerのGPT応答をたす & usernameを足す
    $('#button_submit2').on('click', function () {
        const timestamp = new Date().getTime();
        const memoText = $('#memo2').val();
        const data = { timestamp: timestamp, type: "normal", user: user.displayName , userid: user.uid, value: nl2brEx(memoText) , room: user.displayName , roomid: user.uid };
        firebase.database().ref('items').push(data);
        $('#memo2').val('');
    });

    // ショートカットのイベントリスナー2＃＃localStorageを変える & user: trainerのGPT応答をたす & usernameを足す
    $('#memo2').on('keydown', function (event) {
        if ((event.ctrlKey || event.metaKey) && event.keyCode == 13) {
            event.preventDefault();
            const timestamp = new Date().getTime();
            const memoText = $('#memo2').val();
            const data = { timestamp: timestamp, type: "normal", user: user.displayName , userid: user.uid, value: nl2brEx(memoText) , room: user.displayName , roomid: user.uid };
            firebase.database().ref('items').push(data);
            $('#memo2').val('');
        }
    });
    $('#skip-mode-2').on('click', function () {
        clearTimeout(timer2);
        $(".mode-3").removeClass("d-none"); // .mode-3を表示する
        $(".mode-1, .mode-2").addClass("d-none"); // .mode-1と.mode-2を非表示にする
    });
    // お気に入りボタンのイベント設定
    $(document).on('click', '.favorite-no', function () {
        let ref = firebase.database().ref("items");
        let keyToUpdate = $(this).data('key');  // すでに定義されているとのことなので、ここで参照します
        ref.child(keyToUpdate).once('value', function(snapshot) {
            let data = snapshot.val();
            // typeを"favorite"に更新
            data.type = "favorite";
            // Firebaseに保存
            ref.child(keyToUpdate).set(data, function(error) {
                if (error) {
                    console.error("Data could not be saved." + error);
                } else {
                    console.log("Data saved successfully.");
                }
            });
        });
    });
    $(document).on('click', '.favorite-yes', function () {
        let ref = firebase.database().ref("items");
        let keyToUpdate = $(this).data('key');  // すでに定義されているとのことなので、ここで参照します
        ref.child(keyToUpdate).once('value', function(snapshot) {
            let data = snapshot.val();
            // typeを"normal"に更新
            data.type = "normal";
            // Firebaseに保存
            ref.child(keyToUpdate).set(data, function(error) {
                if (error) {
                    console.error("Data could not be saved." + error);
                } else {
                    console.log("Data saved successfully.");
                }
            });
        });
    });
    // ゴミ箱ボタンのイベント設定
    $(document).on('click', '.delete', function () {
        let ref = firebase.database().ref("items");
        let keyToUpdate = $(this).data('key');  // すでに定義されているとのことなので、ここで参照します
        ref.child(keyToUpdate).once('value', function(snapshot) {
            let data = snapshot.val();
            // typeを"favorite"に更新
            data.type = "trash";
            // Firebaseに保存
            ref.child(keyToUpdate).set(data, function(error) {
                if (error) {
                    console.error("Data could not be saved." + error);
                } else {
                    console.log("Data saved successfully.");
                }
            });
        });
    });
    } else {
    // ユーザーがログアウトしている場合
    document.getElementById('login-content').classList.remove('d-none');
    document.getElementById('loading-content').classList.add('d-none');
    document.getElementById('user-content').classList.add('d-none');
    // タイマーをリセットする
    clearTimeout(timer1);
    clearTimeout(timer2);
    clearTimeout(timer3);
    }
});

// Google認証のためのFirebaseのAuthProviderを作成
var provider = new firebase.auth.GoogleAuthProvider();

// Googleでログインボタンがクリックされた時の処理
document.getElementById('google-login-btn').addEventListener('click', function() {
    // Google認証のためのFirebaseのAuthProviderを作成
    firebase.auth().signInWithPopup(provider).then(function(result) {
        var user = result.user;
        firebase.database().ref('users/' + user.uid).once('value').then(function(snapshot) {
            var userData = snapshot.val();
            console.log(userData);
        }).catch(function(error) {
            console.log(error.message);
        });
    }).catch(function(error) {
        console.error('ログインエラー:', error);
    });
});

// チャット履歴のロード関数＃＃localStorageを変える
function loadChatDefault(user) {
    let ref = firebase.database().ref("items");
    // "timestamp"でソートし、最新の100件を取得
    // 'value'イベントは、データが変更される度にトリガーされます
    ref.orderByChild("timestamp").limitToLast(100).on("value", function(snapshot) {
        $('.area-chat').empty();
        // 取得したデータをループ
        snapshot.forEach(function(childSnapshot) {
            let key = childSnapshot.key;
            let data = childSnapshot.val();
            // typeが"normal"または"favorite"、かつroomidがuser.uidと同じならば
            if ((data.type === "normal" || data.type === "favorite") && data.roomid === user.uid) {
                // createChatCardを呼び出す
                createChatCard(data, key, user);
            }
        });
    });
}

function toRelativeDate(key) {
    const date = new Date(parseInt(key, 10));
    const seconds = (new Date - date) / 1000;
    const days = seconds / 3600 / 24;
    if (seconds < 1) return '今';
    if (seconds < 60) return Math.floor(seconds) + '秒前';
    if (seconds < 3600) return Math.floor(seconds / 60) + '分前';
    if (seconds < 3600 * 24) return Math.floor(seconds / 3600) + '時間前';
    if (days < 365.25 / 12) return Math.floor(days) + '日前';
    // 1か月を一律(365.25 / 12)日とみなして計算
    if (days < 365.25) return Math.floor(days / 365.25 * 12) + 'か月前';
    return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
}

function nl2brEx(v){
    if(v == null || v == '' || v=='0'){
        return v;
    }

    v = v.replace(/\r\n|\n\r|\r|\n/g,'<br>');
    return v;
}

// チャットカードの作成関数
function createChatCard(data, key, user) {
    if (data.type === 'normal'){
        if (data.userid === user.uid){
            let cardHtml = '';
            cardHtml += '<div class="card mb-2">';
            cardHtml +=     '<div class="card-header bg-white d-flex justify-content-between align-items-center">';
            cardHtml +=         '<div class="card-left d-flex align-items-center">';
            cardHtml +=             '<span class="user-name text-dark fw-bold me-2 fs-6">' + user.displayName + '</span>';
            cardHtml +=             '<span class="time mx-2 text-muted small">' + toRelativeDate(data.timestamp) + '</span>';
            cardHtml +=         '</div>';
            cardHtml +=         '<div class="card-right d-flex align-items-center">';
            cardHtml +=             '<span class="pointer material-symbols-outlined fs-6 text-muted me-2 favorite-no" data-key="' + key + '">favorite</span>';
            cardHtml +=             '<span class="pointer material-symbols-outlined fs-6 text-muted delete" data-key="' + key + '">delete</span>';
            cardHtml +=         '</div>';
            cardHtml +=     '</div>';
            cardHtml +=     '<div class="card-body">';
            cardHtml +=         '<p class="card-text text-dark">' + data.value + '</p>';
            cardHtml +=     '</div>';
            cardHtml += '</div>';
            $('.area-chat').append(cardHtml);
        }
        if (data.userid === 'chatgpt'){
            let cardHtml = '';
            cardHtml += '<div class="card mb-2 card-you">';
            cardHtml +=     '<div class="card-header d-flex justify-content-between align-items-center">';
            cardHtml +=         '<div class="card-left d-flex align-items-center">';
            cardHtml +=             '<span class="user-name text-white fw-bold me-2 fs-6">GPTくん</span>';
            cardHtml +=             '<span class="time mx-2 text-light small">' + toRelativeDate(data.timestamp) + '</span>';
            cardHtml +=         '</div>';
            cardHtml +=         '<div class="card-right d-flex align-items-center">';
            cardHtml +=             '<span class="pointer material-symbols-outlined fs-6 text-light me-2 favorite-no" data-key="' + key + '">favorite</span>';
            cardHtml +=             '<span class="pointer material-symbols-outlined fs-6 text-light delete" data-key="' + key + '">delete</span>';
            cardHtml +=         '</div>';
            cardHtml +=     '</div>';
            cardHtml +=     '<div class="card-body">';
            cardHtml +=         '<p class="card-text text-white">' + data.value + '</p>';
            cardHtml +=     '</div>';
            cardHtml += '</div>';
            $('.area-chat').append(cardHtml);
        }
    }
    if (data.type === 'favorite'){
        if (data.userid === user.uid){
            let cardHtml = '';
            cardHtml += '<div class="card mb-2">';
            cardHtml +=     '<div class="card-header bg-white d-flex justify-content-between align-items-center">';
            cardHtml +=         '<div class="card-left d-flex align-items-center">';
            cardHtml +=             '<span class="user-name text-dark fw-bold me-2 fs-6">' + user.displayName + '</span>';
            cardHtml +=             '<span class="time mx-2 text-muted small">' + toRelativeDate(data.timestamp) + '</span>';
            cardHtml +=         '</div>';
            cardHtml +=         '<div class="card-right d-flex align-items-center">';
            cardHtml +=             '<span class="pointer material-symbols-outlined fs-6 text-danger me-2 fill favorite-yes" data-key="' + key + '">favorite</span>';
            cardHtml +=             '<span class="not-allowed material-symbols-outlined fs-6 text-light cantdelete" data-key="' + key + '">delete</span>';
            cardHtml +=         '</div>';
            cardHtml +=     '</div>';
            cardHtml +=     '<div class="card-body">';
            cardHtml +=         '<p class="card-text text-dark">' + data.value + '</p>';
            cardHtml +=     '</div>';
            cardHtml += '</div>';
            $('.area-chat').append(cardHtml);
        }
        if (data.userid === 'chatgpt'){
            let cardHtml = '';
            cardHtml += '<div class="card mb-2 card-you">';
            cardHtml +=     '<div class="card-header d-flex justify-content-between align-items-center">';
            cardHtml +=         '<div class="card-left d-flex align-items-center">';
            cardHtml +=             '<span class="user-name text-white fw-bold me-2 fs-6">GPTくん</span>';
            cardHtml +=             '<span class="time mx-2 text-light small">' + toRelativeDate(data.timestamp) + '</span>';
            cardHtml +=         '</div>';
            cardHtml +=         '<div class="card-right d-flex align-items-center">';
            cardHtml +=             '<span class="pointer material-symbols-outlined fs-6 text-danger me-2 fill favorite-yes" data-key="' + key + '">favorite</span>';
            cardHtml +=             '<span class="not-allowed material-symbols-outlined fs-6 text-muted cantdelete" data-key="' + key + '">delete</span>';
            cardHtml +=         '</div>';
            cardHtml +=     '</div>';
            cardHtml +=     '<div class="card-body">';
            cardHtml +=         '<p class="card-text text-white">' + data.value + '</p>';
            cardHtml +=     '</div>';
            cardHtml += '</div>';
            $('.area-chat').append(cardHtml);
        }
    }
}

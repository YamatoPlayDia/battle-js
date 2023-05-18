const config = {
    apiKey: "AIzaSyAWWgTRtSNkLPYcIWiSenmO4dpfdAntrO8",
    authDomain: "whyme-js-00.firebaseapp.com",
    projectId: "whyme-js-00",
    storageBucket: "whyme-js-00.appspot.com",
    messagingSenderId: "901066502444",
    appId: "1:901066502444:web:07024a1f5875fd72bebc89"
};
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
    // Get the current user's uid
    const currentUid = user.uid;
    // Get the user's selectedUsers data from Firebase
    firebase.database().ref('users/' + currentUid + '/selectedUsers').once('value').then(function(snapshot) {
        // Get the selectedUsers data from the snapshot
        const selectedUsers = snapshot.val();
        console.log(selectedUsers);

        // Get the navigation list element
        const navList = document.querySelector('.nav.nav-pills.flex-column.mb-auto');

        // Iterate through each selectedUser
        selectedUsers.forEach(function(selectedUserUid) {
            // Ignore the current user's uid
            if (selectedUserUid === currentUid) return;

            firebase.database().ref('users/' + selectedUserUid).once('value').then(function(snapshot) {
                var displayName = snapshot.val().displayName;

                // ここでdisplayNameを使う
                console.log(displayName);

                // Create a new list item
                const li = document.createElement('li');

                // Create a new span element
                const span = document.createElement('span');
                span.className = 'pointer nav-link menu-mode nav-default';
                span.dataset.uid = selectedUserUid;  // Set the data-uid attribute
                span.textContent = displayName;  // Set the text content

                // Append the span to the list item
                li.appendChild(span);

                // Append the list item to the navigation list
                navList.appendChild(li);
            });
        });
    });
    loadChatDefault(user);
    $(".mode-default").removeClass("d-none");
    $(".mode-favorite, .mode-trash, .mode-others").addClass("d-none");
    $('.nav-default').on('click', function () {
        $('.mode-default').removeClass('d-none');
        $('.mode-favorite').addClass('d-none');
        $('.mode-trash').addClass('d-none');
        $('.menu-mode').removeClass('active');
        $(this).addClass('active');
        loadChatDefault();
    });

    $('.nav-favorite').on('click', function () {
        $('.mode-favorite').removeClass('d-none');
        $('.mode-default').addClass('d-none');
        $('.mode-trash').addClass('d-none');
        $('.menu-mode').removeClass('active');
        $(this).addClass('active');
        loadChatFavorite();
    });

    $('.nav-trash').on('click', function () {
        $('.mode-trash').removeClass('d-none');
        $('.mode-default').addClass('d-none');
        $('.mode-favorite').addClass('d-none');
        $('.menu-mode').removeClass('active');
        $(this).addClass('active');
        loadChatTrash();
    });
    // 送信ボタンのイベントリスナー2＃＃localStorageを変える & user: trainerのGPT応答をたす & usernameを足す
    $('#submit').on('click', function () {
        // Select the element with the class "active"
        var activeElement = document.querySelector('.active');
        // If the active element exists, get its data-uid attribute
        if (activeElement) {
            var roomUid = activeElement.getAttribute('data-uid');
            console.log(roomUid);  // Log the uid
        } else {
            console.log('No active element found');
        }
        const timestamp = new Date().getTime();
        const memoText = $('#memo').val();
        firebase.database().ref('users/' + roomUid).once('value').then(function(snapshot) {
            const data = { timestamp: timestamp, type: "normal", user: user.displayName , userid: user.uid, value: nl2brEx(memoText) , room: snapshot.val().displayName , roomid: roomUid };
            firebase.database().ref('items').push(data);
        });
        $('#memo').val('');
    });
    // ショートカットのイベントリスナー2＃＃localStorageを変える & user: trainerのGPT応答をたす & usernameを足す
    $('#submit').on('keydown', function (event) {
        if ((event.ctrlKey || event.metaKey) && event.keyCode == 13) {
            event.preventDefault();
            // Select the element with the class "active"
            var activeElement = document.querySelector('.active');
            // If the active element exists, get its data-uid attribute
            if (activeElement) {
                var roomUid = activeElement.getAttribute('data-uid');
                console.log(roomUid);  // Log the uid
            } else {
                console.log('No active element found');
            }
            const timestamp = new Date().getTime();
            const memoText = $('#memo').val();
            firebase.database().ref('users/' + roomUid).once('value').then(function(snapshot) {
                const data = { timestamp: timestamp, type: "normal", user: user.displayName , userid: user.uid, value: nl2brEx(memoText) , room: snapshot.val().displayName , roomid: roomUid };
                firebase.database().ref('items').push(data);
            });
            $('#memo').val('');
        }
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
    // 元に戻すボタンのイベント設定
    $(document).on('click', '.undo', function () {
        let ref = firebase.database().ref("items");
        let keyToUpdate = $(this).data('key');  // すでに定義されているとのことなので、ここで参照します
        ref.child(keyToUpdate).once('value', function(snapshot) {
            let data = snapshot.val();
            // typeを"favorite"に更新
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
  // 永久削除ボタンのイベント設定
    $(document).on('click', '.deleteforever', function () {
        let keyToUpdate = $(this).data('key');  // すでに定義されているとのことなので、ここで参照します
        let ref = firebase.database().ref("items/" + keyToUpdate);
        ref.remove()
            .then(function() {
                console.log("Remove succeeded.")
            })
            .catch(function(error) {
                console.log("Remove failed: " + error.message)
            });
    });
    } else {
    // ユーザーがログアウトしている場合
    document.getElementById('login-content').classList.remove('d-none');
    document.getElementById('loading-content').classList.add('d-none');
    document.getElementById('user-content').classList.add('d-none');
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
        // Select the element with the class "active"
        var activeElement = document.querySelector('.active');
        // If the active element exists, get its data-uid attribute
        if (activeElement) {
            var roomUid = activeElement.getAttribute('data-uid');
            console.log(roomUid);  // Log the uid
        } else {
            console.log('No active element found');
        }
        let ref = firebase.database().ref("items");
        // "timestamp"でソートし、最新の100件を取得
        // 'value'イベントは、データが変更される度にトリガーされます
        ref.orderByChild("timestamp").limitToLast(100).on("value", function(snapshot) {
            $('.area-chat-default').empty();
            // 取得したデータをループ
            snapshot.forEach(function(childSnapshot) {
                let key = childSnapshot.key;
                let data = childSnapshot.val();
                // typeが"normal"または"favorite"、かつroomidがactiveのuidと同じならば
                if ((data.type === "normal" || data.type === "favorite") && data.roomid === roomUid) {
                    createChatCard(data, key, user);
                }
            });
        });
    }
    function loadChatFavorite(user) {
        let ref = firebase.database().ref("items");
        // "timestamp"でソートし、最新の100件を取得
        // 'value'イベントは、データが変更される度にトリガーされます
        ref.orderByChild("timestamp").limitToLast(100).on("value", function(snapshot) {
            $('.area-chat-favorite').empty();
            // 取得したデータをループ
            snapshot.forEach(function(childSnapshot) {
                let key = childSnapshot.key;
                let data = childSnapshot.val();
                // typeが"normal"または"favorite"、かつroomidがactiveのuidと同じならば
                if (data.type === "favorite" && data.roomid === user.id) {
                    createChatCard(data, key, user);
                }
            });
        });
    }
    function loadChatTrash(user) {
        let ref = firebase.database().ref("items");
        // "timestamp"でソートし、最新の100件を取得
        // 'value'イベントは、データが変更される度にトリガーされます
        ref.orderByChild("timestamp").limitToLast(100).on("value", function(snapshot) {
            $('.area-chat-trash').empty();
            // 取得したデータをループ
            snapshot.forEach(function(childSnapshot) {
                let key = childSnapshot.key;
                let data = childSnapshot.val();
                // typeが"normal"または"favorite"、かつroomidがactiveのuidと同じならば
                if (data.type === "trash" && data.roomid === user.id) {
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
            } else if (data.userid === 'chatgpt'){
                let cardHtml = '';
                cardHtml += '<div class="card mb-2 card-you">';
                cardHtml +=     '<div class="card-header d-flex justify-content-between align-items-center">';
                cardHtml +=         '<div class="card-left d-flex align-items-center">';
                cardHtml +=             '<span class="user-name text-white fw-bold me-2 fs-6">GPTくん</span>';
                cardHtml +=             '<span class="time mx-2 text-light small">' + toRelativeDate(data.timestamp) + '</span>';
                cardHtml +=         '</div>';
                cardHtml +=     '</div>';
                cardHtml +=     '<div class="card-body">';
                cardHtml +=         '<p class="card-text text-white">' + data.value + '</p>';
                cardHtml +=     '</div>';
                cardHtml += '</div>';
                $('.area-chat').append(cardHtml);
            } else {
                let cardHtml = '';
                cardHtml += '<div class="card mb-2 card-other">';
                cardHtml +=     '<div class="card-header d-flex justify-content-between align-items-center">';
                cardHtml +=         '<div class="card-left d-flex align-items-center">';
                cardHtml +=             '<span class="user-name text-white fw-bold me-2 fs-6">' + data.user + '</span>';
                cardHtml +=             '<span class="time mx-2 text-light small">' + toRelativeDate(data.timestamp) + '</span>';
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
            if (data.user === 'me'){
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
            } else if (data.userid === 'chatgpt'){
                let cardHtml = '';
                cardHtml += '<div class="card mb-2 card-you">';
                cardHtml +=     '<div class="card-header d-flex justify-content-between align-items-center">';
                cardHtml +=         '<div class="card-left d-flex align-items-center">';
                cardHtml +=             '<span class="user-name text-white fw-bold me-2 fs-6">GPTくん</span>';
                cardHtml +=             '<span class="time mx-2 text-light small">' + toRelativeDate(data.timestamp) + '</span>';
                cardHtml +=         '</div>';
                cardHtml +=     '</div>';
                cardHtml +=     '<div class="card-body">';
                cardHtml +=         '<p class="card-text text-white">' + data.value + '</p>';
                cardHtml +=     '</div>';
                cardHtml += '</div>';
                $('.area-chat').append(cardHtml);
            } else {
                let cardHtml = '';
                cardHtml += '<div class="card mb-2 card-other">';
                cardHtml +=     '<div class="card-header d-flex justify-content-between align-items-center">';
                cardHtml +=         '<div class="card-left d-flex align-items-center">';
                cardHtml +=             '<span class="user-name text-white fw-bold me-2 fs-6">' + data.user + '</span>';
                cardHtml +=             '<span class="time mx-2 text-light small">' + toRelativeDate(data.timestamp) + '</span>';
                cardHtml +=         '</div>';
                cardHtml +=     '</div>';
                cardHtml +=     '<div class="card-body">';
                cardHtml +=         '<p class="card-text text-white">' + data.value + '</p>';
                cardHtml +=     '</div>';
                cardHtml += '</div>';
                $('.area-chat').append(cardHtml);
            }
        }
        if (data.type === 'trash'){
            if (data.user === 'me'){
                let cardHtml = '';
                cardHtml += '<div class="card mb-2">';
                cardHtml +=     '<div class="card-header bg-white d-flex justify-content-between align-items-center">';
                cardHtml +=         '<div class="card-left d-flex align-items-center">';
                cardHtml +=             '<span class="user-name text-dark fw-bold me-2 fs-6">' + user.displayName + '</span>';
                cardHtml +=             '<span class="time mx-2 text-muted small">' + toRelativeDate(key) + '</span>';
                cardHtml +=         '</div>';
                cardHtml +=         '<div class="card-right d-flex align-items-center">';
                cardHtml +=             '<span class="pointer material-symbols-outlined fs-6 text-muted me-2 undo" data-key="' + key + '">undo</span>';
                cardHtml +=             '<span class="pointer material-symbols-outlined fs-6 text-muted deleteforever" data-key="' + key + '">close</span>';
                cardHtml +=         '</div>';
                cardHtml +=     '</div>';
                cardHtml +=     '<div class="card-body">';
                cardHtml +=         '<p class="card-text text-dark">' + data.value + '</p>';
                cardHtml +=     '</div>';
                cardHtml += '</div>';
                $('.area-chat').append(cardHtml);
            }
        }
    }

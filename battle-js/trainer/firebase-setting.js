// Firebase の初期化
// const firebaseConfig = {
//     apiKey: "AIzaSyAWWgTRtSNkLPYcIWiSenmO4dpfdAntrO8",
//     authDomain: "whyme-js-00.firebaseapp.com",
//     projectId: "whyme-js-00",
//     storageBucket: "whyme-js-00.appspot.com",
//     messagingSenderId: "901066502444",
//     appId: "1:901066502444:web:07024a1f5875fd72bebc89"
// };
// firebase.initializeApp(firebaseConfig);

// // ボタンをクリックしたときにログインする
// const loginButton = document.getElementById("login");
// loginButton.addEventListener("click", () => {
//   // Google 認証プロバイダーを取得する
//     const provider = new firebase.auth.GoogleAuthProvider();

//   // ログインする
//     firebase.auth().signInWithPopup(provider).then((result) => {
//         const user = result.user;
//         console.log(user.uid); // 一意の ID
//     });
// });

// const config = {
//     apiKey: "AIzaSyAWWgTRtSNkLPYcIWiSenmO4dpfdAntrO8",
//     authDomain: "whyme-js-00.firebaseapp.com",
//     projectId: "whyme-js-00",
//     storageBucket: "whyme-js-00.appspot.com",
//     messagingSenderId: "901066502444",
//     appId: "1:901066502444:web:07024a1f5875fd72bebc89"
// };

// firebase.initializeApp(config);

// const startAuth = (token) => {
// const credential = firebase.auth.GoogleAuthProvider.credential(null, token);
// firebase.auth().signInWithCredential(credential).catch((error) => {
//     console.log(error);
// });
// }

// const startSignIn = () => {
// if (firebase.auth().currentUser) {
//     firebase.auth().signOut();
// } else {
//     startAuth();
// }
// }

// window.addEventListener("message", (event) => {
// console.log(event);
// startAuth(event.data);
// });

// const inputFile = document.getElementById("inputFile");

// inputFile.onchange = (evt) => {
// const storageRef = firebase.storage().ref();
// evt.stopPropagation();
// evt.preventDefault();
// const file = evt.target.files[0];

// const metadata = {
//     "contentType": file.type
// };

// storageRef.child(file.name).put(file, metadata).catch((error) => {
//     console.log(error);
// });
// }
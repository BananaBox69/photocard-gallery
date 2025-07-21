// Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAmTGZo-kU-HsDwczXb2sjTw5VZgCDJn68",
  authDomain: "k-pop-price-list-pro.firebaseapp.com",
  projectId: "k-pop-price-list-pro",
  storageBucket: "k-pop-price-list-pro.appspot.com",
  messagingSenderId: "386977468923",
  appId: "1:386977468923:web:4fecd8b5971976063e7b5e"
};

// Initialize Firebase
var app = firebase.initializeApp(firebaseConfig);
var db = firebase.firestore(app);
var photocardsCollection = db.collection("photocards");
var settingsDoc = db.doc("settings/main");

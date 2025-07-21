import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAmTGZo-kU-HsDwczXb2sjTw5VZgCDJn68",
    authDomain: "k-pop-price-list-pro.firebaseapp.com",
    projectId: "k-pop-price-list-pro",
    storageBucket: "k-pop-price-list-pro.appspot.com",
    messagingSenderId: "386977468923",
    appId: "1:386977468923:web:4fecd8b5971976063e7b5e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const photocardsCollection = collection(db, "photocards");
const settingsDoc = doc(db, "settings", "main");

export { db, photocardsCollection, settingsDoc };

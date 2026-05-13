// Firebase конфиг (CDN версия)
const firebaseConfig = {
  apiKey: "AIzaSyBz3iqZUfH9krFed9a_bSTBwjh_XIaOeRE",
  authDomain: "yog-ava-tho.firebaseapp.com",
  projectId: "yog-ava-tho",
  storageBucket: "yog-ava-tho.firebasestorage.app",
  messagingSenderId: "882855433461",
  appId: "1:882855433461:web:9f5c79b184070a7549a1bc",
  measurementId: "G-LS1K2MT8LW"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Администратор
const ADMIN_EMAIL = "wuallar@gmail.com";

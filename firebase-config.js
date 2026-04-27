import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyChy6Klf0xWdLGe81hROQJcVmhmaF61O5g",
  authDomain: "brain-gain-e31ad.firebaseapp.com",
  projectId: "brain-gain-e31ad",
  storageBucket: "brain-gain-e31ad.firebasestorage.app",
  messagingSenderId: "392952330040",
  appId: "1:392952330040:web:da9e8a8d4348d8c0f433cd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
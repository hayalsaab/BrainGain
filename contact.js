import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const form = document.getElementById("contactForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    gender: document.getElementById("gender").value,
    phone: document.getElementById("mobile").value.trim(),
    birthDate: document.getElementById("dateOfBirth").value,
    email: document.getElementById("email").value.trim(),
    language: document.getElementById("language").value,
    suggestion: document.getElementById("message").value.trim(),
    createdAt: serverTimestamp()
  };


console.log(data);

  try {
    await addDoc(collection(db, "contactSuggestions"), data);
    alert("تم الإرسال بنجاح ✅");
    form.reset();
  } catch (error) {
    console.error("Firestore error:", error);
    alert("حدث خطأ أثناء الإرسال ❌");
  }
});
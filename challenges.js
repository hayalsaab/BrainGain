import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

async function loadDailyChallenges() {
  const today = new Date().toLocaleDateString("en-CA");

  const dailyRef = doc(db, "dailyChallenges", today);
  const dailySnap = await getDoc(dailyRef);

  // ✅ إذا موجودة خلاص
  if (dailySnap.exists()) {
    return dailySnap.data().challengeIds;
  }

  // ❗ إذا مو موجودة → نسويها الآن
  const snapshot = await getDocs(collection(db, "challenges"));

  const allChallenges = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.isActive) {
      allChallenges.push({ id: doc.id, ...data });
    }
  });

  const shuffled = allChallenges.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  await setDoc(dailyRef, {
    date: today,
    challengeIds: selected.map(c => c.id),
    createdAt: new Date()
  });

  return selected.map(c => c.id);
}
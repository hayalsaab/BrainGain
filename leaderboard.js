console.log("leaderboard working");

import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const playerNameInput = document.getElementById("playerName");
const leaderboardList = document.getElementById("leaderboardList");
const countdownEl = document.getElementById("winnerCountdown");
const currentRankEl = document.getElementById("currentRank");
const rankNoteEl = document.getElementById("rankNote");

const RESET_KEY = "globalResetTime";
const RESET_TIME = 24 * 60 * 60 * 1000;// دقيقة للاختبار

let start = localStorage.getItem(RESET_KEY);

if (!start) {
  start = Date.now();
  localStorage.setItem(RESET_KEY, start);
}

let today = String(Math.floor(Number(start) / RESET_TIME));

async function loadLeaderboard() {
  if (!leaderboardList) return;

  try {
    const q = query(
      collection(db, "challengeWinners"),
      where("date", "==", today)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      leaderboardList.innerHTML = "No winners yet.";

      if (currentRankEl) currentRankEl.textContent = "#0";
      if (rankNoteEl) {
        rankNoteEl.textContent = "You completed 0 of 3 challenges today.";
      }

      return;
    }

    const winners = [];

    snapshot.forEach((doc) => {
      winners.push(doc.data());
    });

    winners.sort((a, b) => {
      return (a.finishTime || 9999) - (b.finishTime || 9999);
    });

    let html = "";

    winners.slice(0, 3).forEach((winner, index) => {
      const rank = index + 1;
      const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
      const time = winner.finishTime || 0;

      html += `
        <div class="winner-row">
          <div class="winner-medal">${medal}</div>

          <div class="winner-info">
            <strong>${winner.name}</strong>
            <span>3 completed challenges</span>
          </div>

          <div class="winner-points">${time}s</div>
        </div>
      `;
    });

    leaderboardList.innerHTML = html;

    if (currentRankEl && rankNoteEl) {
      const savedName = localStorage.getItem("playerName");

      const myIndex = winners.findIndex((winner) => {
        return winner.name && winner.name.toLowerCase() === savedName;
      });

      if (myIndex !== -1) {
        currentRankEl.textContent = `#${myIndex + 1}`;
        rankNoteEl.textContent = "You completed 3 of 3 challenges today.";
      } else {
        currentRankEl.textContent = "#0";
        rankNoteEl.textContent = "Complete today’s challenges to join the ranking.";
      }
    }

  } catch (error) {
    console.error("Leaderboard error:", error);

    if (leaderboardList) {
      leaderboardList.innerHTML = "Failed to load winners.";
    }
  }
}

async function submitWinner() {
  if (!playerNameInput) return;

  const name = playerNameInput.value.trim();

  if (!name) {
    alert("Please enter your name first");
    return;
  }

  localStorage.setItem("playerName", name.toLowerCase());

  const q = query(
    collection(db, "challengeWinners"),
    where("date", "==", today),
    where("name", "==", name)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    loadLeaderboard();
    return;
  }

  const startTime = Number(localStorage.getItem(RESET_KEY));
  const finishTime = Math.floor((Date.now() - startTime) / 1000);

  await addDoc(collection(db, "challengeWinners"), {
    name: name,
    date: today,
    finishTime: finishTime,
    createdAt: serverTimestamp()
  });

  alert("Congratulations! You are added to today's winners 🏆");

  loadLeaderboard();
}

function updateCountdown() {
  const startTime = Number(localStorage.getItem(RESET_KEY));
  const now = Date.now();

  const passed = now - startTime;
  const remaining = RESET_TIME - passed;
  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));

const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
const seconds = String(totalSeconds % 60).padStart(2, "0");

if (countdownEl) {
  countdownEl.textContent = `Next reset in: ${hours}:${minutes}:${seconds}`;
}
  if (remaining <= 0) {
    localStorage.setItem(RESET_KEY, now);
    location.reload();
  }
}

window.addEventListener("allChallengesCompleted", submitWinner);

loadLeaderboard();
updateCountdown();
setInterval(updateCountdown, 1000);
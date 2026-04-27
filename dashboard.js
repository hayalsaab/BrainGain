import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const tableBody = document.getElementById("dashboardTableBody");
const totalMessages = document.getElementById("totalMessages");
const maleCount = document.getElementById("maleCount");
const femaleCount = document.getElementById("femaleCount");
const dashboardMessage = document.getElementById("dashboardMessage");

async function loadDashboardData() {
  try {
    const q = query(
      collection(db, "contactSuggestions"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    let total = 0;
    let male = 0;
    let female = 0;
    let rows = "";

    if (querySnapshot.empty) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8">No data found.</td>
        </tr>
      `;
      dashboardMessage.textContent = "No messages have been submitted yet.";
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      total++;

      if (data.gender === "male") male++;
      if (data.gender === "female") female++;

      rows += `
        <tr>
          <td>${data.firstName || "-"}</td>
          <td>${data.lastName || "-"}</td>
          <td>${data.gender || "-"}</td>
          <td>${data.phone || "-"}</td>
          <td>${data.birthDate || "-"}</td>
          <td>${data.email || "-"}</td>
          <td>${data.language || "-"}</td>
          <td>${data.suggestion || "-"}</td>
        </tr>
      `;
    });

    tableBody.innerHTML = rows;
    totalMessages.textContent = total;
    maleCount.textContent = male;
    femaleCount.textContent = female;

    dashboardMessage.textContent = `Loaded ${total} message(s) successfully.`;
    dashboardMessage.classList.add("success");
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="8">Failed to load data.</td>
      </tr>
    `;
    dashboardMessage.textContent = "Error loading dashboard data from Firebase.";
    dashboardMessage.classList.remove("success");
  }
}

loadDashboardData();
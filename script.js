const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav a");
const currentPage = document.body.dataset.page;

if (menuBtn && navMenu) {
  menuBtn.addEventListener("click", () => {
    navMenu.classList.toggle("show");
    const expanded = navMenu.classList.contains("show");
    menuBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
  });
}

navLinks.forEach((link) => {
  if (link.dataset.nav === currentPage) {
    link.classList.add("active");
  }

  link.addEventListener("click", () => {
    if (navMenu) navMenu.classList.remove("show");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  });
});

const challengeList = document.getElementById("challengeList");
const completedCountEl = document.getElementById("completedCount");
const progressFill = document.getElementById("progressFill");
const progressPercentEl = document.getElementById("progressPercent");
const messageBox = document.getElementById("messageBox");
const completedNote = document.getElementById("completedNote");
const todayDateText = document.getElementById("todayDateText");

if (challengeList && completedCountEl && progressFill && messageBox) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = "dailyChallengeState";

  const challengePool = [
    { id: 1, icon: "🙌", title: "Say one positive thing to yourself", category: "Mindset" },
    { id: 2, icon: "📚", title: "Read 15 pages", category: "Learning" },
    { id: 3, icon: "🚶", title: "Walk 20 minutes", category: "Health" },
    { id: 4, icon: "💧", title: "Drink 8 glasses of water", category: "Wellness" },
    { id: 5, icon: "📝", title: "Write three things you are grateful for", category: "Mindset" },
    { id: 6, icon: "🎧", title: "Listen to a useful podcast for 10 minutes", category: "Learning" },
    { id: 7, icon: "🧘", title: "Take 5 minutes to breathe and reset", category: "Wellness" },
    { id: 8, icon: "🥗", title: "Choose one healthy meal today", category: "Health" },
    { id: 9, icon: "📖", title: "Learn one new word and use it", category: "Learning" }
  ];

  function seededSelection(pool, count) {
    const seed = todayKey
      .split("-")
      .join("")
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);

    const items = [...pool];

    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = (seed * (i + 3) + i) % (i + 1);
      [items[i], items[j]] = [items[j], items[i]];
    }

    return items.slice(0, count).map((item) => ({ ...item, completed: false }));
  }

  function loadState() {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");

    if (!saved || saved.date !== todayKey || !Array.isArray(saved.challenges)) {
      return { date: todayKey, challenges: seededSelection(challengePool, 3), winnerSubmitted: false };
    }

    if (saved.winnerSubmitted === undefined) {
      saved.winnerSubmitted = false;
    }

    return saved;
  }

  let state = loadState();

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function formatTodayDate() {
    const now = new Date();

    return now
      .toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      })
      .replace(/, (\d{4})$/, ",\n$1")
      .replace(", ", ",\n");
  }

  function getMessage(completedCount) {
    if (completedCount === 3) {
      return { text: "Amazing! You completed every challenge for today.", success: true };
    }

    if (completedCount === 2) {
      return { text: "So close! Just one more challenge to finish the day strong.", success: false };
    }

    if (completedCount === 1) {
      return { text: "Nice start! Keep going and complete another one.", success: false };
    }

    return { text: "Ready to start? Pick a challenge and make today count.", success: false };
  }

  function getProgressColor(progress) {
    if (progress >= 100) return "#22c55e";
    if (progress >= 50) return "#fbbf24";
    return "#ef4444";
  }

  function getIconClass() {
    return "blue";
  }

  function renderChallenges() {
    const completedCount = state.challenges.filter((item) => item.completed).length;

    if (completedCount === 3 && !state.winnerSubmitted) {
      state.winnerSubmitted = true;
      saveState();
      window.dispatchEvent(new Event("allChallengesCompleted"));
    }

    const progress = Math.round((completedCount / state.challenges.length) * 100);
    const progressColor = getProgressColor(progress);

    if (todayDateText) {
      todayDateText.innerHTML = formatTodayDate().replace(/\n/g, "<br>");
    }

    completedCountEl.textContent = completedCount;

    if (progressPercentEl) {
      progressPercentEl.textContent = `${progress}%`;
      progressPercentEl.style.color = progressColor;
    }

    if (completedNote) {
      if (completedCount === 0) completedNote.textContent = "Not started yet";
      else if (completedCount === 3) completedNote.textContent = "All done today";
      else completedNote.textContent = `${completedCount} of 3 completed`;
    }

    progressFill.style.width = `${progress}%`;
    progressFill.style.background = progressColor;

    const currentMessage = getMessage(completedCount);
    messageBox.textContent = currentMessage.text;
    messageBox.classList.toggle("success", currentMessage.success);

    challengeList.innerHTML = "";

    state.challenges.forEach((challenge) => {
      const article = document.createElement("article");
      article.className = `challenge-item ${challenge.completed ? "completed" : ""}`;

      article.innerHTML = `
        <div class="challenge-main">
          <div class="icon ${getIconClass(challenge.category)}">${challenge.icon}</div>
          <div class="challenge-text">
            <h3 class="challenge-title">${challenge.title}</h3>
            <span class="challenge-badge">${challenge.category}</span>
          </div>
        </div>
        <button class="btn complete-btn ${challenge.completed ? "done" : ""}" data-id="${challenge.id}">
          ${challenge.completed ? "Completed" : "Complete"}
        </button>
      `;

      challengeList.appendChild(article);
    });

    document.querySelectorAll(".complete-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.getAttribute("data-id"));
        const target = state.challenges.find((item) => item.id === id);

        if (!target) return;

        target.completed = !target.completed;
        saveState();
        renderChallenges();
      });
    });
  }

  saveState();
  renderChallenges();
}

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  const fields = {
    firstName: {
      input: document.getElementById("firstName"),
      validate: (value) =>
        /^[A-Za-z\s]{2,}$/.test(value.trim()) ? "" : "Enter a valid first name"
    },
    lastName: {
      input: document.getElementById("lastName"),
      validate: (value) =>
        /^[A-Za-z\s]{2,}$/.test(value.trim()) ? "" : "Enter a valid last name"
    },
    gender: {
      input: document.getElementById("gender"),
      validate: (value) => (value ? "" : "Please select gender")
    },
    mobile: {
      input: document.getElementById("mobile"),
      validate: (value) =>
        /^05\d{8}$/.test(value.trim()) ? "" : "Enter a valid mobile number"
    },
    dateOfBirth: {
      input: document.getElementById("dateOfBirth"),
      validate: (value) => {
        if (!value) return "Please select date of birth";

        const selectedDate = new Date(value);
        const today = new Date();

        if (selectedDate > today) return "Date of birth cannot be in the future";

        return "";
      }
    },
    email: {
      input: document.getElementById("email"),
      validate: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
          ? ""
          : "Enter a valid email address"
    },
    language: {
      input: document.getElementById("language"),
      validate: (value) => (value ? "" : "Please select a language")
    },
    message: {
      input: document.getElementById("message"),
      validate: (value) =>
        value.trim().length >= 10 ? "" : "Message must be at least 10 characters"
    }
  };

  function ensureErrorElement(input) {
    let error = input.parentElement.querySelector(".error-text");

    if (!error) {
      error = document.createElement("div");
      error.className = "error-text";
      input.parentElement.appendChild(error);
    }

    return error;
  }

  function showValidation(name) {
    const field = fields[name];

    if (!field || !field.input) return true;

    const value = field.input.value;
    const message = field.validate(value);
    const errorEl = ensureErrorElement(field.input);

    if (message) {
      field.input.classList.add("invalid");
      field.input.classList.remove("valid");
      errorEl.textContent = message;
      return false;
    }

    field.input.classList.remove("invalid");
    field.input.classList.add("valid");
    errorEl.textContent = "";
    return true;
  }

  Object.keys(fields).forEach((name) => {
    const { input } = fields[name];

    if (!input) return;

    if (name === "mobile") {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "").slice(0, 10);
        showValidation(name);
      });
    } else {
      input.addEventListener("input", () => showValidation(name));
    }

    input.addEventListener("blur", () => showValidation(name));
  });

  contactForm.addEventListener("submit", (event) => {
    const allValid = Object.keys(fields).every((name) => showValidation(name));

    if (!allValid) {
      event.preventDefault();
    }
  });
}

// ===== RESET CHALLENGES WITH GLOBAL TIMER =====
const RESET_KEY = "globalResetTime";
const RESET_TIME = 24 * 60 * 60 * 1000; // 24 hours 

setInterval(() => {
  const startTime = Number(localStorage.getItem(RESET_KEY));
  const now = Date.now();

  if (!startTime) {
    localStorage.setItem(RESET_KEY, now);
    return;
  }

  const passed = now - startTime;

  if (passed >= RESET_TIME) {
    localStorage.removeItem("dailyChallengeState");
    localStorage.removeItem("playerName");

    localStorage.setItem(RESET_KEY, now);

    location.reload();
  }
}, 1000);


// ===== NAME INPUT VALIDATION =====
const nameInput = document.getElementById("playerName");
const nameError = document.getElementById("nameError");

if (nameInput) {
  nameInput.addEventListener("blur", () => {
    if (nameInput.value.trim() === "") {
      nameError.style.display = "block";
      nameInput.style.borderColor = "#ef4444";
    } else {
      nameError.style.display = "none";
      nameInput.style.borderColor = "#22c55e";
    }
  });
}
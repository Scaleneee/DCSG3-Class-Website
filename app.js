// DCSG3 is intentionally data-driven: replace data.json to update the page content.
const DATA_URL = "./data.json";

const state = {
  classData: null,
};

const getMember = (id) => state.classData.classmates.find((person) => person.id === id);

function renderClassmates(classmates) {
  const list = document.querySelector("[data-people-list]");

  list.innerHTML = classmates
    .map(
      (person, index) => `
        <article class="person-card">
          <div class="photo-frame">
            <img
              src="${person.photo}"
              alt="Portrait of ${person.name}"
              loading="lazy"
              width="400"
              height="500"
            />
          </div>
          <p class="person-index">${String(index + 1).padStart(2, "0")}</p>
          <h3>${person.name}</h3>
          <p>${person.comment}</p>
        </article>
      `,
    )
    .join("");
}

function renderGroups(groups) {
  const list = document.querySelector("[data-group-list]");

  list.innerHTML = groups
    .map(
      (group, index) => `
        <details class="group-card" ${index === 0 ? "open" : ""}>
          <summary>
            <span class="group-number">${String(index + 1).padStart(2, "0")}</span>
            <h3 class="group-title">${group.name}</h3>
            <span class="group-toggle" aria-hidden="true">+</span>
          </summary>
          <div class="group-content">
            <p class="group-comment">${group.comment}</p>
            <div class="member-stack">
              ${group.members
                .map((memberId) => {
                  const member = getMember(memberId);
                  return `
                    <div class="member-chip">
                      <img src="${member.photo}" alt="" loading="lazy" width="64" height="64" />
                      <span>${member.name}</span>
                    </div>
                  `;
                })
                .join("")}
            </div>
          </div>
        </details>
      `,
    )
    .join("");
}

function renderMemories(memories) {
  const list = document.querySelector("[data-memory-list]");

  list.innerHTML = memories
    .map(
      (memory) => `
        <figure class="memory-card">
          <div class="memory-image-wrap">
            <img src="${memory.photo}" alt="${memory.alt}" loading="lazy" width="1200" height="900" />
            <span class="memory-tag">${memory.date}</span>
          </div>
          <figcaption>
            <h3>${memory.title}</h3>
            <p>${memory.comment}</p>
          </figcaption>
        </figure>
      `,
    )
    .join("");
}

function setTheme(theme) {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  const isDark = theme === "dark";

  root.dataset.theme = theme;
  toggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
  document.querySelector('meta[name="theme-color"]').content = isDark ? "#0d0d0d" : "#ffffff";
  localStorage.setItem("dcsg3-theme", theme);
}

function setupThemeToggle() {
  const savedTheme = localStorage.getItem("dcsg3-theme");
  const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  setTheme(savedTheme || preferredTheme);
  document.querySelector(".theme-toggle").addEventListener("click", () => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
}

// Elements animate only when they approach the viewport, keeping the page light on mobile.
function setupRevealAnimation() {
  const items = document.querySelectorAll(".reveal, .person-card, .group-card, .memory-card");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -8%" },
  );

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
    observer.observe(item);
  });
}

async function initialiseSite() {
  setupThemeToggle();

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Could not load class data (${response.status})`);

    state.classData = await response.json();
    renderClassmates(state.classData.classmates);
    renderGroups(state.classData.groups);
    renderMemories(state.classData.memories);
    setupRevealAnimation();
  } catch (error) {
    console.error(error);
    document.querySelector("[data-people-list]").innerHTML =
      '<p class="noscript-message">The class list could not be loaded. Please refresh the page.</p>';
  }
}

initialiseSite();

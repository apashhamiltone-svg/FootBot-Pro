const loadBtn = document.getElementById("loadBtn");
const todayBtn = document.getElementById("todayBtn");
const statusEl = document.getElementById("status");
const matchesEl = document.getElementById("matches");
const countEl = document.getElementById("matchCount");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function render(matches) {
  countEl.textContent = `${matches.length} match(s)`;

  if (!matches.length) {
    matchesEl.innerHTML =
      "<p>Aucun match trouvé. Réessaie plus tard.</p>";
    return;
  }

  matchesEl.innerHTML = matches.map(m => `
    <article class="match">
      <p>${escapeHtml(m.competition)}</p>
      <h3>
        ${escapeHtml(m.homeTeam)}
        ${m.homeScore ?? ""} - ${m.awayScore ?? ""}
        ${escapeHtml(m.awayTeam)}
      </h3>
      <p>Date : ${new Date(m.utcDate).toLocaleString("fr-FR")}</p>
      <p>Statut : ${escapeHtml(m.status)}</p>
    </article>
  `).join("");
}

async function loadMatches(todayOnly = false) {
  loadBtn.disabled = true;
  todayBtn.disabled = true;
  statusEl.textContent = "Chargement des matchs...";

  try {
    const params = new URLSearchParams();

    if (todayOnly) {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      params.set("dateFrom", now.toISOString().slice(0, 10));
      params.set("dateTo", tomorrow.toISOString().slice(0, 10));
    }

    const response = await fetch(`/api/matches?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur de chargement.");
    }

    render(data.matches || []);
    statusEl.textContent =
      `${data.count || 0} match(s) chargé(s).`;

  } catch (error) {
    statusEl.textContent = error.message;
  } finally {
    loadBtn.disabled = false;
    todayBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", () => loadMatches(false));
todayBtn.addEventListener("click", () => loadMatches(true));

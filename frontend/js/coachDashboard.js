const API_BASE = "http://localhost:5001/api";

let performanceChart = null;

document.addEventListener("DOMContentLoaded", () => {
  checkCoachLogin();
  loadCoachDashboard();
});

function checkCoachLogin() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "coach") {
    window.location.href = "login.html";
  }
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

async function loadCoachDashboard() {
  try {
    const [statsResponse, playersResponse, performanceResponse] = await Promise.all([
      fetch(`${API_BASE}/coach/dashboard/stats`),
      fetch(`${API_BASE}/players`),
      fetch(`${API_BASE}/performance`)
    ]);

    const stats = await statsResponse.json();
    const players = await playersResponse.json();
    const performance = await performanceResponse.json();

    updateStats(stats, performance);
    renderPlayers(players);
    renderTopPlayers(players, performance);
    renderRecentActivities(players, performance);
    renderPerformanceChart(players, performance);
    renderSummary(stats, players, performance);

  } catch (error) {
    console.error("Dashboard loading error:", error);
    showDashboardError();
  }
}

function updateStats(stats, performance) {
  document.getElementById("totalPlayers").textContent = stats.total_players || 0;
  document.getElementById("averageRating").textContent = stats.average_rating || 0;
  document.getElementById("averageAttendance").textContent = `${stats.average_attendance || 0}%`;
  document.getElementById("totalGoals").textContent = stats.total_goals || 0;
}

function renderPlayers(players) {
  const table = document.getElementById("playersTable");

  if (!players || players.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="4">No players found.</td>
      </tr>
    `;
    return;
  }

  table.innerHTML = players.map(player => `
    <tr>
      <td><strong>${player.name || "Unknown"}</strong></td>
      <td>${player.age || "-"}</td>
      <td>${player.position || "Not specified"}</td>
      <td>${player.parent_id || "-"}</td>
    </tr>
  `).join("");
}

function renderTopPlayers(players, performance) {
  const container = document.getElementById("topPlayersList");

  if (!performance || performance.length === 0) {
    container.innerHTML = `<p>No performance records found.</p>`;
    return;
  }

  const playerStats = players.map(player => {
    const records = performance.filter(record => record.player_id === player.player_id);

    const avgRating = records.length > 0
      ? records.reduce((sum, record) => sum + Number(record.rating || 0), 0) / records.length
      : 0;

    const totalGoals = records.reduce((sum, record) => sum + Number(record.goals || 0), 0);

    return {
      name: player.name,
      avgRating,
      totalGoals
    };
  });

  const topPlayers = playerStats
    .filter(player => player.avgRating > 0)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 5);

  if (topPlayers.length === 0) {
    container.innerHTML = `<p>No rated players found.</p>`;
    return;
  }

  container.innerHTML = topPlayers.map((player, index) => `
    <div class="top-player-item">
      <div class="rank">${index + 1}</div>
      <div>
        <h4>${player.name}</h4>
        <p>Average Rating: ${player.avgRating.toFixed(1)} | Goals: ${player.totalGoals}</p>
      </div>
    </div>
  `).join("");
}

function renderRecentActivities(players, performance) {
  const container = document.getElementById("recentActivities");

  if (!performance || performance.length === 0) {
    container.innerHTML = `<p>No recent activities found.</p>`;
    return;
  }

  const recent = [...performance]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  container.innerHTML = recent.map(record => {
    const player = players.find(p => p.player_id === record.player_id);
    const playerName = player ? player.name : "Unknown Player";

    return `
      <div class="activity-item">
        <div class="activity-dot"></div>
        <div>
          <h4>${playerName}</h4>
          <p>
            Rating ${record.rating || 0}/5, Attendance ${record.attendance || 0}%,
            Goals ${record.goals || 0}
          </p>
          <small>${formatDate(record.date)}</small>
        </div>
      </div>
    `;
  }).join("");
}

function renderPerformanceChart(players, performance) {
  const ctx = document.getElementById("performanceChart");

  if (!ctx) return;

  const labels = players.map(player => player.name);

  const attendanceData = players.map(player => {
    const records = performance.filter(record => record.player_id === player.player_id);
    return calculateAverage(records, "attendance");
  });

  const ratingData = players.map(player => {
    const records = performance.filter(record => record.player_id === player.player_id);
    return calculateAverage(records, "rating");
  });

  const goalsData = players.map(player => {
    const records = performance.filter(record => record.player_id === player.player_id);
    return records.reduce((sum, record) => sum + Number(record.goals || 0), 0);
  });

  if (performanceChart) {
    performanceChart.destroy();
  }

  performanceChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Average Attendance (%)",
          data: attendanceData,
          backgroundColor: "rgba(37, 99, 235, 0.7)"
        },
        {
          label: "Average Rating",
          data: ratingData,
          backgroundColor: "rgba(16, 185, 129, 0.7)"
        },
        {
          label: "Total Goals",
          data: goalsData,
          backgroundColor: "rgba(245, 158, 11, 0.7)"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function renderSummary(stats, players, performance) {
  const summaryText = document.getElementById("summaryText");

  const totalPlayers = stats.total_players || players.length || 0;
  const totalRecords = performance.length || 0;
  const averageRating = stats.average_rating || 0;
  const averageAttendance = stats.average_attendance || 0;

  summaryText.innerHTML = `
    The academy currently has <strong>${totalPlayers}</strong> registered players and
    <strong>${totalRecords}</strong> performance records. The overall average rating is
    <strong>${averageRating}</strong> and the average attendance rate is
    <strong>${averageAttendance}%</strong>. This supports structured player monitoring
    and improves communication between coaches and parents.
  `;
}

function calculateAverage(records, field) {
  if (!records || records.length === 0) return 0;

  const total = records.reduce((sum, record) => {
    return sum + Number(record[field] || 0);
  }, 0);

  return Number((total / records.length).toFixed(1));
}

function formatDate(dateValue) {
  if (!dateValue) return "No date";

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-GB");
}

function showDashboardError() {
  document.getElementById("playersTable").innerHTML = `
    <tr>
      <td colspan="4">Unable to load dashboard data. Please check backend server.</td>
    </tr>
  `;

  document.getElementById("topPlayersList").innerHTML = `
    <p>Unable to load top players.</p>
  `;

  document.getElementById("recentActivities").innerHTML = `
    <p>Unable to load recent activities.</p>
  `;
}
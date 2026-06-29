const PERFORMANCE_API_URL = "http://localhost:5001/api/performance";
const PLAYERS_API_URL = "http://localhost:5001/api/players";

const performanceForm = document.getElementById("performanceForm");
const playerSelect = document.getElementById("player_id");
const dateInput = document.getElementById("date");
const attendanceInput = document.getElementById("attendance");
const goalsInput = document.getElementById("goals");
const ratingInput = document.getElementById("rating");
const feedbackInput = document.getElementById("feedback");
const performanceTableBody = document.getElementById("performanceTableBody");
const performanceSearch = document.getElementById("performanceSearch");

const totalRecords = document.getElementById("totalRecords");
const avgAttendance = document.getElementById("avgAttendance");
const avgRating = document.getElementById("avgRating");
const totalGoals = document.getElementById("totalGoals");

let allPerformanceRecords = [];
let editingPerformanceId = null;

document.addEventListener("DOMContentLoaded", function () {
  loadPlayers();
  loadPerformance();

  if (performanceSearch) {
    performanceSearch.addEventListener("input", function () {
      const searchValue = performanceSearch.value.toLowerCase();
      const filteredRecords = allPerformanceRecords.filter((record) => {
        const playerName = String(record.player_name || record.name || record.player_id).toLowerCase();
        const feedback = String(record.feedback || "").toLowerCase();

        return playerName.includes(searchValue) || feedback.includes(searchValue);
      });

      renderPerformanceTable(filteredRecords);
    });
  }
});

async function loadPlayers() {
  try {
    const response = await fetch(PLAYERS_API_URL);
    const players = await response.json();

    playerSelect.innerHTML = `<option value="">Select player</option>`;

    players.forEach((player) => {
      const option = document.createElement("option");
      option.value = player.player_id;
      option.textContent = `${player.name} (ID: ${player.player_id})`;
      playerSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading players:", error);
    alert("Players could not be loaded.");
  }
}

async function loadPerformance() {
  try {
    const response = await fetch(PERFORMANCE_API_URL);
    const records = await response.json();

    allPerformanceRecords = records || [];

    updateStats(allPerformanceRecords);
    renderPerformanceTable(allPerformanceRecords);
  } catch (error) {
    console.error("Error loading performance records:", error);

    performanceTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-message">Error loading performance records.</td>
      </tr>
    `;
  }
}

function renderPerformanceTable(records) {
  performanceTableBody.innerHTML = "";

  if (!records || records.length === 0) {
    performanceTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-message">No performance records found.</td>
      </tr>
    `;
    return;
  }

  records.forEach((record) => {
    const row = document.createElement("tr");
    const formattedDate = record.date ? record.date.toString().split("T")[0] : "";

    row.innerHTML = `
      <td>${record.performance_id}</td>
      <td>${record.player_name || record.name || record.player_id}</td>
      <td>${formattedDate}</td>
      <td>${record.attendance}%</td>
      <td>${record.goals}</td>
      <td>${record.rating}/5</td>
      <td>${record.feedback || ""}</td>
      <td>
        <div class="action-buttons">
          <button class="edit-btn" onclick="editPerformance(${record.performance_id})">Edit</button>
          <button class="delete-btn" onclick="deletePerformance(${record.performance_id})">Delete</button>
        </div>
      </td>
    `;

    performanceTableBody.appendChild(row);
  });
}

function updateStats(records) {
  if (!records || records.length === 0) {
    totalRecords.textContent = "0";
    avgAttendance.textContent = "0%";
    avgRating.textContent = "0/5";
    totalGoals.textContent = "0";
    return;
  }

  const recordCount = records.length;

  const attendanceAverage =
    records.reduce((sum, record) => sum + Number(record.attendance || 0), 0) / recordCount;

  const ratingAverage =
    records.reduce((sum, record) => sum + Number(record.rating || 0), 0) / recordCount;

  const goalsTotal =
    records.reduce((sum, record) => sum + Number(record.goals || 0), 0);

  totalRecords.textContent = recordCount;
  avgAttendance.textContent = `${attendanceAverage.toFixed(1)}%`;
  avgRating.textContent = `${ratingAverage.toFixed(1)}/5`;
  totalGoals.textContent = goalsTotal;
}

performanceForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const performanceData = {
    player_id: Number(playerSelect.value),
    date: dateInput.value,
    attendance: Number(attendanceInput.value),
    goals: Number(goalsInput.value),
    rating: Number(ratingInput.value),
    feedback: feedbackInput.value
  };

  try {
    if (editingPerformanceId) {
      await fetch(`${PERFORMANCE_API_URL}/${editingPerformanceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(performanceData)
      });

      alert("Performance updated successfully!");
    } else {
      await fetch(PERFORMANCE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(performanceData)
      });

      alert("Performance added successfully!");
    }

    resetForm();
    loadPerformance();
  } catch (error) {
    console.error("Error saving performance:", error);
    alert("Something went wrong while saving performance.");
  }
});

function editPerformance(performanceId) {
  const record = allPerformanceRecords.find(
    (item) => Number(item.performance_id) === Number(performanceId)
  );

  if (!record) {
    alert("Performance record could not be found.");
    return;
  }

  const formattedDate = record.date ? record.date.toString().split("T")[0] : "";

  editingPerformanceId = record.performance_id;

  playerSelect.value = record.player_id;
  dateInput.value = formattedDate;
  attendanceInput.value = record.attendance;
  goalsInput.value = record.goals;
  ratingInput.value = record.rating;
  feedbackInput.value = record.feedback || "";

  const saveButton = performanceForm.querySelector(".save-btn");
  if (saveButton) {
    saveButton.textContent = "Update Performance";
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

async function deletePerformance(performanceId) {
  const confirmDelete = confirm("Are you sure you want to delete this performance record?");

  if (!confirmDelete) {
    return;
  }

  try {
    await fetch(`${PERFORMANCE_API_URL}/${performanceId}`, {
      method: "DELETE"
    });

    alert("Performance deleted successfully!");
    loadPerformance();
  } catch (error) {
    console.error("Error deleting performance:", error);
    alert("Something went wrong while deleting performance.");
  }
}

function resetForm() {
  editingPerformanceId = null;

  playerSelect.value = "";
  dateInput.value = "";
  attendanceInput.value = "";
  goalsInput.value = "";
  ratingInput.value = "";
  feedbackInput.value = "";

  const saveButton = performanceForm.querySelector(".save-btn");
  if (saveButton) {
    saveButton.textContent = "Save Performance";
  }
}
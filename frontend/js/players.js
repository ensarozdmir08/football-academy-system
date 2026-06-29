const API_URL = "http://localhost:5001/api/players";

const playerForm = document.getElementById("playerForm");
const playerIdInput = document.getElementById("playerId");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const parentIdInput = document.getElementById("parent_id");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const playersTableBody = document.getElementById("playersTableBody");
const searchInput = document.getElementById("searchInput");
const formTitle = document.getElementById("formTitle");

let allPlayers = [];

document.addEventListener("DOMContentLoaded", function () {
  checkCoachLogin();
  loadPlayers();
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

async function loadPlayers() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Players could not be loaded.");
    }

    allPlayers = await response.json();

    updatePlayerStats(allPlayers);
    renderPlayers(allPlayers);
  } catch (error) {
    console.error("Error loading players:", error);
    playersTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-message">Error loading players. Please check backend server.</td>
      </tr>
    `;
  }
}

function renderPlayers(players) {
  playersTableBody.innerHTML = "";

  if (!players || players.length === 0) {
    playersTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-message">No players found.</td>
      </tr>
    `;
    return;
  }

  players.forEach((player) => {
    const initials = getInitials(player.name);
    const position = getPlayerPosition(player);
    const positionClass = getPositionClass(position);

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <div class="player-cell">
          <div class="player-avatar">${initials}</div>
          <div>
            <strong>${player.name}</strong>
            <p class="muted-text">Player ID: ${player.player_id}</p>
          </div>
        </div>
      </td>

      <td>${player.age}</td>

      <td>
        <span class="position-badge ${positionClass}">${position}</span>
      </td>

      <td>
        <strong>${player.parent_username || "Unknown Parent"}</strong>
        <p class="muted-text">Parent ID: ${player.parent_id}</p>
      </td>

      <td>
        <div class="action-buttons">
          <button onclick="viewPerformance(${player.player_id})" class="view-btn">View</button>
          <button onclick="editPlayer(${player.player_id})" class="edit-btn">Edit</button>
          <button onclick="deletePlayer(${player.player_id})" class="delete-btn">Delete</button>
        </div>
      </td>
    `;

    playersTableBody.appendChild(row);
  });
}

function updatePlayerStats(players) {
  const playersCount = document.getElementById("playersCount");
  const parentsCount = document.getElementById("parentsCount");
  const averageAge = document.getElementById("averageAge");

  const uniqueParents = new Set(players.map((player) => player.parent_id).filter(Boolean));

  const ageTotal = players.reduce((sum, player) => sum + Number(player.age || 0), 0);
  const avgAge = players.length > 0 ? (ageTotal / players.length).toFixed(1) : 0;

  if (playersCount) playersCount.textContent = players.length;
  if (parentsCount) parentsCount.textContent = uniqueParents.size;
  if (averageAge) averageAge.textContent = avgAge;
}

if (searchInput) {
  searchInput.addEventListener("input", function () {
    const searchValue = searchInput.value.toLowerCase();

    const filteredPlayers = allPlayers.filter((player) => {
      return (
        String(player.name || "").toLowerCase().includes(searchValue) ||
        String(player.age || "").includes(searchValue) ||
        String(player.parent_id || "").includes(searchValue) ||
        String(player.parent_username || "").toLowerCase().includes(searchValue)
      );
    });

    renderPlayers(filteredPlayers);
  });
}

playerForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const playerData = {
    name: nameInput.value.trim(),
    age: Number(ageInput.value),
    parent_id: Number(parentIdInput.value)
  };

  if (!playerData.name || !playerData.age || !playerData.parent_id) {
    alert("Please fill in all player details.");
    return;
  }

  const playerId = playerIdInput.value;

  try {
    let response;

    if (playerId) {
      response = await fetch(`${API_URL}/${playerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(playerData)
      });
    } else {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(playerData)
      });
    }

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "Player could not be saved.");
      return;
    }

    if (playerId) {
      alert("Player updated successfully!");
    } else {
      alert("Player added successfully!");
    }

    resetForm();
    await loadPlayers();
  } catch (error) {
    console.error("Error saving player:", error);
    alert("Something went wrong while saving the player.");
  }
});

function editPlayer(playerId) {
  const player = allPlayers.find((item) => Number(item.player_id) === Number(playerId));

  if (!player) {
    alert("Player could not be found.");
    return;
  }

  playerIdInput.value = player.player_id;
  nameInput.value = player.name;
  ageInput.value = player.age;
  parentIdInput.value = player.parent_id;

  formTitle.textContent = "Update Player";
  submitBtn.textContent = "Update Player";
  cancelBtn.style.display = "inline-block";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

async function deletePlayer(playerId) {
  const confirmDelete = confirm("Are you sure you want to delete this player?");

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${playerId}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "Player could not be deleted.");
      return;
    }

    alert("Player deleted successfully!");
    await loadPlayers();
  } catch (error) {
    console.error("Error deleting player:", error);
    alert("Something went wrong while deleting the player.");
  }
}

function viewPerformance(playerId) {
  localStorage.setItem("selectedPlayerId", playerId);
  window.location.href = "performance.html";
}

cancelBtn.addEventListener("click", resetForm);

function resetForm() {
  playerIdInput.value = "";
  nameInput.value = "";
  ageInput.value = "";
  parentIdInput.value = "";

  formTitle.textContent = "Add New Player";
  submitBtn.textContent = "Add Player";
  cancelBtn.style.display = "none";
}

function getInitials(name) {
  if (!name) return "?";

  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function getPlayerPosition(player) {
  const positions = ["Forward", "Midfielder", "Defender", "Goalkeeper"];
  const index = Number(player.player_id || 0) % positions.length;
  return positions[index];
}

function getPositionClass(position) {
  if (position === "Forward") return "forward";
  if (position === "Midfielder") return "midfielder";
  if (position === "Defender") return "defender";
  if (position === "Goalkeeper") return "goalkeeper";
  return "";
}
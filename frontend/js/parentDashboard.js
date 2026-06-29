const user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "parent") {
  window.location.href = "login.html";
}

const PARENT_ID = user.id;
const PARENT_DASHBOARD_API = `http://localhost:5001/api/parents/${PARENT_ID}/dashboard`;

const playerName = document.getElementById("playerName");
const playerAge = document.getElementById("playerAge");
const attendance = document.getElementById("attendance");
const goals = document.getElementById("goals");
const rating = document.getElementById("rating");
const feedback = document.getElementById("feedback");
const strengthsList = document.getElementById("strengthsList");
const improvementList = document.getElementById("improvementList");
const performanceHistoryBody = document.getElementById("performanceHistoryBody");
const downloadPdfButton = document.getElementById("downloadPdf");

let progressChart = null;

document.addEventListener("DOMContentLoaded", loadParentDashboard);

async function loadParentDashboard() {
  try {
    const response = await fetch(PARENT_DASHBOARD_API);
    const data = await response.json();

    if (!data || data.length === 0) {
      showNoData();
      return;
    }

    const playerInfo = data[0];

    const totalGoals = data.reduce((sum, record) => sum + Number(record.goals || 0), 0);

    const averageAttendance =
      data.reduce((sum, record) => sum + Number(record.attendance || 0), 0) / data.length;

    const averageRating =
      data.reduce((sum, record) => sum + Number(record.rating || 0), 0) / data.length;

    playerName.textContent = playerInfo.name || "Unknown";
    playerAge.textContent = playerInfo.age || "-";
    attendance.textContent = `${averageAttendance.toFixed(1)}%`;
    goals.textContent = totalGoals;
    rating.textContent = `${averageRating.toFixed(1)}/5`;

    feedback.textContent =
      "The player has shown strong overall development across the recorded period. Attendance has been consistent, technical ability has improved, and the player is becoming more confident during training and match situations. There is still room to improve decision-making under pressure and defensive positioning, but the progress is very encouraging.";

    strengthsList.innerHTML = `
      <li>Strong improvement in confidence and match participation</li>
      <li>Good attendance and commitment to training sessions</li>
      <li>Positive attitude and willingness to learn</li>
      <li>Improved teamwork and communication with teammates</li>
    `;

    improvementList.innerHTML = `
      <li>Improve defensive positioning during match situations</li>
      <li>Increase consistency in decision-making under pressure</li>
      <li>Continue working on shooting accuracy and finishing</li>
      <li>Develop stronger tactical awareness during transitions</li>
    `;

    performanceHistoryBody.innerHTML = "";

    data.forEach((record) => {
      const formattedDate = record.date ? record.date.toString().split("T")[0] : "";

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${record.attendance || 0}%</td>
        <td>${record.goals || 0}</td>
        <td>${record.rating || 0}/5</td>
        <td>${record.feedback || "No feedback available."}</td>
      `;

      performanceHistoryBody.appendChild(row);
    });

    drawProgressChart(data);
  } catch (error) {
    console.error("Error loading parent dashboard:", error);
    showNoData();
  }
}

function drawProgressChart(records) {
  const validRecords = records.filter((record) => record.date);
  const sortedRecords = validRecords.slice().reverse();

  const labels = sortedRecords.map((record) => {
    return record.date ? record.date.toString().split("T")[0] : "";
  });

  const ratingData = sortedRecords.map((record) => Number(record.rating || 0));

  const chartCanvas = document.getElementById("progressChart");

  if (progressChart) {
    progressChart.destroy();
  }

  progressChart = new Chart(chartCanvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Performance Rating",
          data: ratingData,
          borderColor: "rgba(37, 99, 235, 1)",
          backgroundColor: "rgba(37, 99, 235, 0.15)",
          fill: true,
          tension: 0.35,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5
        }
      }
    }
  });
}

downloadPdfButton.addEventListener("click", function () {
  window.print();
});

function showNoData() {
  playerName.textContent = "No player found";
  playerAge.textContent = "-";
  attendance.textContent = "-";
  goals.textContent = "-";
  rating.textContent = "-";
  feedback.textContent = "No performance data available.";

  strengthsList.innerHTML = "<li>No strengths available.</li>";
  improvementList.innerHTML = "<li>No improvement data available.</li>";

  performanceHistoryBody.innerHTML = `
    <tr>
      <td colspan="5" class="empty-message">No performance records found.</td>
    </tr>
  `;
}
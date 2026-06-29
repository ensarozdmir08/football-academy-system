const PERFORMANCE_API_URL = "http://localhost:5001/api/performance";
const PLAYERS_API_URL = "http://localhost:5001/api/players";

const reportsTableBody = document.getElementById("reportsTableBody");

const playerSelect = document.getElementById("reportPlayerSelect");
const ratingSelect = document.getElementById("reportRatingSelect");
const searchInput = document.getElementById("reportSearchInput");
const filterForm = document.getElementById("reportFilterForm");

const totalReports = document.getElementById("totalReports");
const totalPlayers = document.getElementById("totalPlayers");
const bestRating = document.getElementById("bestRating");
const reportGoals = document.getElementById("reportGoals");

let allReports = [];

document.addEventListener("DOMContentLoaded", () => {
    loadPlayers();
    loadReports();
});

async function loadPlayers() {

    try{

        const response = await fetch(PLAYERS_API_URL);
        const players = await response.json();

        playerSelect.innerHTML = `
            <option value="">All Players</option>
        `;

        players.forEach(player=>{

            playerSelect.innerHTML += `
                <option value="${player.player_id}">
                    ${player.name}
                </option>
            `;

        });

    }catch(err){

        console.error(err);

    }

}

async function loadReports(){

    try{

        const response = await fetch(PERFORMANCE_API_URL);
        const reports = await response.json();

        allReports = reports;

        renderTable(reports);
        updateStatistics(reports);

    }catch(err){

        console.error(err);

    }

}

function renderTable(data){

    reportsTableBody.innerHTML = "";

    if(data.length===0){

        reportsTableBody.innerHTML=`
        <tr>
            <td colspan="7" class="empty-message">
                No report found.
            </td>
        </tr>
        `;

        return;
    }

    data.forEach(report=>{

        const date = report.date
            ? report.date.split("T")[0]
            : "";

        reportsTableBody.innerHTML += `

        <tr>

            <td>${report.performance_id}</td>

            <td>${report.player_name || report.name}</td>

            <td>${date}</td>

            <td>${report.attendance}%</td>

            <td>${report.goals}</td>

            <td>${report.rating}/5</td>

            <td>${report.feedback}</td>

        </tr>

        `;

    });

}

function updateStatistics(data){

    totalReports.textContent=data.length;

    const uniquePlayers=new Set();

    let maxRating=0;

    let goals=0;

    data.forEach(item=>{

        uniquePlayers.add(item.player_id);

        goals+=Number(item.goals);

        if(Number(item.rating)>maxRating){

            maxRating=Number(item.rating);

        }

    });

    totalPlayers.textContent=uniquePlayers.size;

    bestRating.textContent=maxRating+"/5";

    reportGoals.textContent=goals;

}

filterForm.addEventListener("submit",function(e){

    e.preventDefault();

    let filtered=[...allReports];

    if(playerSelect.value){

        filtered=filtered.filter(r=>

            Number(r.player_id)===Number(playerSelect.value)

        );

    }

    if(ratingSelect.value){

        filtered=filtered.filter(r=>

            Number(r.rating)>=Number(ratingSelect.value)

        );

    }

    if(searchInput.value){

        const text=searchInput.value.toLowerCase();

        filtered=filtered.filter(r=>

            String(r.feedback).toLowerCase().includes(text)

        );

    }

    renderTable(filtered);

    updateStatistics(filtered);

});

function resetReportFilters(){

    playerSelect.value="";

    ratingSelect.value="";

    searchInput.value="";

    renderTable(allReports);

    updateStatistics(allReports);

}
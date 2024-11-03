import { displayCharts, setupDropdownListeners } from "./playerData.js";

async function getCachedPlayers() {
    try {
        const response = await fetch('/api/cached_players');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching cache: ', error);
        return [];
    }
}

async function getDetailedPlayer(api_id) {
    try {
        const response = await fetch(`/api/detailed_data?player_api_id=${api_id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching detailed data: ', error);
        return {};
    }
}

async function displayPlayers() { 
    const cachedPlayers = await getCachedPlayers();
    if (cachedPlayers && cachedPlayers.length > 1) {
        const firstIndex = Math.floor(Math.random() * cachedPlayers.length);
        
        let secondIndex;
        do {
            secondIndex = Math.floor(Math.random() * cachedPlayers.length);
        } while (secondIndex === firstIndex);

        const playerData = [cachedPlayers[firstIndex], cachedPlayers[secondIndex]];
        const seasonDataForBothPlayers = [];

        for (let i = 0; i < 2; i++) {
            const ithPlayer = playerData[i];
            const playerApiId = ithPlayer[1]?.player_api_id;
            const playerImgSrc = `https://images.fotmob.com/image_resources/playerimages/${playerApiId}.png`;

            // Logic to display player rank
            let rank;
            const elo = ithPlayer[1]?.ELO;

            if (elo !== undefined) {
                if (elo < 300) rank = '🥉';
                else if (elo < 600) rank = '🥈';
                else if (elo < 900) rank = '🥈🥈';
                else if (elo < 1200) rank = '🥈🥈🥈';
                else if (elo < 1500) rank = '🥇';
                else if (elo < 1800) rank = '🥇🥇';
                else if (elo < 2100) rank = '🌟';
                else if (elo < 2400) rank = '💎';
                else if (elo < 2700) rank = '🔴💎';
                else if (elo < 3000) rank = '⚫💎';
                else rank = '🔮';
            } else {
                rank = 'N/A';
            }

            // Getting respective DOM Elements
            const playerImageElement = document.getElementById(`player_${i + 1}_image`);
            const playerNameElement = document.getElementById(`player_${i + 1}_name`);
            const playerCardElement = document.getElementById(`player_${i + 1}_card`);
            const otherPlayerCardElement = document.getElementById(`player_${(i === 0 ? 2 : 1)}_card`);

            const playerPositionElement = document.getElementById(`player_${i + 1}_position`);
            const playerTeamElement = document.getElementById(`player_${i + 1}_club`);

            const test = document.getElementById('test');

            // Getting Detailed Data and using it
            const detailedData = await getDetailedPlayer(playerApiId);
            const teamColour = detailedData?.primaryTeam?.teamColors?.color || 'lightgrey';
            const awayColour = detailedData?.primaryTeam?.teamColors?.colorAway || 'black';

            // Updating values for each DOM Element
            playerImageElement.onerror = function () {
                this.src = 'https://cdn.sofifa.net/player_0.svg'; // Set default image URL
            };
            playerImageElement.src = playerImgSrc;



            playerNameElement.innerHTML = `${ithPlayer[1]?.player_name || 'Player'} ${rank}`;   
            playerNameElement.style.color = 'white';
            playerCardElement.style.backgroundColor = teamColour;

            playerTeamElement.innerHTML = detailedData?.primaryTeam?.teamName || 'N/A';
            playerPositionElement.innerHTML = detailedData?.positionDescription?.primaryPosition?.label || 'N/A';

            // Add click event listener to player card for POST request
            playerCardElement.addEventListener('click', () => {
                const losingPlayer = ithPlayer === playerData[0] ? playerData[1] : playerData[0];
                const dataToSend = {
                    winning_id: ithPlayer[0],
                    winning_elo: ithPlayer[1].ELO,
                    losing_id: losingPlayer[0],
                    losing_elo: losingPlayer[1].ELO
                };
                sendCacheUpdate(dataToSend);  // Call function to send POST request

                // Adding fade-out effect 
                playerCardElement.classList.replace('animate__slower', 'animate__fast');
                otherPlayerCardElement.classList.replace('animate__slower', 'animate__fast');

                playerCardElement.classList.add('animate__fadeOut');
                otherPlayerCardElement.classList.add('animate__fadeOut');

                test.classList.toggle('opacity-100');

                

            });

            // onHover event listeners
            playerCardElement.addEventListener('mouseover', () => {
                playerCardElement.style.backgroundColor = awayColour;
                playerCardElement.style.color = teamColour;
            });

            playerCardElement.addEventListener('mouseout', () => {
                playerCardElement.style.backgroundColor = teamColour;
                playerCardElement.style.filter = "none";
            });

            // Collect the player's season data for chart display
            seasonDataForBothPlayers.push(detailedData.careerHistory?.careerItems?.senior?.seasonEntries || []);
        }

        // After processing both players, display the charts with the same y-axis max value
        const params = ['appearances', 'appearances'];
        displayCharts(seasonDataForBothPlayers[0], seasonDataForBothPlayers[1], params);

        // Call setupDropdownListeners here after rendering the players and charts
        setupDropdownListeners(seasonDataForBothPlayers[0], seasonDataForBothPlayers[1], params);

        return [cachedPlayers[firstIndex], cachedPlayers[secondIndex]];
    }
}


// Function to send POST request to /api/cache_updates
async function sendCacheUpdate(dataToSend) {
    try {
        const response = await fetch('/api/update_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });

        const result = await response.json();
    } catch (error) {
        console.error('Error sending cache update:', error);
    }
}

displayPlayers();

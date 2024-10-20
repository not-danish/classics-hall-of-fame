async function getCachedPlayers() {
    try {
        const response = await fetch('/api/cached_players');  // Wait for the fetch to resolve
        const data = await response.json();  // Wait for the response to parse as JSON
        return data;
    } catch (error) {
        console.error('Error fetching cache: ', error);
    }
  }


async function getDetailedPlayer(api_id) {
    try {
        const response = await fetch(`/api/detailed_data?player_api_id=${api_id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching detailed data: ', error);
    }
}

  async function displayPlayers() { 
    const cachedPlayers = await getCachedPlayers();
    if (cachedPlayers) {
        const firstIndex = Math.floor(Math.random() * cachedPlayers.length);
        
        let secondIndex;
        
        do {
            secondIndex = Math.floor(Math.random() * cachedPlayers.length);
        } while (secondIndex === firstIndex);

        playerData = [cachedPlayers[firstIndex], cachedPlayers[secondIndex]];


        for(var i=0; i<=1; i++){
            const ithPlayer = playerData[i];

            const playerApiId = ithPlayer[1].player_api_id;
            const playerImgSrc = `https://images.fotmob.com/image_resources/playerimages/${playerApiId}.png`;
            console.log(playerImgSrc);

            // logic to display player rank
            var rank;

            const elo = ithPlayer[1]['ELO'];

            if (0 <= elo && elo < 300) {
                rank = '🥉';
            } else if (300 <= elo && elo < 600) {
                rank = '🥈';
            }
            else if(600 <= elo && elo < 900){
                rank = '🥈🥈';
            }
            else if(900 <= elo && elo  < 1200){
                rank = '🥈🥈🥈';
            }            
            else if(1200 <= elo && elo < 1500){
                rank = '🥇';
            }            
            else if(1500 <= elo && elo < 1800){
                rank = '🥇🥇';
            }            
            else if(1800 <= elo && elo < 2100){
                rank = '🌟';
            }            
            else if(2100 <= elo && elo < 2400){
                rank = '💎';
            }            
            else if(2400 <= elo && elo < 2700){
                rank = '🔴💎';
            }            
            else if(2700 <= elo && elo < 3000){
                rank = '⚫💎';
            }            
            else if(3000 <= elo){
                rank = '🔮';
            }

            // Getting respective DOM Elements
            const playerImageElement = document.getElementById(`player_${i+1}_image`);
            const playerNameElement = document.getElementById(`player_${i+1}_name`);
            const playerCardElement = document.getElementById(`player_${i+1}_card`);
            const playerPositionElement = document.getElementById(`player_${i+1}_position`);
            const playerTeamElement = document.getElementById(`player_${i+1}_club`);


            // Getting Detailed Data and using it to work with 
            const detailedData = await getDetailedPlayer(ithPlayer[1].player_api_id);
            const teamColour = detailedData?.primaryTeam?.teamColors?.color || 'lightgrey';
            const awayColour = detailedData?.primaryTeam?.teamColors?.colorAway || 'black';
            
            console.log(detailedData);

            // Updating values for each DOM Element
            playerImageElement.onerror = function () {
                this.src = 'https://cdn.sofifa.net/player_0.svg'; // Set default image URL
            }
            playerImageElement.src = playerImgSrc;

            playerNameElement.innerHTML = `${ithPlayer[1].player_name} ${rank}`;   
            playerNameElement.style.color = 'white';
            playerCardElement.style.backgroundColor = teamColour;

            playerTeamElement.innerHTML = detailedData?.primaryTeam?.teamName || detailedData?.status;

            playerPositionElement.innerHTML = detailedData?.positionDescription?.primaryPosition?.label || 'N/A'


            // onHover 
            playerCardElement.addEventListener('mouseover', () => {
                playerCardElement.style.backgroundColor = awayColour;
                playerCardElement.style.color = teamColour;
                playerCardElement.style.filter = "blur(2px)";

            })

            playerCardElement.addEventListener('mouseout', () => {
                playerCardElement.style.backgroundColor = teamColour;
                playerCardElement.style.filter = "none";

            })

        }

        return [cachedPlayers[firstIndex], cachedPlayers[secondIndex]]
    }

  }

displayPlayers()
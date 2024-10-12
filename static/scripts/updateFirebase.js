// player 1 html elements
const p1ImageElement = document.getElementById("player_1_image");
const p1Name = document.getElementById("player_1_name");


// player 2 html elements
const p2ImageElement = document.getElementById("player_2_image");
const p2Name = document.getElementById("player_2_name");




async function getCachedPlayers() {
    try {
        const response = await fetch('/api/cached_players');  // Wait for the fetch to resolve
        const data = await response.json();  // Wait for the response to parse as JSON
        return data;
    } catch (error) {
        console.error('Error fetching cache:', error);
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
            const playerApiId = playerData[i][1]['player_api_id'];
            const playerImgSrc = `https://images.fotmob.com/image_resources/playerimages/${playerApiId}.png`;

            var rank;

            const elo = playerData[i][1]['ELO'];

            if (0 <= elo && elo < 300) {
                p1Rank = '🥉';
            } else if (300 <= elo && elo < 600) {
                p1Rank = '🥈';
            }
            else if(600 <= elo && elo < 900){
                p1Rank = '🥈🥈';
            }
            else if(900 <= elo && elo  < 1200){
                p1Rank = '🥈🥈🥈';
            }            
            else if(1200 <= elo && elo < 1500){
                p1Rank = '🥇';
            }            
            else if(1500 <= elo && elo < 1800){
                p1Rank = '🥇🥇';
            }            
            else if(1800 <= elo && elo < 2100){
                p1Rank = '🌟';
            }            
            else if(2100 <= elo && elo < 2400){
                p1Rank = '💎';
            }            
            else if(2400 <= elo && elo < 2700){
                p1Rank = '🔴💎';
            }            
            else if(2700 <= elo && elo < 3000){
                p1Rank = '⚫💎';
            }            
            else if(3000 <= elo){
                p1Rank = '🔮';
            }
            
            if(i === 0){
                p1ImageElement.onerror = function () {
                    this.src = 'https://cdn.sofifa.net/player_0.svg'; // Set default image URL
                };
                p1ImageElement.src = playerImgSrc;
                p1Name.innerHTML = `${playerData[i][1]['player_name']} ${p1Rank}`;

            }
            else {
                p2ImageElement.onerror = function () {
                    this.src = 'https://cdn.sofifa.net/player_0.svg'; // Set default image URL
                };
                p2ImageElement.src = playerImgSrc;
                p2Name.innerHTML = `${playerData[i][1]['player_name']} ${p1Rank}`;
            }
        }

        return [cachedPlayers[firstIndex], cachedPlayers[secondIndex]]
    }

  }

displayPlayers()








/* for (const button of playerButtons) {
    button.addEventListener('click', async function () {
        try {
            let players = ['player_1', 'player_2'];
            const winningPlayerID = button.id;
            const losingPlayerID = players.filter(player => player !== winningPlayerID)[0];

            const winningPlayer = button.value;
            const losingPlayer = document.getElementById(losingPlayerID).value;

            const postData = { 'winningPlayer': winningPlayer, 'losingPlayer': losingPlayer };

            const [updateResponse, playerResponse] = await Promise.all([
                fetch('/api/update_player', {
                    method: 'POST',
                    body: JSON.stringify(postData),
                    headers: { 'Content-Type': 'application/json' }
                }).then(response => response.json()),
                fetch('/api/new_player?id=' + postData['winningPlayer']).then(response => response.json())
            ]);


            const { newEloWin } = updateResponse;
            const { tierChanged } = updateResponse;

            const {player_name, player_api_id, ELO } = playerResponse;

            const losing_img = document.getElementById(`${losingPlayerID}_img`);
            const losing_name = document.getElementById(`${losingPlayerID}_name`);
            const losingElo = document.getElementById(`${losingPlayerID}_elo`);


            const winning_img = document.getElementById(`${winningPlayerID}_img`);
            const winning_name = document.getElementById(`${winningPlayerID}_name`);
            const winningRank = document.getElementById(`${winningPlayerID}_rank`);
            const winningElo = document.getElementById(`${winningPlayerID}_elo`);

            winningElo.innerHTML = newEloWin;
            losing_name.innerHTML = player_name;
            losingElo.innerHTML = ELO;

            const imgSrc = `https://images.fotmob.com/image_resources/playerimages/${player_api_id}.png`;
            losing_img.onerror = function () {
                this.src = 'https://cdn.sofifa.net/player_0.svg'; // Set default image URL
            };
            losing_img.src = imgSrc;

            if (tierChanged){
                console.log("tier changed")
                if (0 <= newEloWin && newEloWin < 300) {
                    winningRank.innerHTML = '🥉';
                } else if (300 <= newEloWin && newEloWin < 600) {
                    winningRank.innerHTML = '🥈';
                }
                else if(600 <= newEloWin && newEloWin < 900){
                    winningRank.innerHTML = '🥈🥈';
                }
                else if(900 <= newEloWin && newEloWin  < 1200){
                    winningRank.innerHTML = '🥈🥈🥈';
                }            
                else if(1200 <= newEloWin && newEloWin < 1500){
                    winningRank.innerHTML = '🥇';
                }            
                else if(1500 <= newEloWin && newEloWin < 1800){
                    winningRank.innerHTML = '🥇🥇';
                }            
                else if(1800 <= newEloWin && newEloWin < 2100){
                    winningRank.innerHTML = '🌟';
                }            
                else if(2100 <= newEloWin && newEloWin < 2400){
                    winningRank.innerHTML = '💎';
                }            
                else if(2400 <= newEloWin && newEloWin < 2700){
                    winningRank.innerHTML = '🔴💎';
                }            
                else if(2700 <= newEloWin && newEloWin < 3000){
                    winningRank.innerHTML = '⚫💎';
                }            
                else if(3000 <= newEloWin){
                    winningRank.innerHTML = '🔮';
                }
            }
        

        } catch (error) {
            console.error('Error:', error);
        }
    });
}
 */
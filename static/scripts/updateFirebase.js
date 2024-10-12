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
        
        playerOneData = cachedPlayers[firstIndex];
        playerTwoData = cachedPlayers[secondIndex];


        // Update Player 1
        const player1ApiId = playerOneData[1]['player_api_id'];
        const p1ImgSrc = `https://images.fotmob.com/image_resources/playerimages/${player1ApiId}.png`;
        p1ImageElement.onerror = function () {
                this.src = 'https://cdn.sofifa.net/player_0.svg'; // Set default image URL
            };
        p1ImageElement.src = p1ImgSrc;

        var p1Rank;
        const p1ELO = playerOneData[1]['ELO']; 

        if (0 <= p1ELO && p1ELO < 300) {
            p1Rank = '🥉';
        } else if (300 <= p1ELO && p1ELO < 600) {
            p1Rank = '🥈';
        }
        else if(600 <= p1ELO && p1ELO < 900){
            p1Rank = '🥈🥈';
        }
        else if(900 <= p1ELO && p1ELO  < 1200){
            p1Rank = '🥈🥈🥈';
        }            
        else if(1200 <= p1ELO && p1ELO < 1500){
            p1Rank = '🥇';
        }            
        else if(1500 <= p1ELO && p1ELO < 1800){
            p1Rank = '🥇🥇';
        }            
        else if(1800 <= p1ELO && p1ELO < 2100){
            p1Rank = '🌟';
        }            
        else if(2100 <= p1ELO && p1ELO < 2400){
            p1Rank = '💎';
        }            
        else if(2400 <= p1ELO && p1ELO < 2700){
            p1Rank = '🔴💎';
        }            
        else if(2700 <= p1ELO && p1ELO < 3000){
            p1Rank = '⚫💎';
        }            
        else if(3000 <= p1ELO){
            p1Rank = '🔮';
        }

        p1Name.innerHTML = `${playerOneData[1]['player_name']} ${p1Rank}`;


        // Update Player 2
        const player2ApiId = playerTwoData[1]['player_api_id'];
        const p2ImgSrc = `https://images.fotmob.com/image_resources/playerimages/${player2ApiId}.png`;
        p2ImageElement.onerror = function () {
                this.src = 'https://cdn.sofifa.net/player_0.svg'; // Set default image URL
            };
        p2ImageElement.src = p2ImgSrc;
        
        var p2Rank;
        const p2ELO = playerOneData[1]['ELO']; 

        if (0 <= p2ELO && p2ELO < 300) {
            p2Rank = '🥉';
        } else if (300 <= p2ELO && p2ELO < 600) {
            p2Rank = '🥈';
        }
        else if(600 <= p2ELO && p2ELO < 900){
            p2Rank = '🥈🥈';
        }
        else if(900 <= p2ELO && p2ELO  < 1200){
            p2Rank = '🥈🥈🥈';
        }            
        else if(1200 <= p2ELO && p2ELO < 1500){
            p2Rank = '🥇';
        }            
        else if(1500 <= p2ELO && p2ELO < 1800){
            p2Rank = '🥇🥇';
        }            
        else if(1800 <= p2ELO && p2ELO < 2100){
            p2Rank = '🌟';
        }            
        else if(2100 <= p2ELO && p2ELO < 2400){
            p2Rank = '💎';
        }            
        else if(2400 <= p2ELO && p2ELO < 2700){
            p2Rank = '🔴💎';
        }            
        else if(2700 <= p2ELO && p2ELO < 3000){
            p2Rank = '⚫💎';
        }            
        else if(3000 <= p2ELO){
            p2Rank = '🔮';
        }

        p2Name.innerHTML = `${playerTwoData[1]['player_name']} ${p2Rank}`;



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
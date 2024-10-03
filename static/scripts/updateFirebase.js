const playerButtons = document.getElementsByClassName('select-player-btn');

for (const button of playerButtons) {
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

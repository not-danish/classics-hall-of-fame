const playerButtons = document.getElementsByClassName('select-player-btn');

for (const button of playerButtons) {
    button.addEventListener('click', function(){
    if(button.id == 'player_1'){
        const winningPlayer = button.value;
        const losingPlayer = document.getElementById('player_2').value;


        const losing_img = document.getElementById('player_2_img');
        const losing_name = document.getElementById('player_2_name');


        const postData = {
            'winningPlayer': winningPlayer,
            'losingPlayer': losingPlayer
        }

        fetch('/api/update_player', {
            method: 'POST',
            body: JSON.stringify(postData),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .catch(error => {
            console.error('Error:', error);
        });
        

        fetch('/api/new_player')
        .then(function (response) {
            return response.json();
        })
        .then(function data(response){
            document.getElementById('player_2').value = response['id'];
            losing_name.innerHTML = response['player_name'];
            const imgSrc = 'https://images.fotmob.com/image_resources/playerimages/' + response['player_api_id'] + '.png';
            losing_img.onerror = function(){
                this.src = 'https://cdn.sofifa.net/player_0.svg'; // Set default image URL
            }
            losing_img.src = imgSrc;
        })


    }
    else {
        const winningPlayer = button.value;
        const losingPlayer = document.getElementById('player_1').value;


        const losing_img = document.getElementById('player_1_img');
        const losing_name = document.getElementById('player_1_name');


        const postData = {
            'winningPlayer': winningPlayer,
            'losingPlayer': losingPlayer
        }

        fetch('/api/update_player', {
            method: 'POST',
            body: JSON.stringify(postData),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .catch(error => {
            console.error('Error:', error);
        });

        fetch('/api/new_player')
        .then(function (response) {
            return response.json();
        })
        .then(function data(response){
            document.getElementById('player_1').value = response['id'];
            losing_name.innerHTML = response['player_name'];
            const imgSrc = 'https://images.fotmob.com/image_resources/playerimages/' + response['player_api_id'] + '.png';
            losing_img.onerror = function(){
                this.src = 'https://cdn.sofifa.net/player_0.svg'; // Set default image URL
            }
            losing_img.src = imgSrc;
        })


    }


    });
}

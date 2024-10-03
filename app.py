from flask import Flask, render_template, jsonify, request
import firebase_admin
from firebase_admin import credentials, db
from dotenv import load_dotenv
import os
import random
import get_player_data as pd


from flask import Flask, render_template, request, jsonify
from firebase_admin import credentials, db, initialize_app
import random

load_dotenv()  # Load environment variables from .env file

firebase_key_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')


app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate(firebase_key_path)
initialize_app(cred, {'databaseURL': os.getenv('DATABASE_URL')})

# Get a reference to the Firebase Realtime Database
firebase_db = db.reference()

# Client-side caching dictionary
player_cache = {}

def get_data_from_firebase(player_id):
    # Check if player data is already cached
    if player_id in player_cache:
        return player_cache[player_id]

    # Fetch data from Firebase if not cached
    player_data = firebase_db.child('data/players').child(player_id).get()

    # Cache the fetched data
    player_cache[player_id] = player_data

    return player_data

def update_player_elo_to_firebase(player_id, new_elo):
    player_cache[str(player_id)]['ELO'] = new_elo    
    firebase_db.child('data/players').child(str(player_id)).update({'ELO': new_elo})
    return True

def get_tier_from_elo(player_elo: int):
    tier = 0
    if 0 <= player_elo < 300:
            tier = 'Bronze'
            print(f'{tier} tier achieved!')
    elif 300 <= player_elo < 600:
            tier = 'SilverI'
            print(f'{tier} tier achieved!')
    elif 600 <= player_elo < 900:
            tier = 'SilverII'
            print(f'{tier} tier achieved!')

    elif 900 <= player_elo < 1200:
            tier = 'SilverIII'
            print(f'{tier} tier achieved!')

    elif 1200 <= player_elo < 1500:
            tier = 'GoldI'
            print(f'{tier} tier achieved!')
    elif 1500 <= player_elo < 1800:
            tier = 'GoldII'
            print(f'{tier} tier achieved!')
    elif 1800 <= player_elo < 2100:
            tier = 'Platinum'
            print(f'{tier} tier achieved!')
    elif 2100 <= player_elo < 2400:
            tier = 'Diamond'
            print(f'{tier} tier achieved!')
    elif 2400 <= player_elo < 2700:
            tier = 'Ruby'
            print(f'{tier} tier achieved!')
    elif 2700 <= player_elo < 3000:
            tier = 'Obsidian'
            print(f'{tier} tier achieved!')
    elif player_elo >= 3000:
            tier = 'Crystal'
            print(f'{tier} tier achieved!')
    return tier


def calculate_elo(winning_elo, losing_elo):
    winning_expected_score  = 1/(1+(10**((losing_elo-winning_elo)/400)))

    k = 0
    if winning_elo < 2100:
        k = 32
    elif 2100 < winning_elo < 2400:
        k = 24
    else:
        k = 16
    
    new_elo_win = int(round(winning_elo + k*(1-winning_expected_score)))
    new_elo_loss = int(round(losing_elo - k*(1-winning_expected_score)))
    return new_elo_win, new_elo_loss

'------------------'

    
@app.route('/api/new_player', methods=['GET'])
def new_player():
    player_id = request.args.get('id')

    # Get all player IDs except the current player
    all_player_ids = list(player_cache.keys())
    all_player_ids.remove(player_id)

    print(player_id)
    print("-------------")
    print(all_player_ids)

    # Select a random player ID from the remaining IDs
    random_id = random.choice(all_player_ids)

    return jsonify(get_data_from_firebase(random_id))


@app.route('/api/update_player', methods=['POST'])
def update_player():
    data = request.get_json()
    winning_player = int(data['winningPlayer'])
    losing_player = int(data['losingPlayer'])

    print(f"winning: {winning_player}, losing: {losing_player}")

    # Fetch player data from cache or Firebase
    winning_data = get_data_from_firebase(str(winning_player))
    losing_data = get_data_from_firebase(str(losing_player))

    # Calculate new Elo ratings
    new_elo_win, new_elo_loss = calculate_elo(winning_data['ELO'], losing_data['ELO'])
    print("winning elo: ", new_elo_win)
    print("losing elo: ", new_elo_loss)

    # Check if tier has changed
    old_tier = get_tier_from_elo(winning_data['ELO'])
    new_tier = get_tier_from_elo(new_elo_win)

    tier_changed = False

    if old_tier != new_tier:
        tier_changed = True
          

    # Update player Elo in Firebase
    update_player_elo_to_firebase(winning_player, new_elo_win)
    update_player_elo_to_firebase(losing_player, new_elo_loss)


    return jsonify({'Message': 'Done!', 'newEloWin': new_elo_win, 'tierChanged': tier_changed, 'tier': new_tier})


@app.route('/')
def index():
    random_numbers = random.sample(range(0, 11059 + 1), 2)
    player_1 = get_data_from_firebase(str(random_numbers[0]))
    player_2 = get_data_from_firebase(str(random_numbers[1]))
    player_1_data = pd.player_data(player_1['player_api_id'])
    player_2_data = pd.player_data(player_1['player_api_id'])

    
    return render_template("index.html", 
                           player_1 = player_1,
                           player_2 = player_2,
                           player_1_data = player_1_data,
                           player_2_data = player_2_data)

@app.route('/leaderboard')
def leaderboard():
    return render_template("leaderboard.html")


app.run(
    host="0.0.0.0", port=5000
    #debug = True, port = 3000
        )
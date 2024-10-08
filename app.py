from flask import Flask, render_template, jsonify, request
from firebase_admin import credentials, db, initialize_app
from dotenv import load_dotenv
import os
import random
import get_player_data as pd
import random
import elo
import time
import threading

load_dotenv()  # Load environment variables from .env file

firebase_key_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')

app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate(firebase_key_path)
initialize_app(cred, {'databaseURL': os.getenv('DATABASE_URL')})

# Get a reference to the Firebase Realtime Database
firebase_db = db.reference()

'''
-------------------------------------
# Cache
------------------------------------
'''

# Client-side caching dictionary with timer
player_cache = {'data': {}, 
                'time': None}
cache_updates = {}
cache_expiry_time = 300

# Updates cache with new player data every 5 minutes
def update_cache():
    while True:
        current_time = time.time()
        print(current_time)
        # Remove expired cache entries
        if player_cache['time'] == None:
            random_elo = random.randint(1300,1700)
            player_cache['data'] = fetch_players_by_elo(random_elo - 50, random_elo + 50, limit = 50)
            player_cache['time'] = current_time
            print(player_cache)
        else:
            if current_time - player_cache['time'] > cache_expiry_time:
                #firebase_db.update(cache_updates)
                random_elo = random.randint(1300,1700)
                player_cache['data'] = fetch_players_by_elo(random_elo - 50, random_elo + 50, limit = 50)
                print('NEW PLAYERS!')
                print(player_cache)
        time.sleep(60)  # Check every minute

threading.Thread(target=update_cache, daemon=True).start()


'''
-------------------------------------
# Firebase Magic
-------------------------------------
'''

def get_data_from_firebase(player_id, player_cache):
    current_time = time.time()
    
    # Check if player data is already cached
    if player_id in player_cache['data'] and (current_time - player_cache[player_id]['time']) < cache_expiry_time:
        return player_cache[player_id]
    
    if player_cache != {}:
        firebase_db.update(cache_updates)
        player_cache = {}

    # Fetch data from Firebase if not cached
    player_data = firebase_db.child('data/players').child(player_id).get()

    # Cache the fetched data
    player_cache[player_id] = {'data': player_data,
                               'time': current_time}

    return player_data

def fetch_players_by_elo(min_elo, max_elo, **kwargs):
    limit = kwargs.get('limit', None)
    players_ref = db.reference('data/players')

    if limit:
        players_data = players_ref.order_by_child('ELO').start_at(min_elo).end_at(max_elo).limit_to_last(limit).get()
    else:
        players_data = players_ref.order_by_child('ELO').start_at(min_elo).end_at(max_elo).get()

    # Convert to a list and sort it in descending order by ELO
    sorted_players = sorted(players_data.items(), key=lambda x: x[1].get('ELO', 0), reverse=True)

    return sorted_players[:limit]  # Return the top N players

'''
-------------------------------------
# API Routes for the webpage
-------------------------------------
'''

    
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

    return jsonify(get_data_from_firebase(random_id, player_cache))

@app.route('/api/leaderboard')
def test():
    return jsonify(fetch_players_by_elo(1401,1760, limit = 10))


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
    new_elo_win, new_elo_loss = elo.calculate_elo(winning_data['ELO'], losing_data['ELO'])

    # Check if tier has changed
    old_tier = elo.from_elo(winning_data['ELO'])
    new_tier = elo.get_tier_from_elo(new_elo_win)

    tier_changed = False

    if old_tier != new_tier:
        tier_changed = True
          

    # Update player Elo in Firebase
    update_player_elo_to_firebase(winning_player, new_elo_win)
    update_player_elo_to_firebase(losing_player, new_elo_loss)


    return jsonify({'Message': 'Done!', 'newEloWin': new_elo_win, 'tierChanged': tier_changed, 'tier': new_tier})

'''
--------------------------------------
 Main routes for the webpage
-------------------------------------- 
'''

@app.route('/')
def index():    
    random_numbers = random.sample(range(0, 11059 + 1), 2)
    player_1 = get_data_from_firebase(str(random_numbers[0]), player_cache)
    player_2 = get_data_from_firebase(str(random_numbers[1]), player_cache)
    player_1_data = pd.player_data(player_1['player_api_id'])
    player_2_data = pd.player_data(player_1['player_api_id'])

    return render_template("index.html",
                           player_1 = player_1,
                           player_2 = player_2,
                           player_1_data = player_1_data,
                           player_2_data = player_2_data)

@app.route('/rank')
def rank():
    random_numbers = random.sample(range(0, 11059 + 1), 2)
    player_1 = get_data_from_firebase(str(random_numbers[0]))
    player_2 = get_data_from_firebase(str(random_numbers[1]))
    player_1_data = pd.player_data(player_1['player_api_id'])
    player_2_data = pd.player_data(player_1['player_api_id'])

    return render_template("rank.html",
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
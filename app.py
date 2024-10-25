from flask import Flask, render_template, jsonify, request
from firebase_admin import credentials, db, initialize_app
from dotenv import load_dotenv
import os
import random
import random
import elo
import time
import threading
import requests
import json

load_dotenv()  # Load environment variables from .env file

firebase_key_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')

app = Flask(__name__)


'''
-------------------------------------
# Firebase Magic
-------------------------------------
'''

# Initialize Firebase Admin SDK
cred = credentials.Certificate(firebase_key_path)
initialize_app(cred, {'databaseURL': os.getenv('DATABASE_URL')})

# Get a reference to the Firebase Realtime Database
firebase_db = db.reference()

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
# Cache
------------------------------------
'''

# Client-side caching dictionary with timer
player_cache = {'data': {},
                'detailed_data': {}, 
                'time': None}
cache_updates = {}
cache_expiry_time = 300

# Updates cache with new player data every 5 minutes
def update_cache():
    global cache_updates 
    
    while True:
        current_time = time.time()

        # Initialize the Cache
        if player_cache['time'] is None:
            random_elo = random.randint(1300, 1700)
            player_cache['data'] = fetch_players_by_elo(random_elo - 50, random_elo + 50, limit=50)
            player_cache['time'] = current_time

        # Cache has expired, update the firebase db with respective changes and fetch new players into the cache
        else:
            print(current_time = player_cache['time'])
            if current_time - player_cache['time'] > cache_expiry_time:
                # Updating the db
                if cache_updates:
                    firebase_db.update(cache_updates)
                    print("Updated players")
                    print(cache_updates)
                    cache_updates = {}  # Reset cache_updates after update
                
                # Fetch new players
                random_elo = random.randint(1300, 1700)
                player_cache['data'] = fetch_players_by_elo(random_elo - 50, random_elo + 50, limit=100)

        time.sleep(60)  # Check every minute


threading.Thread(target=update_cache, daemon=True).start()




'''
-------------------------------------
# API Routes for the webpage
-------------------------------------
'''

@app.route('/api/cached_players')
def cached_players():
    return jsonify(player_cache['data'])


@app.route('/api/cache_updates')
def cache_needing_to_be_updated():
    return jsonify(cache_updates)

@app.route('/api/leaderboard')
def test():
    return jsonify(fetch_players_by_elo(1401,1760, limit = 50))

@app.route('/api/update_data', methods = ["POST"])
def update_data():
    global cache_updates
    data = request.get_json()
    winning_id = data.get('winning_id')
    winning_elo = data.get('winning_elo')
    losing_id = data.get('losing_id')
    losing_elo = data.get('losing_elo')

    print(f"winning: {winning_id}, {winning_elo}, losing: {losing_id}, {losing_elo}")


    if f'data/players/{winning_id}/ELO' in cache_updates:
        winning_elo = cache_updates[f'data/players/{winning_id}/ELO']

    if f'data/players/{losing_id}/ELO' in cache_updates:
        losing_elo = cache_updates[f'data/players/{losing_id}/ELO']

    updated_elos = elo.calculate_elo(winning_elo, losing_elo)
    print(winning_elo, updated_elos[0])
    print(losing_elo, updated_elos[1])

    if not winning_id or not winning_elo or not losing_id or not losing_elo:
        return jsonify({"error": "Invalid data"}), 400

    # Update player data in the cache_updates dictionary
    cache_updates[f'data/players/{winning_id}/ELO'] = updated_elos[0]
    cache_updates[f'data/players/{losing_id}/ELO'] = updated_elos[1]

    return jsonify({"message": "Player data updated successfully"}), 200

@app.route('/api/new_elo')
def new_elo():
    winning_player = request.args.get("winning_player")
    losing_player = request.args.get("losing_player")


    old_elo_win = player_cache['data'][winning_player]['ELO']
    old_elo_loss = player_cache['data'][losing_player]['ELO']

    new_elo_win, new_elo_loss = elo.calculate_elo(old_elo_win, old_elo_loss)

    return jsonify( 
        { winning_player: { 'ELO': new_elo_win },
          losing_player: { 'ELO': new_elo_loss }
        }
    )


@app.route('/api/detailed_data')
def detailed_data():
    player_api_id = request.args.get('player_api_id')
    data_link = f'https://www.fotmob.com/api/playerData?id={player_api_id}'
    data = requests.get(data_link).text

    return json.loads(data)



'''
--------------------------------------
 Main routes for the webpage
-------------------------------------- 
'''

@app.route('/')
def index():    
    return render_template("index.html")

@app.route('/rank')
def rank():
    return render_template("rank.html")

@app.route('/leaderboard')
def leaderboard():
    return render_template("leaderboard.html")



app.run(
    host="0.0.0.0", port=5000
    #debug = True, port = 3000
        )
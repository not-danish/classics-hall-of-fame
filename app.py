from flask import Flask, render_template, url_for, jsonify, request
import firebase_admin
from firebase_admin import credentials, db
from dotenv import load_dotenv
import os
import random

load_dotenv()  # Load environment variables from .env file

firebase_key_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')

# Initialize Firebase Admin SDK
cred = credentials.Certificate(firebase_key_path)
firebase_admin.initialize_app(cred, {
    'databaseURL': os.getenv('DATABASE_URL')
})

# Get a reference to the Firebase Realtime Database
firebase_db = db.reference()

app = Flask(__name__)

def get_data_from_firebase(id):
    # Example: Read data from Firebase
    data = firebase_db.get()
    return data[id]

@app.route('/api/new_player', methods = ['GET'])
def new_player():
    random_number = random.randint(0, 11059)
    player_data = get_data_from_firebase(random_number)
    return player_data

@app.route('/api/update_player', methods = ['POST'])
def update_player():
    data = request.get_json()
    winning_player = int(data['winningPlayer'])
    losing_player = int(data['losingPlayer'])

    winning_data = get_data_from_firebase(winning_player)
    losing_data = get_data_from_firebase(losing_player)

    winning_elo = winning_data['ELO']
    losing_elo = losing_data['ELO']

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


    # Updating new Elo Rating
    firebase_db.child(str(winning_player)).update({
        'ELO': new_elo_win
        })
    
    firebase_db.child(str(losing_player)).update({
        'ELO': new_elo_loss
        })

    return {'Message':'Done!'}


@app.route('/')
def index():
    random_numbers = random.sample(range(0, 11059 + 1), 2)
    player_1 = get_data_from_firebase(random_numbers[0])
    player_2 = get_data_from_firebase(random_numbers[1])
    
    return render_template("index.html", 
                           player_1 = player_1,
                           player_2 = player_2)

@app.route('/leaderboard')
def leaderboard():
    return render_template("leaderboard.html")


app.run(
    host="0.0.0.0", port=5000
    #debug = True, port = 3000
        )
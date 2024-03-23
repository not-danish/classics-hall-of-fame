from flask import Flask, render_template, url_for, jsonify
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


def get_data_from_firebase():
    # Example: Read data from Firebase
    data = firebase_db.get()
    return data[3]

print(get_data_from_firebase())

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/leaderboard')
def leaderboard():
    return render_template("leaderboard.html")


app.run(
    host="0.0.0.0", port=5000
    #debug = True, port = 3000
        )
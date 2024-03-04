from flask import Flask, render_template, url_for

app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/leaderboard')
def leaderboard():
    return render_template("leaderboard.html")


app.run(
    host="0.0.0.0", port=5000
    #debug = True, port = 5000
        )
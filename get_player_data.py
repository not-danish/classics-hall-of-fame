import requests
import json

def player_data(player_api_id):
    data_url = f"https://www.fotmob.com/api/playerData?id={player_api_id}"
    # Loading data as json
    data = json.loads(requests.get(data_url).text)
    return data
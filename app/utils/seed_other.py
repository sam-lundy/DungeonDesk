from app.models import db
from app.models import AbilityScore
import requests
import time


MAX_RETRIES = 3
WAIT_TIME = 5   # in seconds
BASE_API_URL = "https://www.dnd5eapi.co/api"



def fetch_data(endpoint):
    retries = 0
    while retries < MAX_RETRIES:
        try:
            url = f"{BASE_API_URL}/{endpoint}"
            response = requests.get(url)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error fetching data from {url}. Error: {e}")
            retries += 1
            if retries < MAX_RETRIES:
                print(f"Retrying in {WAIT_TIME} seconds...")
                time.sleep(WAIT_TIME)
            else:
                print("Max retries reached. Skipping...")
                return None



def seed_ability_scores():
    ability_scores = [
        {"name": "STR", "full_name": "Strength"},
        {"name": "DEX", "full_name": "Dexterity"},
        {"name": "CON", "full_name": "Constitution"},
        {"name": "INT", "full_name": "Intelligence"},
        {"name": "WIS", "full_name": "Wisdom"},
        {"name": "CHA", "full_name": "Charisma"}
    ]
    
    for score in ability_scores:
        existing_score = AbilityScore.query.filter_by(name=score['name']).first()
        if not existing_score:
            new_score = AbilityScore(name=score['name'], full_name=score['full_name'])
            db.session.add(new_score)
    
    db.session.commit()

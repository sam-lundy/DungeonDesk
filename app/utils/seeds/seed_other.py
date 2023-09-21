from app.models import db
from app.models import AbilityScore, Equipment, Skill
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


def seed_equipment():
    # Fetch equipment data from the API
    response = fetch_data("equipment")

    if not response or 'results' not in response:
        print("No equipment data fetched.")
        return

    for equipment in response['results']:
        existing_equipment = Equipment.query.filter_by(name=equipment['name']).first()
        
        if not existing_equipment:
            new_equipment = Equipment(
                name=equipment['name'],
                description=equipment['index']
            )
            db.session.add(new_equipment)

    db.session.commit()


def seed_skills():
    # Fetch equipment data from the API
    response = fetch_data("skills")

    if not response or 'results' not in response:
        print("No skills data fetched.")
        return

    for skill in response['results']:
        existing_skill= Skill.query.filter_by(name=skill['name']).first()
        
        if not existing_skill:
            new_skill = Skill(
                name=skill['name'],
            )
            db.session.add(new_skill)

    db.session.commit()
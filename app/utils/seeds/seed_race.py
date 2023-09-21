from app.models import db
from app.models import Race, Language, Trait, AbilityScore, race_ability_bonuses
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


def seed_langs_and_traits():
    races = fetch_data('races')
    all_languages = set()
    all_traits = set()

    for race in races['results']:
        race_data = fetch_data('races/' + race['index'])
        for lang in race_data['languages']:
            all_languages.add((lang['name'], lang.get('description', '')))
        all_traits.update([trait['name'] for trait in race_data['traits']])
        
    for lang_name, description in all_languages:
        if not Language.query.filter_by(name=lang_name).first():
            db.session.add(Language(name=lang_name, description=description))

    for trait_name in all_traits:
        if not Trait.query.filter_by(name=trait_name).first():
            db.session.add(Trait(name=trait_name))

    db.session.commit()


def seed_races():
    races = fetch_data('races')

    for race in races['results']:
        race_data = fetch_data('races/' + race['index'])
        
        existing_race = Race.query.filter_by(name=race_data['name']).first()
        if not existing_race:
            new_race = Race(name=race_data['name'])
            db.session.add(new_race)
            db.session.flush()  # This ensures new_race gets an ID

            # Add ability bonuses for the main race
            for bonus in race_data['ability_bonuses']:
                ability_score = AbilityScore.query.filter_by(name=bonus['ability_score']['index'].upper()).first()
                if ability_score:
                    db.session.execute(race_ability_bonuses.insert().values(race_id=new_race.id, ability_score_id=ability_score.id, bonus=bonus['bonus']))
            
            # Handle subraces
            if race_data['subraces']:
                for subrace_info in race_data['subraces']:
                    subrace_data = fetch_data('subraces/' + subrace_info['index'])
                    new_subrace = Race(
                        name=subrace_data['name'],
                        parent_race_id=new_race.id  # This is where you associate the subrace with its main race
                    )
                    db.session.add(new_subrace)
                    db.session.flush()

                    # Add ability bonuses for the subrace
                    for bonus in subrace_data['ability_bonuses']:
                        ability_score = AbilityScore.query.filter_by(name=bonus['ability_score']['index'].upper()).first()
                        if ability_score:
                            db.session.execute(race_ability_bonuses.insert().values(race_id=new_subrace.id, ability_score_id=ability_score.id, bonus=bonus['bonus']))

            db.session.commit()


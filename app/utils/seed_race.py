from app.models import db
from app.models import Race, Proficiency, Language, Trait
from app.models import AbilityScore
from app.models import race_ability_bonuses
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
    language_descriptions = {}

    for race in races['results']:
        race_data = fetch_data('races/' + race['index'])
        for lang in race_data['languages']:
            all_languages.add(lang['name'])
            language_descriptions[lang['name']] = race_data['language_desc']
        all_traits.update([trait['name'] for trait in race_data['traits']])
        
    for lang_name in all_languages:
        if not Language.query.filter_by(name=lang_name).first():
            db.session.add(Language(name=lang_name, description=language_descriptions.get(lang_name)))

    for trait_name in all_traits:
        if not Trait.query.filter_by(name=trait_name).first():
            db.session.add(Trait(name=trait_name))

    db.session.commit()


def seed_proficiencies():
    # Get all races to fetch proficiencies
    races = fetch_data('races')
    
    all_proficiencies = set()
    for race in races['results']:
        race_data = fetch_data('races/' + race['index'])
        
        # Extract proficiencies
        if 'starting_proficiencies' in race_data:
            all_proficiencies.update([prof['name'] for prof in race_data['starting_proficiencies']])
        
    
    # Add proficiencies to the database
    for proficiency_name in all_proficiencies:
        if not Proficiency.query.filter_by(name=proficiency_name).first():
            db.session.add(Proficiency(name=proficiency_name))

    db.session.commit()


def process_proficiencies(race_data, race_obj):
    # Fixed Proficiencies
    if 'starting_proficiencies' in race_data:
        for prof in race_data['starting_proficiencies']:
            proficiency = Proficiency.query.filter_by(name=prof['name']).first()
            if not proficiency:
                proficiency = Proficiency(name=prof['name'])
                db.session.add(proficiency)
                db.session.commit()
            race_obj.starting_proficiencies.append(proficiency)
            db.session.commit()

    db.session.commit()

    return list(race_obj.starting_proficiencies) + list(race_obj.starting_proficiency_options)


def seed_races():
    races = fetch_data('races')

    for race in races['results']:
        race_data = fetch_data('races/' + race['index'])
        bonuses = {bonus['ability_score']['index']: bonus['bonus'] for bonus in race_data['ability_bonuses']}
        race_languages = Language.query.filter(
            Language.name.in_([lang['name'] for lang in race_data['languages']])
        ).all()
        race_traits = Trait.query.filter(
            Trait.name.in_([trait['name'] for trait in race_data['traits']])
        ).all()

        existing_race = Race.query.filter_by(name=race_data['name']).first()

        if not existing_race:
            new_race = Race(
                name=race_data['name'],
                languages=race_languages,
                traits=race_traits
            )
            db.session.add(new_race)
            db.session.flush()  # flush to get the id of the new_race without committing

            # Assign ability score bonuses
            for ability, bonus_value in bonuses.items():
                ability_score = AbilityScore.query.filter_by(name=ability.upper()).first()
                if ability_score:
                    race_ability_bonuses.insert().values(race_id=new_race.id, ability_score_id=ability_score.id, bonus=bonus_value)


            combined_proficiencies_race = process_proficiencies(race_data, new_race)
            
            if race_data['subraces']:
                new_race.has_subrace = True
                for subrace_info in race_data['subraces']:
                    subrace_data = fetch_data('subraces/' + subrace_info['index'])
                    subrace_traits = Trait.query.filter(
                        Trait.name.in_([trait['name'] for trait in subrace_data.get('racial_traits', [])])
                    ).all()
                    
                    new_subrace = Race(
                        name=subrace_data['name'],
                        parent_race_id=new_race.id,
                        languages=race_languages,
                        traits=race_traits + subrace_traits
                    )
                    db.session.add(new_subrace)
                    
                    subrace_combined_proficiencies = process_proficiencies(subrace_data, new_subrace)
                    new_subrace.starting_proficiencies = subrace_combined_proficiencies
            
            # Commit all the changes related to this race at once
            db.session.commit()

        else:
            combined_proficiencies_race = process_proficiencies(race_data, existing_race)
            # Commit the changes related to the existing race
            db.session.commit()


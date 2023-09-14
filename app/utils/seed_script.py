from app.models import db
from app.models.user import User
from app.models.character import CharacterSheet, CharacterEquipments
from app.models.equipment import Equipment
from app.models.class_model import Classes
from app.models.race import Race, Proficiency, Language, Trait
from app.models.assoc_tables import (
    race_languages, race_traits, 
    race_fixed_proficiencies, race_optional_proficiencies
)
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
        
        if 'starting_proficiency_options' in race_data:
            proficiency_options = race_data['starting_proficiency_options'].get('from', [])
            all_proficiencies.update([prof['item']['name'] for prof in proficiency_options if isinstance(prof, dict)])
    
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
            if proficiency:
                race_obj.starting_proficiencies.append(proficiency)

    # Optional Proficiencies
    if 'starting_proficiency_options' in race_data:
        proficiency_options = race_data['starting_proficiency_options'].get('from', [])
        for prof_option in proficiency_options:
            if isinstance(prof_option, dict) and 'item' in prof_option:
                proficiency = Proficiency.query.filter_by(name=prof_option['item']['name']).first()
                if proficiency:
                    race_obj.starting_proficiency_options.append(proficiency)

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
                str_bonus=bonuses.get('str', 0),
                dex_bonus=bonuses.get('dex', 0),
                con_bonus=bonuses.get('con', 0),
                int_bonus=bonuses.get('int', 0),
                wis_bonus=bonuses.get('wis', 0),
                cha_bonus=bonuses.get('cha', 0),
                languages=race_languages,
                traits=race_traits
            )
            db.session.add(new_race)
            db.session.commit()

            combined_proficiencies_race = process_proficiencies(race_data, new_race)
            new_race.starting_proficiencies = combined_proficiencies_race
            db.session.commit()
            race_id = new_race.id
        else:
            combined_proficiencies_race = process_proficiencies(race_data, existing_race)
            existing_race.starting_proficiencies = combined_proficiencies_race
            db.session.commit()
            race_id = existing_race.id

    for subrace_info in race_data['subraces']:
        subrace_data = fetch_data('subraces/' + subrace_info['index'])
        subrace_traits = Trait.query.filter(
            Trait.name.in_([trait['name'] for trait in subrace_data.get('racial_traits', [])])
        ).all()

        # Create the subrace object first without proficiencies
        new_subrace = Race(
            name=subrace_data['name'],
            parent_race_id=race_id,
            languages=race_languages,  # Assuming subraces inherit languages from the main race
            traits=race_traits + subrace_traits
        )
        db.session.add(new_subrace)
        db.session.commit()

        # Process proficiencies specific to this subrace
        subrace_combined_proficiencies = process_proficiencies(subrace_data, new_subrace)
        new_subrace.starting_proficiencies = subrace_combined_proficiencies

        db.session.commit()




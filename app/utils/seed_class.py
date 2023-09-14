from app.models import db
from app.models import Classes, ClassProficiency, AbilityScore, StartingEquipmentOption
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


def seed_class_proficiencies(class_data):
    for prof in class_data['proficiencies']:
        proficiency = ClassProficiency.query.filter_by(name=prof['name']).first()
        if not proficiency:
            proficiency = ClassProficiency(name=prof['name'])
            db.session.add(proficiency)
            db.session.commit()
    return [ClassProficiency.query.filter_by(name=prof['name']).first() for prof in class_data['proficiencies']]


def seed_ability_scores(class_data):
    return [AbilityScore.query.filter_by(name=ability['name']).first() for ability in class_data['saving_throws']]


def seed_starting_equipment_options(class_data, class_obj):
    for option in class_data.get('starting_equipment_options', []):
        desc = option.get('desc')
        new_option = StartingEquipmentOption(description=desc, class_id=class_obj.id)
        db.session.add(new_option)
    db.session.commit()


def seed_classes():
    classes_list = fetch_data('classes')  # Assuming the endpoint gives a list of all classes

    for class_info in classes_list['results']:
        class_data = fetch_data('classes/' + class_info['index'])
        
        # Seed basic class details
        existing_class = Classes.query.filter_by(name=class_data['name']).first()
        if not existing_class:
            new_class = Classes(
                name=class_data['name'],
                hit_dice=f"d{class_data['hit_die']}",
                # Assuming the description and primary_ability fields can be extracted similarly
                description=class_data.get('description', ''),
                primary_ability=class_data.get('primary_ability', '')
            )
            db.session.add(new_class)
            db.session.commit()

            # Seed proficiencies
            proficiencies = seed_class_proficiencies(class_data)
            new_class.proficiencies = proficiencies

            # Seed saving throws
            saving_throws = seed_ability_scores(class_data)
            new_class.saving_throws = saving_throws

            # Seed starting equipment options
            seed_starting_equipment_options(class_data, new_class)

            db.session.commit()

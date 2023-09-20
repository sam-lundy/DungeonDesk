from app.models import db
from app.models import Classes, AbilityScore, SubClass
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



def seed_classes():
    classes_list = fetch_data('classes')  

    for class_info in classes_list['results']:
        class_data = fetch_data('classes/' + class_info['index'])
        
        existing_class = Classes.query.filter_by(name=class_data['name']).first()
        if not existing_class:
            # Extract default proficiencies
            default_profs = [prof['name'] for prof in class_data['proficiencies']]
            # Extract saving throws
            saving_throws_list = [st['name'] for st in class_data['saving_throws']]
            
            new_class = Classes(
                name=class_data['name'],
                hit_dice=f"d{class_data['hit_die']}",
                default_proficiencies=default_profs,
                saving_throws=saving_throws_list
            )
            
            db.session.add(new_class)

            for subclass_data in class_data.get('subclasses', []):
                new_subclass = SubClass(name=subclass_data['name'], parent_class=new_class)
                db.session.add(new_subclass)

    db.session.commit()


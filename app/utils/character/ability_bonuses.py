from app.models import db, Race, race_ability_bonuses
from .ability_to_id import get_ability_name_to_id, get_id_to_ability_name


def get_race_id_by_name(race_name):
    race = Race.query.filter_by(name=race_name).first()
    if not race:
        raise ValueError(f"Race with name {race_name} not found.")
    return race.id


def fetch_racial_bonuses(race_id):
    ability_name_to_id = get_ability_name_to_id()
    id_to_ability_name = get_id_to_ability_name()
    race = Race.query.get(race_id)
    if not race:
        raise ValueError(f"Race with ID {race_id} not found.")

    # Fetch bonuses by joining with the association table
    bonuses = {}
    for row in db.session.query(race_ability_bonuses).filter(race_ability_bonuses.c.race_id == race_id).all():
        ability_name = id_to_ability_name[row.ability_score_id]
        bonuses[ability_name] = row.bonus


    # If the subrace doesn't have any bonuses associated, fetch from the parent race
    if not bonuses and race.parent_race_id:
        for row in db.session.query(race_ability_bonuses).filter(race_ability_bonuses.c.race_id == race.parent_race_id).all():
            bonuses[row.ability_score_id] = row.bonus

    return bonuses


def add_racial_bonuses_calc_mods(race_name, selected_abilities):
    # Print the selected abilities before modifications
    print("Initial Abilities:", selected_abilities)

    race_id = get_race_id_by_name(race_name)
    
    # Fetch racial bonuses based on the selected race
    racial_bonuses = fetch_racial_bonuses(race_id)

    # Print the fetched racial bonuses
    print("Racial Bonuses:", racial_bonuses)

    # Apply racial bonuses to the selected abilities
    for ability, bonus in racial_bonuses.items():
        selected_abilities[ability] += bonus
        
    # Print the modified abilities
    print("Modified Abilities:", selected_abilities)

    # Calculate the ability modifiers
    ability_modifiers = {}
    for ability, score in selected_abilities.items():
        ability_modifiers[ability] = (score - 10) // 2
        
    return selected_abilities, ability_modifiers




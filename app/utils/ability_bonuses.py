from app.models import Race


def fetch_racial_bonuses(race_id):
    race = Race.query.get(race_id)
    if not race:
        raise ValueError(f"Race with ID {race_id} not found.")

    # Fetch bonuses for the given subrace
    bonuses = {bonus.ability_score_id: bonus.bonus for bonus in race.ability_bonuses}

    # If the subrace doesn't have any bonuses associated, fetch from the parent race
    if not bonuses and race.parent_race_id:
        parent_race = Race.query.get(race.parent_race_id)
        bonuses = {bonus.ability_score_id: bonus.bonus for bonus in parent_race.ability_bonuses}

    return bonuses



def add_racial_bonuses_calc_mods(race, selected_abilities):
    # Fetch racial bonuses based on the selected race
    racial_bonuses = fetch_racial_bonuses(race)  # Implement this function to fetch from DB
    
    # Apply racial bonuses to the selected abilities
    for ability, bonus in racial_bonuses.items():
        selected_abilities[ability] += bonus
        
    # Calculate the ability modifiers
    ability_modifiers = {}
    for ability, score in selected_abilities.items():
        ability_modifiers[ability] = (score - 10) // 2
        
    return selected_abilities, ability_modifiers




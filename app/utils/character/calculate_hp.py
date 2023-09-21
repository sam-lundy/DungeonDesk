from app.models import Classes


def get_hit_die(class_name):
    class_entry = Classes.query.filter_by(name=class_name).first()
    if class_entry:
        return int(class_entry.hit_dice[1:])
    return None


def calculate_hp(character_class, character_race, character_level, constitution):
    # Step 1: Retrieve Hit Die
    # Assuming you have a function `get_hit_die` that fetches the hit die value for a given class.
    hit_die_value = get_hit_die(character_class) # This would return 8 for Cleric

    # Step 2: Calculate Constitution Modifier
    con_mod = (constitution - 10) // 2

    # Step 3: Add Racial Bonus
    racial_bonus = 1 if character_race == "Hill Dwarf" else 0

    # Step 4: Calculate Max HP
    hp = (hit_die_value + con_mod + racial_bonus) * character_level

    return hp


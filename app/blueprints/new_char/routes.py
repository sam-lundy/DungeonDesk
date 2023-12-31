from . import new_char
from flask import request, jsonify
from ...models import db, CharacterSheet, CharacterEquipments, AbilityModifiers, character_ability_values, Proficiency, CharacterProficiencies
from firebase_admin import auth
from app.utils.character.calculate_hp import calculate_hp
from app.utils.character.ability_bonuses import add_racial_bonuses_calc_mods
from app.utils.character.ability_to_id import get_ability_name_to_id, get_id_to_ability_name



@new_char.route('/save-character', methods=['POST'])
def save_character():
    data = request.json
    print(data)
    user_uid = request.headers.get('uid')
    id_to_ability_name = get_ability_name_to_id()

    existing_characters_count = CharacterSheet.query.filter_by(user_uid=user_uid).count()
    if existing_characters_count >= 4:
        return jsonify({"error": "You have reached the maximum limit of 4 characters."}), 400

    # Authorization token
    token = request.headers.get('Authorization').split('Bearer ')[1]
    decoded_token = auth.verify_id_token(token)
    uid = decoded_token['uid']

    selected_proficiencies = data.get('selectedProficiencies', [])

    # Proficiency bonus calculation
    prof_bonus = 1 + (data['level'] // 4)

    # Calculate armor class
    armor_class = (data['dexterity'] - 10) // 2 + 10

    # Calculate max HP
    max_hp = calculate_hp(data['class_name'], data['race_name'], data['level'], data['constitution'])

    try:
        final_abilities, ability_modifiers = add_racial_bonuses_calc_mods(data['race_name'], {
            'strength': data['strength'],
            'dexterity': data['dexterity'],
            'constitution': data['constitution'],
            'intelligence': data['intelligence'],
            'wisdom': data['wisdom'],
            'charisma': data['charisma']
        })


        # Create the new character entry
        new_character = CharacterSheet(
            name=data['name'],
            race_name=data['race_name'],
            class_name=data['class_name'],
            level=data['level'],
            prof_bonus=prof_bonus,
            armor_class=armor_class,
            current_hp=data.get('current_hp', max_hp),
            max_hp=max_hp,
            characterPic=data.get('profile_pic'),
            user_uid=data['user_uid']  
        )

        db.session.add(new_character)
        db.session.commit()
        character_id = new_character.id

        # Store the final abilities in the character_ability_values table
        for ability_name, value in final_abilities.items():
            ability_score_id = id_to_ability_name[ability_name]
            new_ability_value = character_ability_values.insert().values(
                character_id=character_id,
                ability_score_id=ability_score_id,
                value=value
            )
            db.session.execute(new_ability_value)


        # Add the ability modifiers
        for ability, modifier in ability_modifiers.items():
            new_modifier = AbilityModifiers(
                character_id=character_id,
                name=ability,
                value=modifier
            )
            db.session.add(new_modifier)


        selected_proficiencies = [p.split(": ")[1] if "Skill: " in p else p for p in data.get('selectedProficiencies', [])]
        for proficiency_name in selected_proficiencies:
            proficiency = Proficiency.query.filter_by(name=proficiency_name).first()
            if proficiency:
                new_character_proficiency = CharacterProficiencies(character_id=character_id, proficiency_id=proficiency.id)
                db.session.add(new_character_proficiency)

        db.session.commit()
        
    except Exception as e:
        # In case of any error, roll back the changes to maintain data integrity.
        db.session.rollback()
        return jsonify({"error": "An error occurred: " + str(e)}), 400

    return jsonify({"message": "Character saved successfully!", "characterId": character_id}), 201


@new_char.route('/save-equipment', methods=['POST'])
def save_equipment():
    data = request.json

    print("Received at /save-equipment:", data)

    # Check if data is a list and contains character_id and equipment_id
    if not isinstance(data, list) or not all('character_id' in item and 'equipment_id' in item for item in data):
        return jsonify({"message": "Invalid data format"}), 400

    try:
        for item in data:
            print(f"Processing item: {item}")
            # Create a new CharacterEquipments entry for each piece of equipment
            new_equipment = CharacterEquipments(
                character_id=item['character_id'],
                equipment_id=item['equipment_id'],
            )
            db.session.add(new_equipment)
        
        # Commit all new CharacterEquipments entries to the database
        db.session.commit()

        return jsonify({"message": "Equipment saved successfully!"}), 201

    except Exception as e:
        print(f"Error: {e}")
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500


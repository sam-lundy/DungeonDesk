from . import character
from flask import request, jsonify
from ...models import db, Equipment, CharacterSheet, AbilityScore, character_ability_values, Classes, AbilityModifiers, CharacterProficiencies
from sqlalchemy import func
from sqlalchemy.dialects import postgresql
import json


@character.route('/get-characters', methods=['GET'])
def get_characters():
    # Retrieve user_uid from the request's headers
    user_uid = request.headers.get('uid')
    
    if not user_uid:
        return jsonify({"error": "UID not provided."}), 400

    # Query the database for characters associated with the user_uid
    characters = CharacterSheet.query.filter_by(user_uid=user_uid).all()

    # Convert the list of characters to a list of dictionaries to return as JSON
    character_data = [{
        "id": character.id,
        "name": character.name,
        "imageUrl": character.characterPic or "default_image_url"  # Provide a default image URL if none exists
    } for character in characters]

    if not character_data:
        return jsonify({
        "message": "No characters found for this user.",
        "characters": []
    })

    return jsonify(character_data)


@character.route('/get-character/<int:character_id>', methods=['GET'])
def get_character(character_id):
    character = CharacterSheet.query.get(character_id)

    if not character:
        return jsonify({"error": "Character not found."}), 404

    character_class = Classes.query.filter_by(name=character.class_name).first()

    if not character_class:
        return jsonify({"error": "Class data not found for the character"}), 404

    saving_throws = character_class.saving_throws
    default_proficiencies = character_class.default_proficiencies
    
    # Fetch ability values through a join query
    ability_values_query = db.session.query(AbilityScore.name, character_ability_values.c.value).\
        join(character_ability_values, AbilityScore.id == character_ability_values.c.ability_score_id).\
        filter(character_ability_values.c.character_id == character_id)

    query_results = list(ability_values_query)
    ability_values = {row.name: row.value for row in query_results}

    ability_modifiers_query = AbilityModifiers.query.filter_by(character_id=character_id).all()
    ability_modifiers = {mod.name.lower(): mod.value for mod in ability_modifiers_query}

    character_proficiencies = CharacterProficiencies.query.filter_by(character_id=character_id).all()
    proficiency_ids = [proficiency.proficiency_id for proficiency in character_proficiencies]

    character_data = {
        "id": character.id,
        "name": character.name,
        "race_name": character.race_name,
        "class": character.class_name,
        "level": character.level,
        "background": character.background,
        "prof_bonus": character.prof_bonus,
        "inspiration": character.inspiration,
        "armor class": character.armor_class,
        "current_hp": character.current_hp,
        "max_hp": character.max_hp,
        "alignment": character.alignment,
        "abilityScores": {
            "strength": ability_values.get("STR"),
            "dexterity": ability_values.get("DEX"),
            "constitution": ability_values.get("CON"),
            "intelligence": ability_values.get("INT"),
            "wisdom": ability_values.get("WIS"),
            "charisma": ability_values.get("CHA")
        },
        "defaultProficiencies": default_proficiencies,
        "imageUrl": character.characterPic or "default_image_url",
        "saving_throws": saving_throws,
        "abilityModifiers": ability_modifiers,
        "proficiency_ids": proficiency_ids
    }

    character_data["defaultProficiencies"] = json.loads(character_data["defaultProficiencies"])
    print(character_data)
    return jsonify(character_data)



@character.route('/get-equip', methods=['POST'])
def get_equipment_ids():
    data = request.json
    if not data or "names" not in data:
        return jsonify({"error": "Invalid data provided"}), 400

    equipment_names = data['names']

    print("Received names at /get-equip:", equipment_names)

    query = Equipment.query.filter(Equipment.name.in_(equipment_names))
    print("SQL Query:", str(query))

    # Execute the query
    equipment_entries = query.all()

    # Query for equipment by name
    equipment_entries = Equipment.query.filter(Equipment.name.in_(equipment_names)).all()

    # Create a mapping of names to IDs
    equipment_mapping = {equip.name: equip.id for equip in equipment_entries}

    # Check for missing equipment and insert them
    missing_equipment = set(equipment_names) - set(equipment_mapping.keys())
    for missing in missing_equipment:
        new_equipment = Equipment(
            name=missing,
            description="Newly added item"
        )
        db.session.add(new_equipment)
    db.session.commit()

    # Query for equipment again to include newly added items
    equipment_entries = Equipment.query.filter(Equipment.name.in_(equipment_names)).all()
    equipment_mapping = {equip.name: equip.id for equip in equipment_entries}

    print("Successfully created equipment_mapping:", equipment_mapping)

    return jsonify(equipment_mapping)




@character.route('/delete-character/<int:character_id>', methods=['DELETE'])
def delete_character(character_id):
    character = CharacterSheet.query.get(character_id)
    if character:
        db.session.delete(character)
        db.session.commit()
        return jsonify({"message": "Character deleted successfully!"}), 200
    else:
        return jsonify({"error": "Character not found"}), 404


from . import character
from flask import request, jsonify
from ...models import db, Equipment, CharacterSheet, AbilityScore, character_ability_values
from sqlalchemy import func
from sqlalchemy.dialects import postgresql


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
    print(f"Accessing get_character route with ID: {character_id}")
    character = CharacterSheet.query.get(character_id)

    if not character:
        return jsonify({"error": "Character not found."}), 404
    
    # Fetch ability values through a join query
    ability_values_query = db.session.query(AbilityScore.name, character_ability_values.c.value).\
        join(character_ability_values, AbilityScore.id == character_ability_values.c.ability_score_id).\
        filter(character_ability_values.c.character_id == character_id)

    # Store results in a list
    query_results = list(ability_values_query)

    # Now create the dictionary using the stored results
    ability_values = {row.name: row.value for row in query_results}


    # Convert the character to a dictionary to return as JSON
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
        "imageUrl": character.characterPic or "default_image_url" 
    }
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


from . import character
from flask import request, jsonify
from ...models import db, Equipment, CharacterSheet
from sqlalchemy import func
from sqlalchemy.dialects import postgresql


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


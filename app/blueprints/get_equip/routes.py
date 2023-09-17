from . import get_equip
from flask import request, jsonify
from ...models import Equipment
from sqlalchemy import func

@get_equip.route('/get-equip', methods=['POST'])
def get_equipment_ids():
    data = request.json
    if not data or "names" not in data:
        return jsonify({"error": "Invalid data provided"}), 400

    equipment_names = data['names']
    # Convert names to lowercase and strip common prefixes
    equipment_names = [name.lower().replace("a ", "").replace("an ", "") for name in equipment_names]
    
    print("Received names at /get-equip:", equipment_names)

    # Query for equipment by name while converting database entries to lowercase for comparison
    equipment_entries = Equipment.query.filter(func.lower(Equipment.name).in_(equipment_names)).all()
    
    # Rest of your code...

    # Create a mapping of names to IDs
    print("About to create equipment_mapping")
    equipment_mapping = {equip.name.lower(): equip.id for equip in equipment_entries}
    print("Successfully created equipment_mapping:", equipment_mapping)

    print("Sending equipment mapping:", equipment_mapping)
    return jsonify(equipment_mapping)


from . import new_char
from flask import request, jsonify
from ...models import db, CharacterSheet, CharacterEquipments, AbilityModifiers, character_ability_values
from firebase_admin import auth
from werkzeug.utils import secure_filename
from app.utils.character.calculate_hp import calculate_hp
from app.utils.character.ability_bonuses import add_racial_bonuses_calc_mods
from app.utils.character.ability_to_id import get_ability_name_to_id, get_id_to_ability_name
import os
import boto3


S3_BUCKET = 'exionweb'
S3_KEY = os.environ.get('S3_ACCESS_KEY')
S3_SECRET = os.environ.get('S3_SECRET_KEY')
S3_LOCATION = f'http://{S3_BUCKET}.s3.amazonaws.com/'

s3 = boto3.client(
    "s3",
    aws_access_key_id=S3_KEY,
    aws_secret_access_key=S3_SECRET
)


@new_char.route('/save-character', methods=['POST'])
def save_character():
    data = request.json
    user_uid = request.headers.get('uid')
    id_to_ability_name = get_ability_name_to_id()

    existing_characters_count = CharacterSheet.query.filter_by(user_uid=user_uid).count()
    if existing_characters_count >= 4:
        return jsonify({"error": "You have reached the maximum limit of 4 characters."}), 400

    # Authorization token
    token = request.headers.get('Authorization').split('Bearer ')[1]
    decoded_token = auth.verify_id_token(token)
    uid = decoded_token['uid']

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
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


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

    db.session_commit()

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
        db.session.rollback()  # Rollback the transaction in case of errors
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500
    


@new_char.route('/character-avatar-upload', methods=['POST'])
def character_avatar_upload():
    character_id = request.headers.get('character_id')

    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if file:
        filename = secure_filename(file.filename)
        s3.upload_fileobj(
            file,
            S3_BUCKET,
            filename,
            ExtraArgs={
                "ACL": "public-read",
                "ContentType": file.content_type
            }
        )

        character = CharacterSheet.query.filter_by(id=character_id).first()
        if character:
            try:
                character.characterPic = f"{S3_LOCATION}{filename}"
                print(f"Setting characterPic for character {character.id} to {S3_LOCATION}{filename}")
                db.session.commit()
                print(f"CharacterPic for character {character.id} set and committed.")
            except Exception as e:
                print(f"Error updating characterPic for character {character_id}: {e}")
            
        return jsonify({"url": f"{S3_LOCATION}{filename}"})


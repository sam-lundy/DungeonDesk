from . import authent
from flask import request, jsonify
from app.models.user import db, User
from firebase_admin import auth
import os


@authent.route('/register', methods=['POST'])
def register():
    #Validate the JWT
    id_token = request.headers.get('Authorization').split(' ')[1]
    
    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


    if not request.json:
        return jsonify({"success": False, "error": "No JSON data provided"})
    
    data = request.json
    username = data.get('username')
    email = data.get('email')


    if not username:
        return jsonify({"success": False, "error": "Missing username in request."})
    if not email:
        return jsonify({"success": False, "error": "Missing email in request."})

    #Check if username exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"success": False, "error": "Username already taken"})
    
    #Check if email exists
    existing_email = User.query.filter_by(email=email).first()
    if existing_email:
        return jsonify({"success": False, "error": "Email address already in use."})
    

    #Store user data
    new_user = User(uid=uid, username=username, email=email)
    db.session.add(new_user)

    try:
        db.session.commit()
    except:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


    return jsonify({"success": True, "message": "User registered successfully."})
    

@authent.route('/delete_user', methods=['POST'])
def delete_user():
    data = request.json
    uid = data.get('uid')
    auth_header = request.headers.get('Authorization')
    secret_key = os.environ.get('SECRET_KEY')

    if not auth_header or auth_header.split(' ')[1] != secret_key:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    #delete user from PostgreSQL
    user_to_delete = User.query.filter_by(uid=uid).first()
    if user_to_delete:
        db.session.delete(user_to_delete)
        db.session.commit()
        return jsonify({"success": True, "message": "User deleted successfully."})
    else:
        return jsonify({"success": False, "error": "User not found."})
    

@authent.route('/get-email', methods=['GET'])
def get_email():
    username = request.args.get('username')

    if not username:
        return jsonify({"success": False, "error": "No username provided"}), 400
    
    user = User.query.filter_by(username=username).first()

    if user:
        return jsonify({"success": True, "email": user.email})
    else:
        return jsonify({"success": False, "error": "Username not found"}), 404

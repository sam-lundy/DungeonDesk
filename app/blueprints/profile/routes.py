from . import profile
from flask import request, jsonify
from ...models import db, User
from werkzeug.utils import secure_filename
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


@profile.route('/get-profile', methods=['GET'])
def get_profile():
    # Get the user's UID from the JWT or another method
    uid = request.headers.get('uid')
    user = User.query.filter_by(uid=uid).first()

    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404

    return jsonify({
        "success": True,
        "username": user.username,
        "email": user.email,
        "dateCreated": user.date_created,
        "timezone": user.timezone,
        "location": user.location,
        "bio": user.bio,
        "profile_image": user.profile_pic
    })


@profile.route('/get-username', methods=['GET'])
def get_username():
    uid = request.args.get('uid')
    user = User.query.filter_by(uid=uid).first()

    db.session.close()

    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404

    return jsonify({
        "success": True,
        "username": user.username
    })


@profile.route('/update-profile', methods=['POST'])
def update_profile():
    uid = request.headers.get('uid')
    user = User.query.filter_by(uid=uid).first()

    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404

    data = request.json
    timezone = data.get('timezone')
    location = data.get('location')
    bio = data.get('bio')
    profile_image = data.get('profile_pic')

    if timezone:
        user.timezone = timezone
    if location:
        user.location = location
    if bio:
        user.bio = bio
    if profile_image == 'default':
        user.profile_pic = f"{S3_LOCATION}default_user_icon.png"
    elif profile_image:
        user.profile_pic = profile_image
        

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Profile updated successfully."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    

@profile.route('/avatar-upload', methods=['POST'])
def avatar_upload():
    uid = request.headers.get('uid')

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

        user = User.query.filter_by(uid=uid).first()
        if user:
            try:
                user.profile_pic = f"{S3_LOCATION}{filename}"
                print(f"Setting profile_pic for user {user.uid} to {S3_LOCATION}{filename}")
                db.session.commit()
                print(f"Profile_pic for user {user.uid} set and committed.")
            except Exception as e:
                print(f"Error updating profile_pic for user {uid}: {e}")
            
        return jsonify({"url": f"{S3_LOCATION}{filename}"})



from . import files
from flask import request, jsonify
from datetime import datetime
from app.models import db, CampaignFile
from werkzeug.utils import secure_filename
import os
import boto3


# S3 Configuration
S3_BUCKET = 'exionweb'
S3_KEY = os.environ.get('S3_ACCESS_KEY')
S3_SECRET = os.environ.get('S3_SECRET_KEY')
S3_LOCATION = f'http://{S3_BUCKET}.s3.amazonaws.com/'

s3 = boto3.client(
    "s3",
    aws_access_key_id=S3_KEY,
    aws_secret_access_key=S3_SECRET
)


UPLOAD_FOLDER = '/path/to/upload/directory'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@files.route('/campaigns/<int:campaign_id>/files', methods=['GET'])
def get_campaign_files(campaign_id):
    files = CampaignFile.query.filter_by(campaign_id=campaign_id).all()
    
    # Convert the file objects to a list of URLs
    file_urls = [file.filename for file in files]
    
    return jsonify(file_urls)



@files.route('/campaigns/<int:campaign_id>/files', methods=['POST'])
def upload_campaign_file(campaign_id):

    # Validation checks
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Secure and upload the file to S3
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

    # Create a new CampaignFile entry in the database
    new_file = CampaignFile(
        campaign_id=campaign_id,
        filename=f"{S3_LOCATION}{filename}"
    )
    db.session.add(new_file)
    
    try:
        db.session.commit()
    except Exception as e:
        print(f"Error saving file entry for campaign {campaign_id}: {e}")
        return jsonify({"error": "Failed to save file entry to database"}), 500
        
    return jsonify({"url": f"{S3_LOCATION}{filename}"})


@files.route('/campaigns/files/<int:file_id>', methods=['DELETE'])
def delete_campaign_file(file_id):
    campaign_file = CampaignFile.query.get(file_id)
    
    if not campaign_file:
        return jsonify({"error": "File not found"}), 404

    # Remove file from S3
    filename = campaign_file.filename.split('/')[-1]  # Extract the filename from the URL
    s3.delete_object(Bucket=S3_BUCKET, Key=filename)
    
    # Remove file reference from the database
    db.session.delete(campaign_file)
    db.session.commit()

    return jsonify({"message": "File deleted successfully!"}), 200

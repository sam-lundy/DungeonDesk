from . import campaign
from app.models import db, Campaign, Invitation, User, CampaignStatus, CampaignFile, CharacterSheet
from flask import jsonify, request
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


@campaign.route('/campaigns', methods=['POST'])
def create_campaign():
    data = request.json

    name = data.get('name')
    description = data.get('description')
    starting_location = data.get('starting_location')
    dm_uid = data.get('dm_uid')

    if not name or not starting_location:
        return jsonify({"message": "Name and starting location are required!"}), 400

    new_campaign = Campaign(name=name, description=description, starting_location=starting_location, dm_uid=dm_uid)
    db.session.add(new_campaign)
    db.session.commit()

    return jsonify({"message": "Campaign created successfully!", "campaign_id": new_campaign.id}), 201


@campaign.route('/campaigns/<int:campaign_id>/invitations', methods=['POST'])
def invite_players(campaign_id):
    invitations = request.json.get('invitations', [])
    
    for invitee in invitations:
        user = User.query.filter((User.username == invitee) | (User.email == invitee)).first()
        if not user:
            return jsonify({"message": f"No user found with username or email '{invitee}'!"}), 400

        existing_invitation = Invitation.query.filter_by(campaign_id=campaign_id, player_uid=user.uid).first()
        if not existing_invitation:
            invitation = Invitation(campaign_id=campaign_id, player_uid=user.uid)
            db.session.add(invitation)

    db.session.commit()
    return jsonify({"message": "Invitations sent successfully!"}), 200


@campaign.route('/users/<user_uid>/invitations', methods=['GET'])
def get_user_invitations(user_uid):
    invitations = Invitation.query.filter_by(player_uid=user_uid, status="pending").all()
    return jsonify([invitation.to_dict() for invitation in invitations])


@campaign.route('/enriched-invitations', methods=['GET'])
def get_enriched_invitations():
    result = db.session.query(
        Invitation.id, 
        Campaign.name.label('campaign_name'), 
        User.username.label('dm_username'),
        Invitation.status,
        Invitation.sent_at
    ).join(
        Campaign, Campaign.id == Invitation.campaign_id
    ).join(
        User, User.uid == Campaign.dm_uid
    ).filter(
        Invitation.status == "pending"
    ).all()
    
    enriched_invitations = [r._asdict() for r in result]

    return jsonify(enriched_invitations)


@campaign.route('/invitations/<int:invitation_id>/accept', methods=['POST'])
def accept_invitation(invitation_id):
    invitation = Invitation.query.get(invitation_id)
    if not invitation:
        return jsonify({"message": "Invitation not found!"}), 404
    invitation.status = "accepted"
    # Add user to the campaign (if necessary)
    db.session.commit()
    return jsonify({"message": "Invitation accepted!"}), 200


@campaign.route('/invitations/<int:invitation_id>/decline', methods=['POST'])
def decline_invitation(invitation_id):
    invitation = Invitation.query.get(invitation_id)
    if not invitation:
        return jsonify({"message": "Invitation not found!"}), 404
    invitation.status = "declined"
    db.session.commit()
    return jsonify({"message": "Invitation declined!"}), 200


@campaign.route('/campaigns/<int:campaign_id>/accepted-invites', methods=['GET'])
def get_accepted_users(campaign_id):
    accepted_invites = Invitation.query.filter_by(campaign_id=campaign_id, status="accepted").all()
    
    users = [User.query.get(invite.player_uid) for invite in accepted_invites]
    return jsonify([user.to_dict() for user in users])


@campaign.route('/campaigns/<int:campaign_id>/status', methods=['PUT'])
def update_status(campaign_id):
    new_status = request.json.get('status')
    
    try:
        status_enum = CampaignStatus(new_status)
    except ValueError:
        return jsonify({"message": f"Invalid status value '{new_status}'!"}), 400

    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify({"message": "Campaign not found!"}), 404

    campaign.status = status_enum
    db.session.commit()

    return jsonify({"message": "Status updated successfully!"}), 200



@campaign.route('/users/<string:uid>/campaigns', methods=['GET'])
def get_user_campaigns(uid):
    try:
        user = User.query.get(uid)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Fetch all campaigns where dm_uid matches the provided uid (DMing campaigns)
        dm_campaigns = Campaign.query.filter_by(dm_uid=uid).all()

        # Fetch all campaigns the user has been invited to
        invited_campaign_ids = [invitation.campaign_id for invitation in Invitation.query.filter_by(player_uid=uid).all()]
        invited_campaigns = Campaign.query.filter(Campaign.id.in_(invited_campaign_ids)).all()

        # Merge the results
        all_campaigns = set(dm_campaigns + invited_campaigns)

        # Convert the campaigns into a list of dictionaries
        campaigns_list = [{
            "id": c.id, 
            "name": c.name, 
            "description": c.description, 
            "starting_location": c.starting_location, 
            "status": c.status.value
        } for c in all_campaigns]


        return jsonify(campaigns_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@campaign.route('/delete-campaign/<int:campaign_id>', methods=['DELETE'])
def delete_campaign(campaign_id):
    campaign = Campaign.query.get(campaign_id)
    print(request.headers)

    if not campaign:
        return jsonify({"success": False, "message": "Campaign not found"}), 404

    # Obtain the current user's UID from the JWT in the headers
    current_user_uid = request.headers.get('uid')

    print(f"DM UID from campaign: {campaign.dm_uid}")
    print(f"Current user UID from headers: {current_user_uid}")


    # Check if the current user is the DM
    if campaign.dm_uid != current_user_uid:
        return jsonify({"success": False, "message": "Unauthorized: Only the DM can delete this campaign"}), 403

    # Delete associated files from S3
    associated_files = CampaignFile.query.filter_by(campaign_id=campaign_id).all()
    for file_record in associated_files:
        filename = file_record.filename.split('/')[-1]
        try:
            s3.delete_object(Bucket=S3_BUCKET, Key=filename)
        except Exception as e:
            print(f"Error deleting {filename} from S3: {e}")
            return jsonify({"success": False, "message": f"Error deleting file {filename} from S3", "error": str(e)}), 500

    try:
        db.session.delete(campaign)
        db.session.commit()
    except Exception as e:
        print(f"Error deleting campaign from database: {e}")
        return jsonify({"success": False, "message": "An error occurred while deleting the campaign and its associated files", "error": str(e)}), 500
    
    return jsonify({"success": False, "message": "Unknown error occurred"}), 500


@campaign.route('/campaigns/<int:campaign_id>/associate-character', methods=['POST'])
def associate_character_with_campaign(campaign_id):
    character_id = request.json.get('character_id')
    
    if not character_id or not campaign_id:
        return jsonify({"error": "Both character_id and campaign_id are required."}), 400

    character = CharacterSheet.query.get(character_id)

    if not character:
        return jsonify({"error": "Character not found."}), 404

    character.campaign_id = campaign_id

    db.session.commit()

    return jsonify({"message": "Character successfully associated with campaign."})


@campaign.route('/campaigns/<int:campaign_id>/disassociate-character', methods=['POST'])
def disassociate_from_campaign(campaign_id):
    character_id = request.json.get('character_id')
    
    if not character_id:
        return jsonify({"error": "Character_id is required."}), 400

    character = CharacterSheet.query.get(character_id)

    if not character:
        return jsonify({"error": "Character not found."}), 404

    character.campaign_id = None

    db.session.commit()

    return jsonify({"message": "Character successfully disassociated from the campaign."})


@campaign.route('/campaigns/<int:campaign_id>/characters', methods=['GET'])
def get_campaign_characters(campaign_id):
    # Fetch characters associated with the given campaign ID
    characters = CharacterSheet.query.filter_by(campaign_id=campaign_id).all()

    character_data = [{
        'id': char.id,
        'name': char.name,
        'level': char.level
    } for char in characters]

    return jsonify(character_data)
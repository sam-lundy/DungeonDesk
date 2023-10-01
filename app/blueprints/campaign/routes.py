from . import campaign
from app.models import db, Campaign, Invitation, User, CampaignStatus
from flask import jsonify, request


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
        # Check if the user exists
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
            "status": c.status.value  # convert the Enum to its string representation
        } for c in all_campaigns]


        return jsonify(campaigns_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

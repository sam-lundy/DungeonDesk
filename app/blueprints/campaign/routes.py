from . import campaign
from app.models import db, Campaign, Invitation, User
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


@campaign.route('/campaigns/<int:campaign_id>/invite', methods=['POST'])
def invite_players(campaign_id):
    invitations = request.json.get('invitations', [])

    for uid in invitations:
        invitation = Invitation(campaign_id=campaign_id, player_uid=uid)
        db.session.add(invitation)

    db.session.commit()
    return jsonify({"message": "Invitations sent successfully!"}), 200



@campaign.route('/campaigns/<int:campaign_id>/status', methods=['PUT'])
def update_status(campaign_id):
    new_status = request.json.get('status')

    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify({"message": "Campaign not found!"}), 404

    campaign.status = new_status
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

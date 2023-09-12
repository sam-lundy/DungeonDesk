from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    uid = db.Column(db.String, primary_key=True) #Firebase UID
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow())
    profile_pic = db.Column(db.String(200), nullable=False, default='https://exionweb.s3.amazonaws.com/default_user_icon.png')
    timezone = db.Column(db.String(50), default='UTC')
    location = db.Column(db.String(100), default='Unknown')
    bio = db.Column(db.String(1000), nullable=False, default='No bio set')
    character_sheets = db.relationship('CharacterSheet', backref='user', lazy=True)


class CharacterSheet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    attributes = db.Column(db.JSON)  # Storing character attributes as JSON
    user_uid = db.Column(db.String, db.ForeignKey('user.uid'), nullable=False, index=True)


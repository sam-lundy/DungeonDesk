from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

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
    name = db.Column(db.String(80), nullable=False)
    race_name = db.Column(db.String(50), nullable=False)
    class_name = db.Column(db.String(50), nullable=False)
    level = db.Column(db.Integer, nullable=False, default=1)
    strength = db.Column(db.Integer, nullable=False)
    dexterity = db.Column(db.Integer, nullable=False)
    constitution = db.Column(db.Integer, nullable=False)
    intelligence = db.Column(db.Integer, nullable=False)
    wisdom = db.Column(db.Integer, nullable=False)
    charisma = db.Column(db.Integer, nullable=False)
    characterPic = db.Column(db.String(255), nullable=True)
    user_uid = db.Column(db.String, db.ForeignKey('user.uid'), nullable=False, index=True)


class CharacterEquipments(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    character_id = db.Column(db.Integer, db.ForeignKey('character_sheet.id'), nullable=False)
    equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)


race_ability_bonuses = db.Table('race_ability_bonuses',
    db.Column('race_id', db.Integer, db.ForeignKey('race.id')),
    db.Column('ability_score_id', db.Integer, db.ForeignKey('ability_score.id')),
    db.Column('bonus', db.Integer, default=0)
)


class Race(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    parent_race_id = db.Column(db.Integer, db.ForeignKey('race.id'), nullable=True)  # Self-referential foreign key
    ability_score_bonuses = db.relationship('AbilityScore', secondary=race_ability_bonuses, backref=db.backref('races', lazy=True))
    subraces = db.relationship('Race', backref=db.backref('parent_race', remote_side=[id]))  # Self-referential relationship


class Language(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.Text)


class Trait(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)


class_saving_throws = db.Table('class_saving_throws',
    db.Column('class_id', db.Integer, db.ForeignKey('classes.id')),
    db.Column('ability_score_id', db.Integer, db.ForeignKey('ability_score.id'))
)


class Classes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    hit_dice = db.Column(db.String, nullable=True)
    subclasses = db.relationship('SubClass', back_populates="parent_class")
    saving_throws = db.relationship('AbilityScore', secondary=class_saving_throws, backref=db.backref('classes', lazy=True))


class SubClass(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'))
    parent_class = db.relationship('Classes', back_populates="subclasses")


class AbilityScore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    full_name = db.Column(db.String, nullable=False)


class Equipment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    description = db.Column(db.String, nullable=False)
    characters = db.relationship('CharacterSheet', secondary='character_equipments', backref=db.backref('equipments', lazy=True))

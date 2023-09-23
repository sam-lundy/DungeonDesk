from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import CheckConstraint
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    uid = db.Column(db.String, primary_key=True) #Firebase UID
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow())
    profile_pic = db.Column(db.String(255), nullable=False, default='https://exionweb.s3.amazonaws.com/default_user_icon.png')
    timezone = db.Column(db.String(50), default='UTC')
    location = db.Column(db.String(100), default='Unknown')
    bio = db.Column(db.String(1000), nullable=False, default='No bio set')
    character_sheets = db.relationship('CharacterSheet', backref='user', cascade="all, delete-orphan", lazy=True)


character_ability_values = db.Table('character_ability_values',
    db.Column('character_id', db.Integer, db.ForeignKey('character_sheet.id', ondelete='CASCADE'), primary_key=True),
    db.Column('ability_score_id', db.Integer, db.ForeignKey('ability_score.id', ondelete='CASCADE'), primary_key=True),
    db.Column('value', db.Integer, nullable=False)  # This stores the ability score value.
)


class CharacterSheet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    race_name = db.Column(db.String(50), nullable=False)
    class_name = db.Column(db.String(50), nullable=False)
    background = db.Column(db.String(40), nullable=False, default='No background set')
    alignment = db.Column(db.String(40), nullable=False, default='Neutral')
    level = db.Column(db.Integer, nullable=False, default=1)
    prof_bonus = db.Column(db.Integer, nullable=False, default=2)
    inspiration = db.Column(db.Integer, nullable=False, default=0)
    characterPic = db.Column(db.String(255), nullable=False, default='https://exionweb.s3.amazonaws.com/default_user_icon.png')
    armor_class = db.Column(db.Integer, nullable=False)
    current_hp = db.Column(db.Integer, nullable=False)
    max_hp = db.Column(db.Integer, nullable=False)
    ability_values = db.relationship('AbilityScore', secondary=character_ability_values, backref=db.backref('characters', lazy='dynamic'))
    ability_modifiers = db.relationship('AbilityModifiers', back_populates='character', lazy='dynamic', cascade="all, delete-orphan")
    proficiencies = db.relationship('CharacterProficiencies', back_populates='character')
    character_equipments = db.relationship('CharacterEquipments', cascade="all, delete-orphan", back_populates='character')
    user_uid = db.Column(db.String, db.ForeignKey('user.uid'), nullable=False, index=True)
    __table_args__ = (
        CheckConstraint('level>=1 AND level<=20', name='level_check'),
    )




class CharacterEquipments(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    character_id = db.Column(db.Integer, db.ForeignKey('character_sheet.id', ondelete='CASCADE'), nullable=False)
    equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    character = db.relationship('CharacterSheet', back_populates='character_equipments')
    equipment = db.relationship('Equipment', back_populates='equipment_entries')



race_ability_bonuses = db.Table('race_ability_bonuses',
    db.Column('race_id', db.Integer, db.ForeignKey('race.id')),
    db.Column('ability_score_id', db.Integer, db.ForeignKey('ability_score.id')),
    db.Column('bonus', db.Integer, default=0)
)


class AbilityModifiers(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    character_id = db.Column(db.Integer, db.ForeignKey('character_sheet.id'), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    value = db.Column(db.Integer, nullable=False)
    character = db.relationship('CharacterSheet', back_populates='ability_modifiers')


class Race(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    parent_race_id = db.Column(db.Integer, db.ForeignKey('race.id'), nullable=True)  # Self-referential foreign key
    ability_score_bonuses = db.relationship('AbilityScore', secondary=race_ability_bonuses, backref=db.backref('races', lazy=True))
    subraces = db.relationship('Race', backref=db.backref('parent_race', remote_side=[id]))  # Self-referential relationship


class Language(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)


class Trait(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)


class Classes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    hit_dice = db.Column(db.String, nullable=False)
    default_proficiencies = db.Column(JSON)
    saving_throws = db.Column(JSON)
    subclasses = db.relationship('SubClass', back_populates="parent_class")


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
    equipment_entries = db.relationship('CharacterEquipments', back_populates='equipment')


class Proficiency(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)


class CharacterProficiencies(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    character_id = db.Column(db.Integer, db.ForeignKey('character_sheet.id'), nullable=False)
    proficiency_id = db.Column(db.Integer, db.ForeignKey('proficiency.id'), nullable=False)
    character = db.relationship('CharacterSheet', backref=db.backref('character_proficiencies', cascade="all, delete-orphan"))


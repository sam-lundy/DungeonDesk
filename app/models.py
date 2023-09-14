from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()



character_classes = db.Table('character_classes',
    db.Column('character_id', db.Integer, db.ForeignKey('character_sheet.id')),
    db.Column('class_id', db.Integer, db.ForeignKey('classes.id')),
    db.Column('level', db.Integer)  # Level of the character in this class
)

class_proficiencies = db.Table('class_proficiencies',
    db.Column('class_id', db.Integer, db.ForeignKey('classes.id')),
    db.Column('proficiency_id', db.Integer, db.ForeignKey('class_proficiency.id'))
)


class_saving_throws = db.Table('class_saving_throws',
    db.Column('class_id', db.Integer, db.ForeignKey('classes.id')),
    db.Column('ability_score_id', db.Integer, db.ForeignKey('ability_score.id'))
)


race_languages = db.Table('race_languages',
    db.Column('race_id', db.Integer, db.ForeignKey('race.id')),
    db.Column('language_id', db.Integer, db.ForeignKey('language.id'))
)


race_ability_bonuses = db.Table('race_ability_bonuses',
    db.Column('race_id', db.Integer, db.ForeignKey('race.id')),
    db.Column('ability_score_id', db.Integer, db.ForeignKey('ability_score.id')),
    db.Column('bonus', db.Integer, default=0)
)


race_traits = db.Table('race_traits',
    db.Column('race_id', db.Integer, db.ForeignKey('race.id')),
    db.Column('trait_id', db.Integer, db.ForeignKey('trait.id'))
)


race_fixed_proficiencies = db.Table('race_fixed_proficiencies',
    db.Column('race_id', db.Integer, db.ForeignKey('race.id')),
    db.Column('proficiency_id', db.Integer, db.ForeignKey('proficiency.id'))
)


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
    race_id = db.Column(db.Integer, db.ForeignKey('race.id'), nullable=False)
    strength = db.Column(db.Integer, nullable=False)
    dexterity = db.Column(db.Integer, nullable=False)
    constitution = db.Column(db.Integer, nullable=False)
    intelligence = db.Column(db.Integer, nullable=False)
    wisdom = db.Column(db.Integer, nullable=False)
    charisma = db.Column(db.Integer, nullable=False)
    attributes = db.Column(db.JSON)  # Storing character attributes as JSON
    classes = db.relationship('Classes', secondary=character_classes, back_populates='characters')
    user_uid = db.Column(db.String, db.ForeignKey('user.uid'), nullable=False, index=True)


class CharacterEquipments(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    character_id = db.Column(db.Integer, db.ForeignKey('character_sheet.id'), nullable=False)
    equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.id'), nullable=False)


class Race(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    parent_race_id = db.Column(db.Integer, db.ForeignKey('race.id'), nullable=True)
    has_subrace = db.Column(db.Boolean, default=False)
    ability_score_bonuses = db.relationship('AbilityScore', secondary=race_ability_bonuses, backref=db.backref('races', lazy=True))
    characters = db.relationship('CharacterSheet', backref='race', lazy=True)
    starting_proficiencies = db.relationship('Proficiency', secondary='race_fixed_proficiencies', backref=db.backref('races_fixed', lazy=True))
    languages = db.relationship('Language', secondary='race_languages', backref=db.backref('races', lazy=True))
    traits = db.relationship('Trait', secondary='race_traits', backref=db.backref('races', lazy=True))
    subraces = db.relationship('Race', backref=db.backref('parent_race', remote_side=[id]))


class Proficiency(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)


class Language(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.Text)


class Trait(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)


class Classes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    description = db.Column(db.Text)
    hit_dice = db.Column(db.String)
    primary_ability = db.Column(db.String)
    saving_throws = db.relationship('AbilityScore', secondary=class_saving_throws, backref='classes')
    proficiencies = db.relationship('ClassProficiency', secondary='class_proficiencies', back_populates='classes')
    starting_equipment_options = db.relationship('StartingEquipmentOption', backref='class_')
    characters = db.relationship('CharacterSheet', secondary=character_classes, back_populates='classes')


class ClassProficiency(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    classes = db.relationship('Classes', secondary='class_proficiencies', back_populates='proficiencies')


class AbilityScore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    classes = db.relationship('Classes', secondary='class_saving_throws', back_populates='saving_throws')


class StartingEquipmentOption(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text, nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'))


class Equipment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    description = db.Column(db.String, nullable=False)
    characters = db.relationship('CharacterSheet', secondary='character_equipments', backref=db.backref('equipments', lazy=True))



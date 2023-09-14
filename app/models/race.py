from . import db


class Race(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    parent_race_id = db.Column(db.Integer, db.ForeignKey('race.id'), nullable=True)
    has_subrace = db.Column(db.Boolean, default=False)
    str_bonus = db.Column(db.Integer, default=0)
    dex_bonus = db.Column(db.Integer, default=0)
    con_bonus = db.Column(db.Integer, default=0)
    int_bonus = db.Column(db.Integer, default=0)
    wis_bonus = db.Column(db.Integer, default=0)
    cha_bonus = db.Column(db.Integer, default=0)
    characters = db.relationship('CharacterSheet', backref='race', lazy=True)
    starting_proficiencies = db.relationship('Proficiency', secondary='race_fixed_proficiencies', backref=db.backref('races_fixed', lazy=True))
    starting_proficiency_options = db.relationship('Proficiency', secondary='race_optional_proficiencies', backref=db.backref('races_optional', lazy=True))
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
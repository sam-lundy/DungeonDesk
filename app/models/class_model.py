from . import db
from .assoc_tables import character_classes


class Classes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    description = db.Column(db.Text)
    hit_dice = db.Column(db.String)  # Example: "d8"
    primary_ability = db.Column(db.String)  # Example: "Strength"
    saving_throw_proficiencies = db.Column(db.String)
    characters = db.relationship('CharacterSheet', secondary=character_classes, back_populates='classes')
from . import db

class Equipment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    description = db.Column(db.String, nullable=False)
    characters = db.relationship('CharacterSheet', secondary='character_equipments', backref=db.backref('equipments', lazy=True))
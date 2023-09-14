from . import db


character_classes = db.Table('character_classes',
    db.Column('character_id', db.Integer, db.ForeignKey('character_sheet.id')),
    db.Column('class_id', db.Integer, db.ForeignKey('classes.id')),
    db.Column('level', db.Integer)  # Level of the character in this class
)

race_languages = db.Table('race_languages',
    db.Column('race_id', db.Integer, db.ForeignKey('race.id')),
    db.Column('language_id', db.Integer, db.ForeignKey('language.id'))
)

race_traits = db.Table('race_traits',
    db.Column('race_id', db.Integer, db.ForeignKey('race.id')),
    db.Column('trait_id', db.Integer, db.ForeignKey('trait.id'))
)

race_fixed_proficiencies = db.Table('race_fixed_proficiencies',
    db.Column('race_id', db.Integer, db.ForeignKey('race.id')),
    db.Column('proficiency_id', db.Integer, db.ForeignKey('proficiency.id'))
)

race_optional_proficiencies = db.Table('race_optional_proficiencies',
    db.Column('race_id', db.Integer, db.ForeignKey('race.id')),
    db.Column('proficiency_id', db.Integer, db.ForeignKey('proficiency.id'))
)

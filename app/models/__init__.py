from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .character import CharacterSheet, CharacterEquipments
from .equipment import Equipment
from .class_model import Classes
from .race import Race, Proficiency, Language, Trait
from .assoc_tables import race_optional_proficiencies, race_fixed_proficiencies, race_languages, race_traits

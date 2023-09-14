from flask import Flask
from config import Config
from flask_migrate import Migrate
from .models import db
from flask_cors import CORS
from .utils.firebase_utils import initialize_firebase
from .utils.seed_race import seed_races, seed_langs_and_traits, seed_proficiencies
from .utils.seed_class import seed_classes
from .utils.seed_other import seed_ability_scores
from flask.cli import with_appcontext
import click

def create_app():

    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['SECRET_KEY']

    initialize_firebase()

    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

    db.init_app(app)

    migrate = Migrate(app, db)

    from app.blueprints.authent import authent
    from app.blueprints.profile import profile

    app.register_blueprint(authent, url_prefix='/api')
    app.register_blueprint(profile, url_prefix='/api')

    @app.cli.command("seed-races")
    def seed_db_command():
        """Seeds the database with data from the DND API."""
        seed_proficiencies()
        seed_langs_and_traits()
        seed_races()

        print("Database seeded!")

    @app.cli.command("seed-classes")
    def seed_db_command():
        """Seeds the database with character class data from the DND API."""
        seed_classes()
        print("Database classes seeded!")

    
    @app.cli.command("seed-other")
    def seed_db_command():
        """Seeds the database with character class data from the DND API."""
        seed_ability_scores()
        print("Database abilities seeded!")

    return app
from flask import Flask
from config import Config
from flask_migrate import Migrate
from app.models import db
from flask_cors import CORS
from .utils.firebase_utils import initialize_firebase

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

    return app
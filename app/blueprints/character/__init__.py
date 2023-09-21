from flask import Blueprint

character = Blueprint('character', __name__, static_folder='./app/public', static_url_path='/')

from . import routes
from flask import Blueprint

profile = Blueprint('profile', __name__, static_folder='./app/public', static_url_path='/')

from . import routes
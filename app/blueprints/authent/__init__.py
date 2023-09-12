from flask import Blueprint

authent = Blueprint('authent', __name__, static_folder='./app/public', static_url_path='/')

from . import routes
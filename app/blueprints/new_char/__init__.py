from flask import Blueprint

new_char = Blueprint('new_char', __name__, static_folder='./app/public', static_url_path='/')

from . import routes
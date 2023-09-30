from flask import Blueprint

files = Blueprint('files', __name__, static_folder='./app/public', static_url_path='/')

from . import routes
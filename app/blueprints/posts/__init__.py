from flask import Blueprint

posts = Blueprint('posts', __name__, static_folder='./app/public', static_url_path='/')

from . import routes
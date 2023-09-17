from flask import Blueprint

get_equip = Blueprint('get_equip', __name__, static_folder='./app/public', static_url_path='/')

from . import routes
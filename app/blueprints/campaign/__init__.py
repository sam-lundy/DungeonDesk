from flask import Blueprint

campaign = Blueprint('campaign', __name__, static_folder='./app/public', static_url_path='/')

from . import routes
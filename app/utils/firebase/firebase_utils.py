import firebase_admin
from firebase_admin import credentials
import os

def initialize_firebase():
    cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
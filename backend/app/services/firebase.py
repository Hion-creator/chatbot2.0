from firebase_admin import credentials, initialize_app, firestore

cred = credentials.Certificate("./app/config/firebaseKey.json")
firebase_app = initialize_app(cred)
db = firestore.client()

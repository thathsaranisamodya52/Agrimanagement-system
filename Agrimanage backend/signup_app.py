import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client['agrimanage']        
users_collection = db['users']   

@app.route('/api/auth/signup', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        
        full_name = data.get('fullName')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirmPassword')

        if not full_name or not email or not password or not confirm_password:
            return jsonify({"success": False, "message": "කරුණාකර සියලුම විස්තර ඇතුලත් කරන්න."}), 400

        if password != confirm_password:
            return jsonify({"success": False, "message": "Passwords එකිනෙකට ගැලපෙන්නේ නැත."}), 400

        if len(password) < 6:
            return jsonify({"success": False, "message": "Password එක සඳහා අවම වශයෙන් අකුරු 6ක්වත් තිබිය යුතුය."}), 400

        email_lowercase = email.lower().strip()
        user_exists = users_collection.find_one({"email": email_lowercase})
        if user_exists:
            return jsonify({"success": False, "message": "මෙම Email ලිපිනය දැනටමත් ලියාපදිංචි කර ඇත."}), 400

        hashed_password = generate_password_hash(password)

        new_user = {
            "fullName": full_name,
            "email": email_lowercase,
            "password": hashed_password
        }
        users_collection.insert_one(new_user)

        return jsonify({"success": True, "message": "ගිණුම සාර්ථකව නිර්මාණය කරන ලදී!"}), 201

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    print("MongoDB connected successfully! ✅")
    app.run(port=port, debug=True)

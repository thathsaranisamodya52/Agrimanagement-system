# login_app.py
import os
import jwt
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import check_password_hash
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

client_ai = genai.Client(api_key="AQ.Ab8RN6IBN1meCQlbOAq_vJ0MtaMvrUCAX0XHJk68R2xvpDziUQ") 

app.config['SECRET_KEY'] = os.getenv("JWT_SECRET", "agrimanage_super_secret_key_123")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client['agrimanage']        
users_collection = db['users']   

@app.route('/api/auth/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        remember = data.get('remember', False)

        if not email or not password:
            return jsonify({"success": False, "message": "Email සහ Password ඇතුලත් කරන්න."}), 400

        email_lowercase = email.lower().strip()
        user = users_collection.find_one({"email": email_lowercase})
        
        if not user:
            return jsonify({"success": False, "message": "ඇතුලත් කල Email ලිපිනය වැරදියි හෝ ගිණුමක් නොමැත."}), 401

        if check_password_hash(user['password'], password):
            expires_days = 30 if remember else 1
            expiration_time = datetime.datetime.utcnow() + datetime.timedelta(days=expires_days)
            
            token = jwt.encode({
                'user_id': str(user['_id']),
                'email': user['email'],
                'exp': expiration_time
            }, app.config['SECRET_KEY'], algorithm='HS256')

            return jsonify({
                "success": True, 
                "token": token,
                "message": "Login Successful!"
            }), 200
        else:
            return jsonify({"success": False, "message": "ඇතුලත් කල Password එක වැරදියි."}), 401

    except Exception as e:
        return jsonify({"success": False, "message": f"Server Error: {str(e)}"}), 500
# login_app.py එකේ අගට මේ කෝඩ් එක එකතු කරන්න:

@app.route('/api/advice', methods=['POST'])
def get_plant_advice():
    try:
        description = request.form.get('description')
        image_file = request.files.get('image')
        
        # AI එක කෘෂිකාර්මික උපදෙස් දෙන කෙනෙක් කරන්න දෙන Prompt එක
        prompt = f"""
        You are an expert agriculture advisor and plant pathologist. 
        A farmer has asked the following question in Sri Lanka: "{description}".
        Please analyze the query (and image if provided) and give practical, step-by-step advice 
        on how to solve this issue, including organic and chemical remedies if applicable.
        CRITICAL: Provide the entire response in friendly, clear Sinhala language so the farmer can understand easily.
        """

        contents = [prompt]

        # ගොවියා පින්තූරයක් දාලා තියෙනවා නම් ඒකත් AI එකට කියවන්න සකස් කිරීම
        if image_file:
            image_data = image_file.read()
            image_part = {
                "data": image_data,
		"mime_type": image_file.content_type
            }
            contents.append(image_part)

        print(f"Sending request to Gemini AI for description: {description}")

        # Gemini මොඩල් එක හරහා පිළිතුර ලබා ගැනීම
        response = client_ai.models.generate_content(
            model='gemini-2.0-flash',
            contents=contents
        )
        
        ai_advice = response.text
        print("Received response from Gemini AI successfully!")

        return jsonify({
            "success": True,  # Frontend එකේ සර්ච් කරන්නේ res.ok නිසා මේක true වෙන්න ඕනේ
            "advice": ai_advice
        }), 200

    except Exception as e:
        print(f"Gemini AI Error: {str(e)}")
        return jsonify({"success": False, "message": f"AI Error: {str(e)}"}), 500

# login_app.py එකේ අගට මේ කෝඩ් එක එකතු කරන්න:

seeds_collection = db['seeds'] # MongoDB එකේ seeds collection එක සෑදීම

# ටෙස්ට් දත්ත පද්ධතියට ඇතුලත් කිරීම (Collection එක හිස් නම් පමණක් සිදුවේ)
if seeds_collection.count_documents({}) == 0:
    sample_seeds = [
        {"name": "කැරට් බීජ (Carrot Seeds)", "description": "ඉහළ අස්වැන්නක් ලබා දෙන පැළෑටි බීජ - 50g", "original_price": 450, "discount_price": 320},
        {"name": "තක්කාලි බීජ (Tomato Seeds)", "description": "ලෙඩ රෝග වලට ඔරොත්තු දෙන විශේෂ බීජ - 25g", "original_price": 380, "discount_price": 250},
        {"name": "බීට්රූට් බීජ (Beetroot Seeds)", "description": "දේශගුණයට ඔරොත්තු දෙන වගා බීජ - 50g", "original_price": 500, "discount_price": 390},
        {"name": "බණ්ඩක්කා බීජ (Okra Seeds)", "description": "වේගයෙන් වැඩෙන උසස් ප්‍රමිතියේ බීජ - 100g", "original_price": 300, "discount_price": 190}
    ]
    seeds_collection.insert_many(sample_seeds)
    print("Sample seeds inserted into MongoDB database! 🌱")


@app.route('/api/seeds', methods=['GET'])
def get_seeds():
    try:
        # MongoDB එකෙන් ඔක්කොම බීජ වර්ග ටික ලබා ගැනීම
        seeds_cursor = seeds_collection.find({}, {"_id": 0}) # _id එක frontend එකට ඕන නැති නිසා 0 කරා
        seeds_list = list(seeds_cursor)
        
        return jsonify({
            "success": True,
            "seeds": seeds_list
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Database Error: {str(e)}"}), 500

@app.route('/api/place-order', methods=['POST'])
def place_order():
    data = request.json
    # මෙහිදී data['farmer_name'], data['address'], data['phone'], data['seed_name'], 
    # data['quantity'], data['total_price'], data['status'] යන දත්ත Database එකට Insert කරන්න.
    
    print("New COD Order Received:", data)
    return jsonify({"success": True, "message": "Order placed successfully!", "order_id": "ORD-001"})




if __name__ == '__main__':
    print("Login Server connected to MongoDB! ✅ (Port 5001)")
    app.run(host='127.0.0.1', port=5001, debug=True)

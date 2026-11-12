from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Frontend එක සමඟ සම්බන්ධ වීමට අවසර දීම

# ඔබේ MongoDB සම්බන්ධතාවය (පරණ ගොනුවේ ඇති Link එකම මෙතනට දාන්න)
client = MongoClient("mongodb://localhost:27017/")
db = client["AgriManageDB"]
orders_collection = db["orders"]  # ඇණවුම් සේව් වන අලුත් Collection එක

# 1. අලුත් ඇණවුමක් සේව් කිරීම
@app.route('/api/place-order', methods=['POST'])
def place_order():
    try:
        data = request.json
        new_order = {
            "seed_name": data.get("seed_name"),
            "quantity": int(data.get("quantity")),
            "total_price": float(data.get("total_price")),
            "farmer_name": data.get("farmer_name"),
            "phone": data.get("phone"),
            "address": data.get("address"),
            "district": data.get("district"),
            "payment_method": "Cash on Delivery",
            "status": "Pending",
            "order_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        result = orders_collection.insert_one(new_order)
        short_id = str(result.inserted_id)[-6:].upper()
        
        return jsonify({
            "success": True, 
            "order_id": f"ORD-{short_id}"
        }), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# 2. Admin හට සියලුම ඇණවුම් ලබා දීම
@app.route('/api/orders', methods=['GET'])
def get_orders():
    try:
        orders = []
        for order in orders_collection.find().sort("_id", -1):
            order["_id"] = str(order["_id"])
            orders.append(order)
        return jsonify({"success": True, "orders": orders}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# 3. ඇණවුම බෙදාහැර මුදල් ලැබුණු බව සලකුණු කිරීම
@app.route('/api/orders/<order_id>/deliver', methods=['PUT'])
def mark_delivered(order_id):
    try:
        orders_collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": "Delivered & Paid"}}
        )
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# මෙය Port 5002 හි වෙනම ක්‍රියාත්මක වේ
if __name__ == '__main__':
    app.run(port=5002, debug=True)

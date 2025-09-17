from flask import Flask, jsonify, send_file
from pymongo import MongoClient
import gridfs
import base64
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # מאפשר לקרוא ל-API מ-React בדפדפן


# חיבור ל-MongoDB לוקאלי
client = MongoClient("mongodb+srv://arieltanami122_db_user:OHod6QgGER7wp09F@facedb.k2ycus.mongodb.net/?retryWrites=true&w=majority&appName=facedb")
db = client["face_identity"]

# GridFS
fs = gridfs.GridFS(db, collection="Photo_storage")

BASE_DIR = os.path.dirname(__file__)

@app.route("/")
def home():
    return send_file(os.path.join(BASE_DIR, "index.html"))

@app.route("/events")
def events():
    return send_file(os.path.join(BASE_DIR, "events.html"))

@app.route("/people")
def people():
    return send_file(os.path.join(BASE_DIR, "people.html"))

@app.route("/api/persons")
def get_persons():
    events = list(db.Event.find({}, {"person_id": 1, "image_id": 1}))
    persons = {}

    for e in events:
        person_id = e["person_id"]
        image_id = e.get("image_id")

        if person_id not in persons:
            persons[person_id] = {"person_id": person_id, "images": []}

        if image_id:
            file_doc = db["Photo_storage.files"].find_one({"metadata.image_id": image_id})
            if file_doc:
                grid_out = fs.get(file_doc["_id"])
                img_data = base64.b64encode(grid_out.read()).decode("utf-8")
                persons[person_id]["images"].append(f"data:image/jpeg;base64,{img_data}")

    # ====== סטטיסטיקות ======
    num_persons = len(persons)
    total_images = sum(len(p["images"]) for p in persons.values())
    avg_images_per_person = total_images / num_persons if num_persons > 0 else 0
    max_images = max((len(p["images"]) for p in persons.values()), default=0)
    min_images = min((len(p["images"]) for p in persons.values() if p["images"]), default=0)

    stats = {
        "total_persons": num_persons,
        "total_images": total_images,
        "avg_images_per_person": avg_images_per_person,
        "max_images_for_single_person": max_images,
        "min_images_for_single_person": min_images
    }

    # ====== תשובה ל-API ======
    return jsonify({
        "persons": list(persons.values()),
        "stats": stats
    })
    
    
@app.route("/api/alerts")
def get_alerts():
    alerts = list(db.Event.find({}, {
        "person_id": 1,
        "time": 1,
        "level": 1,
        "image_id": 1,
        "camera_id": 1,
        "message": 1
    }).sort("time", -1))  # מיון מהחדש לישן

    result = []
    for a in alerts:
        alert_data = {
            "person_id": a.get("person_id"),
            "time": a.get("time"),
            "level": a.get("level"),
            "image_id": a.get("image_id"),
            "camera_id": a.get("camera_id"),
            "message": a.get("message"),
            "image": None  # ברירת מחדל אם לא נמצאה תמונה
        }

        # אם יש image_id ננסה להביא את התמונה מ-GridFS
        image_id = a.get("image_id")
        if image_id:
            file_doc = db["Photo_storage.files"].find_one({"metadata.image_id": image_id})
            if file_doc:
                try:
                    grid_out = fs.get(file_doc["_id"])
                    img_data = base64.b64encode(grid_out.read()).decode("utf-8")
                    alert_data["image"] = f"data:image/jpeg;base64,{img_data}"
                except Exception as e:
                    print(f"בעיה בקריאת תמונה: {e}")

        result.append(alert_data)

    return jsonify({"alerts": result})

if __name__ == "__main__":
    app.run(debug=True, port=5000)

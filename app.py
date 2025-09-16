from flask import Flask, jsonify
from pymongo import MongoClient
import gridfs
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # מאפשר לקרוא ל-API מ-React בדפדפן

# חיבור ל-MongoDB לוקאלי
client = MongoClient("mongodb://localhost:27017/")
db = client["face_identity"]

# GridFS
fs = gridfs.GridFS(db, collection="Photo_storage")

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

    # מחזיר רשימה של אנשים
    return jsonify(list(persons.values()))

if __name__ == "__main__":
    app.run(debug=True, port=5000)

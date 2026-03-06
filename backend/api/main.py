from flask import Flask, jsonify
from backend.api.routes.sets import sets_bp
from backend.api.routes.ebay import ebay_bp
from backend.db import engine
from backend.models import Base


app = Flask(__name__)
app.register_blueprint(sets_bp)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


app.register_blueprint(ebay_bp)

Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
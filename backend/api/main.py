from flask import Flask, jsonify, request, Blueprint
from backend.api.routes.sets import sets_bp

app = Flask(__name__)
app.register_blueprint(sets_bp)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


ebay_bp = Blueprint("ebay", __name__)


@ebay_bp.route("/ebay/account-deletion", methods=["POST"])
def account_deletion():
    data = request.get_json()
    print("Account deletion notification:", data)
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
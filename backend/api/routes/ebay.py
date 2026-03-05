from flask import Blueprint, request, jsonify

ebay_bp = Blueprint("ebay", __name__)


@ebay_bp.route("/ebay/account-deletion", methods=["POST"])
def account_deletion():
    data = request.get_json(silent=True) or {}
    print("Account deletion notification:", data)
    return jsonify({"status": "ok"}), 200
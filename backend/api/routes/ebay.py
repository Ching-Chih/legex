# backend/api/routes/ebay.py
import os
import hashlib
from flask import Blueprint, request, jsonify
import requests
from backend.api.services.ebay_auth import get_ebay_token

ebay_bp = Blueprint("ebay", __name__)


@ebay_bp.route("/ebay/account-deletion", methods=["GET", "POST"])
def ebay_account_deletion():
    # 1) eBay validation step: GET ?challenge_code=...
    challenge_code = request.args.get("challenge_code")
    if challenge_code:
        verification_token = os.getenv("EBAY_VERIFICATION_TOKEN", "")
        # IMPORTANT: this must match EXACTLY the endpoint URL you entered in eBay portal
        endpoint = os.getenv("EBAY_NOTIFICATION_ENDPOINT", "")

        # Compute SHA256(challengeCode + verificationToken + endpoint)
        m = hashlib.sha256()
        m.update(challenge_code.encode("utf-8"))
        m.update(verification_token.encode("utf-8"))
        m.update(endpoint.encode("utf-8"))
        challenge_response = m.hexdigest()

        return jsonify({"challengeResponse": challenge_response}), 200

    # 2) Normal notifications: POST payloads
    data = request.get_json(silent=True) or {}
    print("eBay account deletion notification:", data)
    return ("", 204)


@ebay_bp.route("/api/ebay/test-search")
def ebay_test_search():
    token = get_ebay_token()

    url = "https://api.ebay.com/buy/browse/v1/item_summary/search?q=lego"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = requests.get(url, headers=headers)

    return jsonify(response.json())
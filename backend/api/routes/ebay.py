# backend/api/routes/ebay.py
import os
import hashlib
from flask import Blueprint, request, jsonify
import requests
from backend.api.services.ebay_auth import get_ebay_token

from backend.db import SessionLocal
from backend.models import ListingSnapshot
from datetime import datetime


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


@ebay_bp.route("/api/db-test")
def db_test():
    db = SessionLocal()
    try:
        count = db.query(ListingSnapshot).count()
        return jsonify({
            "status": "ok",
            "listing_snapshots_count": count
        })
    finally:
        db.close()


@ebay_bp.route("/api/db-insert-test")
def db_insert_test():
    db = SessionLocal()
    try:
        test_row = ListingSnapshot(
            source="ebay",
            item_id="test-item-123",
            title="Test LEGO Listing",
            price=99.99,
            currency="USD",
            condition="New",
            marketplace="EBAY_US",
            listed_at=datetime.utcnow()
        )

        db.add(test_row)
        db.commit()

        return jsonify({
            "status": "ok",
            "message": "Test row inserted"
        })
    finally:
        db.close()


def normalize_ebay_item(item):
    return {
        "source": "ebay",
        "item_id": item.get("itemId"),
        "title": item.get("title"),
        "price": float(item.get("price", {}).get("value", 0)),
        "currency": item.get("price", {}).get("currency"),
        "condition": item.get("condition"),
        "marketplace": item.get("listingMarketplaceId"),
        "listed_at": item.get("itemCreationDate")
    }


@ebay_bp.route("/api/ebay/store-search")
def ebay_store_search():
    query = request.args.get("q", "").strip()

    if not query:
        return jsonify({"status": "error", "message": "Missing query parameter 'q'"}), 400

    token = get_ebay_token()

    url = "https://api.ebay.com/buy/browse/v1/item_summary/search"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    params = {
        "q": query,
        "limit": 20
    }

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()

    data = response.json()
    items = data.get("itemSummaries", [])

    db = SessionLocal()
    inserted = 0

    try:
        for item in items:
            normalized = normalize_ebay_item(item)

            # Skip bad/incomplete rows
            if not normalized["item_id"] or not normalized["title"]:
                continue

            listed_at_raw = normalized["listed_at"]
            listed_at = None
            if listed_at_raw:
                listed_at = datetime.fromisoformat(listed_at_raw.replace("Z", "+00:00"))

            row = ListingSnapshot(
                source=normalized["source"],
                item_id=normalized["item_id"],
                title=normalized["title"],
                price=normalized["price"],
                currency=normalized["currency"],
                condition=normalized["condition"],
                marketplace=normalized["marketplace"],
                listed_at=listed_at
            )

            db.add(row)
            inserted += 1

        db.commit()

        return jsonify({
            "status": "ok",
            "query": query,
            "inserted": inserted
        })

    finally:
        db.close()
from flask import Blueprint, jsonify, request
from backend.api.services.rebrickable import search_sets, get_set

sets_bp = Blueprint("sets", __name__)


@sets_bp.route("/api/sets/search")
def sets_search():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"error": "missing query param 'q'"}), 400

    data = search_sets(q)
    results = [
        {
            "set_num": item.get("set_num"),
            "name": item.get("name"),
            "year": item.get("year"),
            "image_url": item.get("set_img_url"),
        }
        for item in data.get("results", [])
    ]
    return jsonify({"query": q, "results": results})


@sets_bp.route("/api/sets/<set_num>")
def set_detail(set_num: str):
    data = get_set(set_num)
    return jsonify(data)
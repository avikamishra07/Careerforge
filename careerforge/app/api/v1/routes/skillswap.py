"""
app/api/v1/routes/skillswap.py — SkillSwap CRUD
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from datetime import datetime, timezone, timedelta
from bson import ObjectId

from app.schemas.models import (
    SkillSwapPost, SkillSwapItem, SkillSwapListResponse,
    ConnectionRequest, MessageResponse,
)
from app.core.auth import get_current_user, get_optional_user
from app.core.database import get_db

router = APIRouter()

# In-memory seed data (always available even without MongoDB)
_SEED = [
    {"_id": "1", "user_id": None, "name": "Rhea Patel", "offer": "React / Next.js", "want": "Machine Learning basics", "experience": "Intermediate", "avatar": "RP", "created_at": datetime.now(timezone.utc) - timedelta(hours=2)},
    {"_id": "2", "user_id": None, "name": "Marcus Lee", "offer": "Python & Data Analysis", "want": "UI/UX Design fundamentals", "experience": "Advanced", "avatar": "ML", "created_at": datetime.now(timezone.utc) - timedelta(hours=4)},
    {"_id": "3", "user_id": None, "name": "Sofia Garcia", "offer": "Figma & Prototyping", "want": "Backend development (Node.js)", "experience": "Beginner", "avatar": "SG", "created_at": datetime.now(timezone.utc) - timedelta(days=1)},
    {"_id": "4", "user_id": None, "name": "Arjun Nair", "offer": "Docker & DevOps", "want": "Mobile dev (Flutter)", "experience": "Intermediate", "avatar": "AN", "created_at": datetime.now(timezone.utc) - timedelta(days=2)},
    {"_id": "5", "user_id": None, "name": "Emma Wilson", "offer": "GraphQL & REST APIs", "want": "TensorFlow / AI models", "experience": "Advanced", "avatar": "EW", "created_at": datetime.now(timezone.utc) - timedelta(days=3)},
    {"_id": "6", "user_id": None, "name": "Liam Chen", "offer": "iOS Swift development", "want": "Web frontend (React)", "experience": "Intermediate", "avatar": "LC", "created_at": datetime.now(timezone.utc) - timedelta(days=3)},
]

_mem_posts = list(_SEED)  # mutable in-memory list
_connections: set = set()  # (user_id, post_id)


def _time_ago(dt: datetime) -> str:
    diff = datetime.now(timezone.utc) - dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else datetime.now(timezone.utc) - dt
    if diff.total_seconds() < 3600:
        return f"{int(diff.total_seconds() // 60)}m ago"
    if diff.days == 0:
        return f"{int(diff.total_seconds() // 3600)}h ago"
    return f"{diff.days}d ago"


def _doc_to_item(doc: dict, user_id: Optional[str] = None) -> SkillSwapItem:
    return SkillSwapItem(
        id=str(doc["_id"]),
        user_id=doc.get("user_id"),
        name=doc["name"],
        offer=doc["offer"],
        want=doc["want"],
        experience=doc.get("experience", "Student"),
        avatar=doc.get("avatar", doc["name"][:2].upper()),
        time_ago=_time_ago(doc["created_at"]),
        connected=(user_id, str(doc["_id"])) in _connections if user_id else False,
        created_at=doc["created_at"],
    )


@router.get("/", response_model=SkillSwapListResponse)
async def list_posts(
    q: Optional[str] = Query(None, description="Search query"),
    skip: int = 0,
    limit: int = 20,
    current_user: dict = Depends(get_optional_user),
):
    """List SkillSwap posts, optionally filtered by search query."""
    db = get_db()
    user_id = current_user["sub"] if current_user else None

    if db is not None:
        filter_query = {}
        if q:
            filter_query["$text"] = {"$search": q}
        docs = await db.skillswap.find(filter_query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        total = await db.skillswap.count_documents(filter_query)
    else:
        docs = _mem_posts
        if q:
            q_lower = q.lower()
            docs = [d for d in docs if q_lower in d["offer"].lower() or q_lower in d["want"].lower() or q_lower in d["name"].lower()]
        total = len(docs)
        docs = docs[skip : skip + limit]

    items = [_doc_to_item(d, user_id) for d in docs]
    return SkillSwapListResponse(items=items, total=total)


@router.post("/", response_model=SkillSwapItem, status_code=201)
async def create_post(
    data: SkillSwapPost,
    current_user: dict = Depends(get_current_user),
):
    """Create a new SkillSwap post."""
    db = get_db()
    name = current_user.get("name", "Anonymous")
    initials = "".join(w[0].upper() for w in name.split()[:2])

    doc = {
        "user_id": current_user["sub"],
        "name": name,
        "offer": data.offer,
        "want": data.want,
        "experience": "Student",
        "avatar": initials or "ME",
        "created_at": datetime.now(timezone.utc),
    }

    if db is not None:
        result = await db.skillswap.insert_one(doc)
        doc["_id"] = result.inserted_id
    else:
        doc["_id"] = f"user_{len(_mem_posts)}"
        _mem_posts.insert(0, doc)

    return _doc_to_item(doc, current_user["sub"])


@router.post("/{post_id}/connect", response_model=MessageResponse)
async def toggle_connection(
    post_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Toggle connection to a SkillSwap post."""
    user_id = current_user["sub"]
    key = (user_id, post_id)

    if key in _connections:
        _connections.discard(key)
        return MessageResponse(message="Disconnected")
    else:
        _connections.add(key)
        return MessageResponse(message="Connected")


@router.delete("/{post_id}", response_model=MessageResponse)
async def delete_post(
    post_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete own SkillSwap post."""
    db = get_db()
    user_id = current_user["sub"]

    if db is not None:
        try:
            result = await db.skillswap.delete_one({"_id": ObjectId(post_id), "user_id": user_id})
            if result.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Post not found or unauthorized")
        except Exception:
            raise HTTPException(status_code=404, detail="Post not found")
    else:
        before = len(_mem_posts)
        _mem_posts[:] = [p for p in _mem_posts if not (str(p["_id"]) == post_id and p.get("user_id") == user_id)]
        if len(_mem_posts) == before:
            raise HTTPException(status_code=404, detail="Post not found or unauthorized")

    return MessageResponse(message="Post deleted")

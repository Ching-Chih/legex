from sqlalchemy import Column, Integer, String, Float, DateTime
from backend.db import Base


class ListingSnapshot(Base):
    __tablename__ = "listing_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, nullable=False)          # e.g. "ebay"
    item_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String, nullable=False)
    condition = Column(String, nullable=True)
    marketplace = Column(String, nullable=True)
    listed_at = Column(DateTime, nullable=True)
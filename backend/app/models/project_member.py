import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, ForeignKey, DateTime, Table
from .base import Base

project_members = Table(
    "project_members",
    Base.metadata,
    Column("project_id", ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("joined_at", DateTime, default=lambda: datetime.now(timezone.utc))
)

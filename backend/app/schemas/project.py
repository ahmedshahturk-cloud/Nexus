import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from .auth import UserOut

class MemberOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ProjectOut(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    owner: UserOut
    member_count: int
    task_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProjectDetail(ProjectOut):
    members: List[UserOut]
    task_summary: dict # {todo: N, in_progress: N, done: N}

class AddMemberRequest(BaseModel):
    user_id: uuid.UUID

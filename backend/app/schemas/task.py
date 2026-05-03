import uuid
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

class MemberOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[date] = None
    assigned_to: Optional[uuid.UUID] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    assigned_to: Optional[uuid.UUID] = None

class TaskStatusUpdate(BaseModel):
    status: str

class TaskOut(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    status: str
    priority: str
    due_date: Optional[date]
    project_id: uuid.UUID
    created_by: MemberOut = Field(validation_alias="creator")
    assigned_to: Optional[MemberOut] = Field(validation_alias="assignee")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from ..core.dependencies import get_db, get_current_user, require_admin
from ..models.user import User
from ..models.project import Project
from ..models.project_member import project_members
from ..models.task import Task
from ..schemas.task import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/api/v1", tags=["tasks"])

def parse_uuid(value: str):
    try:
        return uuid.UUID(value)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid id")

@router.get("/tasks/my", response_model=List[TaskOut])
def get_my_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Task)
        .filter(Task.assigned_to == current_user.id)
        .order_by(Task.updated_at.desc())
        .all()
    )

@router.get("/projects/{project_id}/tasks", response_model=List[TaskOut])
def get_project_tasks(
    project_id: str,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project_uuid = parse_uuid(project_id)
    # Check access
    is_member = db.query(project_members).filter_by(project_id=project_uuid, user_id=current_user.id).first()
    if not is_member and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = db.query(Task).filter(Task.project_id == project_uuid)
    if status: query = query.filter(Task.status == status)
    if priority: query = query.filter(Task.priority == priority)
    if assigned_to: query = query.filter(Task.assigned_to == assigned_to)
    
    return query.all()

@router.post("/projects/{project_id}/tasks", response_model=TaskOut)
def create_task(project_id: str, payload: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    project_uuid = parse_uuid(project_id)
    # Validate project
    project = db.query(Project).filter(Project.id == project_uuid).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Validate assignment
    if payload.assigned_to:
        is_member = db.query(project_members).filter_by(project_id=project_uuid, user_id=str(payload.assigned_to)).first()
        if not is_member:
            raise HTTPException(status_code=400, detail="Assigned user must be a member of this project")
    
    new_task = Task(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        due_date=payload.due_date,
        project_id=project_uuid,
        created_by=current_user.id,
        assigned_to=str(payload.assigned_to) if payload.assigned_to else None
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: str, payload: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task_uuid = parse_uuid(task_id)
    task = db.query(Task).filter(Task.id == task_uuid).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Member restriction: can ONLY update status
    if current_user.role != "admin":
        if str(task.assigned_to) != str(current_user.id):
            raise HTTPException(status_code=403, detail="Members can only update their assigned tasks")

        # Check if any field other than status is provided
        update_data = payload.model_dump(exclude_unset=True)
        if any(key != "status" for key in update_data.keys()):
            raise HTTPException(status_code=403, detail="Members can only update task status")
        
        if "status" in update_data:
            task.status = update_data["status"]
    else:
        # Admin can update everything
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task, key, value)
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/tasks/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    task_uuid = parse_uuid(task_id)
    task = db.query(Task).filter(Task.id == task_uuid).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}

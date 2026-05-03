from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..core.dependencies import get_db, get_current_user, require_admin
from ..models.user import User
from ..models.project import Project
from ..models.project_member import project_members
from ..models.task import Task
from ..schemas.project import ProjectCreate, ProjectUpdate, ProjectOut, ProjectDetail, AddMemberRequest

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])

@router.get("/", response_model=List[ProjectOut])
def get_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        projects = db.query(Project).all()
    else:
        projects = db.query(Project).join(Project.members).filter(User.id == current_user.id).all()
    
    # Enrich with counts (this could be optimized with subqueries)
    for p in projects:
        p.member_count = len(p.members)
        p.task_count = db.query(func.count(Task.id)).filter(Task.project_id == p.id).scalar()
    
    return projects

@router.post("/", response_model=ProjectOut)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_project = Project(
        name=payload.name,
        description=payload.description,
        owner_id=current_user.id
    )
    # Auto-add creator as member
    new_project.members.append(current_user)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    new_project.member_count = 1
    new_project.task_count = 0
    return new_project

@router.get("/{project_id}", response_model=ProjectDetail)
def get_project(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check membership
    is_member = db.query(project_members).filter_by(project_id=project.id, user_id=current_user.id).first()
    if not is_member and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Counts and Summary
    project.member_count = len(project.members)
    project.task_count = len(project.tasks)
    
    todo = db.query(func.count(Task.id)).filter(Task.project_id == project.id, Task.status == "todo").scalar()
    in_progress = db.query(func.count(Task.id)).filter(Task.project_id == project.id, Task.status == "in_progress").scalar()
    done = db.query(func.count(Task.id)).filter(Task.project_id == project.id, Task.status == "done").scalar()
    
    project.task_summary = {"todo": todo, "in_progress": in_progress, "done": done}
    
    return project

@router.put("/{project_id}", response_model=ProjectOut)
def update_project(project_id: str, payload: ProjectUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if payload.name: project.name = payload.name
    if payload.description is not None: project.description = payload.description
    
    db.commit()
    db.refresh(project)
    project.member_count = len(project.members)
    project.task_count = len(project.tasks)
    return project

@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}

@router.post("/{project_id}/members")
def add_member(project_id: str, payload: AddMemberRequest, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    user = db.query(User).filter(User.id == str(payload.user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    is_member = db.query(project_members).filter_by(project_id=project.id, user_id=user.id).first()
    if is_member:
        raise HTTPException(status_code=400, detail="User already a member")
    
    # Using Table object to insert
    stmt = project_members.insert().values(project_id=project.id, user_id=user.id)
    db.execute(stmt)
    db.commit()
    
    return {"message": "Member added"}

@router.delete("/{project_id}/members/{user_id}")
def remove_member(project_id: str, user_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    stmt = project_members.delete().where(project_members.c.project_id == project.id, project_members.c.user_id == user_id)
    db.execute(stmt)
    db.commit()
    
    return {"message": "Member removed"}

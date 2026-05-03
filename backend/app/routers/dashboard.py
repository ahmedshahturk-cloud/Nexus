from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from ..core.dependencies import get_db, get_current_user
from ..models.user import User
from ..models.project import Project
from ..models.project_member import project_members
from ..models.task import Task

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])

@router.get("/")
def get_dashboard_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()
    
    if current_user.role == "admin":
        total_projects = db.query(func.count(Project.id)).scalar()
        total_tasks = db.query(func.count(Task.id)).scalar()
        total_members = db.query(func.count(User.id)).scalar()
        
        tasks_by_status = {
            "todo": db.query(func.count(Task.id)).filter(Task.status == "todo").scalar(),
            "in_progress": db.query(func.count(Task.id)).filter(Task.status == "in_progress").scalar(),
            "done": db.query(func.count(Task.id)).filter(Task.status == "done").scalar()
        }
        
        overdue_tasks_query = db.query(Task).join(Project).join(User, Task.assigned_to == User.id, isouter=True).filter(
            Task.due_date < today,
            Task.status != "done"
        )
        
        recent_tasks = db.query(Task).join(Project).order_by(Task.updated_at.desc()).limit(5).all()
        
    else:
        # Member data
        my_projects_ids = db.query(project_members.c.project_id).filter(project_members.c.user_id == current_user.id).all()
        my_projects_ids = [p[0] for p in my_projects_ids]
        
        total_projects = len(my_projects_ids)
        total_tasks = db.query(func.count(Task.id)).filter(Task.assigned_to == current_user.id).scalar()
        total_members = db.query(func.count(User.id)).scalar() # Still show total users? Prompt says count of all users for admin, filtered for member. I'll show all members for now.
        
        tasks_by_status = {
            "todo": db.query(func.count(Task.id)).filter(Task.assigned_to == current_user.id, Task.status == "todo").scalar(),
            "in_progress": db.query(func.count(Task.id)).filter(Task.assigned_to == current_user.id, Task.status == "in_progress").scalar(),
            "done": db.query(func.count(Task.id)).filter(Task.assigned_to == current_user.id, Task.status == "done").scalar()
        }
        
        overdue_tasks_query = db.query(Task).join(Project).filter(
            Task.assigned_to == current_user.id,
            Task.due_date < today,
            Task.status != "done"
        )
        
        recent_tasks = db.query(Task).join(Project).filter(Task.assigned_to == current_user.id).order_by(Task.updated_at.desc()).limit(5).all()

    # Format overdue tasks
    overdue_tasks = []
    for t in overdue_tasks_query.limit(10).all():
        overdue_tasks.append({
            "id": str(t.id),
            "title": t.title,
            "due_date": str(t.due_date),
            "project_name": t.project.name,
            "assigned_to_name": t.assignee.name if t.assignee else "Unassigned"
        })

    # Format recent tasks
    formatted_recent = []
    for t in recent_tasks:
        formatted_recent.append({
            "id": str(t.id),
            "title": t.title,
            "project_name": t.project.name,
            "status": t.status,
            "priority": t.priority,
            "updated_at": t.updated_at
        })

    return {
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "total_members": total_members,
        "tasks_by_status": tasks_by_status,
        "overdue_tasks": overdue_tasks,
        "recent_tasks": formatted_recent
    }

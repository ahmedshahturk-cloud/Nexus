from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..core.dependencies import get_db, require_admin
from ..models.user import User
from ..schemas.auth import UserOut

router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.get("/", response_model=List[UserOut])
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(User).all()

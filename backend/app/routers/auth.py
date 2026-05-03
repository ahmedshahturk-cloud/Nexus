from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.dependencies import get_db, get_current_user
from ..core.security import hash_password, verify_password, create_access_token
from ..models.user import User
from ..schemas.auth import SignupRequest, LoginRequest, TokenResponse, UserOut

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/signup", response_model=TokenResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    # Check if email exists
    user_exists = db.query(User).filter(User.email == payload.email).first()
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    new_user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="member" # default role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create token
    access_token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

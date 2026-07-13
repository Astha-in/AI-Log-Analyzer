from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.auth.jwt_handler import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from backend.auth.password import (
    hash_password,
    verify_password,
)
from backend.database import get_db
from backend.models.user import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
)
from backend.models.user_model import User


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

security = HTTPBearer()


def build_user_response(user: User):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    payload = decode_token(
        credentials.credentials
    )

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        )

    if payload.get("token_type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    user_id = payload.get("user_id")
    email = payload.get("sub")

    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.email == email,
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        name=request.name,
        email=request.email,
        hashed_password=hash_password(
            request.password
        ),
        role="user",
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    return {
        "message": "Account created successfully",
        "user": build_user_response(user),
    }


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if not user or not verify_password(
        request.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token_data = {
        "sub": user.email,
        "user_id": user.id,
        "role": user.role,
    }

    return {
        "access_token": create_access_token(
            token_data
        ),
        "refresh_token": create_refresh_token(
            token_data
        ),
        "token_type": "bearer",
        "user": build_user_response(user),
    }


@router.post("/refresh")
def refresh_access_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    payload = decode_token(
        request.refresh_token
    )

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    if payload.get("token_type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    user_id = payload.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    token_data = {
        "sub": user.email,
        "user_id": user.id,
        "role": user.role,
    }

    return {
        "access_token": create_access_token(
            token_data
        ),
        "token_type": "bearer",
    }


@router.get("/me")
def get_me(
    current_user: User = Depends(
        get_current_user
    ),
):
    return build_user_response(
        current_user
    )


@router.post("/logout")
def logout(
    current_user: User = Depends(
        get_current_user
    ),
):
    return {
        "message": "Logged out successfully",
    }
from sqlalchemy.orm import Session

from backend.auth.password import hash_password
from backend.database import Base, SessionLocal, engine
from backend.models.user_model import User
from backend.models.upload_model import Upload
from backend.models.analysis_model import AnalysisResult


ADMIN_EMAIL = "admin@logsense.ai"
ADMIN_PASSWORD = "Admin@123"


def create_database():
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        existing_user = (
            db.query(User)
            .filter(User.email == ADMIN_EMAIL)
            .first()
        )

        if existing_user:
            print("Admin user already exists.")
            return

        admin_user = User(
            name="System Administrator",
            email=ADMIN_EMAIL,
            hashed_password=hash_password(ADMIN_PASSWORD),
            role="admin",
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print("Database initialized successfully.")
        print(f"Admin user created: {admin_user.email}")

    finally:
        db.close()


if __name__ == "__main__":
    create_database()
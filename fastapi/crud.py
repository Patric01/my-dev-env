from sqlmodel import Session, select
from models import Users


def get_users(session: Session) -> list[Users]:
    statement = select(Users)
    results = session.exec(statement)
    return results.all()


def get_user_by_email(session: Session, email: str) -> Users | None:
    statement = select(Users).where(Users.email == email)
    user = session.exec(statement).first()
    return user

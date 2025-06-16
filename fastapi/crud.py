from sqlmodel import Session, select
from models import Users

def get_users(session: Session) -> list[Users]:
    statement = select(Users)
    results = session.exec(statement)
    return results.all()

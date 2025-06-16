from fastapi import FastAPI, Depends
from sqlmodel import Session
from  models import Users
from crud import get_users
from database import get_session

api = FastAPI()

@api.get("/", response_model = list[Users])
def index(session: Session = Depends(get_session)):

    users = get_users(session)

    return users

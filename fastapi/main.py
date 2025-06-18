from fastapi import FastAPI, Depends
from sqlmodel import Session
from  models import Users
from crud import get_users
from database import get_session
from fastapi.middleware.cors import CORSMiddleware

api = FastAPI()

origins = [
    "*"
]

api.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@api.get("/", response_model = list[Users])
def index(session: Session = Depends(get_session)):

    users = get_users(session)

    return users

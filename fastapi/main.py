from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from  models import Users
from crud import get_users
from database import get_session
from fastapi.middleware.cors import CORSMiddleware
from auth import verify_password, create_access_token

from fastapi import Request
from auth import create_access_token
from models import Users
from sqlmodel import select


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

@api.post("/login")
async def email_login(request: Request, session: Session = Depends(get_session)):
    body = await request.json()
    email = body.get("email")

    # 1. Validare email
    if not email or not email.endswith("@endava.com"):
        raise HTTPException(status_code=400, detail="Autentificare eșuată. Verifică datele introduse.")
    # aici este o eroare la mail, mail-ul nu se termina cu @endava.com

    # 2. Verificare dacă există deja
    user = session.exec(select(Users).where(Users.email == email)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Autentificare eșuată. Verifică datele introduse.")


    # 3. Creează token JWT
    token = create_access_token(data={"sub": email})

    return {"access_token": token, "token_type": "bearer"}

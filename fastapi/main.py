from fastapi import FastAPI, Depends, HTTPException, Request
from sqlmodel import Session, select
from models import Users
from database import get_session
from fastapi.middleware.cors import CORSMiddleware
from auth import create_access_token, get_current_user


api = FastAPI()
origins = ["*"]


api.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# this endpoint does not require authentication, since it is used to generate the JWT
@api.post("/login")
async def email_login(request: Request, session: Session = Depends(get_session)):
    body = await request.json()
    email = body.get("email")

    # 1. Validare email
    if not email or not email.endswith("@endava.com"):
        raise HTTPException(
            status_code=400, detail="Autentificare eșuată. Verifică datele introduse."
        )
    # aici este o eroare la mail, mail-ul nu se termina cu @endava.com

    # 2. Verificare dacă există deja
    user = session.exec(select(Users).where(Users.email == email)).first()
    if not user:
        raise HTTPException(
            status_code=401, detail="Autentificare eșuată. Verifică datele introduse."
        )

    # 3. Creează token JWT
    token = create_access_token(data={"sub": email})

    return {"access_token": token, "token_type": "bearer"}


# TODO
# figure out if you can just verify the token without having to get the user from the database
# access user data from the "current_user" variable
@api.get("/reservations")
def get_reservations(type: str, current_user: Users = Depends(get_current_user)):

    match type:
        case "ping-pong":
            return {"message": "Ping Pong Reservations"}
        case "playstation":
            return {"message": "Playstation Reservations"}
        case "fussball":
            return {"message": "Fussball Reservations"}
        case "massage":
            return {"message": "Massage Reservations"}
        case _:
            raise HTTPException(
                status_code=400, detail="Reservation type does not exist."
            )

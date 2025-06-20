from fastapi import FastAPI, Depends, HTTPException, Request
from sqlmodel import Session, select
import crud
from models import ReservationRequest, User
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
    user = session.exec(select(User).where(User.email == email)).first()
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
def get_reservations(
    type: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    reservations = crud.get_reservations_by_type(session, type)
    return reservations


@api.post("/reservations")
def add_reservation(
    reservation: ReservationRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if reservation.start_time >= reservation.end_time:
        raise HTTPException(status_code=400, detail="Time interval is invalid.")

    try:
        reservation = crud.add_reservation(
            session,
            current_user.id,
            reservation.type,
            reservation.start_time,
            reservation.end_time,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Reservation added successfully", "reservation": reservation}


@api.delete("/reservations/{reservation_id}")
def delete_reservation(
    reservation_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        crud.delete_reservation(session, reservation_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Reservation deleted successfully"}

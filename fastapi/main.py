from fastapi import FastAPI, Depends, HTTPException, Request
from sqlmodel import Session, select
import crud
from models import Reservation, Element, ReservationGuest
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
    token = create_access_token(
        data={"email": email, "name": user.name, "role": user.role}
    )

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
            game=reservation.game,
            max_guests=reservation.max_guests
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


from fastapi import Body

# this is the endpoint to invite guests to a reservation
# it requires the reservation_id and a list of guest_ids in the body
@api.post("/reservations/{reservation_id}/invite")
def invite_guests(
    reservation_id: int,
    guest_ids: list[int] = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # Get reservation
    reservation = session.get(Reservation, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    # Folosește max_guests din rezervare
    max_guests = reservation.max_guests or 1

    # Check current guests
    current_guests = session.exec(
        select(ReservationGuest).where(ReservationGuest.reservation_id == reservation_id)
    ).all()
    if len(current_guests) + len(guest_ids) > max_guests:
        raise HTTPException(status_code=400, detail=f"Max guests allowed is {max_guests}")

    # Add guests
    for guest_id in guest_ids:
        # Verificare dublură
        already_invited = session.exec(
            select(ReservationGuest).where(
                ReservationGuest.reservation_id == reservation_id,
                ReservationGuest.user_id == guest_id
            )
        ).first()
        if already_invited:
            raise HTTPException(status_code=400, detail="Guest already invited")

        session.add(ReservationGuest(reservation_id=reservation_id, user_id=guest_id))

    session.commit()
    return {"message": "Guests invited successfully"}



@api.get("/reservations/{reservation_id}/guests")
def get_guests_for_reservation(
    reservation_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = (
        select(User)
        .join(ReservationGuest, ReservationGuest.user_id == User.id)
        .where(ReservationGuest.reservation_id == reservation_id)
    )
    guests = session.exec(statement).all()

    return [
        {
            "user_id": guest.id,
            "user_name": guest.name,
            "user_email": guest.email,
            "status": "pending"  # hardcodăm pentru început
        }
        for guest in guests
    ]
# this is in endpoint for searching users for the search bar
@api.get("/users/search")
def search_users(
    q: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    statement = select(User).where(
        (User.name.ilike(f"%{q}%")) | (User.email.ilike(f"%{q}%"))
    )
    users = session.exec(statement).all()
    return [{"id": u.id, "name": u.name, "email": u.email} for u in users]

@api.get("/notifications")
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = (
        select(Reservation, Element, User)
        .join(ReservationGuest, Reservation.id == ReservationGuest.reservation_id)
        .join(Element, Element.id == Reservation.element_id)
        .join(User, Reservation.user_id == User.id)
        .where(ReservationGuest.user_id == current_user.id)
    )
    results = session.exec(statement).all()

    notifications = []
    for reservation, element, inviter in results:
        notifications.append({
            "id": reservation.id,
            "type": element.type,
            "game": reservation.game,
            "from_name": inviter.name,
            "start_time": reservation.start_time.isoformat()
        })
    return notifications


@api.post("/reservations/{reservation_id}/respond")
def respond_to_invitation(
    reservation_id: int,
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    status = payload.get("status")  # 'accepted' or 'declined'

    guest = session.exec(
        select(ReservationGuest)
        .where(
            ReservationGuest.reservation_id == reservation_id,
            ReservationGuest.user_id == current_user.id
        )
    ).first()

    if not guest:
        raise HTTPException(status_code=404, detail="Invitația nu există.")

    guest.status = status
    session.add(guest)
    session.commit()
    return {"message": f"Invitația a fost {status}."}

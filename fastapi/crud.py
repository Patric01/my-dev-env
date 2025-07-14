from sqlmodel import Session, select
from models import Element, Reservation, User


def get_users(session: Session) -> list[User]:
    statement = select(User)
    results = session.exec(statement)
    return results.all()


def get_user_by_email(session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    return user


def get_reservations_by_type(session: Session, type: str) -> list[Reservation]:
    statement = (
        select(
            Reservation.id,
            User.name.label("user_name"),
            Element.name.label("element_name"),
            Reservation.start_time,
            Reservation.end_time,
            Reservation.game,         # ✅ adăugat
            Reservation.max_guests 
        )
        .join(Element, Reservation.element_id == Element.id)
        .join(User, Reservation.user_id == User.id)
        .where(Element.type == type)
    )
    results = session.exec(statement).all()
    reservations = [
        {
            "id": r.id,
            "user_name": r.user_name,
            "element_name": r.element_name,
            "start_time": r.start_time,
            "end_time": r.end_time,
            "game": r.game,                   # ✅
            "max_guests": r.max_guests 
        }
        for r in results
    ]
    return reservations


def get_element_by_type(session: Session, type: str) -> Element:
    statement = select(Element).where(Element.type == type)
    element = session.exec(statement).first()
    return element


def add_reservation(
    session: Session, 
    user_id: int, 
    type: str, 
    start_time: str, 
    end_time: str,
    game: str | None = None,
    max_guests: int = 1,
) -> Reservation:

    element = get_element_by_type(session, type)
    if not element:
        raise ValueError(f"No element found for type: {type}")

    # Check for overlapping reservations for the same element
    statement = select(Reservation).where(
        Reservation.element_id == element.id,
        Reservation.end_time > start_time,
        Reservation.start_time < end_time,
    )
    overlap = session.exec(statement).first()
    if overlap:
        raise ValueError("Reservation overlaps with an existing reservation.")

    reservation = Reservation(
        user_id=user_id,
        element_id=element.id,
        start_time=start_time,
        end_time=end_time,
        game=game,
        max_guests=max_guests
    )
    session.add(reservation)
    session.commit()
    session.refresh(reservation)
    return reservation


def delete_reservation(session: Session, reservation_id: int, user_id: int) -> None:
    statement = select(Reservation).where(Reservation.id == reservation_id)
    reservation = session.exec(statement).first()

    if not reservation:
        raise ValueError("Reservation not found")

    if reservation.user_id != user_id:
        raise ValueError("Not authorized to delete this reservation")

    session.delete(reservation)
    session.commit()

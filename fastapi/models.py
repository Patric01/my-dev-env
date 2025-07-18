from datetime import datetime
from pydantic import BaseModel
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):

    __tablename__ = "users"

    id: int = Field(default=None, primary_key=True)
    name: str
    email: str
    password: str
    role: str
    created_at: datetime = Field(default_factory=datetime.now)


class Element(SQLModel, table=True):

    __tablename__ = "elements"

    id: int = Field(default=None, primary_key=True)
    name: str
    type: str
    default_duration: int
    location: str
    created_at: datetime = Field(default_factory=datetime.now)


class Reservation(SQLModel, table=True):
    __tablename__ = "reservations"

    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(default=None, foreign_key="users.id")
    element_id: int = Field(default=None, foreign_key="elements.id")
    start_time: datetime
    end_time: datetime
    game: str | None = None                    # ✅ nou
    max_guests: int = 1                        # ✅ nou
    created_at: datetime = Field(default_factory=datetime.now)



class ReservationRequest(BaseModel):
    type: str
    start_time: datetime
    end_time: datetime
    game: str | None = None            # 👈 adăugat
    max_guests: int = 1 

class TokenPayload(BaseModel):
    email: str
    name: str
    role: str
    exp: int  # epoch seconds



class ReservationGuest(SQLModel, table=True):
    __tablename__ = "reservation_guests"
    id: int | None = Field(default=None, primary_key=True)
    reservation_id: int = Field(foreign_key="reservations.id")
    user_id: int = Field(foreign_key="users.id")
    invited_at: datetime | None = Field(default_factory=datetime.utcnow)
from datetime import datetime
from pydantic import BaseModel
from sqlmodel import SQLModel, Field


class Users(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str
    email: str
    password: str
    role: str
    created_at: datetime = Field(default_factory=datetime.now)


class TokenPayload(BaseModel):
    sub: str  # email
    exp: int  # epoch seconds

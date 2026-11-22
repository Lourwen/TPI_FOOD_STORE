
from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class Usuario(SQLModel, table=True):

    id: int | None = Field(default=None, primary_key=True)

    username: str = Field(
        min_length=1,
        max_length=50,
        unique=True,
        index=True,
    )

    full_name: str = Field(
        min_length=1,
        max_length=100,
    )

    email: str = Field(
        unique=True,
        index=True,
        max_length=255,
    )

    hashed_password: str

    role: str = Field(default="user")

    disabled: bool = Field(default=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

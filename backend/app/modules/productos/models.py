
from decimal import Decimal

from sqlmodel import Field, SQLModel


class Producto(SQLModel, table=True):

    id: int | None = Field(
        default=None,
        primary_key=True,
    )

    categoria_id: int = Field(
        foreign_key="categoria.id",
        index=True,
    )

    nombre: str = Field(
        min_length=2,
        max_length=100,
        index=True,
    )

    descripcion: str | None = Field(
        default=None,
    )

    precio_base: Decimal = Field(
        ge=0,
        max_digits=10,
        decimal_places=2,
    )

    imagen_url: str | None = Field(
        default=None,
    )

    stock: int = Field(
        default=0,
        ge=0,
    )

    disponible: bool = Field(
        default=True,
    )

    activo: bool = Field(
        default=True,
    )

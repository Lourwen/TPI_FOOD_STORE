
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductoCreate(BaseModel):
    categoria_id: int
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = None
    precio_base: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    imagen_url: str | None = None
    stock: int = Field(default=0, ge=0)
    disponible: bool = True


class ProductoUpdate(BaseModel):
    categoria_id: int = None
    nombre: str = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None
    precio_base: Decimal = Field(
        default=None,
        ge=0,
        max_digits=10,
        decimal_places=2,
    )
    imagen_url: str | None = None
    stock: int = Field(default=None, ge=0)
    disponible: bool = None


class ProductoStockUpdate(BaseModel):
    stock: int = Field(ge=0)
    disponible: bool


class ProductoRead(BaseModel):
    id: int
    categoria_id: int
    nombre: str
    descripcion: str | None
    precio_base: Decimal
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool

    model_config = ConfigDict(from_attributes=True)


class ProductoList(BaseModel):
    total: int
    items: list[ProductoRead]


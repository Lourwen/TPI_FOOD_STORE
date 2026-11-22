
from pydantic import BaseModel, ConfigDict, Field


class CategoriaCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = None


class CategoriaUpdate(BaseModel):
    nombre: str = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    descripcion: str | None = None


class CategoriaRead(BaseModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool

    model_config = ConfigDict(from_attributes=True)

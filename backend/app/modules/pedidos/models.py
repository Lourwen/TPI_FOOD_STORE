from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from app.modules.usuarios.models import Usuario
from sqlmodel import Field, Relationship, SQLModel


class EstadoPedido(str, Enum):
    PENDIENTE = "PENDIENTE"
    EN_PREPARACION = "EN_PREPARACION"
    ENTREGADO = "ENTREGADO"
    CANCELADO = "CANCELADO"


class FormaPago(str, Enum):
    EFECTIVO = "EFECTIVO"
    TRANSFERENCIA = "TRANSFERENCIA"


class Pedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)

    usuario: "Usuario" = Relationship()

    estado: EstadoPedido = Field(default=EstadoPedido.PENDIENTE)
    forma_pago: FormaPago

    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = Field(default=None)

    total: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=10, decimal_places=2)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    detalles: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)

    cantidad: int = Field(ge=1)
    nombre_producto: str
    precio_unitario: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    subtotal: Decimal = Field(ge=0, max_digits=10, decimal_places=2)

    pedido: Pedido = Relationship(back_populates="detalles")
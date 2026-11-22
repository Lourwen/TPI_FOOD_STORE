
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.modules.pedidos.models import EstadoPedido, FormaPago


class DetallePedidoCreate(BaseModel):
    producto_id: int = Field(ge=1)
    cantidad: int = Field(ge=1)


class PedidoCreate(BaseModel):
    items: list[DetallePedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = None

    @model_validator(mode="after")
    def validar_productos_unicos(self):
        productos = [item.producto_id for item in self.items]

        if len(productos) != len(set(productos)):
            raise ValueError("No se puede repetir un producto en el pedido")

        return self


class PedidoEstadoUpdate(BaseModel):
    estado: EstadoPedido


class DetallePedidoRead(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    nombre_producto: str
    precio_unitario: Decimal
    subtotal: Decimal

    model_config = ConfigDict(from_attributes=True)


class UsuarioPedidoRead(BaseModel):
    id: int
    full_name: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class PedidoRead(BaseModel):
    id: int
    usuario_id: int
    usuario: UsuarioPedidoRead
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: str | None
    total: Decimal
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead] = Field(validation_alias="detalles")

    model_config = ConfigDict(from_attributes=True)


class PedidoList(BaseModel):
    total: int
    items: list[PedidoRead]


class ResumenPedidos(BaseModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: Decimal

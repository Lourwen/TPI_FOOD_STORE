from datetime import datetime, time, timezone
from decimal import Decimal

from app.modules.pedidos.models import (
    Pedido,
    DetallePedido,
    EstadoPedido,
)
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoEstadoUpdate,
    PedidoRead,
    PedidoList,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork


class PedidoNoEncontradoError(Exception):
    pass


class PedidoAjenoError(Exception):
    pass


class EstadoPedidoInvalidoError(Exception):
    pass


class ProductoNoEncontradoError(Exception):
    pass


class ProductoNoDisponibleError(Exception):
    pass


class StockInsuficienteError(Exception):
    pass


class PedidoService:

    TRANSICIONES_PERMITIDAS = {
        EstadoPedido.PENDIENTE: {
            EstadoPedido.EN_PREPARACION,
            EstadoPedido.CANCELADO,
        },
        EstadoPedido.EN_PREPARACION: {
            EstadoPedido.ENTREGADO,
            EstadoPedido.CANCELADO,
        },
        EstadoPedido.ENTREGADO: set(),
        EstadoPedido.CANCELADO: set(),
    }

    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def crear_pedido(self, usuario_id: int, datos: PedidoCreate):
        with self.uow as uow:
            detalles = []
            total = Decimal("0.00")

            for item in datos.items:
                producto = uow.productos.get_by_id_activo_for_update(
                    item.producto_id
                )

                if not producto:
                    raise ProductoNoEncontradoError()

                if not producto.disponible:
                    raise ProductoNoDisponibleError()

                if producto.stock < item.cantidad:
                    raise StockInsuficienteError()

                subtotal = (
                        producto.precio_base * item.cantidad
                ).quantize(Decimal("0.01"))

                producto.stock -= item.cantidad
                uow.session.add(producto)

                detalle = DetallePedido(
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )

                detalles.append(detalle)
                total += subtotal

            pedido = Pedido(
                usuario_id=usuario_id,
                forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega,
                notas=datos.notas,
                total=total.quantize(Decimal("0.01")),
                detalles=detalles,
            )

            pedido = uow.pedidos.add(pedido)

            return PedidoRead.model_validate(pedido)

    def listar_pedidos(
            self,
            skip: int = 0,
            limit: int = 20,
            estado: EstadoPedido | None = None,
            usuario_id: int | None = None,
    ):
        with self.uow as uow:
            pedidos = uow.pedidos.get_all(
                skip=skip,
                limit=limit,
                estado=estado,
                usuario_id=usuario_id,
            )

            total = uow.pedidos.count(
                estado=estado,
                usuario_id=usuario_id,
            )

            return PedidoList(
                total=total,
                items=[
                    PedidoRead.model_validate(pedido)
                    for pedido in pedidos
                ],
            )

    def obtener_pedido(
            self,
            pedido_id: int,
            usuario_id: int,
            es_admin: bool = False,
    ):
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id_with_detalles(pedido_id)

            if not pedido:
                raise PedidoNoEncontradoError()

            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjenoError()

            return PedidoRead.model_validate(pedido)

    def cancelar_pedido_cliente(
            self,
            pedido_id: int,
            usuario_id: int,
    ):
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id_for_update(pedido_id)

            if not pedido:
                raise PedidoNoEncontradoError()

            if pedido.usuario_id != usuario_id:
                raise PedidoAjenoError()

            if pedido.estado != EstadoPedido.PENDIENTE:
                raise EstadoPedidoInvalidoError()

            self._restituir_stock(uow, pedido)

            pedido.estado = EstadoPedido.CANCELADO
            pedido.updated_at = datetime.now(timezone.utc)

            uow.session.add(pedido)

            return PedidoRead.model_validate(pedido)

    def actualizar_estado_admin(
            self,
            pedido_id: int,
            datos: PedidoEstadoUpdate,
    ):
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id_for_update(pedido_id)

            if not pedido:
                raise PedidoNoEncontradoError()

            estados_permitidos = self.TRANSICIONES_PERMITIDAS[
                pedido.estado
            ]

            if datos.estado not in estados_permitidos:
                raise EstadoPedidoInvalidoError()

            if datos.estado == EstadoPedido.CANCELADO:
                self._restituir_stock(uow, pedido)

            pedido.estado = datos.estado
            pedido.updated_at = datetime.now(timezone.utc)

            uow.session.add(pedido)

            return PedidoRead.model_validate(pedido)

    def _restituir_stock(self, uow, pedido: Pedido):
        for detalle in pedido.detalles:
            producto = uow.productos.get_by_id_for_update(
                detalle.producto_id
            )

            if not producto:
                raise ProductoNoEncontradoError()

            producto.stock += detalle.cantidad
            uow.session.add(producto)

    def obtener_resumen(self):
        with self.uow as uow:
            ahora_local = datetime.now().astimezone()

            inicio_local = datetime.combine(
                ahora_local.date(),
                time.min,
                tzinfo=ahora_local.tzinfo,
            )

            fin_local = datetime.combine(
                ahora_local.date(),
                time.max,
                tzinfo=ahora_local.tzinfo,
            )

            inicio_utc = inicio_local.astimezone(timezone.utc)
            fin_utc = fin_local.astimezone(timezone.utc)

            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado(
                    EstadoPedido.PENDIENTE
                ),
                en_preparacion=uow.pedidos.count_by_estado(
                    EstadoPedido.EN_PREPARACION
                ),
                entregados=uow.pedidos.count_by_estado(
                    EstadoPedido.ENTREGADO
                ),
                cancelados=uow.pedidos.count_by_estado(
                    EstadoPedido.CANCELADO
                ),
                pedidos_hoy=uow.pedidos.count_created_between(
                    inicio_utc,
                    fin_utc,
                ),
                ingresos_entregados=uow.pedidos.get_ingresos_entregados(),
            )
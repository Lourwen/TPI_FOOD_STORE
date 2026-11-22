from datetime import datetime

from sqlalchemy.orm import selectinload
from sqlmodel import Session, select
from sqlalchemy import func

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import (
    Pedido,
    DetallePedido,
    EstadoPedido,
)


class PedidoRepository(BaseRepository[Pedido]):

    def __init__(self, session: Session):
        super().__init__(Pedido, session)

    def get_by_id_with_detalles(self, pedido_id: int):
        statement = (
            select(Pedido)
            .where(Pedido.id == pedido_id)
            .options(
                selectinload(Pedido.detalles),
                selectinload(Pedido.usuario),
        ))
        return self.session.exec(statement).first()

    def get_by_id_for_update(self, pedido_id: int):
        statement = (
            select(Pedido)
            .where(Pedido.id == pedido_id)
            .options(selectinload(Pedido.detalles))
            .with_for_update()
        )
        return self.session.exec(statement).first()

    def add_detalle(self, detalle: DetallePedido):
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def get_all(
            self,
            skip: int = 0,
            limit: int = 20,
            estado: EstadoPedido | None = None,
            usuario_id: int | None = None,
    ):
        statement = select(Pedido).options(
            selectinload(Pedido.detalles),
            selectinload(Pedido.usuario),
        )

        if estado is not None:
            statement = statement.where(Pedido.estado == estado)

        if usuario_id is not None:
            statement = statement.where(Pedido.usuario_id == usuario_id)

        statement = (
            statement
            .order_by(Pedido.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        return self.session.exec(statement).all()

    def count(
            self,
            estado: EstadoPedido | None = None,
            usuario_id: int | None = None,
    ):
        statement = select(func.count(Pedido.id))

        if estado is not None:
            statement = statement.where(Pedido.estado == estado)

        if usuario_id is not None:
            statement = statement.where(Pedido.usuario_id == usuario_id)

        return self.session.exec(statement).one()

    def count_by_estado(self, estado: EstadoPedido):
        statement = select(func.count(Pedido.id)).where(
            Pedido.estado == estado
        )
        return self.session.exec(statement).one()

    def count_created_between(self, inicio: datetime, fin: datetime):
        statement = select(func.count(Pedido.id)).where(
            Pedido.created_at >= inicio,
            Pedido.created_at < fin,
            )
        return self.session.exec(statement).one()

    def get_ingresos_entregados(self):
        statement = select(func.sum(Pedido.total)).where(
            Pedido.estado == EstadoPedido.ENTREGADO
        )
        resultado = self.session.exec(statement).one()
        return resultado or 0

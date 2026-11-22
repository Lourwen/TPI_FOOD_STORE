
from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):

    def __init__(self, session: Session):
        super().__init__(Producto, session)

    def get_by_id_activo(self, producto_id: int):
        statement = select(Producto).where(
            Producto.id == producto_id,
            Producto.activo == True,
            )
        return self.session.exec(statement).first()


    def get_by_id_incluyendo_inactivos(self, producto_id: int):
        statement = select(Producto).where(
            Producto.id == producto_id
            )
        return self.session.exec(statement).first()



    def get_by_id_activo_for_update(self, producto_id: int):
        statement = (
            select(Producto)
            .where(
                Producto.id == producto_id,
                Producto.activo == True,
                )
            .with_for_update()
        )
        return self.session.exec(statement).first()

    def get_by_id_for_update(self, producto_id: int):
        statement = (
            select(Producto)
            .where(Producto.id == producto_id)
            .with_for_update()
        )
        return self.session.exec(statement).first()

    def get_categoria_activa(self, categoria_id: int):
        statement = select(Categoria).where(
            Categoria.id == categoria_id,
            Categoria.activo == True,
            )
        return self.session.exec(statement).first()

    def get_all_activos(
            self,
            skip: int = 0,
            limit: int = 20,
            search: str | None = None,
            categoria_id: int | None = None,
            disponible: bool | None = None,
    ):
        statement = select(Producto).where(
            Producto.activo == True
        )

        if search:
            statement = statement.where(
                Producto.nombre.contains(search)
            )

        if categoria_id is not None:
            statement = statement.where(
                Producto.categoria_id == categoria_id
            )

        if disponible is not None:
            statement = statement.where(
                Producto.disponible == disponible
            )

        statement = statement.offset(skip).limit(limit)

        return self.session.exec(statement).all()


    def count_activos(
            self,
            search: str | None = None,
            categoria_id: int | None = None,
            disponible: bool | None = None,
    ):
        statement = select(func.count(Producto.id)).where(
            Producto.activo == True
        )

        if search:
            statement = statement.where(
                Producto.nombre.contains(search)
            )

        if categoria_id is not None:
            statement = statement.where(
                Producto.categoria_id == categoria_id
            )

        if disponible is not None:
            statement = statement.where(
                Producto.disponible == disponible
            )

        return self.session.exec(statement).one()

    def get_all(
            self,
            skip: int = 0,
            limit: int = 20,
            search: str | None = None,
            categoria_id: int | None = None,
            disponible: bool | None = None,
    ):
        statement = select(Producto)

        if search:
            statement = statement.where(
                Producto.nombre.contains(search)
            )

        if categoria_id is not None:
            statement = statement.where(
                Producto.categoria_id == categoria_id
            )

        if disponible is not None:
            statement = statement.where(
                Producto.disponible == disponible
            )

        statement = statement.offset(skip).limit(limit)

        return self.session.exec(statement).all()

    def count_all(
            self,
            search: str | None = None,
            categoria_id: int | None = None,
            disponible: bool | None = None,
    ):
        statement = select(func.count(Producto.id))

        if search:
            statement = statement.where(
                Producto.nombre.contains(search)
            )

        if categoria_id is not None:
            statement = statement.where(
                Producto.categoria_id == categoria_id
            )

        if disponible is not None:
            statement = statement.where(
                Producto.disponible == disponible
            )

        return self.session.exec(statement).one()

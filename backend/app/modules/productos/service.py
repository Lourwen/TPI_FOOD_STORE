
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoStockUpdate,
    ProductoRead,
    ProductoList,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontradoError(Exception):
    pass


class CategoriaNoEncontradaError(Exception):
    pass


class ProductoService:

    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def crear_producto(self, datos: ProductoCreate):
        with self.uow as uow:
            categoria = uow.productos.get_categoria_activa(
                datos.categoria_id
            )

            if not categoria:
                raise CategoriaNoEncontradaError()

            producto = Producto(**datos.model_dump())

            producto = uow.productos.add(producto)

            return ProductoRead.model_validate(producto)

    def listar_productos(
            self,
            skip: int = 0,
            limit: int = 20,
            search: str | None = None,
            categoria_id: int | None = None,
            disponible: bool | None = None,
    ):
        with self.uow as uow:
            productos = uow.productos.get_all_activos(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )

            total = uow.productos.count_activos(
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )

            return ProductoList(
                total=total,
                items=[
                    ProductoRead.model_validate(producto)
                    for producto in productos
                ],
            )
    def listar_todos_productos(
            self,
            skip: int = 0,
            limit: int = 20,
            search: str | None = None,
            categoria_id: int | None = None,
            disponible: bool | None = None,
    ):
        with self.uow as uow:
            productos = uow.productos.get_all(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )

            total = uow.productos.count_all(
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )

            return ProductoList(
                total=total,
                items=[
                    ProductoRead.model_validate(producto)
                    for producto in productos
                ],
            )



    def obtener_producto(self, producto_id: int):
        with self.uow as uow:
            producto = uow.productos.get_by_id_activo(producto_id)

            if not producto:
                raise ProductoNoEncontradoError()

            return ProductoRead.model_validate(producto)

    def actualizar_producto(
            self,
            producto_id: int,
            datos: ProductoUpdate,
    ):
        with self.uow as uow:
            producto = uow.productos.get_by_id_activo(producto_id)

            if not producto:
                raise ProductoNoEncontradoError()

            cambios = datos.model_dump(exclude_unset=True)

            if "categoria_id" in cambios:
                categoria = uow.productos.get_categoria_activa(
                    cambios["categoria_id"]
                )

                if not categoria:
                    raise CategoriaNoEncontradaError()

            for campo, valor in cambios.items():
                setattr(producto, campo, valor)

            uow.session.add(producto)

            return ProductoRead.model_validate(producto)

    def actualizar_stock(
            self,
            producto_id: int,
            datos: ProductoStockUpdate,
    ):
        with self.uow as uow:
            producto = uow.productos.get_by_id_activo(producto_id)

            if not producto:
                raise ProductoNoEncontradoError()

            producto.stock = datos.stock
            producto.disponible = datos.disponible
            uow.session.add(producto)

            return ProductoRead.model_validate(producto)


    def eliminar_producto(self, producto_id: int):
        with self.uow as uow:
            producto = uow.productos.get_by_id_activo(producto_id)

            if not producto:
                raise ProductoNoEncontradoError()

            producto.activo = False
            uow.session.add(producto)

            return ProductoRead.model_validate(producto)


    def activar_producto(self, producto_id: int):
         with self.uow as uow:
            producto = uow.productos.get_by_id_incluyendo_inactivos(
                producto_id
            )

            if not producto:
                 raise ProductoNoEncontradoError()

            producto.activo = True
            uow.session.add(producto)

            return ProductoRead.model_validate(producto)

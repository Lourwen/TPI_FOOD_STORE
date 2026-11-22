
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaRead,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontradaError(Exception):
    pass


class CategoriaDuplicadaError(Exception):
    pass


class CategoriaService:

    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def crear_categoria(self, datos: CategoriaCreate):
        with self.uow as uow:
            existente = uow.categorias.get_by_nombre(datos.nombre)

            if existente:
                raise CategoriaDuplicadaError()

            categoria = Categoria(
                nombre=datos.nombre,
                descripcion=datos.descripcion,
            )

            categoria = uow.categorias.add(categoria)

            return CategoriaRead.model_validate(categoria)

    def listar_categorias(self):
        with self.uow as uow:
            categorias = uow.categorias.get_all_activos()

            return [
                CategoriaRead.model_validate(categoria)
                for categoria in categorias
            ]

    def listar_todas_las_categorias(self):
        with self.uow as uow:
            categorias = uow.categorias.get_all_incluyendo_inactivos()

            return [
                CategoriaRead.model_validate(categoria)
                for categoria in categorias
            ]

    def activar_categoria(self, categoria_id: int):
        with self.uow as uow:
            categoria = uow.categorias.get_by_id_incluyendo_inactivos(
                categoria_id
            )

            if not categoria:
                raise CategoriaNoEncontradaError()

            categoria.activo = True
            uow.session.add(categoria)

            return CategoriaRead.model_validate(categoria)

    def obtener_categoria(self, categoria_id: int):
        with self.uow as uow:
            categoria = uow.categorias.get_by_id_activo(
                categoria_id
            )

            if not categoria:
                raise CategoriaNoEncontradaError()

            return CategoriaRead.model_validate(categoria)

    def actualizar_categoria(
            self,
            categoria_id: int,
            datos: CategoriaUpdate,
    ):
        with self.uow as uow:
            categoria = uow.categorias.get_by_id_activo(
                categoria_id
            )

            if not categoria:
                raise CategoriaNoEncontradaError()

            cambios = datos.model_dump(exclude_unset=True)

            if "nombre" in cambios:
                existente = uow.categorias.get_by_nombre(
                    cambios["nombre"]
                )

                if existente and existente.id != categoria_id:
                    raise CategoriaDuplicadaError()

            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)

            uow.session.add(categoria)

            return CategoriaRead.model_validate(categoria)

    def eliminar_categoria(self, categoria_id: int):
        with self.uow as uow:
            categoria = uow.categorias.get_by_id_activo(
                categoria_id
            )

            if not categoria:
                raise CategoriaNoEncontradaError()

            categoria.activo = False
            uow.session.add(categoria)

            return CategoriaRead.model_validate(categoria)

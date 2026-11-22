
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):

    def __init__(self, session: Session):
        super().__init__(Categoria, session)

    def get_by_nombre(self, nombre: str):
        statement = select(Categoria).where(
            Categoria.nombre == nombre
        )
        return self.session.exec(statement).first()

    def get_by_id_activo(self, categoria_id: int):
        statement = select(Categoria).where(
            Categoria.id == categoria_id,
            Categoria.activo == True,
            )
        return self.session.exec(statement).first()

    def get_all_activos(self):
        statement = select(Categoria).where(
            Categoria.activo == True
            )
        return self.session.exec(statement).all()

    def get_by_id_incluyendo_inactivos(self, categoria_id: int):
        statement = select(Categoria).where(
            Categoria.id == categoria_id
        )
        return self.session.exec(statement).first()

    def get_all_incluyendo_inactivos(self):
        statement = select(Categoria)
        return self.session.exec(statement).all()
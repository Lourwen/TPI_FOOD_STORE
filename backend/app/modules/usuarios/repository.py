
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):

    def __init__(self, session: Session):
        super().__init__(Usuario, session)

    def get_by_username(self, username: str):
        statement = select(Usuario).where(
            Usuario.username == username
        )
        return self.session.exec(statement).first()

    def get_by_email(self, email: str):
        statement = select(Usuario).where(
            Usuario.email == email
        )
        return self.session.exec(statement).first()

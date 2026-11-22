
from app.modules.usuarios.schemas import UsuarioRead
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontradoError(Exception):
    pass


class NoPuedeDesactivarseError(Exception):
    pass


class UsuarioService:

    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def listar_usuarios(self):
        with self.uow as uow:
            usuarios = uow.usuarios.get_all()

            return [
                UsuarioRead.model_validate(usuario)
                for usuario in usuarios
            ]

    def activar_usuario(self, usuario_id: int):
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)

            if not usuario:
                raise UsuarioNoEncontradoError()

            usuario.disabled = False
            uow.session.add(usuario)

            return UsuarioRead.model_validate(usuario)

    def desactivar_usuario(
            self,
            usuario_id: int,
            administrador_id: int,
    ):
        if usuario_id == administrador_id:
            raise NoPuedeDesactivarseError()

        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)

            if not usuario:
                raise UsuarioNoEncontradoError()

            usuario.disabled = True
            uow.session.add(usuario)

            return UsuarioRead.model_validate(usuario)


from app.core.security import hash_password, verify_password
from app.modules.auth.schemas import UsuarioCreate, UsuarioMe
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioDuplicadoError(Exception):
    pass


class CredencialesInvalidasError(Exception):
    pass


class CuentaDesactivadaError(Exception):
    pass


class AuthService:

    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def registrar_usuario(self, datos: UsuarioCreate):
        with self.uow as uow:
            usuario_existente = uow.usuarios.get_by_username(
                datos.username
            )

            if usuario_existente:
                raise UsuarioDuplicadoError(
                    "El nombre de usuario ya existe"
                )

            email_existente = uow.usuarios.get_by_email(
                datos.email
            )

            if email_existente:
                raise UsuarioDuplicadoError(
                    "El email ya está registrado"
                )

            usuario = Usuario(
                username=datos.username,
                full_name=datos.full_name,
                email=datos.email,
                hashed_password=hash_password(datos.password),
                role="user",
            )

            usuario = uow.usuarios.add(usuario)

            return UsuarioMe.model_validate(usuario)

    def autenticar_usuario(
            self,
            username: str,
            password: str,
    ):
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)

            if not usuario or not verify_password(
                    password,
                    usuario.hashed_password,
            ):
                raise CredencialesInvalidasError()

            if usuario.disabled:
                raise CuentaDesactivadaError()

            return usuario

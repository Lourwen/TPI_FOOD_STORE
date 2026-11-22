
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.core.security import create_access_token
from app.modules.auth.schemas import UsuarioCreate, UsuarioMe
from app.modules.auth.service import (
    AuthService,
    UsuarioDuplicadoError,
    CredencialesInvalidasError,
    CuentaDesactivadaError,
)
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"],
)


def get_auth_service():
    return AuthService(UsuarioUnitOfWork())


@router.post(
    "/register",
    response_model=UsuarioMe,
    status_code=status.HTTP_201_CREATED,
)
def registrar_usuario(
        datos: UsuarioCreate,
        service: AuthService = Depends(get_auth_service),
):
    try:
        return service.registrar_usuario(datos)
    except UsuarioDuplicadoError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        )


@router.post("/token")
def iniciar_sesion(
        response: Response,
        form_data: OAuth2PasswordRequestForm = Depends(),
        service: AuthService = Depends(get_auth_service),
):
    try:
        usuario = service.autenticar_usuario(
            form_data.username,
            form_data.password,
        )
    except CredencialesInvalidasError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except CuentaDesactivadaError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )

    token = create_access_token({"sub": usuario.username})

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    return {"message": "Inicio de sesión exitoso"}


@router.post("/logout")
def cerrar_sesion(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
    )

    return {"message": "Sesión cerrada correctamente"}


@router.get(
    "/me",
    response_model=UsuarioMe,
)
def obtener_usuario_actual(
        usuario: Usuario = Depends(get_current_active_user),
):
    return usuario

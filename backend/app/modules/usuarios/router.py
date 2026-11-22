
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.modules.usuarios.schemas import UsuarioRead
from app.modules.usuarios.service import (
    UsuarioService,
    UsuarioNoEncontradoError,
    NoPuedeDesactivarseError,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


router = APIRouter(
    prefix="/admin/usuarios",
    tags=["Usuarios"],
)


def get_usuario_service():
    return UsuarioService(UsuarioUnitOfWork())


@router.get(
    "/",
    response_model=list[UsuarioRead],
    dependencies=[Depends(require_role(["admin"]))],
)
def listar_usuarios(
        service: UsuarioService = Depends(get_usuario_service),
):
    return service.listar_usuarios()


@router.post(
    "/{usuario_id}/activar",
    response_model=UsuarioRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def activar_usuario(
        usuario_id: int,
        service: UsuarioService = Depends(get_usuario_service),
):
    try:
        return service.activar_usuario(usuario_id)
    except UsuarioNoEncontradoError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )


@router.post(
    "/{usuario_id}/desactivar",
    response_model=UsuarioRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def desactivar_usuario(
        usuario_id: int,
        service: UsuarioService = Depends(get_usuario_service),
        administrador=Depends(require_role(["admin"])),
):
    try:
        return service.desactivar_usuario(
            usuario_id,
            administrador.id,
        )
    except UsuarioNoEncontradoError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )
    except NoPuedeDesactivarseError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puede desactivar su propia cuenta",
        )

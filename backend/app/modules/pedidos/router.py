
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from app.core.deps import get_current_active_user, require_role
from app.modules.usuarios.models import Usuario
from app.modules.pedidos.models import EstadoPedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoEstadoUpdate,
    PedidoRead,
    PedidoList,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoService,
    PedidoNoEncontradoError,
    PedidoAjenoError,
    EstadoPedidoInvalidoError,
    ProductoNoEncontradoError,
    ProductoNoDisponibleError,
    StockInsuficienteError,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork


router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"],
)


def get_pedido_service():
    return PedidoService(PedidoUnitOfWork())


@router.post(
    "/",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_pedido(
        datos: PedidoCreate,
        usuario: Usuario = Depends(get_current_active_user),
        service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.crear_pedido(usuario.id, datos)
    except ProductoNoEncontradoError:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado",
        )
    except ProductoNoDisponibleError:
        raise HTTPException(
            status_code=400,
            detail="El producto no está disponible",
        )
    except StockInsuficienteError:
        raise HTTPException(
            status_code=400,
            detail="Stock insuficiente para uno o más productos",
        )


@router.get(
    "/",
    response_model=PedidoList,
)
def listar_pedidos(
        skip: int = Query(default=0, ge=0),
        limit: int = Query(default=20, ge=1, le=100),
        estado: EstadoPedido | None = None,
        usuario: Usuario = Depends(get_current_active_user),
        service: PedidoService = Depends(get_pedido_service),
):
    # El administrador puede consultar todos los pedidos.
    # El usuario común solamente consulta los propios.
    usuario_id = None if usuario.role == "admin" else usuario.id

    return service.listar_pedidos(
        skip=skip,
        limit=limit,
        estado=estado,
        usuario_id=usuario_id,
    )

@router.get(
    "/mios",
    response_model=PedidoList,
)
def listar_mis_pedidos(
        skip: int = Query(default=0, ge=0),
        limit: int = Query(default=20, ge=1, le=100),
        estado: EstadoPedido | None = None,
        usuario: Usuario = Depends(get_current_active_user),
        service: PedidoService = Depends(get_pedido_service),
):
    return service.listar_pedidos(
        skip=skip,
        limit=limit,
        estado=estado,
        usuario_id=usuario.id,
    )
@router.get(
    "/resumen",
    response_model=ResumenPedidos,
)
def obtener_resumen(
        service: PedidoService = Depends(get_pedido_service),
        administrador: Usuario = Depends(require_role(["admin"])),
):
    return service.obtener_resumen()


@router.get(
    "/{pedido_id}",
    response_model=PedidoRead,
)
def obtener_pedido(
        pedido_id: int,
        usuario: Usuario = Depends(get_current_active_user),
        service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.obtener_pedido(
            pedido_id=pedido_id,
            usuario_id=usuario.id,
            es_admin=usuario.role == "admin",
        )
    except PedidoNoEncontradoError:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado",
        )
    except PedidoAjenoError:
        raise HTTPException(
            status_code=403,
            detail="No tiene permiso para consultar este pedido",
        )


@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead,
)
def actualizar_estado(
        pedido_id: int,
        datos: PedidoEstadoUpdate,
        administrador: Usuario = Depends(require_role(["admin"])),
        service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.actualizar_estado_admin(pedido_id, datos)
    except PedidoNoEncontradoError:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado",
        )
    except EstadoPedidoInvalidoError:
        raise HTTPException(
            status_code=400,
            detail="La transición de estado no está permitida",
        )
    except ProductoNoEncontradoError:
        raise HTTPException(
            status_code=404,
            detail="No se encontró un producto para restituir el stock",
        )


@router.patch(
    "/{pedido_id}/cancelar",
    response_model=PedidoRead,
)
def cancelar_pedido(
        pedido_id: int,
        usuario: Usuario = Depends(get_current_active_user),
        service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.cancelar_pedido_cliente(
            pedido_id=pedido_id,
            usuario_id=usuario.id,
        )
    except PedidoNoEncontradoError:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado",
        )
    except PedidoAjenoError:
        raise HTTPException(
            status_code=403,
            detail="No tiene permiso para cancelar este pedido",
        )
    except EstadoPedidoInvalidoError:
        raise HTTPException(
            status_code=400,
            detail="Solo se pueden cancelar pedidos pendientes",
        )
    except ProductoNoEncontradoError:
        raise HTTPException(
            status_code=404,
            detail="No se encontró un producto para restituir el stock",
        )

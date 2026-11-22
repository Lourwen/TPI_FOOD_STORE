
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Response,
    status,
)

from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoStockUpdate,
    ProductoRead,
    ProductoList,
)
from app.modules.productos.service import (
    ProductoService,
    ProductoNoEncontradoError,
    CategoriaNoEncontradaError,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


router = APIRouter(
    prefix="/productos",
    tags=["Productos"],
)


def get_producto_service():
    return ProductoService(ProductoUnitOfWork())


@router.get(
    "/",
    response_model=ProductoList,
)
def listar_productos(
        skip: int = Query(default=0, ge=0),
        limit: int = Query(default=20, ge=1, le=100),
        search: str | None = None,
        categoria_id: int | None = Query(default=None, ge=1),
        disponible: bool | None = None,
        service: ProductoService = Depends(get_producto_service),
):
    return service.listar_productos(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get(
    "/{producto_id}",
    response_model=ProductoRead,
)

@router.get(
    "/admin/todos",
    response_model=ProductoList,
    dependencies=[Depends(require_role(["admin"]))],
)
def listar_todos_productos(
        skip: int = Query(default=0, ge=0),
        limit: int = Query(default=20, ge=1, le=100),
        search: str | None = None,
        categoria_id: int | None = Query(default=None, ge=1),
        disponible: bool | None = None,
        service: ProductoService = Depends(get_producto_service),
):
    return service.listar_todos_productos(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get(
    "/{producto_id}",
    response_model=ProductoRead,
)
def obtener_producto(
        producto_id: int,
        service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.obtener_producto(producto_id)
    except ProductoNoEncontradoError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )



@router.post(
    "/",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(["admin"]))],
)
def crear_producto(
        datos: ProductoCreate,
        service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.crear_producto(datos)
    except CategoriaNoEncontradaError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada o inactiva",
        )


@router.put(
    "/{producto_id}",
    response_model=ProductoRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_producto(
        producto_id: int,
        datos: ProductoUpdate,
        service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar_producto(producto_id, datos)
    except ProductoNoEncontradoError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )
    except CategoriaNoEncontradaError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada o inactiva",
        )


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_stock(
        producto_id: int,
        datos: ProductoStockUpdate,
        service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar_stock(producto_id, datos)
    except ProductoNoEncontradoError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(["admin"]))],
)
def eliminar_producto(
        producto_id: int,
        service: ProductoService = Depends(get_producto_service),
):
    try:
        service.eliminar_producto(producto_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ProductoNoEncontradoError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )


@router.post(
    "/{producto_id}/activar",
    response_model=ProductoRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def activar_producto(
        producto_id: int,
        service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.activar_producto(producto_id)
    except ProductoNoEncontradoError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )

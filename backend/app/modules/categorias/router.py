
from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaRead,
)
from app.modules.categorias.service import (
    CategoriaService,
    CategoriaNoEncontradaError,
    CategoriaDuplicadaError,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


router = APIRouter(
    prefix="/categorias",
    tags=["Categorías"],
)


def get_categoria_service():
    return CategoriaService(CategoriaUnitOfWork())


@router.get(
    "/",
    response_model=list[CategoriaRead],
)
def listar_categorias(
        service: CategoriaService = Depends(get_categoria_service),
):
    return service.listar_categorias()

@router.get(
    "/admin/todas",
    response_model=list[CategoriaRead],
    dependencies=[Depends(require_role(["admin"]))],
)
def listar_todas_las_categorias(
        service: CategoriaService = Depends(get_categoria_service),
):
    return service.listar_todas_las_categorias()


@router.get(
    "/{categoria_id}",
    response_model=CategoriaRead,
)
def obtener_categoria(
        categoria_id: int,
        service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.obtener_categoria(categoria_id)
    except CategoriaNoEncontradaError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )


@router.post(
    "/",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(["admin"]))],
)
def crear_categoria(
        datos: CategoriaCreate,
        service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.crear_categoria(datos)
    except CategoriaDuplicadaError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una categoría con ese nombre",
        )


@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_categoria(
        categoria_id: int,
        datos: CategoriaUpdate,
        service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.actualizar_categoria(categoria_id, datos)
    except CategoriaNoEncontradaError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )
    except CategoriaDuplicadaError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una categoría con ese nombre",
        )


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(["admin"]))],
)
def eliminar_categoria(
        categoria_id: int,
        service: CategoriaService = Depends(get_categoria_service),
):
    try:
        service.eliminar_categoria(categoria_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except CategoriaNoEncontradaError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )

@router.post(
    "/{categoria_id}/activar",
    response_model=CategoriaRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def activar_categoria(
        categoria_id: int,
        service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.activar_categoria(categoria_id)
    except CategoriaNoEncontradaError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )
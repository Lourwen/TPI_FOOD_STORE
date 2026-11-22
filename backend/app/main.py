from app.modules.categorias.router import router as categorias_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.productos.router import router as productos_router
from app.core.config import settings
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.pedidos.router import router as pedidos_router


app = FastAPI(
    title="Food Store API",
    description="API para la gestión de un negocio de comidas",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


api_prefix = "/api/v1"

app.include_router(auth_router, prefix=api_prefix)
app.include_router(usuarios_router, prefix=api_prefix)
app.include_router(categorias_router, prefix=api_prefix)
app.include_router(productos_router, prefix=api_prefix)
app.include_router(pedidos_router, prefix=api_prefix)

@app.get("/")
def root():
    return {"message": "Food Store API funcionando"}


from sqlmodel import SQLModel, Session, create_engine

from app.core.config import settings


engine = create_engine(
    settings.DATABASE_URL,
    echo=True,
)


def create_all_tables():
    # Registrar todos los modelos antes de crear las tablas.
    from app.modules.usuarios.models import Usuario
    from app.modules.categorias.models import Categoria
    from app.modules.productos.models import Producto
    from app.modules.pedidos.models import Pedido, DetallePedido

    SQLModel.metadata.create_all(engine)


def session_factory():
    return Session(
        engine,
        expire_on_commit=False,
    )



from decimal import Decimal

from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto


def seed_database():
    # Asegurar que las tablas estén creadas.
    create_all_tables()

    session = session_factory()

    try:
        # ----------------------------------
        # ADMINISTRADOR INICIAL
        # ----------------------------------
        admin = session.exec(
            select(Usuario).where(Usuario.username == "admin")
        ).first()

        if not admin:
            admin = Usuario(
                username="admin",
                full_name="Administrador",
                email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"),
                role="admin",
                disabled=False,
            )
            session.add(admin)
            print("Administrador creado")
        else:
            print("El administrador ya existe")

        # ----------------------------------
        # CATEGORÍAS
        # ----------------------------------
        categorias_iniciales = [
            {
                "nombre": "Hamburguesas",
                "descripcion": "Hamburguesas y combos",
                "activo": True,
            },
            {
                "nombre": "Pizzas",
                "descripcion": "Pizzas individuales y familiares",
                "activo": True,
            },
            {
                "nombre": "Bebidas",
                "descripcion": "Bebidas frías y gaseosas",
                "activo": True,
            },
            {
                "nombre": "Empanadas caseras",
                "descripcion": "Empanadas artesanales de distintos sabores",
                "activo": True,
            },
            {
                "nombre": "Frutas",
                "descripcion": "Frutas de estación",
                "activo": True,
            },
            {
                "nombre": "Postres",
                "descripcion": "Dulces frios",
                "activo": True,
            },
        ]

        categorias = {}

        for datos in categorias_iniciales:
            categoria = session.exec(
                select(Categoria).where(
                    Categoria.nombre == datos["nombre"]
                )
            ).first()

            if not categoria:
                categoria = Categoria(**datos)
                session.add(categoria)
                session.flush()
                print(f"Categoría creada: {categoria.nombre}")
            else:
                print(f"La categoría ya existe: {categoria.nombre}")

            categorias[categoria.nombre] = categoria

        # ----------------------------------
        # PRODUCTOS
        # ----------------------------------
        productos_iniciales = [
            {
                "categoria": "Hamburguesas",
                "nombre": "Hamburguesa clásica",
                "descripcion": "Hamburguesa con carne",
                "precio_base": Decimal("6500.00"),
                "imagen_url": "https://cdn.eatbetter.app/eatbetter-cdn/food-images/sossuz-hamburger-1790273650148.webp?utm_source=chatgpt.com",
                "stock": 19,
            },
            {
                "categoria": "Hamburguesas",
                "nombre": "Hamburguesa completa",
                "descripcion": "Hamburguesa con queso y porción de papas fritas",
                "precio_base": Decimal("8500.00"),
                "imagen_url": "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600",
                "stock": 13,
            },
            {
                "categoria": "Hamburguesas",
                "nombre": "Hamburguesa doble chedar",
                "descripcion": "Hamburguesa con doble carne y queso",
                "precio_base": Decimal("10000.00"),
                "imagen_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
                "stock": 9,
            },
            {
                "categoria": "Pizzas",
                "nombre": "Pizza muzzarella",
                "descripcion": "Pizza clásica de muzzarella",
                "precio_base": Decimal("9000.00"),
                "imagen_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
                "stock": 9,
            },
            {
                "categoria": "Pizzas",
                "nombre": "Pizza napolitana",
                "descripcion": "Pizza con tomate y muzzarella",
                "precio_base": Decimal("10500.00"),
                "imagen_url": "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600",
                "stock": 10,
            },
            {
                "categoria": "Pizzas",
                "nombre": "Pizza especial",
                "descripcion": "Pizza con jamón, morrones y muzzarella",
                "precio_base": Decimal("12000.00"),
                "imagen_url": "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=600",
                "stock": 9,
            },
            {
                "categoria": "Bebidas",
                "nombre": "Pepsi 500 ml",
                "descripcion": "Gaseosa individual",
                "precio_base": Decimal("1800.00"),
                "imagen_url": "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600",
                "stock": 0,
            },
            {
                "categoria": "Bebidas",
                "nombre": "Agua mineral 500 ml",
                "descripcion": "Agua mineral sin gas",
                "precio_base": Decimal("1200.00"),
                "imagen_url": "https://mcdonalds.com.lb/storage/menu-products/January2021/ouYwOzijHGgE9HlEKaLC.png?utm_source=chatgpt.com",
                "stock": 22,
            },
            {
                "categoria": "Hamburguesas",
                "nombre": "Hamburguesa vegetariana especial",
                "descripcion": "Hamburguesa de lentejas, vegetales y queso",
                "precio_base": Decimal("7800.00"),
                "imagen_url": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600",
                "stock": 24,
            },
            {
                "categoria": "Bebidas",
                "nombre": "Cerveza",
                "descripcion": "Lata de 500",
                "precio_base": Decimal("2500.00"),
                "imagen_url": "https://winesndrinks.com/cdn/shop/files/asahi-super-dry-beer-330ml-6211812.webp?v=1765529609&width=1445&utm_source=chatgpt.com",
                "stock": 8,
            },
            {
                "categoria": "Postres",
                "nombre": "Helado",
                "descripcion": "Artesanales",
                "precio_base": Decimal("4000.00"),
                "imagen_url": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600",
                "stock": 33,
            },
        ]

        for datos in productos_iniciales:
            producto_existente = session.exec(
                select(Producto).where(
                    Producto.nombre == datos["nombre"]
                )
            ).first()

            if producto_existente:
                print(f"El producto ya existe: {datos['nombre']}")
                continue

            categoria = categorias[datos["categoria"]]

            producto = Producto(
                categoria_id=categoria.id,
                nombre=datos["nombre"],
                descripcion=datos["descripcion"],
                precio_base=datos["precio_base"],
                imagen_url=datos["imagen_url"],
                stock=datos["stock"],
                disponible=True,
                activo=True,
            )

            session.add(producto)
            print(f"Producto creado: {producto.nombre}")

        session.commit()
        print("\nSeed ejecutado correctamente")

    except Exception:
        session.rollback()
        raise

    finally:
        session.close()


if __name__ == "__main__":
    seed_database()

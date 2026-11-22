import { axiosInstance } from '../../../shared/api/axiosInstance'
import type {
    Producto,
    ProductoCreate,
    ProductoList,
    ProductoUpdate,
} from '../types'

export async function getProductos(filtros: {
    skip?: number
    limit?: number
    search?: string
    categoria_id?: number
    disponible?: boolean
} = {}): Promise<ProductoList> {
    const response = await axiosInstance.get<ProductoList>('/productos/', {
        params: filtros,
    })

    return response.data
}

export async function getProducto(id: number): Promise<Producto> {
    const response = await axiosInstance.get<Producto>(`/productos/${id}`)
    return response.data
}

export async function getTodosProductos(filtros: {
    skip?: number
    limit?: number
    search?: string
    categoria_id?: number
    disponible?: boolean
} = {}): Promise<ProductoList> {
    const response = await axiosInstance.get<ProductoList>(
        '/productos/admin/todos',
        { params: filtros },
    )

    return response.data
}




export async function createProducto(
    datos: ProductoCreate,
): Promise<Producto> {
    const response = await axiosInstance.post<Producto>('/productos/', datos)
    return response.data
}

export async function updateProducto(
    id: number,
    datos: ProductoUpdate,
): Promise<Producto> {
    const response = await axiosInstance.put<Producto>(
        `/productos/${id}`,
        datos,
    )
    return response.data
}

export async function deleteProducto(id: number): Promise<void> {
    await axiosInstance.delete(`/productos/${id}`)
}


export async function activarProducto(id: number): Promise<Producto> {
    const response = await axiosInstance.post<Producto>(
        `/productos/${id}/activar`,
    )
    return response.data
}



export async function updateProductoStock(
    id: number,
    stock: number,
    disponible: boolean,
): Promise<Producto> {
    const response = await axiosInstance.patch<Producto>(
        `/productos/${id}/stock`,
        { stock, disponible },
    )
    return response.data
}
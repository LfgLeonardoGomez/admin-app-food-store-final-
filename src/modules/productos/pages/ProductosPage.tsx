import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getProductos, deleteProducto } from "../../../api/productosApi"
import { useNotification } from "../../../hooks/useNotification"
import { useAuthStore } from "../../../store/useAuthStore"
import type { IProducto } from "../../../types/IProducto"
import { ModalProductos } from "../components/ModalProductos"
import { ConfirmDeleteModal } from "../../../ui/ConfirmDeleteModal"
import { Notification } from "../../../ui/Notification"
import { PageHeader } from "../../../ui/PageHeader"
import { TableActions } from "../../../ui/TableActions"
import { Pagination } from "../../../ui/Pagination"
import { StatusBadge } from "../../../ui/StatusBadge"
import { TH_CLASS, TD_CLASS } from "../../../ui/fieldClasses"

function stockVariant (stock: number): "success" | "warning" | "error" {
    if (stock === 0 ) return "error"
    if (stock <= 5 ) return "warning"
    return "success"
}

export function ProductosPage () {
    const queryCliente = useQueryClient()
    const { mensajeExito, mensajeError, mostrarExito, mostrarError } = useNotification ()
    const isAdmin = useAuthStore ((s)=> s.hasRole("ADMIN"))
    const isStock = useAuthStore ((s) => s.hasRole("STOCK"))

    const [page, setPage] = useState(0)
    const LIMIT = 5

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [ productoToEdit, setProductoToEdit ] = useState <IProducto | undefined> (undefined)
    const [ stockOnly, setStockOnly ] = useState(false)

    const [isDeleteOpen, setIsDeleteOpen ] = useState(false)
    const [idToDelete, setIdToDelete ] = useState <number | null >(null)

    const {data , isLoading, isError } = useQuery ({
        queryKey: ["productos", page],
        queryFn: ()=> getProductos(page * LIMIT, LIMIT),
    })

    const totalPages= Math.ceil((data?.count ?? 0) / LIMIT)

    const deleteMutation = useMutation ({
        mutationFn: (id:number) => deleteProducto (id),
        onSuccess: ()=>{
            queryCliente.invalidateQueries({ queryKey: ["productos"] })
            mostrarExito("Producto eliminado correctamente")
            setIsDeleteOpen(false)
            setIdToDelete(null)
        },
        onError: ()=> {
            mostrarError ("Error al eliminar el producto")
            setIsDeleteOpen (false)
        }
    })

    const handleOpenModal = (producto?: IProducto , soloStock = false) => {
        setProductoToEdit (producto)
        setStockOnly (soloStock)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen (false)
        setProductoToEdit (undefined)
        setStockOnly(false)
    }

    const handleDelete = (id: number) => {
        setIdToDelete(id)
        setIsDeleteOpen(true)
    }

    const handleConfirmDelete = () => {
        if (idToDelete !== null) deleteMutation.mutate(idToDelete)
    }

    return (
        <div className="p-8">

            <PageHeader
                title="Gestión de Productos"
                subtitle= "Administrá el menú y el inventario de stock"
                buttonLabel={isAdmin ? "Nuevo Producto" : undefined }
                onButtonClick= {isAdmin ? ()=> handleOpenModal() : undefined}
            />

            <div className= "bg-surface-container-lowest rounded-xl border border-outline-variant ambient-shadow overflow-hidden">

                {isLoading && (
                    <div className = "flex items-center justify-center py-16 gap-3 text-secondary">
                        <span className="material-symbols-outlined animate-spin text-[24px] overflow-hidden"> progress_activity</span>
                        <span className= "text-body-md"> Cargando productos...</span>
                    </div>
                )}

                {isError && (
                    <div className= "flex items-center gap-2 m-6 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-body-md">
                        <span className= "material-symbols-outlined text-[18px] overflow-hidden">error</span>
                        Ocurrio un error al cargar los datos
                    </div>
                )}

                {data && data.data.length > 0 && (
                    <>
                        <div className = "overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className= "bg-surface-container-low border-b border-outline-variant">
                                        <th className= {TH_CLASS}> ID</th>
                                        <th className= {TH_CLASS}> Nombre</th>
                                        <th className= {TH_CLASS}> Precio</th>
                                        <th className= {TH_CLASS}> Stock</th>
                                        <th className= {TH_CLASS}> Categoria</th>
                                        <th className= {TH_CLASS}> Disponible</th>
                                        {(isAdmin || isStock) && <th className={`${TH_CLASS} text-right`}>Acciones</th>}
                                    </tr>
                                </thead>

                                <tbody className= "divide-y divide-outline-variant">
                                    {data.data.map((prod) => (
                                        <tr key={prod.id} className= "hover:bg-surface-contariner-low transition-colors">
                                            <td className= {TD_CLASS}> #{prod.id}</td>
                                            <td className= {TD_CLASS}>
                                                <div className= "flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded bg-surface-variant flex items-center justify-center shrink-0 overflow-hidden">
                                                        {prod.imagen_url ? (
                                                        <img
                                                            src={prod.imagen_url}
                                                            alt={prod.nombre}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.currentTarget.style.display = "none" }}
                                                         />
                                                        ) : (
                                                        <span className="material-symbols-outlined text-secondary text-[16px] overflow-hidden">
                                                            local_pizza
                                                        </span>
                                                         )}
                                                    </div>
                                                    <span className= "font-medium text-on-surface">{prod.nombre}</span>
                                                </div>
                                            </td>
                                            <td className= {TD_CLASS}>${prod.precio_base}</td>
                                            <td className= {TD_CLASS}>
                                                <StatusBadge
                                                    label={prod.stock_cantidad.toString()}
                                                    variant={stockVariant(prod.stock_cantidad)}
                                                />
                                            </td>
                                            <td className= {TD_CLASS}>
                                                {prod.categorias.length > 0
                                                    ? prod.categorias.map((c) => c.nombre).join (",")
                                                : <span className="text-secondary italic">Sin categoria</span>
                                                }
                                            </td>
                                            <td className= {TD_CLASS}>
                                                <StatusBadge
                                                    label={prod.disponible ? "Activo" : "Inactivo"}
                                                    variant= {prod.disponible ? "success" : "error"}
                                                />
                                            </td>

                                            {(isAdmin || isStock) && (
                                                <td className= {TD_CLASS}>
                                                    <TableActions
                                                        onEdit= {() => handleOpenModal (prod, !isAdmin)}
                                                        onDelete={isAdmin ? () => handleDelete (prod.id) : undefined}
                                                        disabled={deleteMutation.isPending}
                                                    />
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            page= {page}
                            totalPages= {totalPages}
                            total= {data.count}
                            itemLabel="productos"
                            isLoading={isLoading}
                            onPrev={()=> setPage((p) => Math.max (p - 1, 0))}
                            onNext= { ()=> setPage((p) => p + 1)}
                        />
                    </>
                )}

                {data && data.data.length === 0 && (
                    <div className= "flex flex-col items-center justify-center py-16 gap-2 text-secondary">
                        <span className="material-symbols-outlined text-[48px] overflow-hidden">local_pizza</span>
                        <p className= "text-body-md"> No hay productos registrados.</p>
                    </div>
                )}

            </div>

            <ModalProductos
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                productoToEdit={productoToEdit}
                stockOnly= {stockOnly}
            />

            <ConfirmDeleteModal
                isOpen= {isDeleteOpen}
                title= "Eliminar producto"
                message= "¿Estás seguro de que queres eliminar este producto?"
                onConfirm= {handleConfirmDelete}
                onCancel= { () => {setIsDeleteOpen(false); setIdToDelete (null)}}
                isLoading= {deleteMutation.isPending}
            />

            <Notification
                mensajeExito = {mensajeExito}
                mensajeError = {mensajeError}
            />

        </div>
    )

}
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCategorias, deleteCategoria } from "../../../api/categoriasApi"
import { useNotification } from "../../../hooks/useNotification"
import { useAuthStore } from "../../../store/useAuthStore"
import type { ICategoria } from "../../../types/ICategoria"
import { ModalCategorias } from "../components/ModalCategorias"
import { ConfirmDeleteModal } from "../../../ui/ConfirmDeleteModal"
import { Notification } from "../../../ui/Notification"
import { PageHeader } from "../../../ui/PageHeader"
import { TableActions } from "../../../ui/TableActions"
import { Pagination } from "../../../ui/Pagination"
import { StatusBadge } from "../../../ui/StatusBadge"
import { TH_CLASS, TD_CLASS } from "../../../ui/fieldClasses"

/**
 * Página de gestión de categorías del menú.
 * Solo ADMIN puede crear, editar y eliminar.
 * STOCK y PEDIDOS solo pueden ver la tabla.
 */
export function CategoriasPage() {
  const queryClient = useQueryClient()
  const { mensajeExito, mensajeError, mostrarExito, mostrarError } = useNotification()
  const isAdmin = useAuthStore((s) => s.hasRole("ADMIN"))

  const [page, setPage] = useState(0)
  const LIMIT = 10

  const [isModalOpen, setIsModalOpen] = useState(false)
  /** undefined = crear nueva, ICategoria = editar existente */
  const [categoriaToEdit, setCategoriaToEdit] = useState<ICategoria | undefined>(undefined)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [idToDelete, setIdToDelete] = useState<number | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categorias", page],
    queryFn: () => getCategorias(page * LIMIT, LIMIT),
  })

  const totalPages = Math.ceil((data?.count ?? 0) / LIMIT)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] })
      mostrarExito("Categoría eliminada correctamente")
      setIsDeleteOpen(false)
      setIdToDelete(null)
    },
    onError: () => {
      mostrarError("Error al eliminar la categoría")
      setIsDeleteOpen(false)
    },
  })

  /** Abre el modal. Sin argumento = crear, con argumento = editar */
  const handleOpenModal = (categoria?: ICategoria) => {
    setCategoriaToEdit(categoria)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCategoriaToEdit(undefined)
  }

  /** Guarda el ID y abre el modal de confirmación de eliminación */
  const handleDelete = (id: number) => {
    setIdToDelete(id)
    setIsDeleteOpen(true)
  }

  /** Ejecuta la eliminación una vez confirmada */
  const handleConfirmDelete = () => {
    if (idToDelete !== null) deleteMutation.mutate(idToDelete)
  }

  return (
    <div className="p-8">

      <PageHeader
        title="Gestión de Categorías"
        subtitle="Organizá y jerarquizá los productos de tu menú"
        buttonLabel={isAdmin ? "Nueva Categoría" : undefined}
        onButtonClick={isAdmin ? () => handleOpenModal() : undefined}
      />

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant ambient-shadow overflow-hidden">

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3 text-secondary">
            <span className="material-symbols-outlined animate-spin text-[24px] overflow-hidden">progress_activity</span>
            <span className="text-body-md">Cargando categorías...</span>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex items-center gap-2 m-6 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-body-md">
            <span className="material-symbols-outlined text-[18px] overflow-hidden">error</span>
            Ocurrió un error al cargar los datos.
          </div>
        )}

        {/* Tabla */}
        {data && data.data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className={TH_CLASS}>ID</th>
                    <th className={TH_CLASS}>Nombre</th>
                    <th className={TH_CLASS}>Tipo</th>
                    <th className={TH_CLASS}>Subcategoría de</th>
                    {isAdmin && <th className={`${TH_CLASS} text-right`}>Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {data.data.map((cat) => (
                    <tr key={cat.id} className="hover:bg-surface-container-low transition-colors">
                      <td className={TD_CLASS}>#{cat.id}</td>
                      <td className={`${TD_CLASS} font-medium text-on-surface`}>{cat.nombre}</td>
                      <td className={TD_CLASS}>
                        <StatusBadge
                          label={cat.categoria_padre_id ? "Subcategoría" : "Categoría"}
                          variant={cat.categoria_padre_id ? "secondary" : "primary"}
                        />
                      </td>
                      <td className={TD_CLASS}>{cat.categoria_padre_id ?? "—"}</td>
                      {isAdmin && (
                        <td className={TD_CLASS}>
                          <TableActions
                            onEdit={() => handleOpenModal(cat)}
                            onDelete={() => handleDelete(cat.id)}
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
              page={page}
              totalPages={totalPages}
              total={data.count}
              itemLabel="categorías"
              isLoading={isLoading}
              onPrev={() => setPage((p) => Math.max(p - 1, 0))}
              onNext={() => setPage((p) => p + 1)}
            />
          </>
        )}

        {/* Sin datos */}
        {data && data.data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-secondary">
            <span className="material-symbols-outlined text-[48px] overflow-hidden">category</span>
            <p className="text-body-md">No hay categorías registradas.</p>
          </div>
        )}

      </div>

      <ModalCategorias
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        categoriaToEdit={categoriaToEdit}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        title="Eliminar categoría"
        message="¿Estás seguro de que querés eliminar esta categoría? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={() => { setIsDeleteOpen(false); setIdToDelete(null) }}
        isLoading={deleteMutation.isPending}
      />

      <Notification mensajeExito={mensajeExito} mensajeError={mensajeError} />
    </div>
  )
}
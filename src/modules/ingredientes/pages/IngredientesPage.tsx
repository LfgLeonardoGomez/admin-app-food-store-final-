import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getIngredientes, deleteIngrediente } from "../../../api/ingredientesApi"
import { useNotification } from "../../../hooks/useNotification"
import { useAuthStore } from "../../../store/useAuthStore"
import type { IIngrediente } from "../../../types/IIngrediente"
import { ModalIngredientes } from "../components/ModalIngredientes"
import { ConfirmDeleteModal } from "../../../ui/ConfirmDeleteModal"
import { Notification } from "../../../ui/Notification"
import { PageHeader } from "../../../ui/PageHeader"
import { TableActions } from "../../../ui/TableActions"
import { Pagination } from "../../../ui/Pagination"
import { StatusBadge } from "../../../ui/StatusBadge"
import { TH_CLASS, TD_CLASS } from "../../../ui/fieldClasses"

export function IngredientesPage() {
  const queryClient = useQueryClient()
  const { mensajeExito, mensajeError, mostrarExito, mostrarError } = useNotification()
  const isAdmin = useAuthStore((s) => s.hasRole("ADMIN"))

  const [page, setPage] = useState(0)
  const LIMIT = 5

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [ingredienteToEdit, setIngredienteToEdit] = useState<IIngrediente | undefined>(undefined)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [idToDelete, setIdToDelete] = useState<number | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ingredientes", page],
    queryFn: () => getIngredientes(page * LIMIT, LIMIT),
  })

  const totalPages = Math.ceil((data?.count ?? 0) / LIMIT)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteIngrediente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredientes"] })
      mostrarExito("Ingrediente eliminado correctamente")
      setIsDeleteOpen(false)
      setIdToDelete(null)
    },
    onError: () => {
      mostrarError("Error al eliminar el ingrediente")
      setIsDeleteOpen(false)
    },
  })

  const handleOpenModal = (ingrediente?: IIngrediente) => {
    setIngredienteToEdit(ingrediente)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setIngredienteToEdit(undefined)
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
        title="Gestión de Ingredientes"
        subtitle="Controlá los ingredientes disponibles y sus alérgenos"
        buttonLabel={isAdmin ? "Nuevo Ingrediente" : undefined}
        onButtonClick={isAdmin ? () => handleOpenModal() : undefined}
      />

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant ambient-shadow overflow-hidden">

        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3 text-secondary">
            <span className="material-symbols-outlined animate-spin text-[24px] overflow-hidden">progress_activity</span>
            <span className="text-body-md">Cargando ingredientes...</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-2 m-6 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-body-md">
            <span className="material-symbols-outlined text-[18px] overflow-hidden">error</span>
            Ocurrió un error al cargar los datos.
          </div>
        )}

        {data && data.data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className={TH_CLASS}>ID</th>
                    <th className={TH_CLASS}>Nombre</th>
                    <th className={TH_CLASS}>Descripción</th>
                    <th className={TH_CLASS}>Alérgeno</th>
                    <th className={TH_CLASS}>Disponible</th>
                    {isAdmin && <th className={`${TH_CLASS} text-right`}>Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {data.data.map((ing) => (
                    <tr key={ing.id} className="hover:bg-surface-container-low transition-colors">
                      <td className={TD_CLASS}>#{ing.id}</td>
                      <td className={`${TD_CLASS} font-medium text-on-surface`}>{ing.nombre}</td>
                      <td className={TD_CLASS}>{ing.descripcion ?? "—"}</td>
                      <td className={TD_CLASS}>
                        <StatusBadge
                          label={ing.es_alergeno ? "Sí" : "No"}
                          variant={ing.es_alergeno ? "warning" : "secondary"}
                        />
                      </td>
                      <td className={TD_CLASS}>
                        <StatusBadge
                          label={ing.disponible ? "Activo" : "Inactivo"}
                          variant={ing.disponible ? "success" : "error"}
                        />
                      </td>
                      {isAdmin && (
                        <td className={TD_CLASS}>
                          <TableActions
                            onEdit={() => handleOpenModal(ing)}
                            onDelete={() => handleDelete(ing.id)}
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
              itemLabel="ingredientes"
              isLoading={isLoading}
              onPrev={() => setPage((p) => Math.max(p - 1, 0))}
              onNext={() => setPage((p) => p + 1)}
            />
          </>
        )}

        {data && data.data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-secondary">
            <span className="material-symbols-outlined text-[48px] overflow-hidden">inventory_2</span>
            <p className="text-body-md">No hay ingredientes registrados.</p>
          </div>
        )}

      </div>

      <ModalIngredientes
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        ingredienteToEdit={ingredienteToEdit}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        title="Eliminar ingrediente"
        message="¿Estás seguro de que querés eliminar este ingrediente? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={() => { setIsDeleteOpen(false); setIdToDelete(null) }}
        isLoading={deleteMutation.isPending}
      />

      <Notification mensajeExito={mensajeExito} mensajeError={mensajeError} />
    </div>
  )
}
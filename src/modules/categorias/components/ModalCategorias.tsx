import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createCategoria, updateCategoria, getCategorias } from "../../../api/categoriasApi"
import { useForm } from "../../../hooks/useForm"
import { useNotification } from "../../../hooks/useNotification"
import { Notification } from "../../../ui/Notification"
import { INPUT_MT } from "../../../ui/fieldClasses"
import type { ICategoria, ICategoriaCreate } from "../../../types/ICategoria"

interface ModalCategoriasProps {
  isOpen: boolean
  onClose: () => void
  categoriaToEdit?: ICategoria
}

/** Tipo interno del formulario — parent_id es string para el input, se convierte al enviar */
type CategoriaForm = {
  nombre: string
  descripcion: string
  categoria_padre_id: string
}

const EMPTY_FORM: CategoriaForm = {
  nombre: "",
  descripcion: "",
  categoria_padre_id: "",
}

/**
 * Modal de creación y edición de categorías.
 * Si recibe categoriaToEdit, opera en modo edición.
 * El campo parent_id es opcional — si se deja vacío la categoría es raíz.
 */
export function ModalCategorias({ isOpen, onClose, categoriaToEdit }: ModalCategoriasProps) {
  const queryClient = useQueryClient()
  const { mensajeExito, mensajeError, mostrarExito, mostrarError } = useNotification()
  const { formState, handleChange, setFormState } = useForm<CategoriaForm>(EMPTY_FORM)

  const { data: categoriasData } = useQuery({
    queryKey: ["categorias"],
    queryFn: ()=> getCategorias(0,100)
  })

  // Solo categorías raíz (sin padre) pueden ser padre de otra
  const categoriasRaiz = (categoriasData?.data ?? []).filter(
    (c) => !c.categoria_padre_id && c.id !== categoriaToEdit?.id
  )

  useEffect(() => {
    if (categoriaToEdit) {
      setFormState({
        nombre: categoriaToEdit.nombre,
        descripcion: categoriaToEdit.descripcion ?? "",
        categoria_padre_id: categoriaToEdit.categoria_padre_id?.toString() ?? "",
      })
    } else {
      setFormState(EMPTY_FORM)
    }
  }, [categoriaToEdit, isOpen, setFormState])

  /** Convierte el formulario al tipo que espera el backend */
  const buildPayload = (): ICategoriaCreate => ({
    nombre: formState.nombre,
    descripcion: formState.descripcion || null,
    categoria_padre_id: formState.categoria_padre_id ? Number(formState.categoria_padre_id) : null,
  })

  const createMutation = useMutation({
    mutationFn: (data: ICategoriaCreate) => createCategoria(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] })
      mostrarExito("Categoría creada correctamente")
      setTimeout(onClose, 1000)
    },
    onError: () => mostrarError("Error al crear la categoría"),
  })

  const updateMutation = useMutation({
    mutationFn: (data: ICategoriaCreate) => updateCategoria(categoriaToEdit!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] })
      mostrarExito("Categoría actualizada correctamente")
      setTimeout(onClose, 1000)
    },
    onError: () => mostrarError("Error al actualizar la categoría"),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = buildPayload()
    if (categoriaToEdit) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  if (!isOpen) return null

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-xl ambient-shadow w-full max-w-112 overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
          <h2 className="text-headline-md font-semibold text-on-surface">
            {categoriaToEdit ? "Editar Categoría" : "Nueva Categoría"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-secondary hover:bg-surface-container-high rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] overflow-hidden">close</span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div>
            <label className="block text-label-lg text-on-surface-variant">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formState.nombre}
              onChange={handleChange}
              required
              disabled={isPending}
              placeholder="Ej: Pizzas, Bebidas..."
              className={INPUT_MT}
            />
          </div>

          <div>
            <label className="block text-label-lg text-on-surface-variant">Descripción</label>
            <textarea
              name="descripcion"
              value={formState.descripcion}
              onChange={handleChange}
              rows={3}
              disabled={isPending}
              placeholder="Descripción opcional..."
              className={INPUT_MT}
            />
          </div>

          <div>
            <label className="block text-label-lg text-on-surface-variant">
              Categoría padre{" "}
              <span className="text-secondary font-normal">(opcional)</span>
            </label>
            <select
              name="categoria_padre_id"
              value={formState.categoria_padre_id}
              onChange={handleChange}
              disabled={isPending}
              className={INPUT_MT}
            >
              <option value=""> - Categoria raiz - </option>
              {categoriasRaiz.map((c) => (
                <option key= {c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-lg border border-outline-variant text-label-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg text-label-lg text-on-primary hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px] overflow-hidden">
                    progress_activity
                  </span>
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </button>
          </div>

        </form>
      </div>

      <Notification mensajeExito={mensajeExito} mensajeError={mensajeError} />
    </div>
  )
}
import { useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createIngrediente, updateIngrediente } from "../../../api/ingredientesApi"
import { useForm } from "../../../hooks/useForm"
import { useNotification } from "../../../hooks/useNotification"
import { Notification } from "../../../ui/Notification"
import { INPUT_MT } from "../../../ui/fieldClasses"
import type { IIngrediente, IIngredienteCreate } from "../../../types/IIngrediente"

interface ModalIngredientesProps {
  isOpen: boolean
  onClose: () => void
  ingredienteToEdit?: IIngrediente
}

type IngredienteForm = {
  nombre: string
  descripcion: string
  es_alergeno: boolean
}

const EMPTY_FORM: IngredienteForm = {
  nombre: "",
  descripcion: "",
  es_alergeno: false,
}

export function ModalIngredientes({ isOpen, onClose, ingredienteToEdit }: ModalIngredientesProps) {
  const queryClient = useQueryClient()
  const { mensajeExito, mensajeError, mostrarExito, mostrarError } = useNotification()
  const { formState, handleChange, setFormState } = useForm<IngredienteForm>(EMPTY_FORM)

  useEffect(() => {
    if (ingredienteToEdit) {
      setFormState({
        nombre: ingredienteToEdit.nombre,
        descripcion: ingredienteToEdit.descripcion ?? "",
        es_alergeno: ingredienteToEdit.es_alergeno,
      })
    } else {
      setFormState(EMPTY_FORM)
    }
  }, [ingredienteToEdit, isOpen, setFormState])

  const buildPayload = (): IIngredienteCreate => ({
    nombre: formState.nombre,
    descripcion: formState.descripcion || null,
    es_alergeno: formState.es_alergeno,
  })

  const createMutation = useMutation({
    mutationFn: (data: IIngredienteCreate) => createIngrediente(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredientes"] })
      mostrarExito("Ingrediente creado correctamente")
      setTimeout(onClose, 1000)
    },
    onError: () => mostrarError("Error al crear el ingrediente"),
  })

  const updateMutation = useMutation({
    mutationFn: (data: IIngredienteCreate) => updateIngrediente(ingredienteToEdit!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredientes"] })
      mostrarExito("Ingrediente actualizado correctamente")
      setTimeout(onClose, 1000)
    },
    onError: () => mostrarError("Error al actualizar el ingrediente"),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = buildPayload()
    if (ingredienteToEdit) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  if (!isOpen) return null

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-xl ambient-shadow w-full max-w-[28rem] overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
          <h2 className="text-headline-md font-semibold text-on-surface">
            {ingredienteToEdit ? "Editar Ingrediente" : "Nuevo Ingrediente"}
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
              placeholder="Ej: Mozzarella, Harina..."
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

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="es_alergeno"
              name="es_alergeno"
              checked={formState.es_alergeno}
              onChange={handleChange}
              disabled={isPending}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="es_alergeno" className="text-label-lg text-on-surface-variant cursor-pointer">
              Es alérgeno
            </label>
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
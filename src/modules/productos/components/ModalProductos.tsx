import { useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createProducto, updateProducto } from "../../../api/productosApi"
import { useForm } from "../../../hooks/useForm"
import { useNotification } from "../../../hooks/useNotification"
import { Notification } from "../../../ui/Notification"
import { INPUT_MT } from "../../../ui/fieldClasses"
import type { IProducto, IProductoCreate } from "../../../types/IProducto"

interface ModalProductosProps {
    isOpen: boolean
    onClose: ()=> void
    productoToEdit?: IProducto
}

type ProductoForm = {
    nombre: string
    descripcion: string
    precio_base: string
    imagen_url: string
    stock_cantidad: string
    disponible: boolean
}

const EMPTY_FORM: ProductoForm = {
    nombre: "",
    descripcion: "",
    precio_base: "",
    imagen_url: "",
    stock_cantidad: "0",
    disponible: true,
}

export function ModalProductos({ isOpen, onClose, productoToEdit }: ModalProductosProps) {
    const queryClient = useQueryClient()
    const { mensajeExito , mensajeError, mostrarExito, mostrarError } = useNotification ()
    const { formState, handleChange, setFormState } = useForm <ProductoForm> (EMPTY_FORM)

    useEffect(() => {
        if (productoToEdit) {
            setFormState({
                nombre: productoToEdit.nombre,
                descripcion: productoToEdit.descripcion ?? "",
                precio_base: productoToEdit.precio_base,
                imagen_url: productoToEdit.imagen_url ?? "",
                stock_cantidad: productoToEdit.stock_cantidad.toString(),
                disponible: productoToEdit.disponible,
            })
        } else {
            setFormState(EMPTY_FORM)
        }
    } ,[productoToEdit, isOpen, setFormState])

    const buildPayload = (): IProductoCreate => ({
        nombre: formState.nombre,
        descripcion: formState.descripcion || null ,
        precio_base: formState.precio_base,
        imagen_url: formState.imagen_url || null,
        stock_cantidad: Number (formState.stock_cantidad),
        disponible: formState.disponible,
    })

    const createMutation = useMutation({
    mutationFn: (data: IProductoCreate) => createProducto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] })
      mostrarExito("Producto creado correctamente")
      setTimeout(onClose, 1000)
    },
    onError: () => mostrarError("Error al crear el producto"),
  })

  const updateMutation = useMutation({
    mutationFn: (data: IProductoCreate) => updateProducto(productoToEdit!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] })
      mostrarExito("Producto actualizado correctamente")
      setTimeout(onClose, 1000)
    },
    onError: () => mostrarError("Error al actualizar el producto"),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = buildPayload()
    if (productoToEdit) {
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
            {productoToEdit ? "Editar Producto" : "Nuevo Producto"}
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
              placeholder="Ej: Pizza Muzzarella..."
              className={INPUT_MT}
            />
          </div>

          <div>
            <label className="block text-label-lg text-on-surface-variant">Descripción</label>
            <textarea
              name="descripcion"
              value={formState.descripcion}
              onChange={handleChange}
              rows={2}
              disabled={isPending}
              placeholder="Descripción opcional..."
              className={INPUT_MT}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-label-lg text-on-surface-variant">Precio base</label>
              <input
                type="text"
                name="precio_base"
                value={formState.precio_base}
                onChange={handleChange}
                required
                disabled={isPending}
                placeholder="Ej: 12000"
                className={INPUT_MT}
              />
            </div>
            <div>
              <label className="block text-label-lg text-on-surface-variant">Stock</label>
              <input
                type="number"
                name="stock_cantidad"
                value={formState.stock_cantidad}
                onChange={handleChange}
                min={0}
                disabled={isPending}
                className={INPUT_MT}
              />
            </div>
          </div>

          <div>
            <label className="block text-label-lg text-on-surface-variant">URL de imagen</label>
            <input
              type="text"
              name="imagen_url"
              value={formState.imagen_url}
              onChange={handleChange}
              disabled={isPending}
              placeholder="https://... (opcional)"
              className={INPUT_MT}
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="disponible"
              name="disponible"
              checked={formState.disponible}
              onChange={handleChange}
              disabled={isPending}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="disponible" className="text-label-lg text-on-surface-variant cursor-pointer">
              Disponible
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


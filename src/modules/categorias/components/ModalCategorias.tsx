import { useEffect, useState, useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createCategoria, updateCategoria, getCategorias } from "../../../api/categoriasApi"
import { useForm } from "../../../hooks/useForm"
import { useNotification } from "../../../hooks/useNotification"
import { Notification } from "../../../ui/Notification"
import { INPUT_MT } from "../../../ui/fieldClasses"
import type { ICategoria, ICategoriaCreate } from "../../../types/ICategoria"
import { uploadImagen , deleteImagen} from "../../../api/uploadsApi"

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
  imagen_url: string
}

const EMPTY_FORM: CategoriaForm = {
  nombre: "",
  descripcion: "",
  categoria_padre_id: "",
  imagen_url: "",
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

  const [isUploading, setIsUploading] = useState(false)
  const [ currentPublicId, setCurrentPublicId] = useState <string | null> (null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        imagen_url: categoriaToEdit.imagen_url ?? "",
      })
    } else {
      setFormState(EMPTY_FORM)
    }
  }, [categoriaToEdit, isOpen, setFormState])

  //CLOUDINARY
    const handleFileChange = async (e: React.ChangeEvent <HTMLInputElement>) => {
        const file = e.target.files?. [0]
        if (!file) return
        setIsUploading(true)
        try {
            const result = await uploadImagen (file, "categorias")
            setFormState((prev) => ({ ...prev, imagen_url: result.secure_url}))
            setCurrentPublicId(result.public_id)
        } catch {
            mostrarError("Error al subir la imagen")
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }
    const handleRemoveImagen = async () => {
    if (currentPublicId) {
        try {
            await deleteImagen(currentPublicId)
        } catch {
            mostrarError("No se pudo eliminar la imagen")
            return
        }
    }
    setFormState((prev) => ({ ...prev, imagen_url: "" }))
    setCurrentPublicId(null)
}

  /** Convierte el formulario al tipo que espera el backend */
  const buildPayload = (): ICategoriaCreate => ({
    nombre: formState.nombre,
    descripcion: formState.descripcion || null,
    categoria_padre_id: formState.categoria_padre_id ? Number(formState.categoria_padre_id) : null,
    imagen_url: formState.imagen_url || null,
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

          {/* Cloudinary */}
          <div>
            <label className= "block text-label-lg text-on-surface-variant"> Imagen</label>
              <input
                ref= {fileInputRef}
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={isPending || isUploading}
              />

              {formState.imagen_url ? (
                <div className= "mt-2 flex items-center gap-3">
                  <img
                    src={formState.imagen_url}
                    alt="preview"
                    className= "w-16 h-16 rounded-lg object-cover border border-outline-variant"
                  />
                  <button
                  type="button"
                  onClick= {handleRemoveImagen}
                  disabled= {isPending || isUploading}
                  className= "text-label-md text-error hover:underline disabled:opacity-50">
                    Quitar
                  </button>
                </div>
                ) : (
                <button
                  type= "button"
                  onClick= {() => fileInputRef.current?.click()}
                  disabled= {isPending || isUploading}
                  className= "mt-2 flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-label-md text-on-surface-variant hover:bg-surface-container disabled:opacity-50">
                  {isUploading ? (
                   <>
                     <span className="material-symbols-outlined animate-spin text-[18px] overflow-hidden">progress_activity</span>
                       Subiendo...
                  </>
                    ) : (
                   <>
                      <span className= "material-symbols-outlined text-[18px] overflow-hidden">upload</span>
                        Subir imagen
                   </>
                   )}
                  </button>  
                )}
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
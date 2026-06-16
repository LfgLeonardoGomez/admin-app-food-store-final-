import { useEffect, useState, useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createProducto, updateProducto, updateProductoStock, updateProductoCategorias} from "../../../api/productosApi"
import { getCategorias } from "../../../api/categoriasApi"
import { useForm } from "../../../hooks/useForm"
import { useNotification } from "../../../hooks/useNotification"
import { Notification } from "../../../ui/Notification"
import { INPUT_MT } from "../../../ui/fieldClasses"
import type { IProducto, IProductoCreate } from "../../../types/IProducto"
import { uploadImagen, deleteImagen } from "../../../api/uploadsApi"

interface ModalProductosProps {
    isOpen: boolean
    onClose: ()=> void
    productoToEdit?: IProducto
    stockOnly?: boolean
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

export function ModalProductos({ isOpen, onClose, productoToEdit, stockOnly = false }: ModalProductosProps) {
    const queryClient = useQueryClient()
    const { mensajeExito , mensajeError, mostrarExito, mostrarError } = useNotification ()
    const { formState, handleChange, setFormState } = useForm <ProductoForm> (EMPTY_FORM)

    const [selectedCategorias, setSelectedCategorias] = useState<number []>([])

    //isUploading bloquea el submit mientras Cloudinary procesa el archivo
    //currentPublicId se necesita para poder elimianr la imagen 
    // fileInputRef permite disparar el file picker desde el boton sin exponer el input
    const [isUploading, setIsUploading] = useState(false)
    const [currentPublicId, setCurrentPublicId] = useState <string | null>(null)
    const fileInputRef = useRef <HTMLInputElement>(null)

    const { data: categoriasData } = useQuery({
        queryKey: ["categorias-all"],
        queryFn: () => getCategorias(0, 100),
        enabled: isOpen && !stockOnly,
    })

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

            setSelectedCategorias( productoToEdit.categorias.map((c) => c.id))
        } else {
            setFormState(EMPTY_FORM)
            setSelectedCategorias([])
        }
    } ,[productoToEdit, isOpen, setFormState])

    const toggleCategoria = (id: number) => {
        setSelectedCategorias((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        )
    }
    //Sube el archivo a Cloudinary del backend y guarda la URL segura en el form
    const handleFileChange = async (e: React.ChangeEvent <HTMLInputElement>) => {
        const file = e.target.files?. [0]
        if (!file) return
        setIsUploading(true)
        try {
            const result = await uploadImagen (file, "productos")
            setFormState((prev) => ({ ...prev, imagen_url: result.secure_url}))
            setCurrentPublicId(result.public_id)
        } catch {
            mostrarError("Error al subir la imagen")
        } finally {
            setIsUploading(false)
            //resetea el input para permitir seleccionar el mismo archivo de nuevo si el upload fallo
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }
    // Elimina la imagen antes de limpiar el estado local
    const handleRemoveImagen = async () => {
        if (currentPublicId) {
            try {
                await deleteImagen(currentPublicId)
            } catch {
                mostrarError ("No se pudo eliminar la imagen")
                return
            }
        }
        setFormState( (prev) => ({ ...prev, imagen_url: ""}))
        setCurrentPublicId(null)
    }

    const buildPayload = (): IProductoCreate => ({
        nombre: formState.nombre,
        descripcion: formState.descripcion || null ,
        precio_base: formState.precio_base,
        imagen_url: formState.imagen_url || null,
        stock_cantidad: Number (formState.stock_cantidad),
        disponible: formState.disponible,
    })

    const createMutation = useMutation({
    mutationFn: async (data: IProductoCreate) => {
        const producto = await createProducto(data)
        await updateProductoCategorias(producto.id, selectedCategorias)
        return producto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] })
      mostrarExito("Producto creado correctamente")
      setTimeout(onClose, 1000)
    },
    onError: () => mostrarError("Error al crear el producto"),
  })

  const updateMutation = useMutation({
        mutationFn: async (data: IProductoCreate) => {
            await updateProducto (productoToEdit!.id, data)
            await updateProductoCategorias(productoToEdit!.id, selectedCategorias)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos"] })
            mostrarExito("Producto actualizado correctamente")
            setTimeout(onClose, 1000)
        },
        onError: () => mostrarError("Error al actualizar el producto"),
    })

    const updateStockMutation = useMutation({
        mutationFn: () => updateProductoStock(productoToEdit!.id, {
            stock_cantidad: Number(formState.stock_cantidad),
            disponible: formState.disponible,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos"] })
            mostrarExito("Stock actualizado correctamente")
            setTimeout(onClose, 1000)
        },
        onError: () => mostrarError("Error al actualizar el stock"),
    })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (stockOnly) {
      updateStockMutation.mutate()
    } else if (productoToEdit) {
      updateMutation.mutate(buildPayload())
    } else {
      createMutation.mutate(buildPayload())
    }
  }

  if (!isOpen) return null

  const isPending = createMutation.isPending || updateMutation.isPending || updateStockMutation.isPending

 return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-container-lowest rounded-xl ambient-shadow w-full max-w-112 overflow-hidden">

                <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                    <h2 className="text-headline-md font-semibold text-on-surface">
                        {stockOnly ? "Actualizar Stock" : productoToEdit ? "Editar Producto" : "Nuevo Producto"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-secondary hover:bg-surface-container-high rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px] overflow-hidden">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {!stockOnly && (
                        <>
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
                                    rows={1}
                                    disabled={isPending}
                                    placeholder="Descripción opcional..."
                                    className={INPUT_MT}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
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
                          
                            {/* Upload de imagen - el input nativo esta oculto y se dispara desde el boton*/}
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

                            <div>
                                <label className = "block text-label-lg text-on-surface-variant mb-1"> Categorias</label>
                                {categoriasData && categoriasData.data.length > 0 ? (
                                    <div className = "max-h-32 overflow-y-auto border border-outline-variant rounded-lg p-3 grid grid-cols-2 gap-2">
                                        {categoriasData.data.map((cat) => (
                                            <label 
                                                key= {cat.id}
                                                className= "flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked= {selectedCategorias.includes(cat.id)}
                                                        onChange= {() => toggleCategoria(cat.id)}
                                                            disabled={isPending}
                                                            className= "w-4 h-4 accent-primary"
                                                    />
                                                    <span className = "text-body-md text-on-surface">{cat.nombre}</span>
                                            </label> 
                                        ))}
                                    </div>
                                ) : (
                                    <p className = "text-body-sm text-secondary italic mt-1"> No hay categorias disponibles</p>
                                )}
                            </div>
                        </>
                    )}

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


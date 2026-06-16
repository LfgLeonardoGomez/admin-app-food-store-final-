import { useEffect, useState, useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createProducto, updateProducto, updateProductoStock, updateProductoCategorias, updateProductoIngredientes } from "../../../api/productosApi"
import { getCategorias } from "../../../api/categoriasApi"
import { getIngredientes } from "../../../api/ingredientesApi"
import { useForm } from "../../../hooks/useForm"
import { useNotification } from "../../../hooks/useNotification"
import { Notification } from "../../../ui/Notification"
import { INPUT_MT } from "../../../ui/fieldClasses"
import type { IProducto, IProductoCreate } from "../../../types/IProducto"
import { uploadImagen, deleteImagen } from "../../../api/uploadsApi"

const UNIDADES_MEDIDA = [
    { id: 1, nombre: "Kilogramo", simbolo: "kg" },
    { id: 2, nombre: "Gramo", simbolo: "g" },
    { id: 3, nombre: "Litro", simbolo: "L" },
    { id: 4, nombre: "Mililitro", simbolo: "ml" },
    { id: 5, nombre: "Unidad", simbolo: "ud" },
    { id: 6, nombre: "Porción", simbolo: "porciones" },
]

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

    const [selectedCategorias, setSelectedCategorias] = useState<number[]>([])
    const [selectedIngredientes, setSelectedIngredientes] = useState<{ id: number; es_removible: boolean }[]>([])
    const [unidadVentaId, setUnidadVentaId] = useState<number | null>(null)

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

    const { data: ingredientesData, isLoading: isLoadingIngredientes } = useQuery({
        queryKey: ["ingredientes-all"],
        queryFn: () => getIngredientes(0, 100),
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

            setSelectedCategorias(productoToEdit.categorias.map((c) => c.id))
            setSelectedIngredientes(
                productoToEdit.ingredientes.map((i) => ({
                    id: i.id,
                    es_removible: i.es_removible ?? true,
                }))
            )
        } else {
            setFormState(EMPTY_FORM)
            setSelectedCategorias([])
            setSelectedIngredientes([])
            setUnidadVentaId(null)
        }
    } ,[productoToEdit, isOpen, setFormState])

    const toggleCategoria = (id: number) => {
        setSelectedCategorias((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id])
    }

    const toggleIngrediente = (id: number) => {
        setSelectedIngredientes((prev) =>
            prev.some((i) => i.id === id)
                ? prev.filter((i) => i.id !== id)
                : [...prev, { id, es_removible: true }]
        )
    }

    const toggleRemovible = (id: number) => {
        setSelectedIngredientes((prev) =>
            prev.map((i) => i.id === id ? { ...i, es_removible: !i.es_removible } : i)
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
        descripcion: formState.descripcion || null,
        precio_base: formState.precio_base,
        imagen_url: formState.imagen_url || null,
        stock_cantidad: Number(formState.stock_cantidad),
        disponible: formState.disponible,
        unidad_medida_id: unidadVentaId,
    })

    const createMutation = useMutation({
    mutationFn: async (data: IProductoCreate) => {
        const producto = await createProducto(data)
        await updateProductoCategorias(producto.id, selectedCategorias)
        if (selectedIngredientes.length > 0)
            await updateProductoIngredientes(producto.id, selectedIngredientes.map(i => i.id))
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
            await updateProducto(productoToEdit!.id, data)
            await updateProductoCategorias(productoToEdit!.id, selectedCategorias)
            if (selectedIngredientes.length > 0)
                await updateProductoIngredientes(productoToEdit!.id, selectedIngredientes.map(i => i.id))
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
            <div className="bg-surface-container-lowest rounded-xl ambient-shadow w-full max-w-112 overflow-hidden max-h-[90vh] flex flex-col">

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

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">

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
                                <label className="block text-label-lg text-on-surface-variant mb-1">Categorías</label>
                                {categoriasData && categoriasData.data.length > 0 ? (
                                    <div className="max-h-32 overflow-y-auto border border-outline-variant rounded-lg p-3 grid grid-cols-2 gap-2">
                                        {categoriasData.data.map((cat) => (
                                            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategorias.includes(cat.id)}
                                                    onChange={() => toggleCategoria(cat.id)}
                                                    disabled={isPending}
                                                    className="w-4 h-4 accent-primary"
                                                />
                                                <span className="text-body-md text-on-surface">{cat.nombre}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-body-sm text-secondary italic mt-1">No hay categorías disponibles</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-label-lg text-on-surface-variant mb-1">Unidad de medida</label>
                                <select
                                    value={unidadVentaId ?? ""}
                                    onChange={(e) => setUnidadVentaId(e.target.value ? Number(e.target.value) : null)}
                                    disabled={isPending}
                                    className={INPUT_MT}
                                >
                                    <option value="">— Sin unidad —</option>
                                    {UNIDADES_MEDIDA.map((u) => (
                                        <option key={u.id} value={u.id}>{u.nombre} ({u.simbolo})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-label-lg text-on-surface-variant mb-1">Ingredientes</label>
                                {isLoadingIngredientes ? (
                                    <p className="text-body-sm text-secondary italic mt-1">Cargando ingredientes...</p>
                                ) : ingredientesData && ingredientesData.data.filter((i) => i.disponible).length > 0 ? (
                                    <div className="max-h-40 overflow-y-auto border border-outline-variant rounded-lg p-3 flex flex-col gap-2">
                                        {ingredientesData.data.filter((i) => i.disponible).map((ing) => {
                                            const seleccionado = selectedIngredientes.find((s) => s.id === ing.id)
                                            return (
                                                <div key={ing.id} className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!seleccionado}
                                                        onChange={() => toggleIngrediente(ing.id)}
                                                        disabled={isPending}
                                                        className="w-4 h-4 accent-primary shrink-0"
                                                    />
                                                    <span className="text-body-md text-on-surface flex-1">
                                                        {ing.nombre}
                                                        {ing.es_alergeno && (
                                                            <span className="ml-2 text-[11px] font-medium px-1.5 py-0.5 rounded bg-warning-container text-on-warning-container">Alérgeno</span>
                                                        )}
                                                    </span>
                                                    {seleccionado && (
                                                        <label className="flex items-center gap-1.5 text-body-sm text-secondary cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={seleccionado.es_removible}
                                                                onChange={() => toggleRemovible(ing.id)}
                                                                disabled={isPending}
                                                                className="w-3.5 h-3.5 accent-secondary"
                                                            />
                                                            Removible
                                                        </label>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-body-sm text-secondary italic mt-1">No hay ingredientes disponibles</p>
                                )}
                            </div>
                        </>
                    )}

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

                    {stockOnly && productoToEdit && productoToEdit.ingredientes.length > 0 && (
                        <div>
                            <label className="block text-label-lg text-on-surface-variant mb-1">Ingredientes</label>
                            <div className="flex flex-wrap gap-2">
                                {productoToEdit.ingredientes.map((ing) => (
                                    <span
                                        key={ing.id}
                                        className="px-2.5 py-1 rounded-full text-body-sm bg-surface-container text-on-surface border border-outline-variant"
                                    >
                                        {ing.nombre}
                                        {!ing.es_removible && (
                                            <span className="ml-1 text-secondary text-[11px]">· fijo</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
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


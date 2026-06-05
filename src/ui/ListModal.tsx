import type {ReactNode} from "react"

interface ListModalProps {
    isOpen: boolean
    onClose: ()=> void
    title: string
    children: ReactNode
}

export function ListModal ({ isOpen, onClose, title, children }: ListModalProps){
    if (!isOpen) return null

    return (
        <div className = "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className = "bg-surface-container-lowest rounded-xl w-full max-w-160 shadow-xl">
                <div className = "flex items-center justify-between px-6 py-4 border-b border-outline-variant">
                    <h2 className= "text-title-lg font-semibold text-on-surface">{title}</h2>
                    <button
                        onClick= {onClose}
                        className= "w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
                        
                        <span className= "material-symbols-outlined text-[18px] overflow-hidden">close</span>
                    </button>
                </div>

                <div className= "px-6 -py-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
                    {children}
                </div>

                <div className= "px-6 py-4 border-t border-outline-variant flex justify-end">
                    <button
                        onClick= {onClose}
                        className= "px-5 py-2 bg-primary text-on-primary rounded-xl text-label-lg font-medium hover:brightness-110 transition-all">
                            Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}
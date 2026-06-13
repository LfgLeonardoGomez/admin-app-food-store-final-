import apiClient from "./axiosInstance"

export interface CloudinaryResponse {
    secure_url: string
    public_id: string
    width: number
    height: number
    format: string
    resource_type: string
}

export async function uploadImagen(file: File, folder: string = "productos"): Promise <CloudinaryResponse> {
    const formData= new FormData()
    formData.append("file", file)
    formData.append("folder",folder)

    const { data } = await apiClient.post<CloudinaryResponse>(
        "/api/v1/uploads/imagen",
        formData,
        { headers: { "Content-Type" : "multipart/form-data" } }
    )
    return data
}

export async function deleteImagen(publicId: string) : Promise <void> {
    await apiClient.delete(`/api/v1/uploads/imagen/${encodeURIComponent(publicId)}`)
}

export function extractPublicIdFromUrl(url: string): string | null {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/)
    return match ? match[1] : null
}
import type { AuthUser } from "../types/auth"

export const MOCK_ADMIN_USER: AuthUser = {
    id: 1,
    nombre: "Admin",
    apellido: "Test",
    email: "admin@test.com",
    roles: ["ADMIN"],
}
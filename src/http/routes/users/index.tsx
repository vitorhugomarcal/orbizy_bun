import { Elysia } from "elysia"
import { createUser } from "./createUser"
import { getProfile } from "./getProfile"
import { updateUser } from "./updateProfile"

const userRoutes = new Elysia().use(getProfile).use(updateUser).use(createUser)

export default userRoutes

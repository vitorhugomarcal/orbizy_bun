import { Elysia } from "elysia"
import { createUser } from "./createUser"
import { getProfile } from "./getProfile"
import { removeTeam } from "./removeTeam"
import { updateUser } from "./updateProfile"

const userRoutes = new Elysia()
  .use(getProfile)
  .use(updateUser)
  .use(createUser)
  .use(removeTeam)

export default userRoutes

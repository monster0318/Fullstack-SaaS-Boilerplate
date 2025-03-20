import { initUsersData } from "./initUsersData"
import { drizzle } from "drizzle-orm/node-postgres"
import { drizzleOrm } from "../packageDrizzle"
const { eq } = drizzleOrm
import { userTable, userCredentialTable } from "../db/schema"
// import { userTable, deviceTable, userCredentialTable } from "../db/schema"
import * as schema from "../db/schema"
import dotenv from "dotenv"
dotenv.config({ path: "../../server.env" })
const databaseUrl = process.env.DATABASE_URL!
const db = drizzle(databaseUrl, { schema })

const main = async () => {
  console.log(`Seeding ${databaseUrl}...`)
  // const db = drizzle(databaseUrl)
  // await db.delete(userCredentialTable)
  // await db.delete(deviceTable)
  // await db.delete(userTable)
  for (const user of initUsersData) {
    let userNew = await db.insert(userTable).values(user).returning({ id: userTable.id })
    await db.insert(userCredentialTable).values({
      userId: userNew[0].id,
      passwordHash: user.password,
    })
    // let users = await db.insert(userTable).values(user).returning({ id: userTable.id })
    // await db.insert(userCredentialTable).values({
    //   userId: users[0].id,
    //   passwordHash: user.password,
    // })
  }

  const userCheck = await db.query.userTable.findFirst({
    where: eq(userTable.email, "aa@dsd,com"),
    columns: { id: true, name: true, image: true },

    // This should drops an error. But why not?
    with: {
      userCredential_SHOULD_DROP_A_TYPE_ERROR: {
        columns: {
          passwordHash: true,
        },
      },
    },
  })

  console.log(`Done!`)
  process.exit(0)
}
main()

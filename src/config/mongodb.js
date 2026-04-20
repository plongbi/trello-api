import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment'

// Khởi tạo 1 đối tượng trelloDataBaseInstance ban đầu là null vì chưa connect
let trelloDataBaseInstance = null


// Khởi tạo 1 đối tượng mongoClientInstance để connect mongodb
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Connect DB
export const CONNECT_DB = async () => {
  await mongoClientInstance.connect()

  trelloDataBaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

// Get DB
export const GET_DB = () => {
  if (!trelloDataBaseInstance) throw Error('Must connect DB first!')
  return trelloDataBaseInstance
}

// Close DB
export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}
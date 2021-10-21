import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import listEndpoints from "express-list-endpoints";

const port = process.env.PORT | 3005
const mongoConnection = process.env.MONGO_URL
const server = express()

server.use(cors())
server.use(express.json())

console.table(listEndpoints(server))

mongoose.connect(mongoConnection, { useNewUrlParser: true }).then(() => {
    server.listen(port, () => {
      console.log("Server listening on port", port, "and connected to DB");
    });
  });


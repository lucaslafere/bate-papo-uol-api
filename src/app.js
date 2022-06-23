import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import express, { json } from 'express';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(json());

const mongoClient = new MongoClient(process.env.MONGO_URI);


let db;

//incompleto
app.post('/participants', async (req, res) => {
    const username = req.body.name;
    try {
        mongoClient.connect()
        const databaseUol = mongoClient.db("api-uol");
        const collectionParticipants = databaseUol.collection("participants");
        if (!username) {
            res.status(422).send("Preencha o campo de usuário")
            return
        }
        await collectionParticipants.insertOne({name: username})


    } catch (error) {
        console.error(error)
    }
})

app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`)
}) 
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import express, { json } from 'express';
import cors from 'cors';
import joi from 'joi';

dotenv.config();
const app = express();
app.use(cors());
app.use(json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;


app.post('/participants', async (req, res) => {
    const username = req.body.name;
    try {
        await mongoClient.connect();
        db = mongoClient.db("api-uol");
        const collectionParticipants = db.collection("participants");
        if (!username) {
            res.status(422).send("Preencha o campo de usuário");
            mongoClient.close();
            return;
        }
        await collectionParticipants.insertOne({ name: username });
        res.sendStatus(200);
        mongoClient.close();
        return;

    } catch (error) {
        res.status(500).send(error);
        mongoClient.close();
        return;
    }
})

app.get('/participants', async (req, res) => {
    let participants;
    try {
        await mongoClient.connect();
        db = mongoClient.db("api-uol");
        const collectionParticipants = db.collection("participants");
        participants = await collectionParticipants.find().toArray();
        res.status(200).send(participants);
        mongoClient.close();
        return;

    } catch (error) {
        res.status(500).send(error);
        mongoClient.close();
        return;
    }
})

app.post('/messages', async (req, res) => {
    try {
        await mongoClient.connect();

    } catch (error) {
        res.status(500).send(error);
        mongoClient.close();
        return;
    }
})

app.get('/messages', async (req, res) => {
    try {
        await mongoClient.connect();

    } catch (error) {
        res.status(500).send(error);
        mongoClient.close();
        return;
    }
})

app.post('/status', async (req, res) => {
    try {
        await mongoClient.connect();

    } catch (error) {
        res.status(500).send(error);
        mongoClient.close();
        return;
    }
})

app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`)
}) 
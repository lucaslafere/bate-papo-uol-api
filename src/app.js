import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import express, { json } from 'express';
import cors from 'cors';
import joi from 'joi';
import dayjs from 'dayjs';

dotenv.config();
const app = express();
app.use(cors());
app.use(json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

const participantSchema = joi.object({
    name: joi.string().required()
});

app.post('/participants', async (req, res) => {
    const username = req.body;
    const validation = participantSchema.validate(username, { abortEarly: false });  
    if (validation.error) {
        console.log(validation.error.details)
        res.status(422).send(validation.error.details);
        return;     
    }
    try {
        await mongoClient.connect();
        db = mongoClient.db("api-uol");
        const collectionParticipants = db.collection("participants");
        const collectionRoomMessage = db.collection("roomMessage");
        const checkSameUser = await collectionParticipants.findOne(username);

        if (checkSameUser) {
            res.status(409).send(`O nome ${username.name} já existe`);
            return;
        }

        await collectionParticipants.insertOne({name: username.name, lastStatus: Date.now()});
        await collectionRoomMessage.insertOne({from: username.name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('HH:mm:ss')})
        res.sendStatus(201);
        return;

    } catch (error) {
        res.status(500).send(error);
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
        return;

    } catch (error) {
        res.status(500).send(error);
        return;
    }
})

app.post('/messages', async (req, res) => {
    try {
        await mongoClient.connect();

    } catch (error) {
        res.status(500).send(error);
        return;
    }
})

app.get('/messages', async (req, res) => {
    try {
        await mongoClient.connect();

    } catch (error) {
        res.status(500).send(error);
        return;
    }
})

app.post('/status', async (req, res) => {
    try {
        await mongoClient.connect();

    } catch (error) {
        res.status(500).send(error);
        return;
    }
})

app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`)
}) 
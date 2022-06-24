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
const messageSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().valid('private_message', 'message').required()
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
        await collectionRoomMessage.insertOne({from: username.name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('HH:mm:ss')});
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
    const message = req.body;
    const from = req.headers.user;
    const validation = messageSchema.validate(message, { abortEarly: false });
    if (validation.error) {
        console.log(validation.error.details);
        res.status(422).send(validation.error.details);
        return
    }
    if (!req.headers.user) {
        res.sendStatus(422);
        return;
    }
    try {
        await mongoClient.connect();
        db = mongoClient.db("api-uol");
        const collectionRoomMessage = db.collection("roomMessage");
        const collectionParticipants = db.collection("participants");
        await console.log(from);
        const checkExistingUser = await collectionParticipants.findOne({name: from});

        if (!checkExistingUser) {
            res.status(422).send(`O nome ${from} não existe`);
            return;
        }
        await collectionRoomMessage.insertOne({from: from, to: message.to, text: message.text, type: message.type, time: dayjs().format('HH:mm:ss')});
        res.status(201).send("funcionou");
        return;

    } catch (error) {
        res.status(500).send(error);
        return;
    }
})

app.get('/messages', async (req, res) => {
    let messages;
    const limit = parseInt(req.query.limit);
    const user = req.headers.user;

    if (!req.headers.user) {
        res.sendStatus(422);
        return;
    }

    try {
        await mongoClient.connect();
        db = mongoClient.db("api-uol");
        const collectionRoomMessage = db.collection("roomMessage");
        
    
    if (!req.query.limit) {
        messages = await collectionRoomMessage.find({  $or : [ {"from" : user}, {"to" : user}, {"type" : "message"}, {"type" : "status"} ] } ).toArray();
        res.status(200).send(messages);
        return;
    }
        messages = await collectionRoomMessage.find({  $or : [ {"from" : user}, {"to" : user}, {"type" : "message"} ] } ).limit(limit).toArray();
        res.status(200).send(messages);
        return;


    } catch (error) {
        res.status(500).send(error);
        return;
    }
})

app.post('/status', async (req, res) => {
    const user = req.headers.user;

    if (!req.headers.user) {
        res.sendStatus(422);
        return;
    }
    try {
        await mongoClient.connect();
        db = mongoClient.db("api-uol");
        const collectionParticipants = db.collection("participants");
        const checkSameUser = await collectionParticipants.findOne({name: user});
        if (!checkSameUser) {
            res.status(404).send(`O usuário ${user} não foi encontrado`);
            return;
        }
        await collectionParticipants.updateOne({
            name: user
        }, { $set: {lastStatus: Date.now()}});
        res.status(200).send("funcionou");
        return;

    } catch (error) {
        res.status(500).send(error);
        return;
    }
})

async function deleteParticipants () {
    let participants;
    const currentDate = Date.now();
    const tenSecondsInMs = 10000
    try {
        await mongoClient.connect();
        db = mongoClient.db("api-uol");
        const collectionParticipants = db.collection("participants");
        const collectionRoomMessage = db.collection("roomMessage");
        participants = await collectionParticipants.find().toArray();
        for (let i = 0; i < participants.length; i++){
            if (participants[i].lastStatus + tenSecondsInMs < currentDate) {
                collectionParticipants.deleteOne({lastStatus: participants[i].lastStatus})
                await collectionRoomMessage.insertOne({from: participants[i].name, to: 'Todos', text: 'sai da sala...', type: 'status', time: dayjs().format('HH:mm:ss')})
            }
        }
    } catch (error) {
        res.status(500).send(error);
        return;
    }
}

setInterval(deleteParticipants, 15000);

app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`)
}) 
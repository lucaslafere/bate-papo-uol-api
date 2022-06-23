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


app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`)
}) 
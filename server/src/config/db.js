const mongoose = require('mongoose');
const { Pool } = require('pg');
const { createClient } = require('redis');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const connectMongo = async (retries = 5) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(`MongoDB Connection Failed: ${err.message}`);
        if (retries > 0) {
            console.log(`Retrying MongoDB in 5s... (${retries} left)`);
            await sleep(5000);
            return connectMongo(retries - 1);
        }
    }
};

let pgPool = null;

const connectPostgres = async (retries = 5) => {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URI,
        ssl: process.env.POSTGRES_URI && process.env.POSTGRES_URI.includes('ssl=true') ? { rejectUnauthorized: false } : false
    });
    try {
        await pool.connect();
        console.log('PostgreSQL Connected');
        pgPool = pool;
        return pool;
    } catch (err) {
        console.error(`PostgreSQL Connection Failed: ${err.message}`);
        if (retries > 0) {
            console.log(`Retrying PostgreSQL in 5s... (${retries} left)`);
            await sleep(5000);
            return connectPostgres(retries - 1);
        }
    }
};

const connectRedis = async (retries = 5) => {
    const client = createClient({ url: process.env.REDIS_URI });
    client.on('error', (err) => console.error('Redis Client Error', err));
    try {
        await client.connect();
        console.log('Redis Connected');
        return client;
    } catch (err) {
        console.error(`Redis Connection Failed: ${err.message}`);
        if (retries > 0) {
            console.log(`Retrying Redis in 5s... (${retries} left)`);
            await sleep(5000);
            return connectRedis(retries - 1);
        }
    }
};

const connectDBs = async () => {
    await Promise.all([connectMongo(), connectPostgres(), connectRedis()]);
};

const getPgPool = () => pgPool;

module.exports = { connectDBs, getPgPool };

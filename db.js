import mongoose from 'mongoose';

const db = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/mma_db');
        console.log("Connected to MMA Database...");
    } catch (err) {
        console.log("Database connection error: " + err);
    }
};

export default db;
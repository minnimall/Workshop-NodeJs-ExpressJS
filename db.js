const mongoose = require('mongoose');

main().catch((err) => console.log('MongoDB error:', err.message));

async function main() {
    const uri =
        process.env.MONGO_URI ||
        `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

    await mongoose.connect(uri);
    console.log("Connected DB Success.");
}
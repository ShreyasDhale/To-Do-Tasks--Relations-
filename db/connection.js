const mongoose = require('mongoose');

async function main() {
    const uri = "mongodb+srv://shreyasdhale7249:pB7RwrQc8o9tAHcv@cluster0.vph7pc9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(uri);
    console.log("Connected to the collection users");
}

main().catch(error => console.log(error));
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pazji.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log('db connected');

async function run() {
    try {
        await client.connect();
        const database = client.db("inventory").collection("stocks");

        app.get('/inventory' , async (req , res)=>{
            const query = {};
            const cursor = database.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
     
    } finally {
        
    }
}
run().catch(console.dir);





















app.get('/', (req, res) => {
    res.send('Alhamdulillah server running');
})

app.listen(port, () => {
    console.log('listening to port', port)
})

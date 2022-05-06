const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pazji.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log('db connected');

async function run() {
    try {
        await client.connect();
        const database = client.db("inventory").collection("stocks");

        app.get('/inventory', async (req, res) => {
            const query = {};
            const cursor = database.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/addone', async (req, res) => {
            const email = req.query.email;
            // console.log(email);
            const query = { email: email };
            const cursor = database.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/inventory/:id', async (req, res) => {
            const id = req.params;
            const query = { _id: ObjectId(id) };
            const result = await database.findOne(query);
            res.send(result);
        })

        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params;
            const query = { _id: ObjectId(id) };
            const result = await database.deleteOne(query);
            res.send(result)
        })

        app.post('/inventory', async (req, res) => {
            const postdoc = req.body;
            const result = await database.insertOne(postdoc);
            res.send(result);
        })

        app.put('/inventory/:id', async (req, res) => {
            const id = req.params;
            const updatedProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updatedProduct.quantity
                },
            };
            const result = await database.updateOne(filter, updateDoc, options);
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

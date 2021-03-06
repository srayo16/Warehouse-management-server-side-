const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        // console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pazji.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log('db connected');

async function run() {
    try {
        await client.connect();
        const database = client.db("inventory").collection("stocks");
        const reviewCollection = client.db("inventory").collection("reviews");


        // AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        // SERVICES API

        app.get('/inventory', async (req, res) => {
            const query = {};
            const cursor = database.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/addone', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            // console.log(email);
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = database.find(query);
                const result = await cursor.toArray();
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
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

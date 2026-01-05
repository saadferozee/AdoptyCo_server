require('dotenv').config()
const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 3568

const app = express()
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://adoption-web-by-saadferozee.web.app"
    ],
    credentials: true
}));
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster-pet-adoption-we.9wpgqt6.mongodb.net/?appName=Cluster-pet-adoption-web`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


app.listen(port, () => {
    console.log(`Server is running from ${port}`);
})

async function run() {
    try {

        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // here is my code
        app.get('/', (req, res) => {
            res.send('hello from my database.')
        })

        const database0 = client.db('users')
        const users = database0.collection('user-list')

        app.post('/add-user', async (req, res) => {
            const user = req.body
            const result = await users.insertOne(user)
            res.send(result)
        })
        app.get('/users', async (req, res) => {
            const result = await users.find().toArray()
            res.send(result)
        })
        app.get('/users/user/:email', async (req, res) => {
            const { email } = req.params
            const query = { email: email }
            const result = await users.findOne(query)
            if (!result) {
                return res.send(false);
            }
            res.send(result.email === email || false)
        })
        app.get('/users/info', async (req, res) => {
            const { email } = req.query
            const query = { email: email }
            const result = await users.findOne(query)
            if (!result) {
                return res.send(false);
            }
            res.send({ role: result.role })
        })

        const database = client.db('listings')
        const listings = database.collection('pet-listings')

        app.post('/listings', async (req, res) => {
            const data = req.body;
            const result = await listings.insertOne(data)
            res.send(result)
        })
        app.get('/listings', async (req, res) => {
            const result = await listings.find().toArray()
            res.send(result)
        })
        app.get('/listings/recentListings', async (req, res) => {
            const result = await listings.find().sort({ _id: -1 }).limit(6).toArray()
            res.send(result)
        })
        app.get('/listings/product/:id', async (req, res) => {
            const { id } = req.params
            const query = { _id: new ObjectId(id) }
            const result = await listings.findOne(query)
            res.send(result)
        })
        app.get('/listings/myListings/:email', async (req, res) => {
            const { email } = req.params
            const query = { email: email }
            const result = await listings.find(query).toArray()
            res.send(result)
        })
        app.get('/listings/category/:category', async (req, res) => {
            const { category } = req.params
            const query = { category: category }
            const result = await listings.find(query).toArray()
            res.send(result)
        })
        app.put('/listings/update/:id', async (req, res) => {
            const data = req.body
            const { id } = req.params
            const query = { _id: new ObjectId(id) }
            const updatedProductDetails = {
                $set: data
            }
            const result = await listings.updateOne(query, updatedProductDetails)
            res.send(result)
        })
        app.delete('/listings/delete/:id', async (req, res) => {
            const { id } = req.params
            const query = { _id: new ObjectId(id) }
            const result = await listings.deleteOne(query)
            res.send(result)
        })

        const database2 = client.db('orders')
        const orders = database2.collection('product-orders')

        app.post('/orders', async (req, res) => {
            const data = req.body;
            const result = await orders.insertOne(data)
            res.send(result)
        })
        app.get('/orders', async (req, res) => {
            const result = await orders.find().toArray()
            res.send(result)
        })
        app.get('/orders/:email', async (req, res) => {
            const { email } = req.params
            const query = { buyerEmail: email }
            const result = await orders.find(query).toArray()
            res.send(result)
        })

        // my code end here

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rvjkksn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // maxPoolSize: 10,
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect()

        const toysCollection = client.db("toysDb").collection("toys")


        //post
        app.post('/allToys', async (req, res) => {
            const toy = req.body;
            const result = await toysCollection.insertOne(toy)
            res.send(result)
        })

        // get >> all
        app.get('/allToys', async (req, res) => {
            const cursor = toysCollection.find()
            const result = await cursor.limit(20).toArray()
            res.send(result)
        })

        //categorywise
        app.get('/all/:subCategory', async (req, res) => {
            console.log(req.params.subCategory);
            if (req.params.subCategory == "car" || req.params.subCategory == "bike" || req.params.subCategory == "truck") {
                const result = await toysCollection.find({ subCategory: req.params.subCategory }).toArray()
                return res.send(result)
            }
            const result = await toysCollection.find({ subCategory: req.params.subCategory }).toArray()
            return res.send(result)

        })

        // get:signleidData  
        app.get('/allToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(query)
            res.send(result)
        })

        // get data by email 
        app.get('/myToys/:email', async (req, res) => {
            console.log(req.params.email);
            const result = await toysCollection.find({ email: req.params.email }).toArray()
            return res.send(result)

        })

        //update
        app.put('/updatetoy/:id', async (req, res) => {
            const id = req.params.id;
            const updateToy = req.body;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const toy = {
                $set: {
                    ...updateToy
                },
            };

            const result = await toysCollection.updateOne(filter, toy, options)
            res.send(result)

        })
        //delete
        app.delete('/deletetoy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query)
            res.send(result)
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('toys server is running')
})
app.listen(port, () => {
    console.log(`Toys server is runnig on Port:${port}`);
})
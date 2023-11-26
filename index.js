const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
//  middleware
app.use(cors())
app.use(express.json());
// featured products

// faraazhossainimran
// 56W2FLKwCdsxqbP5

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ubvpwhw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const productCollection = client.db("productPeakDb").collection("products")
    // get featured products
    app.get('/products/featured', async(req, res)=> {
        const query = {productStatus: "featured"}
        const result = await productCollection.find(query).toArray()
        res.send(result)
    })
    // get treanding products
    app.get('/products/trending', async(req, res)=> {
        const result = await productCollection.find().sort({voteCount: -1}).limit(6).toArray()
        res.send(result)
    })
    // get accepted products
    app.get('/products', async(req, res)=> {
        const query = {productChecked: "yes"}
        const result = await productCollection.find(query).toArray()
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


app.get('/', async(req, res) => {
res.send("product peak server is runing")
})

app.listen(port, ()=> {
    console.log(`server is running is on port: ${port}`);
})
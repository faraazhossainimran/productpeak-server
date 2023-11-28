const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
//  middleware
app.use(cors());
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
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const productCollection = client.db("productPeakDb").collection("products");
    const userCollection = client.db("productPeakDb").collection("users");
    // get featured products
    app.get("/products/featured", async (req, res) => {
      const query = { productStatus: "featured" };
      const result = await productCollection.find(query).limit(4).toArray();
      res.send(result);
    });
    // get treanding products
    app.get("/products/trending", async (req, res) => {
      const query = {productChecked: "yes"}
      const result = await productCollection
        .find(query)
        .sort({ voteCount: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });
    // get accepted products
    app.get("/products", async (req, res) => {
      const query = { productChecked: "yes" };
      const result = await productCollection.find(query).toArray();
      res.send(result);
    });
    // get a single product details
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });
    // post a single product 
    app.post('/products', async(req, res) => {
      const productInfo = req.body;
      const doc = {
        productName: productInfo.productName,
        productImage: productInfo.productImage,
        description: productInfo.description,
        productOwner: productInfo.productOwner,
        productChecked: productInfo.productChecked,
        productOwnerEmail: productInfo.productOwnerEmail,
        productOwnerImage: productInfo.productOwnerImage,
        voteCount: productInfo.voteCount
      }
      const result = await productCollection.insertOne(doc)
      res.send(result)
    })

    // review related endpoint
    app.patch("/product/review/:id", async (req, res) => {
      const newReviews = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $push: {
          reviews: {
            reviewFrom: newReviews.reviewFrom,
            userEmail: newReviews.userEmail,
            userImage: newReviews.userImage,
            reviewText: newReviews.reviewText,
            reviewRating: newReviews.reviewRating,
          },
        },
      };
      const result = await productCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    // users related endpoints
    app.post('/user', async(req, res)=> {
      const userInfo = req.body;
      const doc = {
        userName : userInfo.userName, 
        userEmail: userInfo.userEmail,
        userPhoto: userInfo.userPhoto

      }
      const result = await userCollection.insertOne(doc)
      res.send(result)
    })
    // admin related api 
    app.get('/dashboard/myProducts/:email', async(req, res)=> {
      const email = req.params.email;
      const query = {productOwnerEmail: email}
      const result = await productCollection.find(query).toArray()
      res.send(result)
    })
    // delete products from my product page 

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("product peak server is runing");
});

app.listen(port, () => {
  console.log(`server is running is on port: ${port}`);
});

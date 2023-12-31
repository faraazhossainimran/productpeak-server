const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
//  middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://steady-kelpie-61d494.netlify.app"],
  credentials: true,
}));
app.use(express.json());
// featured products

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
    // await client.connect();
    const productCollection = client.db("productPeakDb").collection("products");
    const userCollection = client.db("productPeakDb").collection("users");
    const discussionCollection = client.db("productPeakDb").collection("discussion");
    // get featured products
    app.get("/products/featured", async (req, res) => {
      const query = { productStatus: "featured" };
      const result = await productCollection.find(query).limit(4).toArray();
      res.send(result);
    });
    // get treanding products
    app.get("/products/trending", async (req, res) => {
      const query = { productChecked: "yes" };
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
    app.post("/products", async (req, res) => {
      const productInfo = req.body;
      console.log(productInfo);
      const doc = {
        productName: productInfo.productName,
        productImage: productInfo.productImage,
        description: productInfo.description,
        productOwner: productInfo.productOwner,
        productChecked: productInfo.productChecked,
        productOwnerEmail: productInfo.productOwnerEmail,
        productOwnerImage: productInfo.productOwnerImage,
        voteCount: productInfo.voteCount,
        tags: productInfo.tags
      };
      const result = await productCollection.insertOne(doc);
      console.log(result);
      res.send(result);
    });

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
    // upvote related endpoint
    app.patch("/product/upVote/:id", async (req, res) => {
      const email = req.body;
      // if (!email) {
      //   return res.status(401).json({ error: "user not logged in" });
      // }
      const id = req.params.id;
      console.log(email, id);
      const filter = {
        _id: new ObjectId(id),
      };
      const updateDoc = {
        $push: {
          upVote: {
            upVotedEmail: email,
          },
        },
      };
      const result = await productCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // discussion related endpoints
    // post a discussion
    app.post("/discussion", async(req, res) => {
      const discussionInfo = req.body;
      const doc = {
        name: discussionInfo.displayName,
        email: discussionInfo.email,
        question: discussionInfo.question,
        photo: discussionInfo.photo
      }
      const result = await discussionCollection.insertOne(doc);
      res.send(result)
    })
    // get discussion
    app.get("/discussion", async(req, res)=> {
      const result = await discussionCollection.find().toArray()
      res.send(result)
    })
    // get a single discussion

    // users related endpoints
    app.post("/user", async (req, res) => {
      const userInfo = req.body;
      const doc = {
        userName: userInfo.userName,
        userEmail: userInfo.userEmail,
        userPhoto: userInfo.userPhoto,
      };
      const result = await userCollection.insertOne(doc);
      res.send(result);
    });
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      let modarator = false;
      let productOwner = false;
      if (user) {
        admin = user.role === "admin";
        modarator = user.role === "modarator";
      } else {
        productOwner = true;
      }
      res.send({ admin, modarator, productOwner });
    });
    // admin related api
    app.get("/dashboard/myProducts/:email", async (req, res) => {
      const email = req.params.email;
      const query = { productOwnerEmail: email };
      const result = await productCollection.find(query).toArray();
      res.send(result);
    });
    // product queue in the dashboard api
    app.get("/dashboard/productReviewQueue/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });
    app.patch("/dashboard/productReviewQueue/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          productChecked: "yes",
        },
      };
      const result = await productCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // delete products from my product page
    app.delete("/dashboard/myProducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });
    // modarator related api
    app.get("/dashboard/queueProducts", async (req, res) => {
      const query = { productChecked: "no" };
      const result = await productCollection.find(query).toArray();
      res.send(result);
    });
    // manage Users api
    app.get("/dashboard/manageUsers", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    // upadte user role
    app.patch(`/dashboard/manageUsers/:id`, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "modarator",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      console.log(result);
      res.send(result);
    });
    // udpate user role to admin
    app.patch(`/dashboard/manageUsers/admin/:id`, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      console.log(result);
      res.send(result);
    });
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

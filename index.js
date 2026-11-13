const express = require('express');
const { MongoClient, ObjectId } = require("mongodb")
const app = express()
const port = 3000
const cors = require("cors")
app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('Activities running')
})
const client = new MongoClient("mongodb+srv://activities-tracker:nrvqr2bcucCXafCW@cluster0.gqu9vmb.mongodb.net/");
async function connectToMongoDB() {
    try {
        const db = client.db("ActivitiesTracker")
        const activitiesCollection = db.collection("activities")

        app.post("/activities", async (req, res) => {
            const activity = req.body
            const result = await activitiesCollection.insertOne(activity)
            res.send(result)
        })

        app.get("/next-start-time", async (req, res) => {
            const { endTime } = await activitiesCollection.findOne({}, { sort: { _id: -1 }, projection: { _id: 0, endTime: 1 } })
            res.send(endTime)

        })

        app.get("/activities", async (req, res) => {
            const result = await activitiesCollection.find().toArray()
            res.send(result)

        })








        console.log("You successfully connected to MongoDB!");
        return client;
    } catch (err) {
        console.dir(err);
    }
}
connectToMongoDB()

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
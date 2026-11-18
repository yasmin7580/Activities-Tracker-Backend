const express = require('express');
const { MongoClient, ObjectId } = require("mongodb")
const app = express()
const port = 3000

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

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
            // today , all 
            const { date, search, from, to } = req.query

            let query = {}


            if (search) {
                query.description = {
                    $regex: search,
                    $options: "i"
                }
            }
            if (from) {
                query.startTime = { $gte: new Date(from).toISOString() }
            }
            if (to) {
                query.endTime = { $lte: new Date(new Date(to).setHours(23, 59, 59, 999)).toISOString() }
            } else {
                query.endTime = { $lte: new Date(new Date().setHours(23, 59, 59, 999)).toISOString() }
            }

            if (date) {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                tomorrow.setHours(0, 0, 0, 0)
                query = {
                    startTime: {
                        $gte: today.toISOString(),
                        $lte: tomorrow.toISOString()
                    }
                }
                console.log({ today, tomorrow })
            }
            console.log(query)
            const result = await activitiesCollection.find(query).sort({ _id: -1 }).toArray()
            setTimeout(() => {
                res.send(result)
            }, 2000);
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
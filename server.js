import db from "./db.js"; 
import Fighter from "./models/fighter.js"; 
import express from 'express'; 

const app = express(); 
db();
const port = 8080;

app.use(express.static("public")); 
app.use(express.json()); 
app.use(express.urlencoded({extended:false})); 

// ROUTE: Default
app.get("/", async (req, res) => {
    try {
        const allFighters = await Fighter.find({});
        res.render("index.pug", { fighters: allFighters });
    } catch (err) {
        res.status(500).send("Database Error: " + err);
    }
});

// ROUTE: Get all fighters
app.get("/fighters", async (req, res) => {
    try {
        const allFighters = await Fighter.find({});
        res.render("fighters.pug", { fighters: allFighters });
    } catch (err) {
        res.status(500).send("Database Error: " + err);
    }
});

// ROUTE: Insert a new fighter
app.post("/insert", async (req, res) => {
    try {
        const result = await Fighter.create(req.body); // create is the Mongoose version of insertOne
        res.send(result);
    } catch (err) {
        res.send(err);
    }
});

app.listen(port, (err) => {
    if(err) console.log(err); 
    console.log("Server is running at port number: " + port);
});
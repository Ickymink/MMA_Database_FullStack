import db from "./db.js"; 
import bcrypt from 'bcrypt';
import User from './models/user.js';
import Fighter from "./models/fighter.js"; 
import express from 'express'; 
import session from 'express-session';
import multer from 'multer';
import path from 'path';

const app = express(); 
app.set('view engine', 'pug');
db();
const port = 8080;

app.use(express.static("public")); 
app.use(express.json()); 
app.use(express.urlencoded({extended:true})); 
app.use(session({
    secret: 'ufc-secret-key', // This is used to sign the session ID cookie
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // Keep user logged in for 1 day
}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "flag") {
            // Put flags in the Countries folder
            cb(null, './public/Images/Countries/');
        } else {
            // Put fighter portraits in the main images folder
            cb(null, './public/Images/');
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); 
    }
});

const upload = multer({ storage: storage });

// ROUTE: Default
app.get("/", async (req, res) => {
    try {
        const query = {}; 
        const fighters = await Fighter.find(query).sort({ gender: -1, name: 1 });
        
        res.render("index.pug", { 
            fighters: fighters, 
            user: req.session.userName, 
            isAdmin: req.session.isAdmin 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading home page");
    }
});

// ROUTE: Get all fighters
app.get("/fighters", async (req, res) => {
    try {
        const allFighters = await Fighter.find({});
        res.render("fighters.pug", { 
            fighters: allFighters,
            user: req.session.userName,
            isAdmin: req.session.isAdmin
        });
    } catch (err) {
        res.status(500).send("Database Error: " + err);
    }
});

// ROUTE: Insert a new fighter
app.post("/insert", upload.fields([{ name: 'image' }, { name: 'flag' }]), async (req, res) => {
    try {
        // Validation: Ensure name is provided
        if (!req.body.name || req.body.name.trim() === "") {
            return res.status(400).send("Fighter name is required.");
        }

        // The Search/Insert Logic:
        await Fighter.create({
            name: req.body.name,
            record: req.body.record,
            weightClass: req.body.weightClass,
            gender: req.body.gender,
            style: req.body.style,
            image: req.files['image'] ? `/Images/${req.files['image'][0].originalname}` : '',
            flag: req.files['flag'] ? `/Images/Countries/${req.files['flag'][0].originalname}` : '',
            accomplishments: req.body.accomplishments ? req.body.accomplishments.split(',').map(acc => acc.trim()) : []
        });

        res.redirect('/admin');
    } catch (err) {
        console.error("Insert Error:", err);
        res.status(500).send("Error adding fighter to database.");
    }
});

// ROUTE: Delete a fighter
app.post("/delete/:id", async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(403).send("Unauthorized");
    }

    try {
        const fighterId = req.params.id;
        await Fighter.findByIdAndDelete(fighterId);
        
        console.log(`Fighter ${fighterId} deleted successfully.`);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting fighter.");
    }
});

// GET: Show the edit form with current data
app.get("/edit/:id", async (req, res) => {
    if (!req.session.isAdmin) return res.redirect("/login");
    try {
        const fighter = await Fighter.findById(req.params.id);
        res.render("edit.pug", { fighter: fighter });
    } catch (err) {
        res.status(500).send("Error finding fighter");
    }
});

// POST: Update the record in MongoDB
app.post("/update/:id", upload.fields([{ name: 'image' }, { name: 'flag' }]), async (req, res) => {
    try {
        const updates = req.body;

        // If new files were uploaded, update the paths
        if (req.files['image']) {
            updates.image = `/images/${req.files['image'][0].originalname}`;
        }
        if (req.files['flag']) {
            updates.flag = `/images/Countries/${req.files['flag'][0].originalname}`;
        }
        
        // Handle accomplishments split
        if (req.body.accomplishments) {
            updates.accomplishments = req.body.accomplishments.split(',').map(item => item.trim());
        }

        // The Update Operation
        await Fighter.findByIdAndUpdate(req.params.id, updates);
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send("Update failed");
    }
});

// Show Login Page
app.get('/login', (req, res) => {
    res.render('login.pug');
});

// Show Signup Page
app.get('/signup', (req, res) => {
    res.render('signup.pug');
});

// POST route for login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // SERVER-SIDE VALIDATION
        if (!email || !password) {
            return res.render("login.pug", { error: "Please enter both email and password." });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("login.pug", { error: "User not found." });
        }

        // Compare the plain text password with the hashed one
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("login.pug", { error: "Invalid password." });
        }

        if (isMatch) {
            // Save info to the session
            req.session.userId = user._id;
            req.session.userName = user.name;
            req.session.isAdmin = user.isAdmin;

            res.redirect('/'); 
        } else {
            res.send("Invalid password!");
        }

    } catch (err) {
        res.status(500).send("Login error.");
    }
});

// POST for Signup
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // SERVER-SIDE VALIDATION
        if (!name || !email || !password) {
            return res.render("signup.pug", { error: "All fields are required." });
        }
        if (password.length < 6) {
            return res.render("signup.pug", { error: "Password must be at least 6 characters long." });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.render("signup.pug", { error: "An account with this email already exists." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user in the database
        const newUser = new User({
            name,
            email,
            password: hashedPassword 
        });

        await newUser.save();
        res.redirect('/login');
        
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating account.");
    }
});

app.get('/logout', (req, res) => {
    // Destroys the session bucket for this user
    req.session.destroy((err) => {
        if (err) {
            console.log("Error logging out:", err);
            return res.redirect('/');
        }
        // Clear the cookie on the browser side
        res.clearCookie('connect.sid'); 
        // Send them home
        res.redirect('/'); 
    });
});

app.get("/admin", async (req, res) => {
    if (!req.session.isAdmin) return res.redirect("/login");

    try {
        let query = {};
        const searchTerm = req.query.search;

        if (searchTerm) {
            query = { name: { $regex: searchTerm, $options: 'i' } };
        }

        const fighters = await Fighter.find(query).sort({ gender: -1, name: 1 });
        
        res.render("admin.pug", { 
            fighters: fighters, 
            searchTerm: searchTerm
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading admin panel");
    }
});

app.listen(port, (err) => {
    if(err) console.log(err); 
    console.log("Server is running at port number: " + port);
});
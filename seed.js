import db from "./db.js";
import Fighter from "./models/fighter.js";

const seedData = async () => {
    await db();
    await Fighter.deleteMany({}); 

    const fighterRoster = [
        {
            name: "Charles Oliveira",
            record: "36-11-0",
            weightClass: "Lightweight",
            style: "Brazilian Jiu-Jitsu",
            image: "Images/CharlesOliveira.png",
            flag: "Images/Countries/BRA.png",
            accomplishments: ["Most Submissions in UFC History", "Former Lightweight Champion"]
        },
        {
            name: "Max Holloway",
            record: "27-8-0",
            weightClass: "Lightweight",
            style: "Striker",
            image: "Images/MaxHolloway.png",
            flag: "Images/Countries/US.png",
            accomplishments: ["BMF Champion", "Former Featherweight Champion"]
        },
        {
            name: "Carlos Prates",
            record: "23-7-0",
            weightClass: "Welterweight",
            style: "Striker",
            image: "Images/CarlosPrates.png",
            flag: "Images/Countries/BRA.png",
            accomplishments: ["Rising Contender", "Knockout Specialist"]
        },
        {
            name: "Israel Adesanya",
            record: "24-5-0",
            weightClass: "Middleweight",
            style: "Striker, Freestyle",
            image: "Images/IsraelAdesanya.png",
            flag: "Images/Countries/NGR.png",
            accomplishments: ["Former 2-Time Middleweight Champion"]
        },
        {
            name: "Alex Pereira",
            record: "13-3-0",
            weightClass: "Light Heavyweight",
            style: "Kickboxing",
            image: "Images/AlexPereira.png",
            flag: "Images/Countries/BRA.png",
            accomplishments: ["Two-Division Champion", "Glory Hall of Fame"]
        },
        {
            name: "Joshua Van",
            record: "16-2-0",
            weightClass: "Flyweight",
            style: "Freestyle",
            image: "Images/JoshuaVan.png",
            flag: "Images/Countries/MYA.png",
            accomplishments: ["Flyweight Champion"]
        },
        {
            name: "Islam Makhachev",
            record: "28-1-0",
            weightClass: "Welterweight",
            style: "Wrestling, Sambo",
            image: "Images/IslamMakhachev.png",
            flag: "Images/Countries/RUS.png",
            accomplishments: ["Current Lightweight Champion", "Pound-for-Pound #1"]
        },
        {
            name: "Tom Aspinall",
            record: "15-3-0",
            weightClass: "Heavyweight",
            style: "Striker",
            image: "Images/TomAspinall.png",
            flag: "Images/Countries/ENG.png",
            accomplishments: ["Interim Heavyweight Champion"]
        },
        {
            name: "Ilia Topuria",
            record: "17-0-0",
            weightClass: "Lightweight",
            style: "Brazilian Jiu-Jitsu",
            image: "Images/IliaTopuria.png",
            flag: "Images/Countries/GEO.png",
            accomplishments: ["Current Featherweight Champion", "Undefeated"]
        },
        {
            name: "Khamzat Chimaev",
            record: "15-0-0",
            weightClass: "Middleweight",
            style: "Freestyle",
            image: "Images/KhamzatChimaev.png",
            flag: "Images/Countries/UAE.png",
            accomplishments: ["Undefeated Contender"]
        }
    ];

    try {
        await Fighter.insertMany(fighterRoster);
        console.log(`Successfully added ${fighterRoster.length} fighters to mma_db!`);
        process.exit();
    } catch (err) {
        console.log("Error seeding database: " + err);
        process.exit(1);
    }
};

seedData();
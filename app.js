const express=require("express")
const app=express()
const mongoose=require("mongoose")
const Listing=require("./models/listing.js")
const path=require("path")
const methodOverride=require("method-override")
const ejsMate=require("ejs-mate")

app.set("view engine","ejs")
app.set("views", path.join(__dirname,"views"))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride("_method"))
app.engine("ejs", ejsMate)
app.use(express.static(path.join(__dirname,"/public")))

main().then((res)=>{
    console.log("connected to DB")
})
.catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const port= 8080


// app.get("/testListing", async (req,res)=>{
//     let sampleListing=new Listing({
//         title:"My new villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute, Goa",
//         country:"India"
//     });

//     await sampleListing.save();
//     console.log("sample was saved")
//     res.send("successful testing")
// })


app.get("/", (req,res)=>{
    res.send("Hi!, I am root")
})

//index.ejs route
app.get("/listings", async (req,res)=>{
    // await Listing.find({}).then((res)=>{
    //     console.log(res)
    // })
    const allListings=await Listing.find({})
    res.render("index.ejs", {allListings})
})


//show from to create new listing
app.get("/listings/new", (req,res)=>{
    res.render("new.ejs")
})

//showing all the details of a single listing
app.get("/listings/:id", async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id)
    res.render("show.ejs", {listing})
})

//save new listing to db and show it in /listings
app.post("/listings", async (req,res)=>{
    let details=req.body
    console.log(details)
    // await Listing.save(details)
    // res.send("Listing saved")
    const newListing=new Listing(details)
    await newListing.save();
    res.redirect("/listings")
})


//edit a listing
app.get("/listings/:id/edit", async (req,res)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id)
    res.render("edit.ejs", {listing})
})

//updating the listing
app.put("/listings/:id", async (req,res)=>{
    let details=req.body
    let {id}=req.params
    await Listing.findByIdAndUpdate(id, details)
    res.redirect(`/listings/${id}`)
})

//delete listing
app.delete("/listings/:id", async (req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id)
    console.log(deletedListing)
    res.redirect("/listings")
})

app.listen(port,()=>{
    console.log(`app listening on port ${port}`)
})
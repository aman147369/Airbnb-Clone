const express=require("express")
const app=express()
const mongoose=require("mongoose")
const Listing=require("./models/listing.js")
const path=require("path")
const methodOverride=require("method-override")
const ejsMate=require("ejs-mate")
const wrapAsync=require("./utils/wrapAsync.js")
const ExpressError=require("./utils/ExpressError.js")
const {listingSchema, reviewSchema} =require("./schema.js")
const Review=require("./models/review.js")

const flash=require("connect-flash")
const session=require("express-session")

const listings=require("./routes/listing.js")
const reviews=require("./routes/review.js")

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

app.use(session({
    secret: "mysupersecretstring",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now()+ 7*24*60*60*1000,      //after 7 day this cookie expires
        maxAge: 7*24*60*60*1000,
        httpOnly: true
    }
}))

app.use(flash())

app.use((req,res,next)=>{
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")
    next();
})


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


// const validateListing=(req,res,next)=>{
//     let {error}=listingSchema.validate(req.body)
//     if(error){
//         // let errMsg=error.details.map((el)=> el.message).join(",");
//         // throw new ExpressError(400, errMsg)

//         throw new ExpressError(400, error)        //express looking for error handling middleware
//     }else{
//         next();
//     }
// }

const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body)
    if(error){
        throw new ExpressError(400, error)
    }
    next()
}


app.get("/", (req,res)=>{
    res.send("Hi!, I am root")
})


app.use("/listings", listings)


//index.ejs route
// app.get("/listings", wrapAsync(async (req,res)=>{
//     // await Listing.find({}).then((res)=>{
//     //     console.log(res)
//     // })
//     const allListings=await Listing.find({})
//     res.render("index.ejs", {allListings})
// }))


// //show from to create new listing
// app.get("/listings/new", (req,res)=>{
//     res.render("new.ejs")
// })

// //showing all the details of a single listing
// //Without populate() → You only get comment IDs.
// //With populate() → You get the full comments.
// app.get("/listings/:id", wrapAsync(async (req,res)=>{
//     let {id}=req.params;
//     const listing=await Listing.findById(id).populate("reviews")  //before populate it will only show the review id's , if we add populate(reviews) it will show the actual review data
//     res.render("show.ejs", {listing})
// }))

// //save new listing to db and show it in /listings
// app.post("/listings", validateListing ,wrapAsync(async (req,res,next)=>{
   
//     const newListing=new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings")
    
//     // if(!listing){
//     //     throw new ExpressError(400, "Send valid data for listing")
//     // }
    

//     // let result=listingSchema.validate(listing)
//     // console.log(result)
//     // if(result.error){
//     //     throw new ExpressError(400, result.error)
//     // }

//     // console.log(details)
//     // await Listing.save(details)
//     // res.send("Listing saved")
//     // const newListing=new Listing(listing)
//     // await newListing.save();
//     // res.redirect("/listings")
// }))


// //edit a listing
// app.get("/listings/:id/edit", wrapAsync(async (req,res)=>{
//     let {id}=req.params;
//     let listing = await Listing.findById(id)
//     res.render("edit.ejs", {listing})
// }))

// //updating the listing
// app.put("/listings/:id", validateListing ,wrapAsync(async (req,res)=>{
    
//     let {id}=req.params
//     await Listing.findByIdAndUpdate(id, {...req.body.listing})
//     res.redirect(`/listings/${id}`)
// }))

// //delete listing
// //when listing is deleted then findOneAndDelete middleware function will be called
// app.delete("/listings/:id", wrapAsync(async (req,res)=>{
//     let {id}=req.params;
//     let deletedListing=await Listing.findByIdAndDelete(id)
//     console.log(deletedListing)
//     res.redirect("/listings")
// }))



app.use("/listings/:id/reviews",reviews)

//reviews
//saving the reviews
// app.post("/listings/:id/reviews", validateReview ,wrapAsync(async(req,res)=>{
//     let {id}=req.params;
//     let listing=await Listing.findById(id)
//     let newReview=new Review(req.body.review)

//     listing.reviews.push(newReview)   //it will only accept objectID because in schema we have defined type as objectID

//     await newReview.save()
//     await listing.save()

//     // console.log("review saved")
//     // res.send("review saved")

//     res.redirect(`/listings/${listing._id}`)
// }))


// //delete a review from listings and review table
// app.delete("/listings/:id/reviews/:reviewId", wrapAsync( async(req,res)=>{
//     let {id,reviewId}=req.params;

//     await Listing.findByIdAndUpdate(id, {$pull : {reviews:reviewId}})
//     await Review.findByIdAndDelete(reviewId)

//     res.redirect(`/listings/${id}`)
// }))


//throwing new express error
//catch all wildcards
app.all("/*splat", (req,res,next)=>{
    next(new ExpressError(404,"Page not Found!"))
})

//error handling middleware
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Somethind went wrong!"}=err;  //default values
    //res.status(statusCode).send(message)
    res.status(statusCode).render("error.ejs" , {message})
})


app.listen(port,()=>{
    console.log(`app listening on port ${port}`)
})
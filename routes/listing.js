const express=require("express")
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js")
const ExpressError=require("../utils/ExpressError.js")
const {listingSchema} =require("../schema.js")
const Listing=require("../models/listing.js")
const { isLoggedIn, isOwner }=require("../middleware.js")

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body)
    if(error){
        // let errMsg=error.details.map((el)=> el.message).join(",");
        // throw new ExpressError(400, errMsg)

        throw new ExpressError(400, error)        //express looking for error handling middleware
    }else{
        next();
    }
}


//index.ejs route
router.get("/", wrapAsync(async (req,res)=>{
    // await Listing.find({}).then((res)=>{
    //     console.log(res)
    // })
    const allListings=await Listing.find({})
    res.render("index.ejs", {allListings})
}))

//show from to create new listing, here we are using isLoggedIn middleware to check whether user is registered in passport
router.get("/new", isLoggedIn ,(req,res)=>{
    
    res.render("new.ejs")
})

//showing all the details of a single listing
//Without populate() → You only get comment IDs.
//With populate() → You get the full comments.
router.get("/:id", wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews", populate:{path:"author"} }).populate("owner")  //before populate it will only show the review id's , if we add populate(reviews) it will show the actual review data
    if(!listing){
        req.flash("error","Listing you requested for does not exist!")
        return res.redirect("/listings") 
    }
    res.render("show.ejs", {listing})
}))

//save new listing to db and show it in /listings
router.post("/", isLoggedIn ,validateListing ,wrapAsync(async (req,res,next)=>{
   
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings")
    
    // if(!listing){
    //     throw new ExpressError(400, "Send valid data for listing")
    // }
    

    // let result=listingSchema.validate(listing)
    // console.log(result)
    // if(result.error){
    //     throw new ExpressError(400, result.error)
    // }

    // console.log(details)
    // await Listing.save(details)
    // res.send("Listing saved")
    // const newListing=new Listing(listing)
    // await newListing.save();
    // res.redirect("/listings")
}))

//edit a listing
router.get("/:id/edit", isLoggedIn, isOwner ,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id)
    if(!listing){
        req.flash("error","Listing you requested for does not exist!")
        return res.redirect("/listings") 
    }
    res.render("edit.ejs", {listing})
}))

//updating the listing
router.put("/:id", isLoggedIn, isOwner ,validateListing ,wrapAsync(async (req,res)=>{
    
    let {id}=req.params
    await Listing.findByIdAndUpdate(id, {...req.body.listing})
    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`)
}))

//delete listing
//when listing is deleted then findOneAndDelete middleware function will be called
router.delete("/:id", isLoggedIn , isOwner ,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id)
    console.log(deletedListing)
    req.flash("success","Listing Deleted!");    //Flash message appears on: The next request after it is set. Not on: The same request, The previous route
    res.redirect("/listings")
}))

module.exports=router;
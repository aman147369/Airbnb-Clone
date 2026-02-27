const express=require("express")
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js")
const ExpressError=require("../utils/ExpressError.js")
const {listingSchema} =require("../schema.js")
const Listing=require("../models/listing.js")
const { isLoggedIn, isOwner }=require("../middleware.js")

const listingController=require("../controllers/listing.js")

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


router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn ,validateListing ,wrapAsync(listingController.createListing) )


//index.ejs route
// router.get("/", wrapAsync(listingController.index))

//show from to create new listing, here we are using isLoggedIn middleware to check whether user is registered in passport
router.get("/new", isLoggedIn , listingController.renderNewForm)

//showing all the details of a single listing
//Without populate() → You only get comment IDs.
//With populate() → You get the full comments.
router.get("/:id", wrapAsync( listingController.showListing ) )

//save new listing to db and show it in /listings
// router.post("/", isLoggedIn ,validateListing ,wrapAsync(listingController.createListing) )

//edit a listing
router.get("/:id/edit", isLoggedIn, isOwner ,wrapAsync(listingController.renderEditForm))

//updating the listing
router.put("/:id", isLoggedIn, isOwner ,validateListing ,wrapAsync(listingController.updateListing))

//delete listing
//when listing is deleted then findOneAndDelete middleware function will be called
router.delete("/:id", isLoggedIn , isOwner ,wrapAsync(listingController.deleteListing))

module.exports=router;
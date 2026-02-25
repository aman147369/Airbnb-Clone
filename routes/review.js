const express=require("express")
const router=express.Router({mergeParams: true})
const wrapAsync=require("../utils/wrapAsync.js")
const ExpressError=require("../utils/ExpressError.js")
const {reviewSchema} =require("../schema.js")
const Review=require("../models/review.js")
const Listing=require("../models/listing.js")
const { isLoggedIn, isReviewAuthor } = require("../middleware.js")

const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body)
    if(error){
        throw new ExpressError(400, error)
    }
    next()
}


//reviews
//saving the reviews
//before saving the review the user must be logged in
router.post("/", isLoggedIn ,validateReview ,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id)
    let newReview=new Review(req.body.review)

    newReview.author=req.user._id;

    listing.reviews.push(newReview)   //it will only accept objectID because in schema we have defined type as objectID

    await newReview.save()
    await listing.save()

    // console.log("review saved")
    // res.send("review saved")

    req.flash("success", "New Reveiw Created!")
    res.redirect(`/listings/${listing._id}`)
}))


//delete a review from listings and review table
//review will be only deleted by person who has created it
router.delete("/:reviewId", isLoggedIn, isReviewAuthor ,wrapAsync( async(req,res)=>{
    let {id,reviewId}=req.params;

    await Listing.findByIdAndUpdate(id, {$pull : {reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)

    req.flash("success", "Reveiw Deleted!")
    res.redirect(`/listings/${id}`)
}))


module.exports=router;
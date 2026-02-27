const Listing=require("../models/listing.js")
const Review=require("../models/review.js")

module.exports.saveReview=async(req,res)=>{
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
}

module.exports.deleteReview=async(req,res)=>{
    let {id,reviewId}=req.params;

    await Listing.findByIdAndUpdate(id, {$pull : {reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)

    req.flash("success", "Reveiw Deleted!")
    res.redirect(`/listings/${id}`)
}


const Listing=require("../models/listing.js")

module.exports.index=async (req,res)=>{

    let {category}=req.query;
    let filter={}
    if(category){
        filter.category=category;
    }

    const allListings=await Listing.find(filter)
    res.render("index.ejs", {allListings})
}

module.exports.renderNewForm=(req,res)=>{
    res.render("new.ejs")
}

module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews", populate:{path:"author"} }).populate("owner")  //before populate it will only show the review id's , if we add populate(reviews) it will show the actual review data
    if(!listing){
        req.flash("error","Listing you requested for does not exist!")
        return res.redirect("/listings") 
    }
    res.render("show.ejs", {listing})
}

module.exports.createListing=async (req,res,next)=>{
   
    let url=req.file.path;
    let filename=req.file.filename;

    const newListing=new Listing(req.body.listing);
    //console.log(newListing);
    newListing.owner=req.user._id
    newListing.image={url,filename}
    await newListing.save();

    req.flash("success","New Listing Created!");
    res.redirect("/listings")
    
}

module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id)
    if(!listing){
        req.flash("error","Listing you requested for does not exist!")
        return res.redirect("/listings") 
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_150,w_250")
    res.render("edit.ejs", { listing, originalImageUrl })
}

module.exports.updateListing=async (req,res)=>{
    
    let {id}=req.params
    let listing=await Listing.findByIdAndUpdate(id, {...req.body.listing})

    if(typeof req.file!=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={ url, filename }
    await listing.save()
    }

    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`)
}

module.exports.deleteListing=async (req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id)
    console.log(deletedListing)
    req.flash("success","Listing Deleted!");    //Flash message appears on: The next request after it is set. Not on: The same request, The previous route
    res.redirect("/listings")
}
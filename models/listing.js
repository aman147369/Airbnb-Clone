const mongoose=require("mongoose")

const Review=require("./review.js")
const User=require("./user.js")
const Schema=mongoose.Schema;

const listingSchema= new Schema({
    title:{
        type:String,
        required:true
    },
    description:String,
    image:{

        url:String,
        filename:String,

        // type:String,
        // default:"https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=",
        // set:(v)=> v==="" ?"https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=":v,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    category:{
        type:String,
        enum:["Trending","Rooms","Iconic Cities","Mountains","Castles","Amazing Pools","Camping","Farms","Artic"]
    }
})

//middle function for deleting reviews attached to a listing
listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing.reviews.length){
        await Review.deleteMany({_id: {$in: listing.reviews}})
    }
})


const Listing=mongoose.model("Listing",listingSchema);

module.exports=Listing
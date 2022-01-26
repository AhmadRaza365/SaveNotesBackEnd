const mongoose = require('mongoose');

const mongoURI = "[Replace With Your Mongodb URI]"

const connectToMongo = () => {
    mongoose.connect(mongoURI, () =>{
        console.log("Connected Success");
    })
}


module.exports = connectToMongo;


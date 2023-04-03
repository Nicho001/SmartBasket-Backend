const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  totalPrice: {
    type: Number
  },
  phone_no: {
    
    type: String,
  },
  name: {
    
    type: String,
  },
  time: {
    
    type: String,
  },
  cart: [
    {
      name: {
        type: String,
        
        trim: true,
      },
      description: {
        type: String,
        
      },
      images: {
        type: String,
        
      },
      price: {
        type: Number,
        
      },
      category: {
        type: String,
        
      },
      barcode: {
        type: String,
        required: true,
      },
    },
  ],
});

const Bill = mongoose.model("Bill", billSchema);
module.exports = Bill;

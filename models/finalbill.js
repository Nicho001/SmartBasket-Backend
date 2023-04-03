const mongoose = require("mongoose");

const finalbillSchema = new mongoose.Schema({
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
        
      },
    },
  ],
});

const FinalBill = mongoose.model("FinalBill", finalbillSchema);
module.exports = FinalBill;
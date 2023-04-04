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
      quantity: {
        type: String,
        // required: true,
      },
      barcode: {
        type: String,
        required: true,
      },
    },
  ],
});

const FinalBill = mongoose.model("FinalBill", finalbillSchema);
module.exports = FinalBill;

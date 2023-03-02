const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  totalPrice: {
    type: Number,
    required: true,
  },
  phone_no: {
    required: true,
    type: String,
  },
  name: {
    required: true,
    type: String,
  },
  time: {
    required: true,
    type: String,
  },
  cart: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
      },
      images: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      category: {
        type: String,
        required: true,
      },
      barcode: {
        type: String,
        required: true,
      },
      quantity: {
        type: String,
        required: true,
      },
    },
  ],
});

const Bill = mongoose.model("Bill", billSchema);
module.exports = Bill;

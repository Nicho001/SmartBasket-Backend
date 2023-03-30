const express = require("express");
const productRouter = express.Router();
const Shop = require("../models/shop");
const FinalBill = require("../models/finalbill");

productRouter.get("/products", async (req, res) => {
  try {
    const products = await Shop.find();
    res.status(200).json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
productRouter.get("/billhistory", async (req, res) => {
  try {
    const products = await FinalBill.find();
    res.status(200).json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = productRouter;

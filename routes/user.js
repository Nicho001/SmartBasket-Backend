const express = require("express");
const userRouter = express.Router();
const Bill = require("../models/bill");
const Shop = require("../models/shop");
const dateTime = require("node-datetime");
const Product = require("../models/product");

// userRouter.post("/scanAdd/:id",  async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Product.findOne({ barcode: id });
//     let user = await User.findById(req.user);

//     if (user.cart.length == 0) {
//       user.cart.push({ product, quantity: 1 });
//       user = await user.save();
//       return res.json(product).status(200);
//     } else {
//       let isProductFound = false;
//       for (let i = 0; i < user.cart.length; i++) {
//         if (user.cart[i].product._id.equals(product._id)) {
//           isProductFound = true;
//         }
//       }
//       if (!isProductFound) {
//         user.cart.push({ product, quantity: 1 });
//         user = await user.save();
//         return res.json(product).status(200);
//       }

//       if (isProductFound) {
//         return res.json().status(200);
//       }
//     }
//   } catch (e) {
//     res.status(400).json({ error: e.message });
//   }
// });

// userRouter.post("/addQuantity/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Product.findById(id);
//     let user = await User.findById(req.user);
//     let findProduct = user.cart.find((item) =>
//       item.product._id.equals(product._id)
//     );
//     findProduct.quantity += 1;
//     user = await user.save();
//     res.json({ msg: "Quantity Updated" }).status(200);
//   } catch (e) {
//     res.status(400).json({ error: e.message });
//   }
// });

// userRouter.delete("/removeQuantity/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Product.findById(id);
//     let user = await User.findById(req.user);

//     for (let i = 0; i < user.cart.length; i++) {
//       if (user.cart[i].product._id.equals(product._id)) {
//         if (user.cart[i].quantity == 1) {
//           user.cart.splice(i, 1);
//         } else {
//           user.cart[i].quantity -= 1;
//         }
//       }
//     }
//     user = await user.save();
//     res.status(200).json({ msg: "Item Removed" });
//   } catch (e) {
//     res.status(400).json({ error: e.message });
//   }
// });

// userRouter.get("/emptyCart",  async (req, res) => {
//   try {
//     let user = await User.findById(req.user);
//     user.cart = [];
//     user = await user.save();
//     res.status(200).json(user);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// userRouter.post("/checkout/:name/:total",  async (req, res) => {
//   try {
//     const { name, total } = req.params;
//     let user = await User.findById(req.user);
//     let shop = await Shop.findOne({ name });
//     let shopImage = shop.images;
//     if (user.cart.length == 0) {
//       return res.status(400).json({ msg: "Cart Empty" });
//     }
//     let items = user.cart;
//     user.cart = [];
//     user = await user.save();
//     const dt = dateTime.create();
//     let datetime = dt.format("d-m-Y\nI:M p");

//     let bill = new Bill({
//       shopName: name,
//       shopImage,
//       products: items,
//       totalPrice: total,
//       userId: req.user,
//       Time: datetime,
//     });
//     bill = await bill.save();
//     res.status(200).json(bill);
//   } catch (e) {
//     res.status(400).json({ error: e.message });
//   }
// });

userRouter.get("/recentpurchases", async (req, res) => {
  try {
    const bill = await Bill.find({ userId: req.user });

    res.status(200).json(bill);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// userRouter.post("/addProduct", async (req, res) => {
//   try {
//     const { name, description, images, price, category, barcode, shop } =
//       req.body;

//     const existingProduct = await Product.findOne({ name });
//     if (existingProduct) {
//       return res.status(400).json({ msg: "Product already exists!" });
//     }

//     let product = new Product({
//       name,
//       description,
//       images,
//       price,
//       category,
//       barcode,
//       shop,
//     });
//     product = await product.save();
//     res.status(200).json(product);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// userRouter.delete("/removeProduct", async (req, res) => {
//   try {
//     let user = await User.findById(req.user);
//     let shop = await Shop.findById(req.params.id);
//     for (let i = 0; i < user.favourites.length; i++) {
//       if (user.favourites[i].name == shop.name) {
//         user.favourites.splice(i, 1);
//       }
//     }
//     user = await user.save();
//     res.status(200).json(user);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// userRouter.get("/favourites",  async (req, res) => {
//   try {
//     let user = await User.findById(req.user);
//     fav = user.favourites;
//     res.status(200).json(fav);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

userRouter.post("/submitform", async (req, res) => {
  try {
    const productName = req.body.dropdownMenu;
    const quantity = req.body.textField;

    // Find the shop in MongoDB and update the quantity of the specified product
    const shop = await Shop.findOneAndUpdate(
      { "products.name": productName },
      { $set: { "products.$.quantity": quantity } },
      { new: true }
    );
    console.log(shop);
    console.log(productName);
    res.status(200).json({
      msg: `Quantity for ${productName} in ${shop.name} has been updated to ${quantity}`,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error updating quantity" });
  }
});

userRouter.post("/addproduct", async (req, res) => {
  try {
    const { name, description, images, price, category, barcode, quantity } =
      req.body;
    const shop = await Shop.findOneAndUpdate(
      { name: "Self-Out" }, // replace "My Shop" with the actual name of your shop
      {
        $push: {
          products: {
            name,
            description,
            images,
            price,
            category,
            barcode,
            quantity,
          },
        },
      },
      { new: true }
    );
    console.log(shop);
    res.status(200).send("Product added successfully");
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error adding product" });
  }
});

userRouter.delete("/products/delete", async (req, res) => {
  try {
    const { name } = req.body;
    console.log(name);
    const shop = await Shop.findOneAndUpdate(
      { name: "Self-Out" },
      { $pull: { products: { name } } },
      { new: true }
    );

    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error deleting product" });
  }
});

module.exports = userRouter;

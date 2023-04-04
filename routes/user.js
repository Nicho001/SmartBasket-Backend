const express = require("express");
const userRouter = express.Router();
const Bill = require("../models/bill");
const FinalBill = require("../models/finalbill");
const Shop = require("../models/shop");
const dateTime = require("node-datetime");
const io = require("../socket");

userRouter.post('/scanAdd/:id/:idd', async (req, res) => {
  try {
    let newProduct;
    const { id, idd } = req.params;
    let bill = await Bill.findOne();

    if (!bill) {
      // create new bill if not found
      bill = new Bill({
        phone_no: '',
        name: '', // default name
        time: new Date().toISOString(),
        cart: [],
      });
    }

    const product = await Shop.findOne({ 'products.barcode': id }, { 'products.$': 1 });
    if (product) {
      let isProductFound = false;
      for (let i = 0; i < bill.cart.length; i++) {
        if (bill.cart[i].barcode == id) {
          isProductFound = true;
          // bill.cart[i].quantity++; // increase quantity if product already in cart
        }
      }
      // if (isProductFound) {
      //   for (let i = 0; i < bill.cart.length; i++) {
      //     if (bill.cart[i].barcode == id) {
      //       bill.cart.splice(i, 1);
      //       break; // add a break statement to exit the loop after deleting the product
      //     }
      //   }
      // } else {
      //   const prod = product._doc.products[0]._doc;
      //   bill.cart.push({
      //     name: prod.name,
      //     description: prod.description,
      //     images: prod.images,
      //     price: prod.price,
      //     category: prod.category,
      //     barcode: prod.barcode,
      //     quantity: prod.quantity,
      //     identifier: [idd],
      //   });

      // }

      //update identifier
      let isIdentifierFound = false;
      for (let i = 0; i < bill.cart.length; i++) {
        if (bill.cart[i].barcode == id) {
          if (!bill.cart[i].identifier.includes(idd)) {
            // if identifier does not exist, add it to the array
            bill.cart[i].identifier.push(idd);
          } else {
            // if identifier exists, remove it from the array
            bill.cart[i].identifier = bill.cart[i].identifier.filter((elem) => elem !== idd);
          }
          // set the quantity as the length of the identifier array
          bill.cart[i].quantity = bill.cart[i].identifier.length;
          // remove the product from the cart if the identifier array is empty
          if (bill.cart[i].identifier.length == 0) {
            bill.cart.splice(i, 1);
          }
          isIdentifierFound = true;
          break;
        }
      }
      
      if (!isIdentifierFound) {
        // if the product with the barcode is not found in the cart, add it to the cart
        const newProduct = {
          ...product._doc.products[0]._doc,
          identifier: [idd],
          quantity: 1,
        };
        bill.cart.push(newProduct);
      }
      

      
      


      // update total price
      // const totalPrice = bill.cart.reduce((acc, item) => acc + item.product.price, 0);
      // bill.totalPrice = totalPrice;

      // save the bill
      bill = await bill.save();

      await io.getIO().emit("bill", {
        details: bill
      });

      return res.json(bill).status(200);
    } else {
      return res.json({ error: 'Product not found' }).status(404);
    }
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});



userRouter.post('/updateInfo', async (req, res) => {
  try {
    const { name, phone, cart } = req.body;
    let bill = await Bill.findOne();

    if (!bill) {
      // create new bill if not found
      bill = new Bill({
        phone_no: phone,
        name: name,
        time: new Date().toISOString(),
        cart: cart,
      });
    } else {
      // update the existing bill
      bill.phone_no = phone;
      bill.name = name;
      bill.cart = cart;
    }

    // update total price
    // const totalPrice = bill.cart.reduce((acc, item) => acc + item.product.price, 0);
    // bill.totalPrice = totalPrice;

    // save the bill
    bill = await bill.save();

    return res.json(bill).status(200);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});



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

// for (let i = 0; i < user.cart.length; i++) {
//   if (user.cart[i].product._id.equals(product._id)) {
//     if (user.cart[i].quantity == 1) {
//       user.cart.splice(i, 1);
//     } else {
//       user.cart[i].quantity -= 1;
//     }
//   }
// }
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

userRouter.post("/checkout/:total", async (req, res) => {
  try {
    const { total } = req.params;
    let user = await Bill.findOne();
    if (user.cart.length == 0) {
      return res.status(400).json({ msg: "Cart Empty" });
    }
    let items = user.cart;
    user.cart = [];
    user = await user.save();
    const dt = dateTime.create();
    let datetime = dt.format("d-m-Y\nI:M p");

    let finalbill = new FinalBill({
      phone_no: user.phone_no,
      name: user.name,
      cart: items,
      totalPrice: total,
      time: datetime,
    });
    finalbill = await finalbill.save();
    res.status(200).json(finalbill);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

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

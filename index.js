require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const productRouter = require("./routes/product");
const userRouter = require("./routes/user");
var cors = require("cors");

const DB =
  "mongodb+srv://karthik:karthik123@cluster0.vie2q.mongodb.net/smart-basket?retryWrites=true&w=majority";
const PORT = process.env.PORT | 8080;
const app = express();
const http = require("http").createServer(app);

app.use(cors());
app.use(express.json());
app.use(productRouter);
app.use(userRouter);

const server = http.listen(PORT);
const io = require("./socket").init(server);

mongoose
  .connect(DB)
  .then(() => {
    console.log("Database Connected");
    io.on("connection", (socket) => {
      console.log("Connected", socket.id);
    });
  })
  .catch((e) => {
    console.log(e);
  });

app.listen(PORT, "0.0.0.0", () => {
  console.log(`connected at port ${PORT}`);
});

const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
require("./db/config");
const user = require("./db/user");
const product = require("./db/product");
const jwt = require("jsonwebtoken");
const key = "e-comm";

app.post("/signup", async (req, res) => {
  const data = new user(req.body);
  const respo = await data.save();
  result = respo.toObject();
  delete result.password;
  res.send(respo);
});

app.post("/login", async (req, res) => {
  if (req.body.password && req.body.email) {
    const oneuser = await user.findOne(req.body).select("-password");
    if (oneuser) {
      jwt.sign({ oneuser }, key, { expiresIn: "10h" }, (err, token) => {
        if (err) {
          res.send("error");
        } else {
          res.send({ oneuser, token: token });
        }
      });
    } else {
      res.send("user not found");
    }
  } else {
    res.send({result:"please provide a email and password"});
  }
});

app.post("/product", async (req, res) => {
  const data = new product(req.body);
  const result = await data.save();
  res.send(result);
});

app.get("/productlist", verifyToken, async (req, res) => {
  const result = await product.find();
  if (result.length > 0) {
    res.send(result);
  } else {
    res.send("no record find");
  }
});

app.delete("/deleteproduct/:id", async (req, res) => {
  const result = await product.deleteOne({ _id: req.params.id });
  res.send(result);
});

app.get("/updateProduct/:id", async (req, res) => {
  const result = await product.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.send("result is not found ");
  }
});

app.put("/productUpdate/:id", async (req, res) => {
  const result = await product.updateOne(
    { _id: req.params.id },
    { $set: req.body }
  );
  res.send(result);
});

function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  console.log(token)
  if (token) {
     const tokenn  = token.split(' ')[1];
     console.log(tokenn)
    jwt.verify(tokenn, key, (err, valid) => {
      if (err) {
        res.status(401).send({result:"please provide a  valid token"});
      } else {
        next();
      }
    });
  } else {
    res.status(400).send({result:"please enter a token with header"});
  }
}

app.get("/search/:key", async (req, res) => {
  const result = await product.find({
    $or: [
      { name: { $regex: req.params.key } },
      { price: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
      { company: { $regex: req.params.key } },
    ],
  });
  res.send(result);
});

app.listen(3800);

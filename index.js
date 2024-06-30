const express = require("express");
const app = express();

const path = require("path");
const cookieParcer = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("./models/user");
const postModel = require("./models/post");

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.listen(3000);
app.use(cookieParcer());
const upload = require("./config/multer.js");

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/uploadPic", (req, res) => {
  res.render("uploadPic");
});

let isLogedin = (req, res, next) => {
  if (req.cookies.token == "") res.redirect("http://localhost:3000/signup");
  else {
    let data = jwt.verify(req.cookies.token, "secret");
    req.user = data;
    console.log(req.user);
    next();
  }
};

app.post("/upload", isLogedin, upload.single("image"), async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  user.profilePic = req.file.filename;
  await user.save();
  res.redirect("http://localhost:3000/profile");
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("http://localhost:3000/signup");
});

app.get("/update/:id", async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id });
  res.render("update", { post });
});

app.post("/updatePost", async (req, res) => {
  let { content, heading } = req.body;
  await postModel.findOneAndUpdate({
    content,
    heading,
  });
  res.redirect("http://localhost:3000/profile");
});

app.get("/like/:id", isLogedin, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    let post = await postModel.findOne({ _id: req.params.id });

    let likeIndex = post.likes.indexOf(user._id);
    if (likeIndex === -1) {
      post.likes.push(user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.redirect("http://localhost:3000/profile");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/profile", isLogedin, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  // let user = await userModel.findOne({ email: req.user.email }).populate("posts");
  let posts = await postModel.find();
  res.render("profile", { user, posts });
});

app.post("/register", async (req, res) => {
  let { name, username, password, email, age } = req.body;
  let userExist = await userModel.findOne({ email });
  if (userExist) return res.status(500).send("User Already Exists");
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        name,
        email,
        password: hash,
        age,
      });
      let token = jwt.sign({ email, userid: user._id }, "secret");
      res.cookie("token", token);
      res.redirect("http://localhost:3000/profile");
      console.log(user);
    });
  });
});

app.post("/signup", async (req, res) => {
  let { email, password, _id } = req.body;
  let userExist = await userModel.findOne({ email });
  if (userExist) {
    bcrypt.compare(password, userExist.password, (err, result) => {
      if (result) {
        let token = jwt.sign({ email, _id }, "secret");
        res.cookie("token", token);
        res.status(200).redirect("http://localhost:3000/profile");
      } else {
        res.redirect("http://localhost:3000/signup");
      }
    });
  } else {
    res.status(500).send("something went wroooongggg");
  }
});

app.get("/deletePost/:id", async (req, res) => {
  await postModel.findOneAndDelete({ _id: req.params.id });
  res.redirect("http://localhost:3000/profile");
});

app.post("/post", isLogedin, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let { content, heading } = req.body;
  let post = await postModel.create({
    user: user._id,
    content,
    heading,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("http://localhost:3000/profile");
});

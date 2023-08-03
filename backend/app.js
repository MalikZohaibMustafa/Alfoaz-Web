const dotenv = require('dotenv');
const express = require('express');
const adminRoute = require('./router/adminApis');
const ngoRoute = require('./router/ngoApis');
const volunteerRoute = require('./router/volunteerApis');
const projectRoute = require('./router/projectApis');
const rewardRoute =  require('./router/rewardApis');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './upload/images/ngoProfile',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 204857600
  }
})
const cookieParser = require('cookie-parser');
const app = express();

// Configuration ENV File and Require Connection File
dotenv.config({ path: "./config.env" });
require("./db/conn");
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3006");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  res.header('Access-Control-Allow-Credentials', true);
  res.header("Access-Control-Allow-Methods", "POST,DELETE, PUT , GET , OPTIONS")
  next();
});

const port = process.env.PORT || 3001;
const authenticate = require("./middleware/authenticate");
const Ngos = require('./models/ngoSchema');
const Users = require('./models/volunteerSchema');
const Projects = require('./models/projectSchema');
const Admin = require('./models/adminSchema');
const Rewards = require('./models/RewardSchema');
//using methods to get req and cookies from Frontend
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/ngo', ngoRoute);
app.use('/volunteer', volunteerRoute);
app.use('/admin', adminRoute);
app.use('/project', projectRoute);
app.use('/reward', rewardRoute);
app.use('/profile', express.static('upload/images/ngoProfile'));

app.delete("/deleteAll", async (req, res) => {
  try {
    const ngo = await Ngos.deleteMany();
    const volunteer = await Users.deleteMany();
    const project = await Projects.deleteMany();
    const admin = await Admin.deleteMany();
    const reward = await Rewards.deleteMany();
    if (ngo && reward &&  volunteer && project && admin) {
      res.status(200).send("All data removed");
    }
    else {
      res.status(404).send("Error deleting All");
    }
  }
  catch (error) {
    console.log("Internel Server Error");
    res.status(500).send("Internel Server Error")
  }
});

//Authentication
app.get('/auth', authenticate, async (req, res) => {
})
//Logout Page
app.get('/logout', (req, res) => {
  res.clearCookie("jwt", { path: '/' })
  res.status(200).send("User Logged Out");
})
//Account Initiate
app.get('/accountInitiate', async (req, res) => {
  const account = new Admin({});
  let createdUser = await account.save();
  if (createdUser) {
    const admin = await Admin.find({})
    if (admin) {
      let credentials = {
        email : admin[0].email,
        password : admin[0].password
      } 
      res.status(200).send(credentials)
    }
    else {
      res.status(400).send("Bad Request")
    }
  }
  else {
    res.status(400).send("Bad Request")
  }
})
//Run Server
app.listen(3001, () => {
  console.log("Server is listening")
})


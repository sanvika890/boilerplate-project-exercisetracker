const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const users = [];
const exercises = [];
const logs=[]
app.post("/api/users", function (req, res) {
  const username = req.body.username;
  const id = Math.floor(Math.random(0, 1) * 1000);
  users.push({ username: username, _id: id.toString() });
  res.json({ username: username, _id: id.toString() });
});

app.get("/api/users", function (req, res) {
  res.json(users);
});

app.post("/api/users/:_id/exercises", function (req, res) {
  const id = req.body[":_id"];
  let username = "";
  let userVal = users.filter((item) => item._id == id);
  if (userVal.length > 0) {
    username = userVal[0].username;
  }

  let { description, duration, date } = req.body;
  if (date === "") {
    date = new Date().toDateString();
  } else {
    date = new Date(date).toDateString();
  }
  exercises.push({
    username: username,
    description: description,
    duration: parseInt(duration),
    date: date,
    _id: id,
  });

  
  res.json({_id: userVal[0]._id, username:userVal[0].username, date:date, duration:parseInt(duration), description:description});
});

app.get("/api/users/:_id/logs",function(req,res){
const id= req.params["_id"]
let from;
let to;
let filterVal = exercises.filter((item)=>item._id == id)
let limit ;

 if(req.query){
if(req.query.limit && req.query.limit !==""){
  limit = req.query.limit;
}
if(req.query.from && req.query.from !==""){
  from = req.query.from
  filterVal = filterVal.filter((item)=>  new Date(item.date).getTime() > new Date(from).getTime())
}
if(req.query.to && req.query.to !==""){
  to=req.query.to
  filterVal = filterVal.filter((item)=>  new Date(item.date).getTime() < new Date(to).getTime())
}
}

 const logObj={
  username:users.filter((item)=>item._id==id)[0].username || "",
  count:exercises.filter((item)=>item._id == id).length || 0,
  _id:id || "",
  log:filterVal.map((item)=>{
    return{description:item.description,duration:parseInt(item.duration),date:item.date}
  }).slice(0,limit)
 }

 const user = users.filter((item)=>item._id == id).map((i)=>{
  return {...i,log:logObj}
})[0]
 res.json(logObj)

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

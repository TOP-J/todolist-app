//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();
const PORT = process.env.PORT || 5000
app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://BABA-J:Sweetjesus2@baba-j.1lyrm.mongodb.net/todolistDB');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const itemSchema = new mongoose.Schema({
  name : String
});

const listSchema = new mongoose.Schema({
  name : String,
  items:[itemSchema]
});
  const List = new mongoose.model('list', listSchema);
const Item = new mongoose.model('Item', itemSchema);
const item1 = new Item(
  {name: 'welcome to your Todolist'},
);
const item2 = new Item(
  {name: 'hit the + button to add new item'},
);
const item3 = new Item(
  {name: '<-- hit this to delet an item'},
);
const defaultItems = [item1,item2,item3];


const workItems = [];

app.get("/", function(req, res) {

const day = "Today";
Item.find({},function(err,result){
  if (result.length===0){
    Item.insertMany(defaultItems, function(err, docs){
      if (err) {
        console.log(err);
      }else {
        console.log("successfully added docs");
        res.render("list", {listTitle: day, newListItems:docs});
      }
    });
  }else {
    console.log("documents already exist in collection. failed to add default docs");
    res.render("list", {listTitle: day, newListItems:result});
  }
});

});

app.post("/", function(req, res){

  const newItem = req.body.newItem;
  const listItem = req.body.list;
  const day = date.getDate();


  if (listItem=== "Today") {


     Item.create({name : newItem}, function(err,docs){
      if(err){
        console.log(err);
      }else {
        console.log("successfully added new item");
      }
    });
    res.redirect('/');
  }
  else {

    List.findOneAndUpdate({name:listItem},{$push:{items:{name:newItem}}}, function(err,docs){
     if (!err) {
       console.log('successfully updated');
     res.redirect('/'+listItem);
     }else {
       console.log(err);
     }

    });
}




});
app.post('/delete', function (req,res){
  const checkboxId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);
  if (listName==="Today") {
    Item.findByIdAndDelete(checkboxId, function(err){
      console.log('successfully deleted one item');
    });
    res.redirect('/');
  }else {
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id: checkboxId}}}, function(err,docs){
    if (err) {
      console.log(err);
    }  else {
      console.log(docs);
    }
    });
  res.redirect('/'+listName);
  }


});

app.get("/:customName", function(req,res){

  const customName = _.capitalize(req.params.customName);
List.findOne({name:customName}, function(err,docs){
  if (docs===null){
  List.create({name: customName, items:defaultItems}, function(err,one){

    res.redirect('/'+ customName);
  });

  }

else {
    res.render("list", {listTitle: docs.name, newListItems:docs.items});
}


});

});

app.listen(PORT, function() {
  console.log("Server started on port ${PORT}");
});

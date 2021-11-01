//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect("mongodb+srv://admin-Riyaz:allahu2000@cluster0.dkkvq.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemschema=
{
  name:String
};
const Item=mongoose.model("Item",itemschema);
const item1= new Item({
  name:"Welcome to mongodb"
});

const item2= new Item({
  name:"Hit the + button to add a new item"
});

const item3= new Item({
  name:"<-- Hit this to delete an item"
});

const defaultItems=[item1,item2,item3];



app.get("/", function(req, res) {

 Item.find({},function(err,foundItems)
{
  if(foundItems.length===0)
  {
    Item.insertMany(defaultItems,function(err)
    {
      if(err)
      console.log(err);
      else
     {
      console.log("Successfully inserted three docs");
     }
    });
    res.redirect("/");
  }
  else
  {
    // console.log(foundItems);
      res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
 const listName=req.body.list;

  const item= new Item(
  {
    name:itemName
  });
  if(listName==="Today")
  {
  item.save();
  res.redirect("/");
  }
  else
  {
List.findOne({name:listName},function(err,foundList)
{
  foundList.items.push(item);
  foundList.save();
  res.redirect("/"+listName);
});

  }

});
app.post("/delete",function(req,res)
{
  const checkedItemid=req.body.checkbox;
  const listName=req.body.listName;

  if(listName ==="Today")
  {
    Item.findByIdAndRemove(checkedItemid,function(err)
{
  if(!err)
  {
    console.log("deleted checked item Successfully");
    res.redirect("/");
  }
});
}
else
{
  //find one along with $ pull query to remove array element inside arrays of documents in list db
 List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemid}}},function(err,foundList)
{
if(!err)
{
res.redirect("/"+listName);
}
});

}
});
const listSchema=
{
  name:String,
  items:[itemschema]
};
const List=mongoose.model("List",listSchema);

app.get("/:customListName",function(req,res)
{
const customListName=_.capitalize(req.params.customListName);

//findOne method refer documentation
List.findOne({name:customListName},function(err,foundList)
{
if(!err)
{
 if(!foundList)
 {
  //We create a new list
  const list=new List(
    {
      name:customListName,
      items:defaultItems
    }
  );
  list.save();
   res.redirect("/"+customListName);
 }
 else
 {
  //show an existing list
  res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
 }

}
});

});

app.get("/about", function(req, res){
  res.render("about");
});

let port=process.env.PORT;
if(port==null||port=="")
{
  port=3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});

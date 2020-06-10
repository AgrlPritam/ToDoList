const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://admin-pritam:Tcs%402020%23@cluster0-shard-00-00-ctked.mongodb.net:27017,cluster0-shard-00-01-ctked.mongodb.net:27017,cluster0-shard-00-02-ctked.mongodb.net:27017/todolistDB?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority", { useNewUrlParser: true});
const itemsSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Item name is compulsory!"]
    }
});
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
    name: "Welcome to your ToDoList!"
});
const item2 = new Item({
    name: "Hit a + button to add new Item"
});
const item3 = new Item({
    name: "<-- Hit This to delete an Item"
});
const defaultItems = [item1,item2,item3];
const listSchema = {
    name:String,
    items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){   
    Item.find({}, function(err, foundItems){
        if (foundItems.length === 0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                } else {
                    console.log("Successfully Inserted");
                }
            });
            res.redirect("/");
        }else {
            res.render('list',{listTitle: "Today",    
            newListItems: foundItems});
        }
    });          
});
app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                //Create a new List
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            } else {
                //Show existing List
                res.render("list",{listTitle:foundList.name, newListItems: foundList.items});
            }
        }
    })

});

app.post("/", function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });

    if (listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName},function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }

});
app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(err){
                console.log(err);
            } else {
                console.log("Deleted Successfully");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name: listName},{$pull:{items: {_id:checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
    
});


app.post("/work", function(req,res){
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.get("/about", function(req,res){
    res.render("about");
})

app.listen(3000,function(){
    console.log("Server is up on Port 3000");
});
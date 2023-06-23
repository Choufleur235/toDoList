// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded( {extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Choufleur235:4k6IKlv0nnzy78im@cluster0.8rpch8u.mongodb.net/?retryWrites=true&w=majority");
const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
    name: "Welcome to your to do list"
});

const item2 = new Item ({
    name: "Use + to add a new item"
});

const item3 = new Item ({
    name: " <-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];


const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);
   

app.get("/", function(req, res) {

    Item.find({}) .then((foundItems) => {

    if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
        .then(() => {
            console.log("Successfully saved into our DB");
        })
        .catch(() => {
            console.log(err);
        });
        res.redirect("/");
    } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

    }) .catch((err) => {
        console.log(err);
    })    
});

app.post("/", function(req, res) {
    
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item ({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
    res.redirect("/");
    } else {
        List.findOne({name: listName}) .then((foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName)
        });
    }
});

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today") {
        Item.findByIdAndRemove(checkedItemId) 
    .then(() => {
        console.log("Successfully deleted item");
        res.redirect("/")
    }) .catch((err) => {
        console.log(err);
    })
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items : {_id: checkedItemId}}}) .then(() => {
        
            res.redirect("/" + listName);
            
        }) .catch((err) => {
            console.log(err);
        });
            
    }

    
});

app.get("/:customListName", (req, res) => {

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}) 
    
        .then((foundList) => {
            if (!foundList) {
                //doesn't exist - create the list
                console.log("Doesn't exist");
                const list = new List({
                    name: customListName,
                    items: defaultItems
                   });
                   console.log("created");
                list.save();
                res.redirect("/" + customListName);
            } else  {
                //show existing list
                
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        })
        .catch((err) => {
            console.log(err);
        });
});


app.get("/about", function(req ,res) {
    res.render("about");
});

app.listen(3000, function() {
    console.log("Server running on port 3000");
});
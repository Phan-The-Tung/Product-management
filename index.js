const express = require("express");
const methodOverride = require("method-override");
require("dotenv").config();
const systemConfig = require("./config/system");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const moment = require("moment");

const database = require("./config/database");
const route = require("./routes/client/index.route");
const routeAdmin = require("./routes/admin/index.route");
 

 

database.connect();

const app = express();
const port = process.env.PORT;

app.use(methodOverride("_method"));

app.use(bodyParser.urlencoded({extended: true}));

// app.use(bodyParser.json());


// app.set("views", `${_dirname}/views`);
app.set("views", "./views");
app.set("view engine", "pug");

app.use(cookieParser("keyboard cat"));
app.use(session({cookie: {maxAge: 60000}}));
app.use(flash());

//TinyMCE
app.use("/tinymce", express.static(path.join("node_modules", "tinymce")));


//End TinyMCE
app.locals.moment = moment;
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.count = 0;
app.use(express.static("public"));

route(app);
routeAdmin(app);
app.get("*", (req, res) => {
    res.render("client/pages/errors/404", {
        pageTitle: "404 Not Found" 
    })
})



app.listen(port, () =>{
    console.log(`App listening on port ${port}`);
});
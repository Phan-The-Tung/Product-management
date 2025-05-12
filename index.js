const express = require("express");
const methodOverride = require("method-override");
require("dotenv").config();
const systemConfig = require("./config/system");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const database = require("./config/database");
const route = require("./routes/client/index.route");
const routeAdmin = require("./routes/admin/index.route");
 

 

database.connect();

const app = express();
const port = process.env.PORT;

app.use(methodOverride("_method"));

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());


app.set("views", `${_dirname}/views`);
app.set("view engine", "pug");

app.use(cookieParser("keyboard cat"));
app.use(session({cookie: {maxAge: 60000}}));
app.use(flash());

app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.use(express.static(`${_dirname}/public`));

route(app);
routeAdmin(app);



app.listen(port, () =>{
    console.log(`App listening on port ${port}`);
});
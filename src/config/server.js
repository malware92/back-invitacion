require("dotenv").config();
const express = require("express");
const exphbs = require("express-handlebars");
const fileUpload = require("express-fileupload");
const router = require("../routes/router");
const cors = require("cors");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    this.setTemplateEngine();

    this.middlewares();

    this.routes();
    //this.app.use(express.static('static'));
    this.app.set("view engine", "ejs");
    this.app.set("views");
  }

  setTemplateEngine() {
    this.app.set("view engine", "hbs");
    this.app.engine(
      "hbs",
      exphbs.engine({
        extname: "hbs",
        defaultLayout: "",
        layoutsDir: "",
      })
    );
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(express.static("public"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));

    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
        //debug:true
      })
    );
  }

  routes() {
    this.app.use(router, require("../routes/router"));
    /* this.app.use(router, require('../routes/tickets.routes'));
        this.app.use(router, require('../routes/upload.routes')); */
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log("Listening on port", `http://localhost:${this.port}`);
    });
  }
}

module.exports = Server;

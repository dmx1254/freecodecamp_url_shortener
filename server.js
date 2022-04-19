require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const mongoose = require("mongoose");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const mySecret = process.env["MONGODB_URI"];

app.use(express.urlencoded({ extended: false }));
app.use(cors());
mongoose
  .connect(mySecret, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connexion to mongoDB success"))
  .catch((error) => console.log(error));

const UrlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: Number,
    required: true,
  },
});

const UrlModel = mongoose.model("url", UrlSchema);

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", function (req, res) {
  const myReg = /^(http)s*\:\/\/(www.)*/;
  const myUrlShortener = req.body["url"];
  const url_short = Math.floor(Math.random() * 10001);

  if (myReg.test(myUrlShortener)) {
    const urlsortener = myUrlShortener.replace(myReg, "");
    const newUrl = urlsortener.split("/")[0];

    dns.lookup(newUrl, (err, address) => {
      if (err) return res.json({ error: "Invalid URL" });
      const Urlshortener = new UrlModel({
        original_url: myUrlShortener,
        short_url: url_short,
      });
      Urlshortener.save((err, data) => {
        if (err) return console.log(err);
        res.json({ original_url: myUrlShortener, short_url: url_short });
      });
    });
  } else {
    res.json({ error: "Invalid URL" });
  }
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const { short_url: urlExist } = req.params;
  try {
    const idUrl = await UrlModel.findOne({ short_url: urlExist });
    const url = idUrl["original_url"];
    res.redirect(url);
  } catch (error) {
    res.json({ error: "Invalid URL" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

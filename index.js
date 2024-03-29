const express = require('express');
const SingIn = require("./routes/singIn");
const Verify = require("./routes/verifications")
const cors = require('cors');
const bodyParser = require('body-parser');
const stripePoints = require ("./routes/stripePoints");
const Edits = require("./routes/editPoints");
const admin = require("./routes/admin");
const especific = require("./routes/especificPoints")


const app = express()
/*
app.use(express.static('public'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));*/

app.use(express.static('public'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({limit: '10mb',  extended: false }));

const options = {
  inflate: true,
  limit: '10mb',
  type: 'application/octet-stream',
};

app.use(bodyParser.raw(options));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(SingIn)
app.use(Verify)
app.use(stripePoints)
app.use(Edits)
app.use(admin)
app.use(especific)

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log("server up en", PORT));
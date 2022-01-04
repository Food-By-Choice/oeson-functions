const functions = require("firebase-functions");
const express = require("express");
const app = express();
const cors = require("cors");
const Joi = require("joi");

const admin = require("firebase-admin");
admin.initializeApp();

app.use(cors({
    origin : "https://oeson.in",
    methods : ['POST']
}));
app.use(express.json());

const requestFormat = Joi.object().keys({
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(10).regex(/^[1-9]{1}[0-9]{9}$/),
    firstname: Joi.string().required(),
    lastname: Joi.string(),
    message: Joi.string().required()
});
const validateContactRequest = (req, res, next) => {
    const { error, value } = requestFormat.validate(req.body);
    if (error) {
        return res.status(406).json({
            status: false,
            msg: error.details[0].message
        })
    }
    req.body = value;
    next();
}

app.post("/contact-request", validateContactRequest, (req, res) => {
    const { email, phone, firstname, lastname, message } = req.body;
    admin.firestore().collection("contact_request")
        .add({ email, phone, firstname, lastname, message })
        .then(() => {
            res.status(200).json({
                status: true,
                msg: `Thank You ${firstname}, we will respond you soon.`
            })
        }).catch(() => {
            return res.status(500).json({
                status: false,
                msg: "Some error occured, please try again"
            });
        });
});

app.post("/subscribe", (req, res) => {
    const { error, value } = Joi.string().email().validate(req.body.email);
    if(error) {
        return res.status(406).json({
            status : false, msg : "Please Input Valid Email"
        })
    }
    const email = value.email;
    admin.firestore().collection("subsciption_request").add({email})
    .then(() => {
        res.status(200).json({
            status : true,
            msg : "You Subsribed to Oeson"
        })
    }).catch(() => {
        return res.status(500).json({
            status: false,
            msg: "Some error occured, please try again"
        });
    })
})

exports.contact = functions.https.onRequest(app);

// app.listen(3000, (error) => {
//     if(error) return console.log(error)
//     console.log("Started");
// })

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

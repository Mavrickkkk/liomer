const express = require('express');
const router = express.Router();
const connection = require('../database');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/affiches/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Fonction pour valider l'adresse e-mail
function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(email);
}

router.get('/ajoutAffiche', function (req, res, next) {
    res.render('ajoutAffiche', {title: 'Liomer - ajouter une affiche'});
});

router.post('/envoyerAffiche', upload.single('file'), function (req, res, next) {
    const titre = req.body.titre;
    const description = req.body.description;
    const picPath = req.file.filename;
    const date_debut = new Date();
    const date_fin = req.body.date;

    const actu = { titre, description, picPath, date_debut, date_fin };

    connection.query('INSERT INTO actu SET ?', actu, function (error, results, fields) {
        if (error) {
            res.send(error);
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;

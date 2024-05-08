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

// Middleware pour vérifier si l'utilisateur est un admin
function isAdmin(req, res, next) {
    if (req.session.admin === 1) {
        next();
    } else {
        res.redirect('/');
    }
}

router.get('/ajoutAffiche', isAdmin, function (req, res, next) {
    res.render('ajoutAffiche', {title: 'Liomer - ajouter une affiche', admin: req.session.admin});
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

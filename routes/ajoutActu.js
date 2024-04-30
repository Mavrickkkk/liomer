const express = require('express');
const router = express.Router();
const connection = require('../database');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/actus/');
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

router.get('/ajoutActu', isAdmin, function (req, res, next) {
    res.render('ajoutActu', {title: 'Liomer - ajouter une actualité'});
});

router.post('/envoyerActu', upload.single('file'), function (req, res, next) {
    const titre = req.body.titre;
    const description = req.body.description;
    const picPath = req.file.filename;
    const type = 1;
    const actu = { titre, description, picPath, type };

    const query = 'INSERT INTO actu (titre, description, picPath, type) VALUES (?, ?, ?, ?)';
    connection.query(query, [actu.titre, actu.description, actu.picPath, actu.type], function (error, results, fields) {
        if (error) {
            res.send(error);
        } else {
            res.redirect('/');
        }
    });
});


module.exports = router;

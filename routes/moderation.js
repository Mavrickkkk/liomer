const express = require('express');
const router = express.Router();
const connection = require('../database');

function isAdmin(req, res, next) {
    if (req.session.admin === 1) {
        next();
    } else {
        res.redirect('/');
    }
}

router.get('/moderation', isAdmin, function (req, res) {
    connection.query('SELECT * FROM contact', (err, rowContact) => {
        if (err) {
            console.error('Erreur lors de la récupération des contact :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        res.render('moderation', {title: 'Modération', contacts : rowContact});
    });
});

router.post('/supprimerMessage', function (req, res, next) {
    const id = req.body.id;

    // Supprimer le message de la base de données
    connection.query('DELETE FROM contact WHERE id = ?', [id], function (error, results, fields) {
        if (error) {
            res.send(error);
        } else {
            res.redirect('/moderation');
        }
    });
});


module.exports = router;

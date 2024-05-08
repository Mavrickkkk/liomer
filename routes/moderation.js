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
        connection.query('SELECT * FROM horaire_mairie', (err, horaires) => {
            if (err) {
                console.error('Erreur lors de la récupération des horaires de la mairie :', err);
                res.status(500).send('Erreur serveur');
                return;
            }

            res.render('moderation', {title: 'Modération', contacts: rowContact, admin: req.session.admin, horaires});
        });
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

router.post('/changerHoraire', isAdmin, function (req, res) {
    const horaires = req.body;

    for (const jour in horaires) {
        const heures = horaires[jour];

        connection.query('UPDATE horaire_mairie SET heures = ? WHERE jour = ?', [heures, jour], function (error, results, fields) {
            if (error) {
                console.error('Erreur lors de la mise à jour de l\'horaire :', error);
                res.status(500).send('Erreur serveur');
                return;
            }

            console.log(`L'horaire du ${jour} a été mis à jour avec succès.`);
        });
    }

    res.redirect('/moderation');
});


router.get('/logout', function (req, res, next) {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;

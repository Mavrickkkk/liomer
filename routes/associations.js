const express = require('express');
const connection = require("../database");
const router = express.Router();

router.get('/associations', function (req, res) {
    connection.query('SELECT * FROM associations WHERE status=1', (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des associations :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        res.render('associations', {title: 'Associations', associations : rows});
    });
});

router.post('/associations', (req, res) => {
    const { nom, description, president, adresse, coordonnee } = req.body;

    connection.query(
        'INSERT INTO associations (nom, description, president, adresse, coordonnees) VALUES (?, ?, ?, ?, ?)',
        [nom, description, president, adresse, coordonnee],
        (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'envoi du formulaire de contact', err);
                res.status(500).send('Erreur serveur');
                return;
            }

            res.redirect('/associations');
        }
    );
});

module.exports = router;

const express = require('express');
const connection = require("../database");
const router = express.Router();

function isAdmin(req, res, next) {
    if (req.session.admin === 1) {
        next();
    } else {
        res.redirect('/');
    }
}

router.get('/associations', function (req, res) {
    connection.query('SELECT * FROM associations', (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des associations :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        res.render('associations', {title: 'Associations', associations : rows, admin: req.session.admin});
    });
});

router.post('/associations', (req, res) => {
    const { nom, description, president, adresse, coordonnee } = req.body;

    // Vérifier si la valeur de adresse est une chaîne vide
    const adresseToInsert = adresse === '' ? null : adresse;

    connection.query(
        'INSERT INTO associations (nom, description, president, adresse, coordonnees) VALUES (?, ?, ?, ?, ?)',
        [nom, description, president, adresseToInsert, coordonnee], // Utiliser adresseToInsert ici
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


router.post('/associations/delete/:id', isAdmin ,(req, res) => {
    const { id } = req.params;

    connection.query(
        'DELETE FROM associations WHERE id=?',
        [id],
        (err, result) => {
            if (err) {
                console.error('Erreur lors de la suppression de l\'association', err);
                res.status(500).send('Erreur serveur');
                return;
            }

            res.redirect('/associations');
        }
    );
});


module.exports = router;

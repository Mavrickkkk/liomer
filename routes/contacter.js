const express = require('express');
const connection = require('../database');
const router = express.Router();


// Fonction pour valider l'adresse e-mail
function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(email);
}

router.get('/contacter', function (req, res, next) {
    res.render('contacter', {title: 'Liomer - nous contacter', admin: req.session.admin});
});

router.post('/contact', (req, res) => {
    const { prenom, nom, mail, sujet, message } = req.body;

    if (!isValidEmail(mail)) {
        // L'adresse e-mail n'est pas valide
        res.status(400).send('Adresse e-mail invalide');
        return;
    }

    connection.query(
        'INSERT INTO contact (prenom, nom, mail, sujet, message) VALUES (?, ?, ?, ?, ?)',
        [prenom, nom, mail, sujet, message],
        (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'envoi du formulaire de contact', err);
                res.status(500).send('Erreur serveur');
                return;
            }

            res.redirect('/');
        }
    );
});

module.exports = router;
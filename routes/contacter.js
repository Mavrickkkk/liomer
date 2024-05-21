const express = require('express');
const connection = require('../database');
const router = express.Router();
const cron = require('node-cron');
const moment = require('moment');

// Tâche planifiée pour supprimer les messages de plus de 3 mois
cron.schedule('0 0 * * 0', () => {
    const threeMonthsAgo = moment().subtract(3, 'months').toDate();

    connection.query('DELETE FROM contact WHERE date_creation < ?', [threeMonthsAgo], (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression des messages de plus de 3 mois :', err);
        } else {
            console.log(`Suppression de ${result.affectedRows} messages de plus de 3 mois`);
        }
    });
});

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
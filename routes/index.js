const express = require('express');
const router = express.Router();
const connection = require('../database');

// Fonction pour valider l'adresse e-mail
function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(email);
}

router.get('/', function (req, res, next) {
    connection.query('SELECT * FROM actu', (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des dessins :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        const affiches = rows.map(affiche => {
            const dateFin = affiche.date_fin;
            const day = dateFin.getDate();
            const monthIndex = dateFin.getMonth();
            const year = dateFin.getFullYear();
            const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
            const formattedDateFin = `${day} ${months[monthIndex]} ${year}`;
            return { ...affiche, date_fin: formattedDateFin };
        });

        res.render('index', {title: 'Liomer - Accueil', affiches});
    });
});





router.post('/newsletter', (req, res) => {
    const email = req.body.mail;

    if (!isValidEmail(email)) {
        // L'adresse e-mail n'est pas valide
        res.status(400).send('Adresse e-mail invalide');
        return;
    }

    connection.query('INSERT INTO mail (email) VALUES (?)', [email], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'envoi d\'e-mail', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        res.redirect('/');
    });
});

module.exports = router;

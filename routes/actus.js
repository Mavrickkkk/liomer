const express = require('express');
const router = express.Router();
const connection = require('../database');

router.get('/actus', function (req, res, next) {

    connection.query('SELECT * FROM actu WHERE type=1 ORDER BY date_debut DESC', (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des actualités :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        const actualites = rows.map(actualite => {
            const dateCreation = actualite.date_debut;
            const day = dateCreation.getDate();
            const monthIndex = dateCreation.getMonth();
            const year = dateCreation.getFullYear();
            const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
            const formattedDateCreation = `${day} ${months[monthIndex]} ${year}`;
            return {...actualite, date_creation: formattedDateCreation};
        });

        // Rendre la page d'accueil avec les affiches, les événements et les actualités
        res.render('actus', {
            title: 'Actualités',
            actualites,
            admin: req.session.admin
        });
    });
});


module.exports = router;

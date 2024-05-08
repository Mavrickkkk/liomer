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

router.get('/actus', function (req, res, next) {

    const limit = 2; // Nombre d'actualités par page
    const page = parseInt(req.query.page) || 1; // Numéro de la page actuelle
    const offset = (page - 1) * limit; // Décalage pour la requête SQL

    connection.query(`SELECT * FROM actu WHERE type=1 ORDER BY date_debut DESC LIMIT ${limit} OFFSET ${offset}`, (err, rows) => {
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

        connection.query('SELECT COUNT(*) as count FROM actu WHERE type=1', (err, countResult) => {
            if (err) {
                console.error('Erreur lors de la récupération du nombre d\'actualités :', err);
                res.status(500).send('Erreur serveur');
                return;
            }

            const totalActualites = countResult[0].count;
            const totalPages = Math.ceil(totalActualites / limit);

            res.render('actus', {
                title: 'Actualités',
                actualites,
                admin: req.session.admin,
                currentPage: page,
                totalPages
            });
        });
    });
});

const fs = require('fs');
const path = require('path');

router.get('/supprimer-actualite/:id', isAdmin, function (req, res, next) {
    const id = req.params.id;

    // Supprimer l'actualité de la base de données
    connection.query(`SELECT picpath FROM actu WHERE id = ${id}`, (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération du chemin d\'accès de l\'image :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        const picPath = result[0].picpath;

        // Supprimer le fichier image du serveur
        const filePath = path.join(__dirname, '../public/actus', picPath);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Erreur lors de la suppression du fichier image :', err);
                res.status(500).send('Erreur serveur');
                return;
            }

            // Supprimer l'actualité de la base de données
            connection.query(`DELETE FROM actu WHERE id = ${id}`, (err, result) => {
                if (err) {
                    console.error('Erreur lors de la suppression de l\'actualité :', err);
                    res.status(500).send('Erreur serveur');
                    return;
                }

                // Rediriger vers la page précédente
                const referer = req.headers.referer || '/';
                res.redirect(referer);
            });
        });
    });
});


module.exports = router;

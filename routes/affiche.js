const express = require('express');
const router = express.Router();
const connection = require('../database');
const fs = require('fs');

router.get('/affiche/:idAffiche', function (req, res) {
    const idAffiche = req.params.idAffiche;
    connection.query('SELECT * FROM actu WHERE id=?', [idAffiche], (err, rowAffiche) => {
        if (err) {
            console.error('Erreur lors de la récupération des affiches :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        const affiches = rowAffiche.map(affiche => {
            const dateFin = affiche.date_fin;
            const day = dateFin.getDate();
            const monthIndex = dateFin.getMonth();
            const year = dateFin.getFullYear();
            const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
            const formattedDateFin = `${day} ${months[monthIndex]} ${year}`;
            return { ...affiche, date_fin: formattedDateFin };
        });

        res.render('affiche', {title: 'Liomer - Actu', affiches, admin: req.session.admin});
    });
});

router.post('/affiche/delete/:idAffiche', function (req, res) {
    const idAffiche = req.params.idAffiche;
    connection.query('SELECT picpath FROM actu WHERE id=?', [idAffiche], (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération du chemin du fichier :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        if (result.length > 0) {
            const filePath = `./public/affiches/${result[0].picpath}`;

            // Supprimer le fichier
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Erreur lors de la suppression du fichier :', err);
                }

                // Supprimer l'enregistrement dans la base de données
                connection.query('DELETE FROM actu WHERE id=?', [idAffiche], (err, result) => {
                    if (err) {
                        console.error('Erreur lors de la suppression de l\'affiche :', err);
                        res.status(500).send('Erreur serveur');
                        return;
                    }
                    res.redirect('/');
                });
            });
        } else {
            res.status(404).send('Affiche non trouvée');
        }
    });
});


module.exports = router;

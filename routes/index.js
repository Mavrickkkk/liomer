const express = require('express');
const router = express.Router();
const connection = require('../database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage});

// Fonction pour valider l'adresse e-mail
function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(email);
}

function isAdmin(req, res, next) {
    if (req.session.admin === 1) {
        next();
    } else {
        res.redirect('/');
    }
}

router.get('/', function (req, res, next) {
    // Récupérer la date actuelle
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth() + 1;
    let currentDay = currentDate.getDate();

    // Formater la date actuelle pour la requête SQL
    currentDate = `${currentYear}-${currentMonth < 10 ? '0' + currentMonth : currentMonth}-${currentDay < 10 ? '0' + currentDay : currentDay}`;

    // Récupérer les événements de la base de données qui se passent après la date actuelle
    const query = `SELECT * FROM evenement WHERE date > '${currentDate}' ORDER BY date ASC LIMIT 4`;
    connection.query(query, (err, results, fields) => {
        if (err) {
            console.error('erreur de récupération des événements : ' + err.stack);
            res.status(500).send('Erreur de récupération des événements');
            return;
        }
        console.log('événements récupérés :', results);

        // Formater la date des événements
        const events = results.map(event => {
            const date = new Date(event.date);
            const day = date.getDate();
            const monthIndex = date.getMonth();
            const year = date.getFullYear();
            const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
            const formattedDate = `${day} ${months[monthIndex]} ${year}`;
            return {...event, date: formattedDate};
        });

        // Récupérer les affiches de la base de données
        connection.query('SELECT * FROM actu WHERE type=0 AND date_fin > CURDATE() ORDER BY date_fin ASC', (err, rows) => {
            if (err) {
                console.error('Erreur lors de la récupération des affiches :', err);
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
                return {...affiche, date_fin: formattedDateFin};
            });

            connection.query('SELECT * FROM actu WHERE type=1 ORDER BY date_debut DESC LIMIT 5', (err, rows) => {
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

                connection.query('SELECT picpath FROM photos WHERE type=1', (err, rows) => {
                    if (err) {
                        console.error('Erreur lors de la récupération de l\'image d\'accueil :', err);
                        res.status(500).send('Erreur serveur');
                        return;
                    }

                    let homeImage = '';
                    if (rows.length > 0) {
                        homeImage = rows[0].picpath;
                    }
                    connection.query('SELECT * FROM horaire_mairie', (err, horaires) => {
                        if (err) {
                            console.error('Erreur lors de la récupération des horaires de la mairie :', err);
                            res.status(500).send('Erreur serveur');
                            return;
                        }

                        // Rendre la page d'accueil avec les affiches, les événements et les actualités
                        res.render('index', {
                            title: 'Liomer - Accueil',
                            affiches,
                            events,
                            actualites,
                            homeImage,
                            horaires,
                            admin: req.session.admin
                        });
                    });
                });
            });
        });
    });
});


router.post('/evenement', (req, res) => {
    const eventDate = req.body['event-date'];
    const eventName = req.body['event-name'];

    // Insérer les données dans la table 'evenement' de la base de données
    const query = 'INSERT INTO evenement (date, nom) VALUES (?, ?)';
    connection.query(query, [eventDate, eventName], (err, results, fields) => {
        if (err) {
            console.error('erreur d\'insertion dans la base de données : ' + err.stack);
            res.status(500).send('Erreur d\'insertion dans la base de données');
            return;
        }
        console.log('événement ajouté avec l\'ID :', results.insertId);
        res.redirect('/');
    });
});

router.post('/evenement/:id/supprimer', (req, res) => {
    if (req.session.admin !== 1) {
        // L'utilisateur n'est pas un administrateur, renvoyer une erreur
        res.status(403).send('Accès refusé');
        return;
    }

    const eventId = req.params.id;
    // Supprimer l'événement de la base de données
    connection.query('DELETE FROM evenement WHERE id = ?', [eventId], (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression de l\'événement :', err);
            res.status(500).send('Erreur serveur');
            return;
        }
        console.log(`Événement ${eventId} supprimé avec succès`);
        res.redirect('/');
    });
});

router.post('/envoyerPhoto/:type', isAdmin , upload.single('file'), function (req, res, next) {
    const type = req.params.type;
    const file = req.file;

    if (!file) {
        res.status(400).send('No file uploaded.');
        return;
    }
    // Mettre à jour la base de données avec le nouveau nom de fichier et le type correspondant
    const updateImageQuery = 'UPDATE photos SET picpath = ?, type = ? WHERE type = ?';
    connection.query(updateImageQuery, [file.filename, type, type], function (error, results, fields) {
        if (error) {
            res.send(error);
            return;
        }

        // Récupérer l'ancienne image en fonction du type
        const oldImageQuery = 'SELECT picpath FROM photos WHERE type = ? AND picpath != ?';
        connection.query(oldImageQuery, [type, file.filename], function (err, results, fields) {
            if (err) {
                res.send(err);
                return;
            }

            if (results.length > 0) {
                const oldImagePath = results[0].picpath;
                const oldImageFullPath = path.join(__dirname, '../public/images', oldImagePath);

                // Supprimer le fichier de l'ancienne image
                fs.unlink(oldImageFullPath, function (err) {
                    if (err) {
                        console.error(err);
                    }
                    console.log('Old image deleted:', oldImagePath);
                });
            }

            res.redirect('/');
        });
    });
});

router.post('/newsletter', (req, res) => {
    const email = req.body.mail;

    if (!isValidEmail(email)) {
        // L'adresse e-mail n'est pas valide
        res.status(400).send('Adresse e-mail invalide');
        return;
    }

    //insérer une adresse mail dans la base de donnée
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
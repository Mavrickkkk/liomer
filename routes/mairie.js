const express = require('express');
const router = express.Router();
const connection = require('../database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');



// Configuration de Multer pour enregistrer les fichiers dans le dossier /public/compte_rendu
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/compte_rendu/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 Mo
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type, only PDFs are allowed!'), false);
        }
    }
});

function isAdmin(req, res, next) {
    if (req.session.admin === 1) {
        next();
    } else {
        res.redirect('/');
    }
}

router.post('/envoyerCompteRendu', upload.single('file'), function (req, res, next) {
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth() + 1;
    let currentDay = currentDate.getDate();

    currentDate = `${currentYear}-${currentMonth < 10 ? '0' + currentMonth : currentMonth}-${currentDay < 10 ? '0' + currentDay : currentDay}`;

    const filePath = req.file.filename;

    connection.query('INSERT INTO compte_rendu (date, filePath) VALUES (?, ?)', [currentDate, filePath], function (error, results, fields) {
        if (error) {
            res.send(error);
        } else {
            res.redirect('/mairie');
        }
    });
});


router.get('/mairie', function (req, res) {
    // Récupérer les comptes-rendus de la base de données
    connection.query('SELECT * FROM compte_rendu ORDER BY date DESC', (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des comptes-rendus :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        const comptesRendus = rows.map(compteRendu => {
            const dateCreation = compteRendu.date;
            const day = dateCreation.getDate();
            const monthIndex = dateCreation.getMonth();
            const year = dateCreation.getFullYear();
            const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
            const formattedDateCreation = `${day} ${months[monthIndex]} ${year}`;
            return {...compteRendu, date_creation: formattedDateCreation};
        });

        res.render('mairie', {
            title: 'La mairie',
            comptesRendus: comptesRendus,
            admin: req.session.admin
        });
    });
});

router.post('/mairie/supprimer/:id', isAdmin, function (req, res, next) {
    const id = req.params.id;
    connection.query('SELECT filePath FROM compte_rendu WHERE id = ?', [id], function (error, results, fields) {
        if (error) {
            res.send(error);
        } else if (results.length === 0) {
            res.status(404).send('Compte rendu non trouvé');
        } else {
            const filePath = results[0].filePath;
            const filePathAbsolute = path.join(__dirname, '..', 'public', 'compte_rendu', filePath);

            fs.unlink(filePathAbsolute, (err) => {
                if (err) {
                    console.error('Erreur lors de la suppression du fichier :', err);
                    res.status(500).send('Erreur serveur');
                    return;
                }

                connection.query('DELETE FROM compte_rendu WHERE id = ?', [id], function (error, results, fields) {
                    if (error) {
                        res.send(error);
                    } else {
                        res.redirect('/mairie');
                    }
                });
            });
        }
    });
});



router.get('/compte_rendu/:filePath', isAdmin, function (req, res) {
    const filePath = req.params.filePath;
    const filePathAbsolute = path.join(__dirname, '..', 'public', 'compte_rendu', filePath);

    res.download(filePathAbsolute, filePath);
});

module.exports = router;

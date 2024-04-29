const express = require('express');
const connection = require('../database');
const router = express.Router();

router.get('/connexion', function (req, res) {
    res.render('connexion', {title: 'Me connecter'});
});

router.post('/connexion', (req, res) => {
    const {username, password} = req.body;
    const sql = 'SELECT * FROM admin WHERE username = ? AND password = ?';
    connection.query(sql, [username, password], async (err, result) => {
        if (err) {
            console.error('Erreur lors de la recherche de l\'utilisateur :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        if (result.length > 0) {
            console.log('Connexion réussie pour l\'utilisateur :', {username});
            req.session.admin = 1;
            res.redirect('/');
        } else {
            console.log('Mot de passe incorrect pour l\'utilisateur :', {username});
            res.status(401).send('utilisateur ou mot de passe incorrect');
        }
    });
})
;

module.exports = router;
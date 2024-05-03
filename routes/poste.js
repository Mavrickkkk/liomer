const express = require('express');
const router = express.Router();

router.get('/poste', function (req, res) {
    res.render('poste', {title: 'Agence postale'});
});

module.exports = router;

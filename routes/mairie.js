const express = require('express');
const router = express.Router();

router.get('/mairie', function (req, res) {
    res.render('mairie', {title: 'La mairie'});
});

module.exports = router;

const express = require('express');
const router = express.Router();

router.get('/poste', function (req, res) {
    res.render('poste', {title: 'La poste'});
});

module.exports = router;

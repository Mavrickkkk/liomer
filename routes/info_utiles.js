const express = require('express');
const router = express.Router();

router.get('/info_utiles', function (req, res) {
    res.render('info_utiles', {title: 'Services'});
});

module.exports = router;

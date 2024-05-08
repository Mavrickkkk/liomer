const express = require('express');
const router = express.Router();

router.get('/info_utiles', function (req, res) {
    res.render('info_utiles', {title: 'Services', admin: req.session.admin});
});

module.exports = router;

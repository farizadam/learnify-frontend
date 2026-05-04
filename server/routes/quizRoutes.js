<<<<<<< HEAD
module.exports = require('./quiz.routes');
=======
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.status(200).json({ message: 'Quiz routes are not implemented yet' });
});

module.exports = router;
>>>>>>> main

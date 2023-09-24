const express = require('express');
const router = express.Router();

// Define routes and route handlers specific to service1
router.get('/endpoint', (req, res) => {
    res.json({ message: 'GET request received by Service-1' });
});

// Export the router
module.exports = router;

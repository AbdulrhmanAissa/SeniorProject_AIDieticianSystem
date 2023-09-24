const app = require('../../app'); // Go two directories back to reach app.js
const express = require('express');
const router = require('./routes'); // Import the router from the local routes.js file

// Mount the microservice's routes under the /service1 path
app.use('/service1', router);

// Start the microservice
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Service-1 is running on port ${PORT}`);
});

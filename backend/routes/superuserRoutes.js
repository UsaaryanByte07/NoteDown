const express = require('express');
const superuserRoutes = express.Router();
const { requireSuperuser } = require('../middlewares/superuserMiddleware');
const {
  getSuperuserMe,
  postLogin,
  getAdmins,
  postAddAdmin,
  postDeleteAdmin,
} = require('../controllers/superuser/superuserAuthController');

// Public
superuserRoutes.get('/me', getSuperuserMe);
superuserRoutes.post('/login', postLogin);

// Protected – require superuser JWT
superuserRoutes.get('/admins', requireSuperuser, getAdmins);
superuserRoutes.post('/add-admin', requireSuperuser, postAddAdmin);
superuserRoutes.delete('/delete-admin/:email', requireSuperuser, postDeleteAdmin);

module.exports = { superuserRoutes };
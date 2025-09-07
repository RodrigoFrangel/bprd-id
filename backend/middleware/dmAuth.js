const auth = require('./auth');

module.exports = function (req, res, next) {
  // Este middleware deve ser usado DEPOIS do middleware 'auth'
  if (!req.user || (req.user.role !== 'DM' && req.user.role !== 'Admin')) {
    return res.status(403).json({ msg: 'Acesso negado. Requer privilégios de DM ou Administrador.' });
  }
  next();
};

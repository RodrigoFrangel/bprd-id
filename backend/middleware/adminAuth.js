module.exports = function (req, res, next) {
  // Este middleware deve ser usado DEPOIS do middleware 'auth'
  // para que 'req.user' já exista.
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ msg: 'Acesso negado. Requer privilégios de Administrador.' });
  }
  next();
};

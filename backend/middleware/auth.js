const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'Nenhum token, autorização negada.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next(); // passa para a próxima etapa (a rota em si)
  } catch (err) {
    res.status(401).json({ msg: 'Token inválido.' });
  }
};

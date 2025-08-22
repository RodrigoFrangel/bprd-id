const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Pega o token do cabeçalho da requisição
  const token = req.header('x-auth-token');

  // Se não houver token, nega o acesso
  if (!token) {
    return res.status(401).json({ msg: 'Nenhum token, autorização negada.' });
  }

  // Se houver token, verifica se é válido
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Adiciona o payload do token (que contém o id do usuário) ao objeto da requisição
    req.user = decoded.user;
    next(); // Passa para a próxima etapa (a rota em si)
  } catch (err) {
    res.status(401).json({ msg: 'Token inválido.' });
  }
};

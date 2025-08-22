// Define a URL base da nossa API para não repetirmos
// const API_URL = 'http://localhost:5000/api';
const API_URL = '/api';

// Função para verificar se o usuário está logado
function checkAuth() {
    const token = localStorage.getItem('bprd_token');
    // Se não houver token e a página atual não for de login/registro, redireciona
    if (!token && !window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('register.html')) {
        window.location.href = 'login.html';
    }
}

// Função de logout
function logout() {
    localStorage.removeItem('bprd_token');
    window.location.href = 'login.html';
}

// Roda a verificação em todas as páginas que importarem este script
checkAuth();

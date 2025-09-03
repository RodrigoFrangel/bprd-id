const API_URL = '/api'; // Ajustado para funcionar com Nginx/Vercel
// const API_URL = 'http://localhost:3000/api'; // pra testar localmente

// Array com as páginas que são públicas
const publicPages = [
    '/', // Raiz do site
    '/index.html',
    '/login.html',
    '/register.html',
    '/personagens.html',
    '/id.html'
];

// Função para verificar se o usuário está logado
function checkAuth() {
    const token = localStorage.getItem('bprd_token');
    const currentPage = window.location.pathname;

    // Se não houver token E a página atual NÃO ESTIVER na lista de páginas públicas, redireciona
    if (!token && !publicPages.some(page => currentPage.endsWith(page))) {
        window.location.href = 'login.html';
    }
}

// Função de logout
function logout() {
    localStorage.removeItem('bprd_token');
    window.location.href = 'login.html';
}

// --- FUNÇÕES DE TOKEN REESTRUTURADAS ---

// Função central para decodificar o token
function getDecodedToken() {
    const token = localStorage.getItem('bprd_token');
    if (!token) return null;
    try {
        // Decodifica a parte do meio (payload) do token JWT
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error("Erro ao decodificar token:", e);
        return null;
    }
}

// Função para pegar o ID do usuário logado
function getLoggedInUserId() {
    const payload = getDecodedToken();
    return payload ? payload.user.id : null;
}

// Função para pegar a ROLE do usuário logado
function getLoggedInUserRole() {
    const payload = getDecodedToken();
    // Assumindo que o backend inclui 'role' no payload do token
    return payload ? payload.user.role : null; 
}


// Roda a verificação em todas as páginas que importarem este script
checkAuth();

import { supabase } from './supabase.js';

let currentUser = null;

const articlesContainer = document.getElementById('articles-container');
const addArticleBtn = document.getElementById('add-article-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginLink = document.getElementById('login-link');
const articleModal = document.getElementById('article-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const articleForm = document.getElementById('article-form');
const modalTitle = document.getElementById('modal-title');

async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;
    if (user) {
        logoutBtn.classList.remove('hidden');
        loginLink.classList.add('hidden');
    } else {
        logoutBtn.classList.add('hidden');
        loginLink.classList.remove('hidden');
    }
    fetchArticles();
}

async function fetchArticles() {
    const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return console.error(error);

    articlesContainer.innerHTML = '';
    articles.forEach(art => {
        const date = new Date(art.created_at).toLocaleDateString('pl-PL', {
            hour: '2-digit', minute: '2-digit'
        });

        const articleEl = document.createElement('article');
        articleEl.className = 'bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between break-words';
        
        articleEl.innerHTML = `
            <div>
                <h2 class="text-2xl font-bold text-gray-900 mb-1">${art.title}</h2>
                ${art.subtitle ? `<h3 class="text-md text-gray-500 italic mb-3">${art.subtitle}</h3>` : ''}
                <div class="text-xs text-indigo-600 font-semibold mb-4">Autor: ${art.author} | ${date}</div>
                <p class="text-gray-700 whitespace-pre-line">${art.content}</p>
            </div>
            ${currentUser ? `
                <div class="mt-4 pt-4 border-t border-gray-100 flex gap-2 justify-end">
                    <button class="edit-btn bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-sm rounded transition-colors duration-200" data-id="${art.id}">Edytuj</button>
                    <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 text-sm rounded transition-colors duration-200" data-id="${art.id}">Usuñ</button>
                </div>
            ` : ''}
        `;

        if (currentUser) {
            articleEl.querySelector('.delete-btn').addEventListener('click', () => deleteArticle(art.id));
            articleEl.querySelector('.edit-btn').addEventListener('click', () => openModal(art));
        }

        articlesContainer.appendChild(articleEl);
    });
}

addArticleBtn.addEventListener('click', () => {
    if (!currentUser) {
        window.location.href = 'login.html';
    } else {
        openModal();
    }
});

function openModal(article = null) {
    articleModal.classList.remove('hidden');
    if (article) {
        modalTitle.textContent = 'Edytuj artyku³';
        document.getElementById('article-id').value = article.id;
        document.getElementById('form-title').value = article.title;
        document.getElementById('form-subtitle').value = article.subtitle || '';
        document.getElementById('form-author').value = article.author;
        document.getElementById('form-content').value = article.content;
    } else {
        modalTitle.textContent = 'Dodaj artyku³';
        articleForm.reset();
        document.getElementById('article-id').value = '';
    }
}

closeModalBtn.addEventListener('click', () => articleModal.classList.add('hidden'));

articleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('article-id').value;
    const title = document.getElementById('form-title').value;
    const subtitle = document.getElementById('form-subtitle').value;
    const author = document.getElementById('form-author').value;
    const content = document.getElementById('form-content').value;
    const created_at = new Date().toISOString();

    let error;
    if (id) {
        ({ error } = await supabase.from('articles').update({ title, subtitle, author, content, created_at }).eq('id', id));
    } else {
        ({ error } = await supabase.from('articles').insert([{ title, subtitle, author, content, created_at }]));
    }

    if (error) {
        alert('B³¹d zapisu: ' + error.message);
    } else {
        articleModal.classList.add('hidden');
        fetchArticles();
    }
});

async function deleteArticle(id) {
    if (confirm('Czy na pewno chcesz usun¹æ ten artyku³?')) {
        const { error } = await supabase.from('articles').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchArticles();
    }
}

logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    checkUser();
});

checkUser();
document.addEventListener('DOMContentLoaded', () => {
    // Configuração do Firebase (sem alterações)
    const firebaseConfig = {
        apiKey: "AIzaSyAI0-oWcJskLZJQtxlGMqEthHhQ4SelZVM",
        authDomain: "cardapio-boi-na-brasa.firebaseapp.com",
        projectId: "cardapio-boi-na-brasa",
        storageBucket: "cardapio-boi-na-brasa.appspot.com",
        messagingSenderId: "849554969468",
        appId: "1:849554969468:web:54fe997c09260d064f4af9"
    };

    // Inicialização do Firebase (sem alterações)
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    const menuRef = database.ref('menu');

    // Seletores de elementos (sem alterações)
    const loginSection = document.getElementById('login-section');
    const adminPanel = document.getElementById('admin-panel');
    const passwordInput = document.getElementById('password-input');
    const loginBtn = document.getElementById('login-btn');
    const itemsList = document.getElementById('items-list');
    const editItemId = document.getElementById('edit-item-id');
    const itemCategory = document.getElementById('item-category');
    const itemNome = document.getElementById('item-nome');
    const itemDescricao = document.getElementById('item-descricao');
    const itemPreco = document.getElementById('item-preco');
    const saveItemBtn = document.getElementById('save-item-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    const SENHA_ADMIN = '7183';
    let menuData = [];

    // --- FUNÇÕES (sem alterações) ---
    function checkLogin() {
        if (sessionStorage.getItem('adminLoggedIn') === 'true') {
            loginSection.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            loadAdminData();
        }
    }

    function handleLogin() {
        if (passwordInput.value === SENHA_ADMIN) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            checkLogin();
        } else {
            alert('Senha incorreta!');
        }
    }

    function loadAdminData() {
        menuRef.on('value', (snapshot) => {
            const data = snapshot.val();
            menuData = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            renderAdminList();
        });
    }

    function renderAdminList() {
        itemsList.innerHTML = '';
        if (menuData.length === 0) {
            itemsList.innerHTML = '<p>Nenhum item cadastrado ainda.</p>';
            return;
        }
        menuData.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'admin-item';
            itemDiv.innerHTML = `
                <div class="admin-item-info">
                    <span class="item-name">${item.nome} (R$ ${parseFloat(item.preco).toFixed(2)})</span>
                    <span class="item-category">${item.category}</span>
                </div>
                <div class="admin-item-actions">
                    <button class="btn-edit" data-id="${item.id}">Editar</button>
                    <button class="btn-delete" data-id="${item.id}">Excluir</button>
                </div>
            `;
            itemsList.appendChild(itemDiv);
        });
    }

    function handleSaveItem() {
        const id = editItemId.value;
        const nome = itemNome.value.trim();
        const preco = parseFloat(itemPreco.value);
        const category = itemCategory.value;
        const descricao = itemDescricao.value.trim();

        if (!nome || isNaN(preco) || preco <= 0) {
            alert('Por favor, preencha o nome e um preço válido.');
            return;
        }

        const itemData = { nome, preco, category, descricao };

        if (id) {
            menuRef.child(id).update(itemData);
        } else {
            menuRef.push(itemData);
        }
        
        resetForm();
    }

    function handleEditItem(id) {
        const item = menuData.find(i => i.id == id);
        if (item) {
            editItemId.value = item.id;
            itemCategory.value = item.category;
            itemNome.value = item.nome;
            itemDescricao.value = item.descricao;
            itemPreco.value = item.preco;
            saveItemBtn.textContent = 'Atualizar Item';
            cancelEditBtn.classList.remove('hidden');
            window.scrollTo(0, 0);
        }
    }

    function handleDeleteItem(id) {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            menuRef.child(id).remove();
        }
    }

    function resetForm() {
        editItemId.value = '';
        itemNome.value = '';
        itemDescricao.value = '';
        itemPreco.value = '';
        itemCategory.value = 'Alacarte';
        saveItemBtn.textContent = 'Salvar Item';
        cancelEditBtn.classList.add('hidden');
    }

    // --- EVENT LISTENERS (AQUI ESTAVA O ERRO, AGORA CORRIGIDO) ---
    loginBtn.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    
    saveItemBtn.addEventListener('click', handleSaveItem);
    cancelEditBtn.addEventListener('click', resetForm);
    
    itemsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-edit')) {
            handleEditItem(e.target.dataset.id);
        } else if (e.target.classList.contains('btn-delete')) {
            handleDeleteItem(e.target.dataset.id);
        }
    });

    // --- INICIALIZAÇÃO ---
    checkLogin();
});

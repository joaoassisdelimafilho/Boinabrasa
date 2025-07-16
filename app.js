document.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = {
        apiKey: "AIzaSyAI0-oWcJskLZJQtxlGMqEthHhQ4SelZVM",
        authDomain: "cardapio-boi-na-brasa.firebaseapp.com",
        projectId: "cardapio-boi-na-brasa",
        storageBucket: "cardapio-boi-na-brasa.appspot.com",
        messagingSenderId: "849554969468",
        appId: "1:849554969468:web:54fe997c09260d064f4af9"
    };

    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    const menuRef = database.ref('menu');

    const menuContainer = document.getElementById('menu-container');
    const categoryNav = document.getElementById('category-nav');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const viewCartBtn = document.getElementById('view-cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const sendOrderBtn = document.getElementById('send-order-btn');
    const paymentMethodSelect = document.getElementById('payment-method');
    const trocoSection = document.getElementById('troco-section');

    const WHATSAPP_NUMBER = '5519995027183'; 

    let menuData = [];
    let cart = [];

    function loadMenu() {
        menuRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // A CORREÇÃO ESTÁ AQUI: A forma de transformar o objeto do Firebase em lista foi corrigida.
                menuData = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                renderCategories();
                if (menuData.length > 0) {
                    const firstCategory = getAvailableCategories()[0] || '';
                    if (firstCategory) {
                        filterMenu(firstCategory);
                        const firstBtn = categoryNav.querySelector(`[data-category="${firstCategory}"]`);
                        if(firstBtn) firstBtn.classList.add('active');
                    } else {
                         menuContainer.innerHTML = '<p class="initial-message">Nenhum item encontrado.</p>';
                    }
                } else {
                    displayEmptyMenuMessage();
                }
            } else {
                menuData = [];
                displayEmptyMenuMessage();
            }
        }, (error) => {
            console.error("Erro ao ler dados do Firebase:", error);
            menuContainer.innerHTML = '<p class="initial-message">Erro ao carregar o cardápio. Verifique a conexão.</p>';
        });
    }

    function getAvailableCategories() {
        const categoriesOrder = ["Alacarte", "Marmitex", "Comercial", "Saladas", "Porções", "Omeletes", "Bebidas"];
        const available = new Set(menuData.map(item => item.category));
        return categoriesOrder.filter(cat => available.has(cat));
    }

    function renderCategories() {
        categoryNav.innerHTML = '';
        const categories = getAvailableCategories();
        if (categories.length === 0) {
            menuContainer.innerHTML = '<p class="initial-message">Nenhum item cadastrado. Acesse o painel de administrador para começar.</p>';
            return;
        }
        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.textContent = category;
            btn.dataset.category = category;
            categoryNav.appendChild(btn);
        });
    }

    function filterMenu(category) {
        menuContainer.innerHTML = '';
        const filteredItems = menuData.filter(item => item.category === category);
        
        if (filteredItems.length === 0 && category) {
             menuContainer.innerHTML = `<p class="initial-message">Nenhum item na categoria ${category}.</p>`;
        } else if (filteredItems.length === 0 && !category) {
            displayEmptyMenuMessage();
        } else {
            filteredItems.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';
                itemDiv.innerHTML = `
                    <div class="item-header">
                        <div class="item-info">
                            <h3>${item.nome}</h3>
                            <p>${item.descricao || ''}</p>
                        </div>
                        <button class="add-btn" data-id="${item.id}">
                            <span>Adicionar</span>
                            <span class="btn-price">R$ ${parseFloat(item.preco).toFixed(2)}</span>
                        </button>
                    </div>
                `;
                menuContainer.appendChild(itemDiv);
            });
        }
    }

    function displayEmptyMenuMessage() {
        menuContainer.innerHTML = '<p class="initial-message">O cardápio está vazio. Acesse o painel de administrador para adicionar itens.</p>';
        categoryNav.innerHTML = '';
    }

    function addToCart(itemId) {
        const item = menuData.find(i => i.id == itemId);
        if (item) {
            cart.push(item);
            updateCart();
        }
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCart();
        renderCartItems();
    }

    function updateCart() {
        cartCount.textContent = cart.length;
        const total = cart.reduce((sum, item) => sum + parseFloat(item.preco), 0);
        cartTotal.textContent = `R$ ${total.toFixed(2)}`;
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
            sendOrderBtn.disabled = true;
            return;
        }
        sendOrderBtn.disabled = false;
        cart.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <span>${item.nome} - R$ ${parseFloat(item.preco).toFixed(2)}</span>
                <button class="remove-btn" data-index="${index}">&times;</button>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });
    }

    function generateWhatsAppMessage() {
        const addressStreet = document.getElementById('address-street').value.trim();
        const addressReference = document.getElementById('address-reference').value.trim();
        const paymentMethod = paymentMethodSelect.value;
        const trocoPara = document.getElementById('troco-para').value.trim();

        if (!addressStreet) {
            alert('Por favor, preencha o endereço (Rua e Número).');
            return null;
        }

        let message = `*-- NOVO PEDIDO - BOI NA BRASA --*\n\n`;
        message += `*ITENS DO PEDIDO:*\n`;
        cart.forEach(item => {
            message += `- ${item.nome} (R$ ${parseFloat(item.preco).toFixed(2)})\n`;
        });
        
        const total = cart.reduce((sum, item) => sum + parseFloat(item.preco), 0);
        message += `\n*TOTAL: R$ ${total.toFixed(2)}*\n\n`;
        
        message += `*DADOS PARA ENTREGA:*\n`;
        message += `Endereço: ${addressStreet}\n`;
        if (addressReference) {
            message += `Referência: ${addressReference}\n`;
        }
        
        message += `\n*PAGAMENTO:*\n`;
        message += `Forma: ${paymentMethod}\n`;
        if (paymentMethod === 'Dinheiro' && trocoPara) {
            message += `Troco para: R$ ${trocoPara}\n`;
        } else if (paymentMethod === 'Cartão') {
            message += `(Levar a maquininha)\n`;
        }

        return encodeURIComponent(message);
    }

    categoryNav.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-btn')) {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            filterMenu(e.target.dataset.category);
        }
    });

    menuContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-btn');
        if (btn) {
            addToCart(btn.dataset.id);
        }
    });

    viewCartBtn.addEventListener('click', () => {
        renderCartItems();
        cartModal.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', () => cartModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target == cartModal) cartModal.style.display = 'none';
    });

    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            removeFromCart(e.target.dataset.index);
        }
    });

    paymentMethodSelect.addEventListener('change', () => {
        trocoSection.classList.toggle('hidden', paymentMethodSelect.value !== 'Dinheiro');
    });

    sendOrderBtn.addEventListener('click', () => {
        const message = generateWhatsAppMessage();
        if (message) {
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
        }
    });

    loadMenu();
});

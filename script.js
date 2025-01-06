document.addEventListener('DOMContentLoaded', function() {
    // Cart Elements
    const cartIcon = document.querySelector('.cart-icon');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const closeCart = document.querySelector('.close-cart');
    const cartItems = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    const totalAmount = document.querySelector('.total-amount');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Auth Elements
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const signupBox = document.getElementById('signupBox');
    const loginBox = document.getElementById('loginBox');
    const authLinks = document.getElementById('authLinks');
    const userControls = document.getElementById('userControls');
    const userEmailElement = document.querySelector('#userControls .user-email');
    const logoutBtn = document.querySelector('#userControls .logout-btn');
    
    // Initialize users array from localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Add to Cart functionality
    const buyButtons = document.querySelectorAll('.buy-button');
    buyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!localStorage.getItem('isLoggedIn')) {
                window.location.href = 'page2.html?form=login';
                return;
            }

            const productCard = this.closest('.product-card');
            
            const product = {
                name: productCard.querySelector('h3').textContent,
                price: parseFloat(productCard.querySelector('.price').textContent.replace('$', '')),
                image: productCard.querySelector('img').src,

                quantity: 1 // Quantité par défaut à 1
            };

            // Vérifier si le produit existe déjà dans le panier
            const existingProductIndex = cart.findIndex(item => 
                item.name === product.name && 
                item.size === product.size
            );

            if (existingProductIndex !== -1) {
                // Si le produit existe, incrémenter la quantité
                if (cart[existingProductIndex].quantity < 10) {
                    cart[existingProductIndex].quantity += 1;
                }
            } else {
                // Si le produit n'existe pas, l'ajouter au panier
                cart.push(product);
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();

            // Show success message
            const notification = document.createElement('div');
            notification.className = 'add-to-cart-notification';
            notification.textContent = existingProductIndex !== -1 ? 'Quantity updated!' : 'Added to cart!';
            productCard.appendChild(notification);
            setTimeout(() => notification.remove(), 2000);
        });
    });

    // Signup Form Handler
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Regular expression for email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            // Regular expression for password strength (at least 8 characters, 1 uppercase, 1 lowercase, 1 number)
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address!');
                return;
            }
            if (!passwordRegex.test(password)) {
                alert('Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, and one number.');
                return;
            }
            if (password !== confirmPassword) {
                e.preventDefault(); // Prevent form submission
                alert("Passwords do not match!");
            }
            // Check if password meets the strength requirements
            if (!passwordRegex.test(password)) {
                alert('Password does not meet the required strength criteria!');
                return;
            }
            // Check if user already exists
            if (users.some(user => user.email === email)) {
                alert('User already exists!');
                return;
            }
            
            // Créer le nouvel utilisateur avec son rôle
            const newUser = {
                email: email,
                password: password,
                role: isFirstUser = 'user',
                createdAt: new Date().toISOString()
            };
            // Ajouter l'utilisateur
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', email);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', newUser.role);

            alert('Account created successfully!');
            window.location.href = 'index.html';
        });
    }

    // Login Form Handler
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // Vérification spécifique pour l'admin
            if (email === 'admin@gmail.com' && password === 'admin1230') {
                localStorage.setItem('currentUser', email);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', 'admin');
                localStorage.setItem('isAdmin', 'true');
                
                alert('Admin login successful!');
                window.location.href = 'index.html';
                return;
            }

            // Pour les autres utilisateurs
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                localStorage.setItem('currentUser', email);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', user.role || 'user');
                
                alert('Login successful!');
                window.location.href = 'index.html';
            } else {
                alert('Invalid email or password!');
            }
        });
    }

    // Update Auth UI
    function updateAuthUI() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const currentUser = localStorage.getItem('currentUser');

        if (isLoggedIn && currentUser) {
            if (authLinks) authLinks.style.display = 'none';
            if (userControls) {
                userControls.style.display = 'flex';
                
                // Mise à jour de l'affichage du nom d'utilisateur avec badge admin
                if (userEmailElement) {
                    if (isAdmin()) {
                        userEmailElement.innerHTML = `
                            <span class="user-info">
                                ${currentUser}
                                <span class="admin-badge">Admin</span>
                            </span>
                        `;
                    } else {
                        userEmailElement.textContent = currentUser;
                    }
                }
                
                // Gestion du bouton admin
                const existingAdminLink = userControls.querySelector('.admin-link');
                if (isAdmin()) {
                    if (!existingAdminLink) {
                        const adminButton = document.createElement('a');
                        adminButton.href = 'admin.html';
                        adminButton.className = 'admin-link';
                        adminButton.innerHTML = '<i class="fas fa-cog"></i> Admin Panel';
                        const logoutBtn = userControls.querySelector('.logout-btn');
                        if (logoutBtn) {
                            userControls.insertBefore(adminButton, logoutBtn);
                        } else {
                            userControls.appendChild(adminButton);
                        }
                    }
                }
             
            }
            
            // Enable cart
            if (cartIcon) {
                cartIcon.classList.remove('disabled');
                const tooltip = cartIcon.querySelector('.cart-tooltip');
                if (tooltip) tooltip.style.display = 'none';
            }
        } else {
            if (authLinks) authLinks.style.display = 'flex';
            if (userControls) userControls.style.display = 'none';
            
            // Disable cart
            if (cartIcon) {
                cartIcon.classList.add('disabled');
                const tooltip = cartIcon.querySelector('.cart-tooltip');
                if (tooltip) tooltip.style.display = 'block';
            }
        }
    }

    // Logout Handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            cart = [];
            localStorage.removeItem('cart');
            alert('Successfully logged out!');
            window.location.reload();
        });
    }

    // Cart Functions
    function updateCart() {
        if (!cartCount || !cartItems || !totalAmount) return;
        
        cartCount.textContent = cart.length;
        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += parseFloat(item.price) * item.quantity;
            cartItems.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <div class="cart-item-info">
                            <div class="cart-item-size">
                                <label>Size:</label>
                                <select class="cart-size-select" onchange="updateItemSize(${index}, this.value)">
                                    <option value="S" ${item.size === 'S' ? 'selected' : ''}>S</option>
                                    <option value="M" ${item.size === 'M' ? 'selected' : ''}>M</option>
                                    <option value="L" ${item.size === 'L' ? 'selected' : ''}>L</option>
                                </select>
                            </div>
                            <div class="cart-item-quantity">
                                <label>Qty:</label>
                                <input type="number" 
                                       value="${item.quantity}" 
                                       min="1" 
                                       max="10" 
                                       onchange="updateItemQuantity(${index}, this.value)">
                            </div>
                        </div>
                        <p class="cart-item-price">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                        <button class="remove-item" onclick="removeFromCart(${index})">Remove</button>
                    </div>
                </div>
            `;
        });

        totalAmount.textContent = `$${total.toFixed(2)}`;

        // Mise à jour du total et du bouton checkout
        const cartTotal = document.querySelector('.cart-total');
        if (cartTotal) {
            cartTotal.innerHTML = `
                <p>Total: <span class="total-amount">$${total.toFixed(2)}</span></p>
                ${cart.length > 0 ? '<button class="checkout-btn" onclick="window.location.href=\'checkout.html\'">Checkout</button>' : ''}
            `;
        }
    }

    // Cart Event Listeners
    if (cartIcon && cartSidebar) {
        cartIcon.addEventListener('click', () => {
            if (!localStorage.getItem('isLoggedIn')) {
                alert('Please login to access the cart');
                return;
            }
            cartSidebar.classList.add('active');
        });
        //fermer le panier en cliquant sur X
        closeCart?.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
        });

        // Fermer le panier en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (!cartSidebar.contains(e.target) && !cartIcon.contains(e.target)) {
                cartSidebar.classList.remove('active');
            }
        });
    }

    // Form switching based on URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const formType = urlParams.get('form');
    
    if (formType === 'login' && signupBox && loginBox) {
        signupBox.style.display = 'none';
        loginBox.style.display = 'block';
    }

    // Fonctions de mise à jour des articles
    window.updateItemSize = function(index, newSize) {
        cart[index].size = newSize;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    };

    window.updateItemQuantity = function(index, newQuantity) {
        newQuantity = parseInt(newQuantity);
        if (newQuantity < 1) newQuantity = 1;
        if (newQuantity > 10) newQuantity = 10;
        cart[index].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    };

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();

    };

    // Initialize
    updateAuthUI();
    updateCart();

    document.querySelector('.login-link').addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default link behavior
        document.getElementById('signupBox').style.display = 'none'; // Hide signup box
        document.getElementById('loginBox').style.display = 'block'; // Show login box
    });

    document.querySelector('.signup-link').addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default link behavior
        document.getElementById('loginBox').style.display = 'none'; // Hide login box
        document.getElementById('signupBox').style.display = 'block'; // Show signup box
    });

    // Fonction pour vérifier si l'utilisateur est admin
    function isAdmin() {
        const userRole = localStorage.getItem('userRole');
        const currentUser = localStorage.getItem('currentUser');
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Vérifier si c'est le premier utilisateur
        if (users.length === 1 && users[0].email === currentUser) {
            localStorage.setItem('userRole', 'admin');
            return true;
        }
        
        return userRole === 'admin';
    }

    // Protection de la page admin
    function checkAdminAccess() {
        if (window.location.pathname.includes('admin.html')) {
            if (!isAdmin()) {
                alert('Access denied. Admin privileges required.');
                window.location.href = 'index.html';
            }
        }
    }

    // Initialisation
    document.addEventListener('DOMContentLoaded', function() {
        updateAuthUI();
        checkLoginState();
        checkAdminAccess();
    });

    // Ajouter les styles CSS pour le badge admin
    const adminStyles = document.createElement('style');
    adminStyles.textContent = `
        .user-info {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .admin-badge {
            background-color: #ff4757;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .admin-link {
            background-color: #ff4757;
            color: white;
            padding: 8px 15px;
            border-radius: 4px;
            text-decoration: none;
            margin-right: 10px;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .admin-link:hover {
            background-color: #ff3748;
        }

        .admin-link i {
            font-size: 14px;
        }
    `;
    document.head.appendChild(adminStyles);
});

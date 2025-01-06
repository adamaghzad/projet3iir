document.addEventListener('DOMContentLoaded', function() {
    // Vérification de l'accès admin
    const currentUser = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    //const currentUserData = users.find(user => user.email === currentUser);

    // Vérifier si c'est l'admin avec les identifiants spécifiques
    // if (currentUser !== 'admin@gmail.com') {
    //     alert('Access denied. Admin privileges required.');
    //     window.location.href = 'adminLogin.html';
    //     return;
    // }

    // Initialize the dashboard

    document.getElementById('adminEmail').textContent = currentUser; //adminEmail: Met à jour l'interface pour afficher l'email de l'utilisateur connecté.
    updateDashboardStats();
    loadOrders();

    // Event Listeners
    document.getElementById('adminLogout').addEventListener('click', handleLogout);
    document.getElementById('search-order').addEventListener('input', handleSearch);
    document.getElementById('filter-status').addEventListener('change', handleFilterChange);

    // Modal event listeners
    const modal = document.getElementById('order-details-modal');
    if (modal) {
        document.querySelector('.close-modal').addEventListener('click', () => modal.close());
        document.querySelector('.btn-close').addEventListener('click', () => modal.close());
        document.querySelector('.btn-update-status').addEventListener('click', handleStatusUpdate);
    }

    // Tab management
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const content = document.getElementById(tab.dataset.tab);
            if (content) {
                content.classList.add('active');
            }

            if (tab.dataset.tab === 'orders') {
                loadOrders();
            } else if (tab.dataset.tab === 'users') {
                displayUsers();
            }
        });
    });

    const searchInput = document.querySelector('#search-users');
    const roleFilter = document.querySelector('#filter-role');

    if (searchInput) {
        searchInput.addEventListener('input', displayUsers);
    }

    if (roleFilter) {
        roleFilter.addEventListener('change', displayUsers);
    }

    // Afficher les utilisateurs au chargement
    displayUsers();
});

/**
 * Met à jour les statistiques du tableau de bord
 * Calcule et affiche :
 * - Le nombre total de commandes
 * - Le revenu total
 * - Le nombre de commandes du jour
 */
function updateDashboardStats() {
    // Récupérer toutes les commandes du localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const today = new Date().toLocaleDateString();

    // Calculer les statistiques principales
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const todayOrders = orders.filter(order => 
        new Date(order.orderDate).toLocaleDateString() === today
    ).length;

    // Mettre à jour l'affichage dans le DOM
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('todayOrders').textContent = todayOrders;
}

/**
 * Charge toutes les commandes depuis le localStorage et les affiche
 * Cette fonction sert de point d'entrée pour l'affichage des commandes
 * Elle est appelée :
 * - Au chargement initial de la page
 * - Après chaque modification (suppression, mise à jour de statut)
 * - Lors du rafraîchissement manuel
 */
function loadOrders() {
    // Récupérer toutes les commandes du localStorage
    // Si aucune commande n'existe, utiliser un tableau vide
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Passer les commandes à la fonction d'affichage
    displayFilteredOrders(orders);
}

/**
 * Affiche les commandes filtrées dans le tableau
 * - Liste des commandes à afficher
 * 
 * Cette fonction :
 * - Vide le tableau existant
 * - Affiche un message si aucune commande
 * - Trie les commandes par date (plus récentes en premier)
 * - Crée les lignes du tableau avec les détails de chaque commande
 * - Ajoute les boutons d'action (voir et supprimer)
 */
function displayFilteredOrders(orders) {
    // Récupérer le corps du tableau
    const tbody = document.getElementById('orders-list');
    if (!tbody) return;

    // Vider le contenu existant
    tbody.innerHTML = '';

    // Afficher un message si aucune commande
    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No orders found</td>
            </tr>
        `;
        return;
    }

    // Trier les commandes par date (plus récentes en premier)
    // et créer une ligne pour chaque commande
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
          .forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.orderId}</td>
            <td>${order.customer.fullName || order.customer.email}</td>
            <td>${new Date(order.orderDate).toLocaleDateString()}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td><span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-view" onclick="viewOrderDetails('${order.orderId}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-delete" onclick="deleteOrder('${order.orderId}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filterStatus = document.getElementById('filter-status').value;
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    const filteredOrders = orders.filter(order => {
        const matchesSearch = (
            order.orderId.toLowerCase().includes(searchTerm) ||
            order.customer.fullName?.toLowerCase().includes(searchTerm) ||
            order.customer.email.toLowerCase().includes(searchTerm)
        );
        
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });
    
    displayFilteredOrders(filteredOrders);
}

function handleFilterChange(e) {
    const status = e.target.value;
    const searchTerm = document.getElementById('search-order').value.toLowerCase();
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    const filteredOrders = orders.filter(order => {
        const matchesSearch = (
            order.orderId.toLowerCase().includes(searchTerm) ||
            order.customer.fullName?.toLowerCase().includes(searchTerm) ||
            order.customer.email.toLowerCase().includes(searchTerm)
        );
        
        const matchesStatus = status === 'all' || order.status === status;
        
        return matchesSearch && matchesStatus;
    });
    
    displayFilteredOrders(filteredOrders);
}

/**
 * Affiche les détails d'une commande spécifique dans une modal
 * - L'identifiant unique de la commande
 */
function viewOrderDetails(orderId) {
    // Récupérer la commande spécifique
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.orderId === orderId);
    
    if (!order) return;

    // Récupérer les éléments de la modal
    const modal = document.getElementById('order-details-modal');
    const content = document.getElementById('order-details-content');
    
    // Générer le contenu HTML de la modal
    content.innerHTML = `
        <div class="order-info">
            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
            <p><strong>Status:</strong> ${order.status || 'pending'}</p>
        </div>
        
        <div class="customer-info">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${order.customer.fullName || 'N/A'}</p>
            <p><strong>Email:</strong> ${order.customer.email}</p>
            <p><strong>Phone:</strong> ${order.customer.number || 'N/A'}</p>
            <p><strong>Address:</strong> ${order.customer.address || 'N/A'}</p>
        </div>

        <div class="order-items-section">
            <h3>Order Items</h3>
            <div class="items-container">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.name}" class="item-thumbnail">
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            <div class="item-details">
                                <span>Quantity: ${item.quantity}</span>
                                <span>Price: $${item.price.toFixed(2)}</span>
                                <span>Total: $${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <strong>Total: $${order.total.toFixed(2)}</strong>
            </div>
        </div>
    `;

    document.getElementById('update-status').value = order.status || 'pending';
    document.getElementById('update-status').dataset.orderId = orderId;
    
    modal.showModal();
}

function handleStatusUpdate() {
    const orderId = document.getElementById('update-status').dataset.orderId;
    const newStatus = document.getElementById('update-status').value;
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrders();
        document.getElementById('order-details-modal').close();
        showNotification('Order status updated successfully', 'success');
    }
}

/**
 * Supprime une commande spécifique après confirmation
 * @param {string} orderId - L'identifiant unique de la commande à supprimer
 */
function deleteOrder(orderId) {
    // Demander confirmation avant suppression
    if (confirm('Are you sure you want to delete this order?')) {
        // Récupérer et filtrer les commandes
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const updatedOrders = orders.filter(order => order.orderId !== orderId);
        
        // Mettre à jour le localStorage
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        
        // Rafraîchir l'interface
        loadOrders();
        updateDashboardStats();
        
        // Notifier l'utilisateur
        showNotification('Order deleted successfully', 'success');
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

/**
 * Affiche une notification temporaire à l'utilisateur
 * message - Le message à afficher
 * type - Le type de notification ('success', 'error', etc.)
 */
function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function exportOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    const csvContent = "data:text/csv;charset=utf-8,"
        + "Order ID,Customer Name,Email,Phone,Address,Date,Status,Total\n"
        + orders.map(order => [
            order.orderId,
            order.customer.fullName,
            order.customer.email,
            order.customer.number,
            `${order.customer.address || ''}, ${order.customer.city || ''}, ${order.customer.zipCode || ''}, ${order.customer.country || ''}`,
            new Date(order.orderDate).toLocaleString(),
            order.status || 'pending',
            `$${order.total.toFixed(2)}`
        ].join(',')).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Supprime toutes les commandes complétées (status: 'delivered')
 * après confirmation de l'utilisateur
 */
function deleteCompletedOrders() {
    // Demander confirmation avant suppression
    if (confirm('Are you sure you want to delete all completed orders?')) {
        // Récupérer et filtrer les commandes
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const updatedOrders = orders.filter(order => order.status !== 'delivered');
        
        // Calculer le nombre de commandes supprimées
        const deletedCount = orders.length - updatedOrders.length;
        
        // Mettre à jour le localStorage
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        
        // Rafraîchir l'interface
        loadOrders();
        updateDashboardStats();
        
        // Notifier l'utilisateur
        showNotification(`${deletedCount} completed orders deleted successfully`, 'success');
    }
}

// Fonction pour afficher les utilisateurs
function displayUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const searchTerm = document.querySelector('#search-users')?.value.toLowerCase() || '';
    const roleFilter = document.querySelector('#filter-role')?.value || 'all';
    
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;

    // Filtrer les utilisateurs
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm);
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>${user.email}</td>
            <td>
                <span class="role-badge role-${user.role || 'user'}">${user.role || 'user'}</span>
            </td>
            <td>${new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
            <td>
                <div class="user-actions">
                    ${user.email !== 'admin@gmail.com' ? `
                        <button class="btn-role" onclick="toggleUserRole('${user.email}')">
                            ${user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button class="btn-delete-user" onclick="deleteUser('${user.email}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : '<span class="text-muted">Main Admin</span>'}
                </div>
            </td>
        </tr>
    `).join('');
}

// Fonction pour basculer le rôle d'un utilisateur
window.toggleUserRole = function(email) {
    if (confirm('Are you sure you want to change this user\'s role?')) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email);
        if (user) {
            user.role = user.role === 'admin' ? 'user' : 'admin';
            localStorage.setItem('users', JSON.stringify(users));
            displayUsers();
        }
    }
};

/**
 * Supprime un utilisateur spécifique après confirmation
 * @param {string} email - L'email de l'utilisateur à supprimer
 */
window.deleteUser = function(email) {
  
    // Demander confirmation avant suppression
    if (confirm('Are you sure you want to delete this user?')) {
        // Récupérer et filtrer les utilisateurs
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const updatedUsers = users.filter(user => user.email !== email);
        
        // Mettre à jour le localStorage
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        // Rafraîchir l'affichage
        displayUsers();
        // Notifier l'utilisateur
        showNotification('User deleted successfully', 'success');
    }
};

// Ajouter les event listeners pour la recherche et le filtre
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('#search-users');
    const roleFilter = document.querySelector('#filter-role');

    if (searchInput) {
        searchInput.addEventListener('input', displayUsers);
    }

    if (roleFilter) {
        roleFilter.addEventListener('change', displayUsers);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est connecté
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'page2.html';
        return;
    }

    // Récupérer l'email de l'utilisateur connecté
    const userEmail = localStorage.getItem('currentUser');
    
    // Pré-remplir l'email dans le formulaire
    const emailInput = document.getElementById('email');
    if (emailInput && userEmail) {
        emailInput.value = userEmail;
    }

    // Récupérer le panier
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutItems = document.querySelector('.checkout-items');
    const finalTotal = document.querySelector('.final-total');

    // Afficher les articles
    let total = 0;
    cart.forEach(item => {
        const itemTotal = parseFloat(item.price) * item.quantity;
        total += itemTotal;
        
        checkoutItems.innerHTML += `
            <div class="checkout-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Size: ${item.size}</p>
                    <p>Quantity: ${item.quantity}</p>
                    <p class="item-total">$${itemTotal.toFixed(2)}</p>
                </div>
            </div>
        `;
    });

    finalTotal.textContent = `$${total.toFixed(2)}`;

    // Ajouter la validation du numéro de téléphone
    const numberInput = document.getElementById('number');
    
    if (numberInput) {
        numberInput.addEventListener('input', function() {
            // Regex pour valider le format: +XX XXX XXX XXXX ou XX XXX XXX XXXX
            const phoneRegex = /^(\+?\d{1,3}\s?)?\d{3}\s?\d{3}\s?\d{4}$/;
            
            if (!phoneRegex.test(this.value)) {
                this.setCustomValidity('Please enter a valid phone number (e.g., +33 123 456 7890 or 123 456 7890)');
                this.classList.add('invalid');
            } else {
                this.setCustomValidity('');
                this.classList.remove('invalid');
            }
        });
    }

    // Modification de la gestion du formulaire
    const checkoutForm = document.getElementById('checkoutForm');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const phoneNumber = document.getElementById('number').value;
            const phoneRegex = /^(\+?\d{1,3}\s?)?\d{3}\s?\d{3}\s?\d{4}$/;
            
            if (!phoneRegex.test(phoneNumber)) {
                alert('Please enter a valid phone number');
                return;
            }

            // Récupérer toutes les informations du formulaire
            const orderInfo = {
                customer: {
                    fullName: document.getElementById('fullName').value,
                    email: document.getElementById('email').value,
                    address: document.getElementById('address').value,
                    number : phoneNumber,
                    city: document.getElementById('city').value,
                    zipCode: document.getElementById('zipCode').value,
                    country: document.getElementById('country').value
                },
                items: cart,
                total: total,
                orderDate: new Date().toISOString(),
                orderId: 'ORD-' + Date.now() // Générer un ID unique pour la commande
            };

            // Sauvegarder la commande dans localStorage
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(orderInfo);
            localStorage.setItem('orders', JSON.stringify(orders));

            // Simulation de traitement de commande
            const loadingBtn = document.querySelector('.place-order-btn');
            loadingBtn.textContent = 'Processing...';
            loadingBtn.disabled = true;

            // Remplacer le contenu de la page par un message de confirmation
            const checkoutSection = document.getElementById('checkout-section');
            checkoutSection.innerHTML = `
                <div class="order-confirmation">
                    <div class="confirmation-content">
                        <i class="fas fa-check-circle"></i>
                        <h2>Thank You for Your Order!</h2>
                        <p>Order ID: ${orderInfo.orderId}</p>
                        <div class="order-details">
                            <h3>Order Summary</h3>
                            <p><strong>Name:</strong> ${orderInfo.customer.fullName}</p>
                            <p><strong>Email:</strong> ${orderInfo.customer.email}</p>
                            <p><strong>Shipping Address:</strong><br>
                            ${orderInfo.customer.address}<br>
                            ${orderInfo.customer.city}, ${orderInfo.customer.zipCode}<br>
                            ${orderInfo.customer.number}<br>
                            ${orderInfo.customer.country}</p>
                            <p><strong>Total:</strong> $${total.toFixed(2)}</p>
                        </div>
                        <p class="confirmation-message">
                            A confirmation email has been sent to ${orderInfo.customer.email}
                        </p>
                        <div class="confirmation-buttons">
                            <button onclick="window.location.href='page1.html'" class="continue-shopping">
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Vider le panier
            localStorage.removeItem('cart');

            // Ajouter les styles de confirmation
            const style = document.createElement('style');
            style.textContent = `
                .order-confirmation {
                    text-align: center;
                    padding: 40px 20px;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .confirmation-content {
                    background: white;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .fa-check-circle {
                    color: #4CAF50;
                    font-size: 64px;
                    margin-bottom: 20px;
                }
                .order-details {
                    text-align: left;
                    margin: 30px 0;
                    padding: 20px;
                    background: #f9f9f9;
                    border-radius: 8px;
                }
                .confirmation-message {
                    color: #666;
                    margin: 20px 0;
                }
                .continue-shopping {
                    background: #4CAF50;
                    color: white;
                    padding: 12px 30px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                    margin-top: 20px;
                }
                .continue-shopping:hover {
                    background: #45a049;
                }
            `;
            document.head.appendChild(style);
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const cartTableBody = document.querySelector('.cart-table tbody');
    const subtotalElement = document.querySelector('.subtotal');
    const totalElement = document.querySelector('.total-price');
    const checkoutBtn = document.querySelector('.checkout-btn');

    // Show loader
    const showLoader = () => {
        const loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.innerHTML = `
            <div class="loader"></div>
            <p class="loading-text">Loading...</p>
            `;
        document.body.appendChild(loader);
    };

    const hideLoader = () => {
        const loader = document.querySelector('.loader-overlay');
        if (loader) loader.remove();
    };

    // Fetch cart data from API
    const fetchCartData = async () => {
        showLoader();
        setTimeout(async () => {

            try {
                const response = await fetch('https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889');
                const data = await response.json();
                hideLoader();
                populateCart(data);
                updateCartTotal();
            } catch (error) {
                console.error('Error fetching cart data:', error);
                hideLoader();
            }
        }, 1000)
    };

    const populateCart = (data) => {
        cartTableBody.innerHTML = '';
        data.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="product" ><img src="${item.image}" alt="${item.title}" /></td>
                <td class="product">${item.title}</td>
                <td>₹${(item.price / 100).toLocaleString('en-IN')}</td>
                <td><input type="number" value="${item.quantity}" min="1" data-id="${item.id}" /></td>
                <td>₹${(item.line_price / 100).toLocaleString('en-IN')}</td>
                <td><button class="delete-btn" data-id="${item.id}">&#128465;</button></td>
            `;
            cartTableBody.appendChild(row);
        });

        attachEventListeners();
        saveCartToLocalStorage(data);
    };

    const attachEventListeners = () => {
        const quantityInputs = document.querySelectorAll('.cart-table input[type="number"]');
        const deleteButtons = document.querySelectorAll('.delete-btn');

        quantityInputs.forEach(input => {
            input.addEventListener('change', handleQuantityChange);
        });

        deleteButtons.forEach(button => {
            button.addEventListener('click', handleRemoveItem);
        });
    };

    const handleQuantityChange = (e) => {
        const input = e.target;
        const itemId = input.dataset.id;
        let quantity = parseInt(input.value);
        if (quantity < 1) quantity = 1;

        const cart = JSON.parse(localStorage.getItem('cart'));
        const item = cart.items.find(i => i.id == itemId);
        item.quantity = quantity;
        item.line_price = item.price * quantity;

        saveCartToLocalStorage(cart);
        populateCart(cart);
        updateCartTotal();
    };

    const handleRemoveItem = (e) => {
        const itemId = e.target.dataset.id;
        showConfirmationModal(() => {
            const cart = JSON.parse(localStorage.getItem('cart'));
            const updatedItems = cart.items.filter(item => item.id != itemId);
            cart.items = updatedItems;
            saveCartToLocalStorage(cart);
            populateCart(cart);
            updateCartTotal();
        });
    };

    const showConfirmationModal = (onConfirm) => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Remove Item</h3>
                <p>Are you sure you want to remove this item?</p>
                <button id="confirm-remove">Yes</button>
                <button id="cancel-remove">No</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('confirm-remove').addEventListener('click', () => {
            onConfirm();
            modal.remove();
        });

        document.getElementById('cancel-remove').addEventListener('click', () => {
            modal.remove();
        });
    };

    const updateCartTotal = () => {
        const cart = JSON.parse(localStorage.getItem('cart'));
        let total = cart.items.reduce((sum, item) => sum + item.line_price, 0);
        subtotalElement.textContent = `₹${(total / 100).toLocaleString('en-IN')}`;
        totalElement.textContent = `₹${(total / 100).toLocaleString('en-IN')}`;
    };

    const saveCartToLocalStorage = (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    checkoutBtn.addEventListener('click', () => {
        alert('Checkout functionality to be implemented!');
    });

    fetchCartData();
});

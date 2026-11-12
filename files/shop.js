document.addEventListener('DOMContentLoaded', async () => {
    const productGrid = document.getElementById('productGrid');
    const loadingText = document.getElementById('loading');
    
    try {
        // Python Backend (Port 5001) එකෙන් බීජ දත්ත ලබා ගැනීම
        const res = await fetch('http://127.0.0.1:5001/api/seeds');
        const data = await res.json();
        
        if (res.ok && data.success) {
            loadingText.style.display = 'none';
            
            // හැම බීජ වර්ගයකටම Card එකක් බැගින් සෑදීම
            data.seeds.forEach(seed => {
                const card = document.createElement('div');
                card.className = 'product-card';
                
                card.innerHTML = `
                    <h3>${seed.name}</h3>
                    <p>${seed.description}</p>
                    <div class="price-tag">
                        <span class="original-price">Rs.${seed.original_price}</span> 
                        Rs.${seed.discount_price}
                    </div>
                    <button class="buy-btn">Buy Now</button>
                `;
                
                // බටන් එකට click event එකක් වෙනම එකතු කිරීම (Inline onclick ගැටලු මඟහැරේ)
                const buyButton = card.querySelector('.buy-btn');
                buyButton.addEventListener('click', () => {
                    const encodedName = encodeURIComponent(seed.name);
                    const encodedPrice = encodeURIComponent(seed.discount_price);
                    window.location.href = `order-seeds.html?name=${encodedName}&price=${encodedPrice}`;
                });
                
                productGrid.appendChild(card);
            });
        } else {
            loadingText.textContent = 'Failed to load products.';
        }
    } catch (error) {
        loadingText.textContent = 'Server connection error. Please check your backend.';
    }
});

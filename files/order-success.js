document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    document.getElementById('orderId').innerText = params.get('orderId') || 'ORD-NEW';
    document.getElementById('totalAmount').innerText = parseFloat(params.get('total') || 0).toFixed(2);
});

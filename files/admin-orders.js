async function loadOrders() {
    try {
        const res = await fetch('http://127.0.0.1:5002/api/orders');
        const data = await res.json();
        const tbody = document.getElementById('ordersTable');
        tbody.innerHTML = '';

        if (data.success && data.orders.length > 0) {
            data.orders.forEach(order => {
                const isPending = order.status === 'Pending';
                const row = `
                    <tr>
                        <td>${order.order_date}</td>
                        <td><strong>${order.farmer_name}</strong><br>📞 ${order.phone}</td>
                        <td>${order.address}<br><small>(${order.district})</small></td>
                        <td>${order.seed_name}<br><strong>Qty: ${order.quantity}</strong></td>
                        <td style="font-weight:bold; color:#2e7d32;">Rs. ${order.total_price.toFixed(2)}</td>
                        <td><span class="${isPending ? 'badge-pending' : 'badge-done'}">${order.status}</span></td>
                        <td>
                            ${isPending ? `<button class="btn-deliver" onclick="markDelivered('${order._id}')">Mark Delivered & Paid</button>` : '✅ Completed'}
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No orders found yet.</td></tr>';
        }
    } catch (error) {
        document.getElementById('ordersTable').innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Server connection error. Check Port 5002.</td></tr>';
    }
}

async function markDelivered(id) {
    if(confirm("මෙම ඇණවුම බෙදාහැර මුදල් ලැබුණු බව තහවුරු කරනවාද?")) {
        await fetch(`http://127.0.0.1:5002/api/orders/${id}/deliver`, { method: 'PUT' });
        loadOrders(); 
    }
}

document.addEventListener('DOMContentLoaded', loadOrders);

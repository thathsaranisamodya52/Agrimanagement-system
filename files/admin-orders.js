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

function setupCropGuideForm() {
    const guideForm = document.getElementById("addGuideForm");
    if (!guideForm) return;

    guideForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const guideData = {
            crop_name: document.getElementById("cropName").value,
            soil: document.getElementById("cropSoil").value,
            water: document.getElementById("cropWater").value,
            fertilizer: document.getElementById("cropFertilizer").value,
            special_tips: document.getElementById("cropTips").value
        };

        try {
            const response = await fetch("http://127.0.0.1:5002/api/add-crop-guide", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(guideData)
            });

            const result = await response.json();
            if (result.success) {
                alert("✅ නව බෝග මාර්ගෝපදේශය සාර්ථකව ඇතුළත් කරන ලදී!");
                guideForm.reset();
            } else {
                alert("❌ දෝෂයක් ඇති විය: " + result.message);
            }
        } catch (error) {
            alert("❌ Server connection error. Check Port 5002.");
        }
    });
}

async function loadAdminGuides() {
    try {
        const res = await fetch("http://127.0.0.1:5002/api/crop-guides");
        const data = await res.json();
        const listDiv = document.getElementById("adminGuidesList");
        if (!listDiv) return;
        listDiv.innerHTML = "";

        if (data.success && data.guides.length > 0) {
            data.guides.forEach(guide => {
                listDiv.innerHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 6px;">
                        <strong>🌱 ${guide.crop_name}</strong>
                        <button onclick="deleteGuide('${guide._id}')" style="background: #d32f2f; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                            🗑️ Delete
                        </button>
                    </div>
                `;
            });
        } else {
            listDiv.innerHTML = "<p>No custom crop guides uploaded yet.</p>";
        }
    } catch (error) {
        console.error(error);
    }
}
async function deleteGuide(id) {
    if (confirm("මෙම බෝග මාර්ගෝපදේශය මකා දැමීමට අවශ්‍ය බව තහවුරු කරනවාද?")) {
        await fetch(`http://127.0.0.1:5002/api/crop-guides/${id}`, { method: "DELETE" });
        loadAdminGuides(); // මැකූ පසු ලැයිස්තුව update වීමට
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    setupCropGuideForm();
    loadAdminGuides();
});


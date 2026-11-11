document.getElementById('adviceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const description = document.getElementById('problemDescription').value;
    const imageFile = document.getElementById('plantImage').files[0];
    const resultBox = document.getElementById('result');
    const btn = document.getElementById('submitBtn');
    
    btn.disabled = true;
    btn.textContent = 'Processing... Please wait...';
    resultBox.style.display = 'none';
    
    // FormData එකක් සාදා ඒකට data එකතු කිරීම
    const formData = new FormData();
    formData.append('description', description);
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        // අපි දැනට පාවිච්චි කරන Login/Signup සර්වර් එකකටම මේක දාන්න පුළුවන් (Port 5001 ගනිමු)
        const res = await fetch('http://127.0.0.1:5001/api/advice', {
            method: 'POST',
            body: formData // සටහන: මෙතනදී Headers වලට Content-Type දාන්න එපා, බ්‍රවුසර් එක ඔටෝ ගන්නවා
        });
        
        const data = await res.json();
        
        if (res.ok) {
            resultBox.style.display = 'block';
            resultBox.innerHTML = `<strong>💡 Expert/AI Advice:</strong><br><br>${data.advice.replace(/\n/g, '<br>')}`;
        } else {
            alert(data.message || 'Something went wrong.');
        }
    } catch (error) {
        alert('Server connection error. Please check your backend.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Get Advice';
    }
});

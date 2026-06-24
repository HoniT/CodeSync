window.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/documents?pageNumber=0&pageSize=1');
        if (res.ok) window.location.href = 'index.html';
    } catch (err) {}
});

document.getElementById('togglePasswordBtn').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        this.textContent = 'Show';
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorMsg = document.getElementById('errorMsg');
    const btn = e.target.querySelector('button[type="submit"]');

    btn.disabled = true;
    errorMsg.style.display = 'none';

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            })
        });

        if (res.ok) {
            window.location.href = 'index.html';
        } else {
            let backendMessage = "Registration failed. Verify input parameters.";
            try {
                const data = await res.json();
                backendMessage = data.message || data.error || backendMessage;
            } catch (parseErr) {}

            errorMsg.textContent = backendMessage;
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.textContent = "System error. Please verify network connection.";
        errorMsg.style.display = 'block';
    } finally {
        btn.disabled = false;
    }
});
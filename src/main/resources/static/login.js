document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorMsg = document.getElementById('errorMsg');
    const btn = e.target.querySelector('button');
    btn.disabled = true;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            })
        });

        // 204 indicates the HttpOnly cookie was set successfully
        if (res.ok) {
            window.location.href = 'index.html';
        } else {
            errorMsg.textContent = "Invalid username or password.";
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.textContent = "Server error. Try again.";
        errorMsg.style.display = 'block';
    } finally {
        btn.disabled = false;
    }
});
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorMsg = document.getElementById('errorMsg');
    const btn = e.target.querySelector('button');
    btn.disabled = true;

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            })
        });

        if (res.ok) {
            window.location.href = 'login.html';
        } else {
            errorMsg.textContent = "Registration failed. Username/Email may exist.";
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.textContent = "Server error. Try again.";
        errorMsg.style.display = 'block';
    } finally {
        btn.disabled = false;
    }
});
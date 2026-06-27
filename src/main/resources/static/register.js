async function getErrorMsg(res) {
    try {
        let msg = await res.text();
        try {
            const data = JSON.parse(msg);
            msg = data.message || data.error || msg;
        } catch (e) {}
        return msg || `HTTP Error ${res.status}`;
    } catch (e) {
        return `HTTP Error ${res.status}`;
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/documents?pageNumber=0&pageSize=1');
        if (res.ok) window.location.href = 'index.html';
    } catch (err) {}
});

document.getElementById('togglePasswordBtn').addEventListener('click', function() {
    const pwd = document.getElementById('password');
    pwd.type = pwd.type === 'password' ? 'text' : 'password';
    this.textContent = pwd.type === 'password' ? 'Show' : 'Hide';
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
            return;
        }

        errorMsg.textContent = await getErrorMsg(res);
        errorMsg.style.display = 'block';
    } catch (err) {
        errorMsg.textContent = err.message || "Network error. Please try again.";
        errorMsg.style.display = 'block';
    } finally {
        btn.disabled = false;
    }
});
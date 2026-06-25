document.getElementById('btnDashboard').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('btnLogout').addEventListener('click', async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (err) {}
    window.location.href = 'login.html';
});

window.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch User Info
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) throw new Error("Unauthorized");
        const userData = await userRes.json();
        document.getElementById('usernameHeader').textContent = `${userData.username}'s Profile`;

        // Fetch User's Documents
        const docsRes = await fetch('/api/documents/me?pageNumber=0&pageSize=100&sortParam=createdDesc');
        if (!docsRes.ok) throw new Error("Unauthorized");
        const docs = await docsRes.json();

        const grid = document.getElementById('myDocGrid');
        grid.innerHTML = '';

        if (docs.length === 0) {
            grid.innerHTML = '<p style="color: #aaa; grid-column: 1 / -1;">You have not created any documents yet.</p>';
            return;
        }

        docs.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'doc-card';

            card.addEventListener('click', () => {
                window.location.href = `document.html?id=${doc.id}`;
            });

            card.innerHTML = `
                <div class="doc-title">${doc.public === false ? '🔒 ' : ''}${doc.title}</div>
                <div class="doc-meta">Created: ${new Date(doc.createdAt).toLocaleDateString()}</div>
                <div class="doc-meta">Last Saved: ${new Date(doc.lastSavedAt).toLocaleDateString()}</div>
                <button class="delete-doc-btn">Delete</button>
            `;

            const deleteBtn = card.querySelector('.delete-doc-btn');
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();

                if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
                    try {
                        const deleteRes = await fetch(`/api/documents/${doc.id}`, {
                            method: 'DELETE'
                        });

                        if (deleteRes.ok) {
                            card.remove(); // Instantly remove the card from the UI upon success
                        } else {
                            alert('Failed to delete the document.');
                        }
                    } catch (err) {
                        console.error('Error deleting document:', err);
                        alert('An error occurred while deleting.');
                    }
                }
            });

            grid.appendChild(card);
        });

    } catch (err) {
        window.location.href = 'login.html';
    }
});
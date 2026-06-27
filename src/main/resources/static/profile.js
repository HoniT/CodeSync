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

const accessModal = document.getElementById('accessModal');
const accessForm = document.getElementById('accessForm');
const accessErrorMsg = document.getElementById('accessErrorMsg');

let currentPage = 0;
const pageSize = 12;
let targetPrivateDocId = null;

document.getElementById('btnDashboard').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('btnLogout').addEventListener('click', async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (err) {}
    window.location.href = 'login.html';
});

document.getElementById('btnPrevPage').addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        fetchMyDocuments();
    }
});

document.getElementById('btnNextPage').addEventListener('click', () => {
    currentPage++;
    fetchMyDocuments();
});

document.getElementById('btnCancelAccess').addEventListener('click', () => {
    accessModal.style.display = 'none';
    accessForm.reset();
    if (accessErrorMsg) accessErrorMsg.style.display = 'none';
    targetPrivateDocId = null;
});

accessForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('accessCodeInput').value;
    const submitBtn = document.getElementById('btnSubmitAccess');

    submitBtn.disabled = true;
    if (accessErrorMsg) accessErrorMsg.style.display = 'none';

    try {
        const res = await fetch(`/api/documents/${targetPrivateDocId}?accessCode=${encodeURIComponent(code)}`);

        if (res.ok) {
            window.location.href = `document.html?id=${targetPrivateDocId}&accessCode=${encodeURIComponent(code)}`;
            return;
        }

        accessErrorMsg.textContent = await getErrorMsg(res);
        accessErrorMsg.style.display = 'block';
    } catch (err) {
        accessErrorMsg.textContent = err.message || "Network error. Please try again.";
        accessErrorMsg.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
    }
});

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) throw new Error("Unauthorized");
        const userData = await userRes.json();
        document.getElementById('usernameHeader').textContent = `${userData.username}'s Profile`;
        fetchMyDocuments();
    } catch (err) {
        window.location.href = 'login.html';
    }
});

async function fetchMyDocuments() {
    try {
        const docsRes = await fetch(`/api/documents/me?pageNumber=${currentPage}&pageSize=${pageSize}&sortParam=createdDesc`);

        if (!docsRes.ok) {
            alert(`Error fetching profile: ${await getErrorMsg(docsRes)}`);
            window.location.href = 'login.html';
            return;
        }

        const docs = await docsRes.json();
        const grid = document.getElementById('myDocGrid');
        grid.innerHTML = '';

        if (docs.length === 0 && currentPage === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1 / -1;">You have not created any documents yet.</p>';
            document.getElementById('btnPrevPage').disabled = true;
            document.getElementById('btnNextPage').disabled = true;
            return;
        }

        if (docs.length === 0 && currentPage > 0) {
            currentPage--;
            fetchMyDocuments();
            return;
        }

        docs.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'doc-card';

            card.addEventListener('click', () => {
                if (doc.public === false) {
                    targetPrivateDocId = doc.id;
                    accessModal.style.display = 'flex';
                    document.getElementById('accessCodeInput').focus();
                } else {
                    window.location.href = `document.html?id=${doc.id}`;
                }
            });

            card.innerHTML = `
                <div class="doc-title">${doc.public === false ? '🔒 ' : ''}${doc.title}</div>
                <div class="doc-meta">Created: ${new Date(doc.createdAt).toLocaleDateString()}</div>
                <div class="doc-meta" style="margin-bottom: auto;">Last Saved: ${new Date(doc.lastSavedAt).toLocaleDateString()}</div>
                <button class="delete-doc-btn">Delete</button>
            `;

            const deleteBtn = card.querySelector('.delete-doc-btn');
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();

                if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
                    deleteBtn.disabled = true;
                    deleteBtn.textContent = 'Processing...';

                    try {
                        const deleteRes = await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' });
                        if (deleteRes.ok) {
                            fetchMyDocuments();
                        } else {
                            alert(`Failed to delete document: ${await getErrorMsg(deleteRes)}`);
                            deleteBtn.disabled = false;
                            deleteBtn.textContent = 'Delete';
                        }
                    } catch (err) {
                        alert(`An error occurred: ${err.message}`);
                        deleteBtn.disabled = false;
                        deleteBtn.textContent = 'Delete';
                    }
                }
            });

            grid.appendChild(card);
        });

        document.getElementById('pageIndicator').textContent = `Page ${currentPage + 1}`;
        document.getElementById('btnPrevPage').disabled = currentPage === 0;
        document.getElementById('btnNextPage').disabled = docs.length < pageSize;
    } catch (err) {
        window.location.href = 'login.html';
    }
}
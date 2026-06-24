const createModal = document.getElementById('createModal');
const createForm = document.getElementById('createForm');
const docGrid = document.getElementById('docGrid');

const accessModal = document.getElementById('accessModal');
const accessForm = document.getElementById('accessForm');
const sortSelect = document.getElementById('sortSelect');

let targetPrivateDocId = null;

// Handle Sorting Changes
sortSelect.addEventListener('change', () => {
    fetchDocuments();
});

document.getElementById('btnNewDoc').addEventListener('click', () => {
    createModal.style.display = 'flex';
});

document.getElementById('btnCancel').addEventListener('click', () => {
    createModal.style.display = 'none';
    createForm.reset();
});

// Handle Access Modal Cancellation
document.getElementById('btnCancelAccess').addEventListener('click', () => {
    accessModal.style.display = 'none';
    accessForm.reset();
    targetPrivateDocId = null;
});

// Handle Access Code Submission
accessForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('accessCodeInput').value;
    // Redirect to the document and pass the access code in the URL
    window.location.href = `document.html?id=${targetPrivateDocId}&accessCode=${encodeURIComponent(code)}`;
});

document.getElementById('btnLogout').addEventListener('click', async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (err) {}
    window.location.href = 'login.html';
});

createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', document.getElementById('docTitle').value);

    const res = await fetch('/api/documents', { method: 'POST', body: formData });

    if (res.status === 401 || res.status === 403) {
        window.location.href = 'login.html';
        return;
    }

    createModal.style.display = 'none';
    createForm.reset();
    fetchDocuments();
});

async function fetchDocuments() {
    const currentSort = sortSelect.value;
    const res = await fetch(`/api/documents?pageNumber=0&pageSize=50&sortParam=${currentSort}`);

    if (res.status === 401 || res.status === 403) {
        window.location.href = 'login.html';
        return;
    }

    const docs = await res.json();
    docGrid.innerHTML = '';

    docs.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'doc-card';

        card.addEventListener('click', () => {
            // Check if document is private
            if (doc.isPublic === false) {
                targetPrivateDocId = doc.id;
                accessModal.style.display = 'flex';
                document.getElementById('accessCodeInput').focus();
            } else {
                window.location.href = `document.html?id=${doc.id}`;
            }
        });

        card.innerHTML = `
            <div class="doc-title">
                ${doc.isPublic === false ? '🔒 ' : ''}${doc.title}
            </div>
            <div class="doc-meta">Created: ${new Date(doc.createdAt).toLocaleDateString()}</div>
        `;
        docGrid.appendChild(card);
    });
}

fetchDocuments();
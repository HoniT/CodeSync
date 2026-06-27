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

const createModal = document.getElementById('createModal');
const createForm = document.getElementById('createForm');
const createErrorMsg = document.getElementById('createErrorMsg');
const docGrid = document.getElementById('docGrid');

const accessModal = document.getElementById('accessModal');
const accessForm = document.getElementById('accessForm');
const accessErrorMsg = document.getElementById('accessErrorMsg');
const sortSelect = document.getElementById('sortSelect');

let currentPage = 0;
const pageSize = 12;
let targetPrivateDocId = null;

sortSelect.addEventListener('change', () => {
    currentPage = 0;
    fetchDocuments();
});

document.getElementById('btnPrevPage').addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        fetchDocuments();
    }
});

document.getElementById('btnNextPage').addEventListener('click', () => {
    currentPage++;
    fetchDocuments();
});

document.getElementById('btnNewDoc').addEventListener('click', () => {
    createModal.style.display = 'flex';
});

document.getElementById('btnCancel').addEventListener('click', () => {
    createModal.style.display = 'none';
    createForm.reset();
    createErrorMsg.style.display = 'none';
});

document.getElementById('btnCancelAccess').addEventListener('click', () => {
    accessModal.style.display = 'none';
    accessForm.reset();
    accessErrorMsg.style.display = 'none';
    targetPrivateDocId = null;
});

document.getElementById('btnProfile').addEventListener('click', () => {
    window.location.href = 'profile.html';
});

accessForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('accessCodeInput').value;
    const submitBtn = document.getElementById('btnSubmitAccess');

    submitBtn.disabled = true;
    accessErrorMsg.style.display = 'none';

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

createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('btnSubmitCreate');
    submitBtn.disabled = true;
    createErrorMsg.style.display = 'none';

    const title = document.getElementById('docTitle').value.trim();
    const accessCode = document.getElementById('docAccessCode').value.trim();
    const fileInput = document.getElementById('docFileToClone');

    if (accessCode && !/^[a-zA-Z0-9]{4,20}$/.test(accessCode)) {
        createErrorMsg.textContent = "Access code must be 4-20 alphanumeric characters.";
        createErrorMsg.style.display = 'block';
        submitBtn.disabled = false;
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    if (accessCode) formData.append('accessCode', accessCode);
    if (fileInput.files.length > 0) formData.append('fileToClone', fileInput.files[0]);

    try {
        const res = await fetch('/api/documents', { method: 'POST', body: formData });

        if (res.status === 401 || res.status === 403) {
            window.location.href = 'login.html';
            return;
        }

        if (!res.ok) {
            createErrorMsg.textContent = await getErrorMsg(res);
            createErrorMsg.style.display = 'block';
            submitBtn.disabled = false;
            return;
        }

        createModal.style.display = 'none';
        createForm.reset();
        currentPage = 0;
        fetchDocuments();
    } catch (err) {
        createErrorMsg.textContent = err.message || "Network error. Please try again.";
        createErrorMsg.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
    }
});

async function fetchDocuments() {
    try {
        const currentSort = sortSelect.value;
        const res = await fetch(`/api/documents?pageNumber=${currentPage}&pageSize=${pageSize}&sortParam=${currentSort}`);

        if (res.status === 401 || res.status === 403) {
            window.location.href = 'login.html';
            return;
        }

        if (!res.ok) {
            alert(`Error fetching documents: ${await getErrorMsg(res)}`);
            return;
        }

        const docs = await res.json();
        docGrid.innerHTML = '';

        if (docs.length === 0 && currentPage > 0) {
            currentPage--;
            fetchDocuments();
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
            `;
            docGrid.appendChild(card);
        });

        document.getElementById('pageIndicator').textContent = `Page ${currentPage + 1}`;
        document.getElementById('btnPrevPage').disabled = currentPage === 0;
        document.getElementById('btnNextPage').disabled = docs.length < pageSize;
    } catch (err) {
        alert(err.message || "Network error. Please try again.");
    }
}

fetchDocuments();
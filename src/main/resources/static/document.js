const urlParams = new URLSearchParams(window.location.search);
const docId = urlParams.get('id');
const accessCode = urlParams.get('accessCode');

if (!docId) window.location.href = 'index.html';

const clientId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

const dmp = new diff_match_patch();
const editor = document.getElementById('editor');
const connStatus = document.getElementById('connStatus');
const titleHeader = document.getElementById('docTitleHeader');
const saveStatus = document.getElementById('saveStatus');

let stompClient = null;
let previousText = "";

document.getElementById('btnBack').addEventListener('click', () => {
    window.location.href = 'index.html';
});

async function initDocument() {
    try {
        // Build the correct URL depending on if an access code was provided
        let fetchUrl = `/api/documents/${docId}`;
        if (accessCode) {
            fetchUrl += `?accessCode=${encodeURIComponent(accessCode)}`;
        }

        const res = await fetch(fetchUrl);

        if (res.status === 401 || res.status === 403) {
            alert("Unauthorized. Incorrect access code or session expired.");
            window.location.href = 'index.html';
            return;
        }

        if (!res.ok) throw new Error("Failed to load document");

        const doc = await res.json();
        titleHeader.textContent = doc.title || "Untitled Document";
        editor.value = doc.content || "";
        previousText = editor.value;

        connectWebSocket();
    } catch (err) {
        alert("Error loading document.");
        window.location.href = 'index.html';
    }
}

function connectWebSocket() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, function (frame) {
        connStatus.innerHTML = '<span class="status-indicator status-live"></span>Live';
        editor.disabled = false;
        editor.placeholder = "Start typing...";

        stompClient.subscribe(`/topic/document/${docId}`, function (message) {
            const payload = JSON.parse(message.body);
            if (payload.senderId === clientId) {
                return;
            }

            applyIncomingPatch(payload.patchText);
        });
    }, function(error) {
        connStatus.innerHTML = '<span class="status-indicator status-offline"></span>Disconnected. Retrying...';
        editor.disabled = true;
        setTimeout(connectWebSocket, 5000);
    });
}

editor.addEventListener('input', function() {
    const currentText = editor.value;
    saveStatus.textContent = "Saving...";

    const diff = dmp.diff_main(previousText, currentText);
    dmp.diff_cleanupSemantic(diff);

    const patchList = dmp.patch_make(previousText, currentText, diff);
    const patchText = dmp.patch_toText(patchList);

    previousText = currentText;

    if (stompClient && stompClient.connected && patchText.length > 0) {
        stompClient.send("/api/document/update", {}, JSON.stringify({
            documentId: docId,
            patchText: patchText,
            senderId: clientId
        }));
        setTimeout(() => saveStatus.textContent = "All changes saved", 500);
    }
});

function applyIncomingPatch(patchTextString) {
    if (!patchTextString) return;

    const patches = dmp.patch_fromText(patchTextString);
    const cursorStart = editor.selectionStart;
    const cursorEnd = editor.selectionEnd;

    // Apply remote patch to our local text box seamlessly
    const results = dmp.patch_apply(patches, editor.value);
    const newMergedText = results[0];

    editor.value = newMergedText;
    previousText = newMergedText;
    editor.setSelectionRange(cursorStart, cursorEnd);
}

initDocument();
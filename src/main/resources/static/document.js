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

const urlParams = new URLSearchParams(window.location.search);
const docId = urlParams.get('id');
const accessCode = urlParams.get('accessCode');

if (!docId) window.location.href = 'index.html';

const clientId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

const dmp = new diff_match_patch();
const editor = document.getElementById('editor');
const connIndicator = document.getElementById('connIndicator');
const connText = document.getElementById('connText');
const titleHeader = document.getElementById('docTitleHeader');
const saveStatus = document.getElementById('saveStatus');

let stompClient = null;
let previousText = "";

document.getElementById('btnBack').addEventListener('click', () => {
    window.location.href = 'index.html';
});

async function initDocument() {
    try {
        let fetchUrl = `/api/documents/${docId}`;
        if (accessCode) {
            fetchUrl += `?accessCode=${encodeURIComponent(accessCode)}`;
        }

        const res = await fetch(fetchUrl);

        if (!res.ok) {
            const errMsg = await getErrorMsg(res);
            if (res.status === 401 || res.status === 403) {
                alert(`Access Denied: ${errMsg}`);
            } else {
                alert(`Error: ${errMsg}`);
            }
            window.location.href = 'index.html';
            return;
        }

        const doc = await res.json();
        titleHeader.textContent = doc.title || "Untitled Document";
        editor.value = doc.content || "";
        previousText = editor.value;

        connectWebSocket();
    } catch (err) {
        alert(`Network Error: ${err.message}`);
        window.location.href = 'index.html';
    }
}

function connectWebSocket() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, function (frame) {
        connIndicator.className = 'status-indicator status-live';
        connText.textContent = 'Live';
        editor.disabled = false;
        editor.placeholder = "Start typing...";

        stompClient.subscribe(`/topic/document/${docId}`, function (message) {
            const payload = JSON.parse(message.body);

            if (payload.type === "DOCUMENT_DELETED") {
                alert("The creator has deleted this document. You are being redirected.");
                if (stompClient) stompClient.disconnect();
                window.location.href = '/index.html';
                return;
            }

            if (payload.senderId === clientId) return;

            applyIncomingPatch(payload.patchText);
        });
    }, function(error) {
        connIndicator.className = 'status-indicator status-offline';
        connText.textContent = 'Disconnected. Retrying...';
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
    const oldText = editor.value;

    const results = dmp.patch_apply(patches, oldText);
    const newMergedText = results[0];

    const diffs = dmp.diff_main(oldText, newMergedText);

    let oldIndex = 0;
    let startShift = 0;
    let endShift = 0;

    for (let i = 0; i < diffs.length; i++) {
        const op = diffs[i][0];   // Operation type (0: EQUAL, 1: INSERT, -1: DELETE)
        const text = diffs[i][1];
        const len = text.length;

        if (op === 0) {
            // EQUAL: Text matches, just move our tracker forward
            oldIndex += len;
        } else if (op === -1) {
            // DELETE: If text was deleted before our cursor, shift the cursor backward
            if (oldIndex < cursorStart) {
                startShift -= Math.min(len, cursorStart - oldIndex);
            }
            if (oldIndex < cursorEnd) {
                endShift -= Math.min(len, cursorEnd - oldIndex);
            }
            oldIndex += len;
        } else if (op === 1) {
            // INSERT: If text was inserted before our cursor, shift the cursor forward
            if (oldIndex <= cursorStart) {
                startShift += len;
            }
            if (oldIndex <= cursorEnd) {
                endShift += len;
            }
        }
    }

    editor.value = newMergedText;
    previousText = newMergedText;

    editor.setSelectionRange(cursorStart + startShift, cursorEnd + endShift);
}

initDocument();
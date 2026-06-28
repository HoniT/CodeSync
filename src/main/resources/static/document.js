const urlParams = new URLSearchParams(window.location.search);
const docId = urlParams.get('id');
const accessCode = urlParams.get('accessCode');

if (!docId) window.location.href = 'index.html';

const clientId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
const dmp = new diff_match_patch();

const connIndicator = document.getElementById('connIndicator');
const connText = document.getElementById('connText');
const titleHeader = document.getElementById('docTitleHeader');
const saveStatus = document.getElementById('saveStatus');
const btnSettings = document.getElementById('btnSettings');
const settingsPanel = document.getElementById('settingsPanel');
const editorTypeSelect = document.getElementById('editorTypeSelect');
const languageGroup = document.getElementById('languageGroup');
const languageSelect = document.getElementById('languageSelect');
const toggleMarkdown = document.getElementById('toggleMarkdown');
const toggleHtml = document.getElementById('toggleHtml');
const plainTextarea = document.getElementById('plainTextarea');
const monacoContainer = document.getElementById('monacoContainer');
const previewPane = document.getElementById('previewPane');
const previewContent = document.getElementById('previewContent');
const htmlPreviewFrame = document.getElementById('htmlPreviewFrame');

let stompClient = null;
let previousText = "";
let monacoEditor = null;
let isRemoteUpdate = false;

let currentEditorType = localStorage.getItem('codesync_editor_type') || 'monaco';
let currentLanguage = localStorage.getItem('codesync_language') || 'java';
let markdownEnabled = localStorage.getItem('codesync_markdown') === 'true';
let htmlEnabled = localStorage.getItem('codesync_html') === 'true';

editorTypeSelect.value = currentEditorType;
languageSelect.value = currentLanguage;
toggleMarkdown.checked = markdownEnabled;
toggleHtml.checked = htmlEnabled;
updateSettingsVisibility();

btnSettings.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsPanel.classList.toggle('active');
});
document.addEventListener('click', () => settingsPanel.classList.remove('active'));
settingsPanel.addEventListener('click', (e) => e.stopPropagation());

document.getElementById('btnBack').addEventListener('click', () => {
    window.location.href = 'index.html';
});

editorTypeSelect.addEventListener('change', (e) => {
    const newType = e.target.value;
    switchEditorUILayout(newType);
    currentEditorType = newType;
    localStorage.setItem('codesync_editor_type', currentEditorType);
    updateSettingsVisibility();
});

languageSelect.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    localStorage.setItem('codesync_language', currentLanguage);
    if (monacoEditor) {
        monaco.editor.setModelLanguage(monacoEditor.getModel(), currentLanguage);
    }
});

toggleMarkdown.addEventListener('change', (e) => {
    markdownEnabled = e.target.checked;
    localStorage.setItem('codesync_markdown', markdownEnabled);
    if (markdownEnabled) {
        htmlEnabled = false;
        toggleHtml.checked = false;
        localStorage.setItem('codesync_html', false);
    }
    updatePreviewView();
});

toggleHtml.addEventListener('change', (e) => {
    htmlEnabled = e.target.checked;
    localStorage.setItem('codesync_html', htmlEnabled);
    if (htmlEnabled) {
        markdownEnabled = false;
        toggleMarkdown.checked = false;
        localStorage.setItem('codesync_markdown', false);
    }
    updatePreviewView();
});

function updateSettingsVisibility() {
    languageGroup.style.display = currentEditorType === 'monaco' ? 'block' : 'none';
}

async function initDocument() {
    try {
        let fetchUrl = `/api/documents/${docId}`;
        if (accessCode) {
            fetchUrl += `?accessCode=${encodeURIComponent(accessCode)}`;
        }
        const res = await fetch(fetchUrl);
        if (!res.ok) {
            window.location.href = 'index.html';
            return;
        }
        const doc = await res.json();
        titleHeader.textContent = doc.title || "Untitled Document";
        previousText = doc.content || "";

        plainTextarea.value = previousText;

        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.38.0/min/vs' }});
        require(['vs/editor/editor.main'], function () {

            monaco.editor.defineTheme('codesync-theme', {
                base: 'vs-dark',
                inherit: true,
                rules: [],
                colors: {
                    'editor.background': '#0f172a',
                    'editor.foreground': '#f8fafc',
                    'editorGutter.background': '#1e293b',
                    'editor.lineHighlightBackground': '#1e293b',
                    'editorLineNumber.foreground': '#475569',
                    'editor.selectionBackground': '#3b82f644'
                }
            });

            monacoEditor = monaco.editor.create(monacoContainer, {
                value: previousText,
                language: currentLanguage,
                theme: 'codesync-theme',
                automaticLayout: true,
                readOnly: true,
                minimap: { enabled: false }
            });

            monacoEditor.onDidChangeModelContent(() => {
                if (!isRemoteUpdate) handleLocalChange(monacoEditor.getValue());
            });

            switchEditorUILayout();
            updatePreviewView();
            connectWebSocket();
        });
    } catch (err) {
        window.location.href = 'index.html';
    }
}

function switchEditorUILayout(newType) {
    const currentText = (currentEditorType === 'monaco' && monacoEditor)
        ? monacoEditor.getValue()
        : plainTextarea.value;

    if (newType === 'monaco') {
        plainTextarea.style.display = 'none';
        monacoContainer.style.display = 'block';
        if (monacoEditor) {
            isRemoteUpdate = true;
            monacoEditor.setValue(currentText);
            isRemoteUpdate = false;
        }
    } else {
        monacoContainer.style.display = 'none';
        plainTextarea.style.display = 'block';
        plainTextarea.value = currentText;
    }
}

function updatePreviewView() {
    const txt = getActiveEditorValue();

    if (markdownEnabled || htmlEnabled) {
        previewPane.style.display = 'flex';

        if (markdownEnabled) {
            previewContent.style.display = 'block';
            htmlPreviewFrame.style.display = 'none';
            previewContent.innerHTML = marked.parse(txt || '');
        } else if (htmlEnabled) {
            previewContent.style.display = 'none';
            htmlPreviewFrame.style.display = 'block';
            htmlPreviewFrame.srcdoc = txt || '';
        }
    } else {
        previewPane.style.display = 'none';
    }
}

function getActiveEditorValue() {
    if (currentEditorType === 'monaco' && monacoEditor) {
        return monacoEditor.getValue();
    }
    return plainTextarea.value;
}

plainTextarea.addEventListener('input', () => {
    handleLocalChange(plainTextarea.value);
});

function connectWebSocket() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, function () {
        connIndicator.className = 'status-indicator status-live';
        connText.textContent = 'Live';

        plainTextarea.disabled = false;
        if (monacoEditor) monacoEditor.updateOptions({ readOnly: false });

        stompClient.subscribe(`/topic/document/${docId}`, function (message) {
            const payload = JSON.parse(message.body);
            if (payload.type === "DOCUMENT_DELETED") {
                if (stompClient) stompClient.disconnect();
                window.location.href = '/index.html';
                return;
            }
            if (payload.senderId === clientId) return;

            applyIncomingPatch(payload.patchText);
        });
    }, function() {
        connIndicator.className = 'status-indicator status-offline';
        connText.textContent = 'Disconnected';
        plainTextarea.disabled = true;
        if (monacoEditor) monacoEditor.updateOptions({ readOnly: true });
        setTimeout(connectWebSocket, 5000);
    });
}

function handleLocalChange(currentText) {
    saveStatus.textContent = "Saving...";
    updatePreviewView();

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
}

function applyIncomingPatch(patchTextString) {
    if (!patchTextString) return;

    const oldText = getActiveEditorValue();
    const patches = dmp.patch_fromText(patchTextString);
    const results = dmp.patch_apply(patches, oldText);
    const newMergedText = results[0];

    isRemoteUpdate = true;

    if (currentEditorType === 'monaco' && monacoEditor) {
        const model = monacoEditor.getModel();
        const diffs = dmp.diff_main(oldText, newMergedText);
        dmp.diff_cleanupSemantic(diffs);

        let operations = [];
        let oldIndex = 0;

        for (let i = 0; i < diffs.length; i++) {
            const op = diffs[i][0];
            const text = diffs[i][1];
            const len = text.length;

            if (op === 0) {
                oldIndex += len;
            } else if (op === -1) {
                const startPos = model.getPositionAt(oldIndex);
                const endPos = model.getPositionAt(oldIndex + len);
                operations.push({
                    range: new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
                    text: null,
                    forceMoveMarkers: true
                });
                oldIndex += len;
            } else if (op === 1) {
                const pos = model.getPositionAt(oldIndex);
                operations.push({
                    range: new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
                    text: text,
                    forceMoveMarkers: true
                });
            }
        }
        model.pushEditOperations([], operations, () => null);
    } else {
        const start = plainTextarea.selectionStart;
        const end = plainTextarea.selectionEnd;

        plainTextarea.value = newMergedText;

        plainTextarea.setSelectionRange(start, end);
    }

    isRemoteUpdate = false;
    previousText = newMergedText;
    updatePreviewView();
}

initDocument();
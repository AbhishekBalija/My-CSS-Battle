document.addEventListener('DOMContentLoaded', async () => {
  const tokenInput = document.getElementById('token-input');
  const saveBtn = document.getElementById('save-token');
  const testBtn = document.getElementById('test-btn');
  const msg = document.getElementById('msg');
  const statusEl = document.getElementById('github-status');
  const lastSubContainer = document.getElementById('last-sub-container');

  // Load saved token
  const { githubToken } = await chrome.storage.sync.get('githubToken');
  if (githubToken) {
    tokenInput.value = githubToken;
    checkConnection();
  } else {
    setStatus('red', 'No GitHub token configured');
  }

  // Load last submission
  const { lastSubmission } = await chrome.storage.local.get('lastSubmission');
  if (lastSubmission) renderLastSubmission(lastSubmission);

  // Save token
  saveBtn.addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    if (!token) return showMsg('Please enter a token', 'error');
    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
      return showMsg('Token should start with ghp_ (classic) or github_pat_ (fine-grained)', 'error');
    }
    try {
      await chrome.storage.sync.set({ githubToken: token });
      showMsg('Token saved!', 'success');
      checkConnection();
    } catch (err) {
      showMsg(`Could not save token: ${err.message}`, 'error');
    }
  });

  // Test connection
  testBtn.addEventListener('click', checkConnection);

  async function checkConnection() {
    setStatus('yellow', 'Testing connection...');
    try {
      const result = await chrome.runtime.sendMessage({ type: 'TEST_CONNECTION' });
      if (!result) {
        setStatus('red', 'No response from extension background. Try reloading the extension.');
        return;
      }
      if (result.success) {
        setStatus('green', `Connected to ${result.repo}`);
      } else {
        setStatus('red', `Failed: ${result.error}`);
      }
    } catch (err) {
      setStatus('red', `Error: ${err.message || 'Could not reach background script'}`);
    }
  }

  function setStatus(color, text) {
    statusEl.innerHTML = `<div class="status-dot ${color}"></div><span>${text}</span>`;
  }

  function showMsg(text, type) {
    msg.textContent = text;
    msg.className = `msg msg-${type}`;
    setTimeout(() => { msg.className = 'msg'; }, 3000);
  }

  function renderLastSubmission(sub) {
    const badgeClass = sub.action === 'create' ? 'badge-create' : sub.action === 'update' ? 'badge-update' : 'badge-ignore';
    const badgeText = sub.action === 'create' ? '✨ Created' : sub.action === 'update' ? '⬆️ Updated' : '⏭️ Skipped';
    const timeAgo = (sub.timestamp != null && !isNaN(sub.timestamp)) ? getTimeAgo(sub.timestamp) : 'Just now';
    const displayScore = sub.score != null ? sub.score : '--';
    const displayChars = sub.charCount != null ? sub.charCount : '--';

    lastSubContainer.innerHTML = `
      <div class="last-sub">
        <div class="name">${sub.targetName || sub.levelId}</div>
        <div class="meta">${timeAgo}</div>
        <div class="stats">
          <div class="stat"><div class="stat-value">${displayScore}</div><div class="stat-label">Score</div></div>
          <div class="stat"><div class="stat-value">${displayChars}</div><div class="stat-label">Chars</div></div>
        </div>
        <span class="badge ${badgeClass}">${badgeText}</span>
      </div>`;
  }

  function getTimeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  // Listen for live updates
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'PUBLISH_RESULT') renderLastSubmission(message.data);
    if (message.type === 'PUBLISH_ERROR') showMsg(message.error, 'error');
  });
});

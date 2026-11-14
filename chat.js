/**
 * Côte Rôtie - AI Concierge Chatbot Widget (Powered by Google Gemini 3)
 * Model: gemini-3-flash-preview
 * Proxy: Cloudflare Worker / Secure Reverse Proxy
 * Supports: English, Roman Urdu & Urdu
 */

(function () {
  'use strict';

  // Default Cloudflare Worker Proxy Endpoint
  // Replace this default with your deployed worker URL, or configure it via the chat settings (gear icon)
  const DEFAULT_WORKER_URL = 'https://coterotie-gemini-proxy.workers.dev';

  // Chatbot State
  const state = {
    isOpen: false,
    isLoading: false,
    messages: [],
    workerUrl: localStorage.getItem('coterotie_worker_url') || DEFAULT_WORKER_URL,
    hasUnread: true,
  };

  // Welcome message
  const WELCOME_MESSAGE = {
    role: 'model',
    text: `Bonjour & welcome to **Côte Rôtie**! 🍷\n\nI am **Élodie**, your bistro AI concierge. I can assist you in **English**, **Roman Urdu**, or **اردو** with:\n\n- 🍽️ Our verified culinary menu & prices in **PKR**\n- 🕒 Operating hours (*Tue–Sun 12:30 PM–11:30 PM, Closed Mondays*)\n- 📍 Location at the **Alliance Française de Karachi**\n- 🪑 Table reservations & seating in our **Indoor Bicycle Salon** or **Courtyard Garden**\n\nHow may I help you today? / *Aap ko hamaray menu ya timing ke baaray mein kya poochna hai?*`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  // DOM Elements
  let dom = {};

  function initChat() {
    cacheDOMElements();
    if (!dom.widget) return;

    loadSavedMessages();
    bindEvents();
    checkLocalProxy();
  }

  function cacheDOMElements() {
    dom = {
      widget: document.getElementById('aiConciergeWidget'),
      toggleBtn: document.getElementById('aiChatToggleBtn'),
      modal: document.getElementById('aiChatModal'),
      closeBtn: document.getElementById('aiCloseChatBtn'),
      resetBtn: document.getElementById('aiResetChatBtn'),
      configBtn: document.getElementById('aiConfigBtn'),
      settingsPanel: document.getElementById('aiSettingsPanel'),
      workerUrlInput: document.getElementById('aiWorkerUrlInput'),
      saveWorkerUrlBtn: document.getElementById('aiSaveWorkerUrlBtn'),
      settingsStatus: document.getElementById('aiSettingsStatus'),
      chatBody: document.getElementById('aiChatBody'),
      typingIndicator: document.getElementById('aiTypingIndicator'),
      form: document.getElementById('aiChatForm'),
      input: document.getElementById('aiMessageInput'),
      sendBtn: document.getElementById('aiSendBtn'),
      badge: document.querySelector('.ai-badge-indicator'),
      chips: document.querySelectorAll('.ai-chip'),
    };
  }

  function loadSavedMessages() {
    try {
      const saved = sessionStorage.getItem('coterotie_chat_history');
      if (saved) {
        state.messages = JSON.parse(saved);
      } else {
        state.messages = [WELCOME_MESSAGE];
      }
    } catch (e) {
      state.messages = [WELCOME_MESSAGE];
    }
    renderMessages();
  }

  function saveMessages() {
    try {
      sessionStorage.setItem('coterotie_chat_history', JSON.stringify(state.messages.slice(-20)));
    } catch (e) {}
  }

  function bindEvents() {
    // Toggle modal
    if (dom.toggleBtn) {
      dom.toggleBtn.addEventListener('click', toggleChat);
    }

    // Close button
    if (dom.closeBtn) {
      dom.closeBtn.addEventListener('click', closeChat);
    }

    // Reset button
    if (dom.resetBtn) {
      dom.resetBtn.addEventListener('click', resetChat);
    }

    // Settings toggle
    if (dom.configBtn) {
      dom.configBtn.addEventListener('click', toggleSettings);
    }

    // Save worker URL
    if (dom.saveWorkerUrlBtn) {
      dom.saveWorkerUrlBtn.addEventListener('click', saveWorkerUrl);
    }

    // Quick suggestion chips
    if (dom.chips) {
      dom.chips.forEach(chip => {
        chip.addEventListener('click', () => {
          const prompt = chip.getAttribute('data-prompt');
          if (prompt && !state.isLoading) {
            sendMessage(prompt);
          }
        });
      });
    }

    // Form submit
    if (dom.form) {
      dom.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = dom.input.value.trim();
        if (text && !state.isLoading) {
          sendMessage(text);
          dom.input.value = '';
          adjustInputHeight();
          dom.sendBtn.disabled = true;
        }
      });
    }

    // Auto-resize textarea & enable send button
    if (dom.input) {
      dom.input.addEventListener('input', () => {
        adjustInputHeight();
        dom.sendBtn.disabled = !dom.input.value.trim();
      });

      // Enter to send (Shift+Enter for new line)
      dom.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (dom.input.value.trim() && !state.isLoading) {
            dom.form.dispatchEvent(new Event('submit'));
          }
        }
      });
    }

    // Escape key to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isOpen) {
        closeChat();
      }
    });
  }

  // Check if local dev proxy is running on 127.0.0.1:8787
  async function checkLocalProxy() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const res = await fetch('http://127.0.0.1:8787', { method: 'GET', mode: 'cors' });
        if (res.ok) {
          console.log('[Côte Rôtie AI] Local development proxy detected on http://127.0.0.1:8787');
          // If no custom worker URL set, default to local proxy for testing
          if (!localStorage.getItem('coterotie_worker_url')) {
            state.workerUrl = 'http://127.0.0.1:8787';
          }
        }
      } catch (e) {
        // Local proxy not running, will use configured Cloudflare Worker URL
      }
    }
  }

  function adjustInputHeight() {
    if (!dom.input) return;
    dom.input.style.height = 'auto';
    const newHeight = Math.min(dom.input.scrollHeight, 120);
    dom.input.style.height = newHeight + 'px';
  }

  function toggleChat() {
    if (state.isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  function openChat() {
    state.isOpen = true;
    state.hasUnread = false;
    dom.modal.classList.add('open');
    dom.modal.setAttribute('aria-hidden', 'false');
    dom.toggleBtn.setAttribute('aria-expanded', 'true');
    dom.toggleBtn.classList.add('active');

    if (dom.badge) {
      dom.badge.style.display = 'none';
    }

    scrollToBottom();
    setTimeout(() => {
      if (dom.input && window.innerWidth > 768) {
        dom.input.focus();
      }
    }, 200);
  }

  function closeChat() {
    state.isOpen = false;
    dom.modal.classList.remove('open');
    dom.modal.setAttribute('aria-hidden', 'true');
    dom.toggleBtn.setAttribute('aria-expanded', 'false');
    dom.toggleBtn.classList.remove('active');
  }

  function resetChat() {
    if (confirm('Start a fresh conversation with Élodie?')) {
      state.messages = [WELCOME_MESSAGE];
      saveMessages();
      renderMessages();
      if (dom.settingsPanel) dom.settingsPanel.hidden = true;
    }
  }

  function toggleSettings() {
    if (!dom.settingsPanel) return;
    const isHidden = dom.settingsPanel.hidden;
    dom.settingsPanel.hidden = !isHidden;

    if (!isHidden) return;

    if (dom.workerUrlInput) {
      dom.workerUrlInput.value = state.workerUrl;
    }
    if (dom.settingsStatus) {
      dom.settingsStatus.innerHTML = '';
    }
  }

  async function saveWorkerUrl() {
    if (!dom.workerUrlInput) return;
    let url = dom.workerUrlInput.value.trim();

    if (!url) {
      url = DEFAULT_WORKER_URL;
      dom.workerUrlInput.value = url;
    }

    // Strip trailing slash
    url = url.replace(/\/+$/, '');

    dom.settingsStatus.innerHTML = '<span class="status-testing"><i class="fa-solid fa-spinner fa-spin"></i> Testing endpoint...</span>';

    try {
      const res = await fetch(url, { method: 'GET', mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        state.workerUrl = url;
        localStorage.setItem('coterotie_worker_url', url);
        dom.settingsStatus.innerHTML = `<span class="status-ok"><i class="fa-solid fa-circle-check"></i> Connected successfully! Model: ${data.model || 'Gemini 3'}</span>`;
        setTimeout(() => {
          if (dom.settingsPanel) dom.settingsPanel.hidden = true;
        }, 1500);
      } else {
        throw new Error(`Endpoint returned status ${res.status}`);
      }
    } catch (err) {
      // Save anyway in case it's a POST-only proxy
      state.workerUrl = url;
      localStorage.setItem('coterotie_worker_url', url);
      dom.settingsStatus.innerHTML = `<span class="status-warn"><i class="fa-solid fa-triangle-exclamation"></i> Saved URL. (Could not reach GET health-check, will test on next chat message).</span>`;
    }
  }

  async function sendMessage(userText) {
    if (state.isLoading) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const userMsg = {
      role: 'user',
      text: userText,
      timestamp: time,
    };
    state.messages.push(userMsg);
    renderMessages();
    scrollToBottom();

    // Prepare API history
    const historyPayload = state.messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      text: m.text,
    }));

    // Show typing indicator
    state.isLoading = true;
    showTyping(true);

    try {
      const reply = await callGeminiProxy(userText, historyPayload);
      state.messages.push({
        role: 'model',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (error) {
      console.error('[Côte Rôtie AI Error]', error);
      state.messages.push({
        role: 'model',
        text: getHelpfulErrorMessage(error),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      });
    } finally {
      state.isLoading = false;
      showTyping(false);
      saveMessages();
      renderMessages();
      scrollToBottom();
    }
  }

  async function callGeminiProxy(message, history) {
    let endpoint = state.workerUrl;

    // Normalizing endpoint
    if (!endpoint.endsWith('/api/chat') && !endpoint.includes('127.0.0.1')) {
      // If user provided base worker URL, ensure correct endpoint
      endpoint = `${endpoint.replace(/\/+$/, '')}/api/chat`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          history: history,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      if (!data.reply) {
        throw new Error('No reply content returned from proxy');
      }

      return data.reply;
    } catch (err) {
      clearTimeout(timeoutId);

      // If default worker is unreachable, and running on localhost, attempt fallback to local proxy
      if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !endpoint.includes('8787')) {
        try {
          console.warn('[Côte Rôtie AI] Trying local fallback on http://127.0.0.1:8787/api/chat...');
          const localRes = await fetch('http://127.0.0.1:8787/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history }),
          });
          if (localRes.ok) {
            const localData = await localRes.json();
            return localData.reply;
          }
        } catch (e) {}
      }

      throw err;
    }
  }

  function getHelpfulErrorMessage(err) {
    const isNetworkError = err.name === 'AbortError' || err.message.includes('Failed to fetch') || err.message.includes('NetworkError');

    if (isNetworkError) {
      return `Bonjour! I am currently unable to reach our secure AI proxy endpoint.\n\n**To resolve this:**\n1. Ensure your free Cloudflare Worker is deployed as described in \`cloudflare-worker/README.md\`.\n2. Tap the **⚙️ (Settings)** icon above to paste your live Worker URL.\n3. Or if testing locally, launch \`python private/local_proxy.py\`.\n\nIn the meantime, please feel free to reach Côte Rôtie directly:\n- **Phone / WhatsApp:** [+92 316 2882880](tel:+923162882880)\n- **Email:** [coterotiekhi@gmail.com](mailto:coterotiekhi@gmail.com)\n- **Location:** Alliance Française de Karachi, Clifton`;
    }

    return `Bonjour! I encountered an unexpected error: *${err.message}*.\n\nPlease call us directly at [+92 316 2882880](tel:+923162882880) for immediate table reservations or menu inquiries.`;
  }

  function showTyping(show) {
    if (!dom.typingIndicator) return;
    dom.typingIndicator.hidden = !show;
    if (show) scrollToBottom();
  }

  function scrollToBottom() {
    if (!dom.chatBody) return;
    requestAnimationFrame(() => {
      dom.chatBody.scrollTop = dom.chatBody.scrollHeight;
    });
  }

  // Simple, safe Markdown & Link Formatter
  function formatMarkdown(text) {
    if (!text) return '';

    let html = escapeHTML(text);

    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic: *text* or _text_
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Bullet lists: - item or * item
    html = html.replace(/(?:^|\n)[-*]\s+(.+)/g, '<li class="ai-list-item">$1</li>');
    html = html.replace(/(<li class="ai-list-item">.*<\/li>)/gs, '<ul class="ai-list">$1</ul>');

    // PKR Price highlight: PKR 1,850 or Rs. 1850
    html = html.replace(/(PKR\s*[\d,]+)/gi, '<span class="ai-price-tag">$1</span>');

    // Phone numbers: +92 316 2882880 or 021-35873408
    html = html.replace(/(\+92\s*3\d{2}\s*\d{7}|\+92\s*3\d{2}\s*\d{3}\s*\d{4})/g, '<a href="tel:$1" class="ai-link"><i class="fa-solid fa-phone"></i> $1</a>');

    // Email
    html = html.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" class="ai-link"><i class="fa-solid fa-envelope"></i> $1</a>');

    // Reservation trigger mentions
    html = html.replace(/\b(book a table|reserve a table|table reservation)\b/gi, '<a href="#reservations" class="ai-res-link" onclick="window.closeAiChatAndScroll()"><i class="fa-solid fa-calendar-check"></i> $1</a>');

    // Paragraph line breaks
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderMessages() {
    if (!dom.chatBody) return;

    dom.chatBody.innerHTML = state.messages.map((msg, index) => {
      const isUser = msg.role === 'user';
      return `
        <div class="ai-message-row ${isUser ? 'user-row' : 'bot-row'} ${msg.isError ? 'error-row' : ''}" data-index="${index}">
          ${!isUser ? `
            <div class="ai-bubble-avatar">
              <i class="fa-solid fa-utensils"></i>
            </div>
          ` : ''}
          <div class="ai-message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}">
            <div class="ai-bubble-content">
              ${isUser ? escapeHTML(msg.text).replace(/\n/g, '<br>') : formatMarkdown(msg.text)}
            </div>
            <span class="ai-bubble-time">${msg.timestamp || ''}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Global helper for links that jump to reservations
  window.closeAiChatAndScroll = function () {
    closeChat();
    const resSection = document.getElementById('reservations');
    if (resSection) {
      resSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
  } else {
    initChat();
  }

})();

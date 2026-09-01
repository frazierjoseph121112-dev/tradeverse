/* TradeVerse — shared components injected into pages */

function navHTML(){
  const sess = TV.session();
  return `<nav class="nav">
    <div class="container nav-inner">
      <a href="index.html" class="brand"><span class="brand-mark">T</span>TradeVerse</a>
      <div class="nav-links">
        <a href="index.html#products" data-i18n="nav_products">Products</a>
        <a href="index.html#markets" data-i18n="nav_markets">Markets</a>
        <a href="index.html#accounts" data-i18n="nav_accounts">Accounts</a>
        <a href="index.html#copy" data-i18n="nav_copy">Copy Trading</a>
        <a href="index.html#learn" data-i18n="nav_learn">Learn</a>
      </div>
      <div class="nav-right">
        ${buildLangSelector()}
        <button class="selector theme-toggle" onclick="toggleTheme()" title="Toggle theme">🌙</button>
        ${sess ? `<a href="dashboard.html" class="btn btn-primary btn-sm" data-i18n="nav_dashboard">Dashboard</a>` :
          `<a href="login.html" class="btn btn-ghost btn-sm" data-i18n="nav_login">Log in</a>
           <a href="signup.html" class="btn btn-primary btn-sm" data-i18n="nav_signup">Sign up</a>`}
      </div>
    </div>
  </nav>`;
}

function footerHTML(){
  return `<footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="brand mb"><span class="brand-mark">T</span>TradeVerse</div>
          <p class="text-2" style="font-size:.9rem;max-width:300px">A broad, multi-asset trading platform for forex, stocks, crypto, metals, indices and commodities — built for traders worldwide.</p>
          <div class="flex gap mt" style="gap:10px">
            <span class="chip">🛡️ Regulated-style</span>
            <span class="chip">🌍 28+ countries</span>
          </div>
        </div>
        <div>
          <h4 data-i18n="foot_products">Products</h4>
          <a href="index.html#products" data-i18n="p_forex">Forex</a>
          <a href="index.html#products" data-i18n="p_stocks">Shares</a>
          <a href="index.html#products" data-i18n="p_crypto">Cryptocurrencies</a>
          <a href="index.html#products" data-i18n="p_metals">Metals</a>
          <a href="index.html#products" data-i18n="p_indices">Indices</a>
        </div>
        <div>
          <h4 data-i18n="foot_company">Company</h4>
          <a href="#" data-i18n="foot_about">About</a>
          <a href="#" data-i18n="foot_contact">Contact</a>
          <a href="#" data-i18n="foot_careers">Careers</a>
          <a href="admin.html">Admin</a>
        </div>
        <div>
          <h4 data-i18n="foot_legal">Legal</h4>
          <a href="#" data-i18n="foot_terms">Terms</a>
          <a href="#" data-i18n="foot_privacy">Privacy</a>
          <a href="#" data-i18n="foot_risk">Risk Disclosure</a>
        </div>
      </div>
      <div class="disclaimer">
        <strong data-i18n="risk">Capital at risk. Investments can go down as well as up and you may get back less than you invested.</strong><br><br>
        <span data-i18n="foot_disclaimer">TradeVerse is a demonstration platform. Trading financial instruments carries risk. You may lose some or all of your invested capital. This is not investment advice.</span><br><br>
        © ${new Date().getFullYear()} TradeVerse. All rights reserved.
      </div>
    </div>
  </footer>`;
}

function tickerHTML(){
  return `<div class="ticker-bar"><div class="ticker-track"></div></div>`;
}

function chatWidgetHTML(){
  return `<div class="chat-fab" onclick="toggleChat()">💬</div>
  <div class="chat-panel" id="chatPanel" style="display:none">
    <div class="chat-head"><span>🤖</span><strong data-i18n="chat_title">TradeVerse Assistant</strong><button onclick="toggleChat()" style="margin-left:auto;color:#fff;font-size:1.2rem">✕</button></div>
    <div class="chat-body" id="chatBody"></div>
    <div class="chat-input">
      <input class="input" id="chatInput" data-i18n-ph="chat_ph" placeholder="Type your message…" onkeydown="if(event.key==='Enter')sendChat()">
      <button class="btn btn-primary btn-sm" onclick="sendChat()" data-i18n="send">Send</button>
    </div>
  </div>`;
}

function toggleChat(){
  const p = document.getElementById('chatPanel');
  if(!p) return;
  const open = p.style.display!=='none';
  p.style.display = open?'none':'flex';
  if(!open && !document.getElementById('chatBody').childElementCount){
    addChat('bot', t('chat_greet'));
  }
}
function addChat(who, text){
  const body = document.getElementById('chatBody');
  if(!body) return;
  const el = document.createElement('div');
  el.className = 'chat-msg '+(who==='me'?'me':'bot');
  el.textContent = text;
  body.appendChild(el);
  body.scrollTop = body.scrollHeight;
}
function sendChat(){
  const inp = document.getElementById('chatInput');
  const text = inp.value.trim();
  if(!text) return;
  addChat('me', text);
  inp.value='';
  const sess = TV.session();
  if(sess) TV.sendSupport(sess.id, text, 'user');
  setTimeout(()=>{
    const ans = AIChat.reply(text);
    addChat('bot', ans);
    if(sess){
      TV.sendSupport(sess.id, ans, 'bot');
      if(AIChat.needsHuman(text)){
        TV.logAI(`Human escalation requested by user ${sess.id}: "${text}"`);
        notifyEmail(sess.id, 'Support escalation', `User ${sess.email} requested human help: ${text}`);
        setTimeout(()=>addChat('bot','✅ I\'ve alerted our support team. You\'ll get a reply in your support inbox and by email.'),1200);
      }
    }
  }, 700);
}

/* page bootstrapper */
function bootPage(){
  initTheme();
  updateThemeToggle();
  Market.init();
  applyI18n();
}

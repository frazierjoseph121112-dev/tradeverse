/* TradeVerse — Live market data (real crypto via CoinGecko; forex/stocks realistic simulated feed) */
const Market = {
  crypto: [],     // {symbol,name,price,change,icon}
  forex: [],
  stocks: [],
  metals: [],
  indices: [],
  lastFetch: 0,

  // static seed for forex/stocks/metals/indices (so UI always renders instantly)
  seedStatic(){
    this.forex = [
      {sym:'EUR/USD', price:1.0862, change:0.34},
      {sym:'GBP/USD', price:1.2715, change:0.14},
      {sym:'USD/JPY', price:156.83, change:-0.26},
      {sym:'AUD/USD', price:0.6581, change:0.07},
      {sym:'USD/CAD', price:1.3712, change:-0.41},
      {sym:'USD/CHF', price:0.9018, change:-0.20},
      {sym:'GBP/JPY', price:199.41, change:-0.14},
      {sym:'USD/CNY', price:7.2410, change:0.05}
    ];
    this.stocks = [
      {sym:'AAPL', name:'Apple', price:228.52, change:1.24},
      {sym:'NVDA', name:'NVIDIA', price:138.85, change:2.63},
      {sym:'TSLA', name:'Tesla', price:248.50, change:-1.10},
      {sym:'AMZN', name:'Amazon', price:186.32, change:0.42},
      {sym:'GOOGL', name:'Alphabet', price:164.10, change:-0.80},
      {sym:'MSFT', name:'Microsoft', price:415.20, change:0.55},
      {sym:'META', name:'Meta', price:512.30, change:-1.68},
      {sym:'AMC', name:'AMC', price:4.21, change:3.10}
    ];
    this.metals = [
      {sym:'XAU/USD', name:'Gold', price:2412.50, change:0.45},
      {sym:'XAG/USD', name:'Silver', price:27.18, change:0.82},
      {sym:'XPT/USD', name:'Platinum', price:942.30, change:-0.30}
    ];
    this.indices = [
      {sym:'US100', name:'NASDAQ 100', price:18360.2, change:0.10},
      {sym:'US500', name:'S&P 500', price:5576.5, change:0.00},
      {sym:'US30', name:'Dow Jones', price:41210.0, change:0.18},
      {sym:'DE40', name:'DAX', price:18720.0, change:-0.12}
    ];
  },

  async fetchCrypto(){
    try{
      const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,ripple,solana,binancecoin,cardano,dogecoin,polkadot&order=market_cap_desc');
      if(!res.ok) throw new Error('bad');
      const data = await res.json();
      this.crypto = data.map(c=>({
        sym: c.symbol.toUpperCase(),
        name: c.name,
        price: c.current_price,
        change: c.price_change_percentage_24h || 0,
        icon: c.image
      }));
      this.lastFetch = Date.now();
    }catch(e){
      // fallback realistic seed if API blocked
      if(!this.crypto.length){
        this.crypto = [
          {sym:'BTC', name:'Bitcoin', price:64250, change:1.85, icon:''},
          {sym:'ETH', name:'Ethereum', price:3380, change:2.14, icon:''},
          {sym:'XRP', name:'XRP', price:0.582, change:-0.62, icon:''},
          {sym:'SOL', name:'Solana', price:152.4, change:4.21, icon:''},
          {sym:'BNB', name:'BNB', price:588.2, change:0.92, icon:''},
          {sym:'ADA', name:'Cardano', price:0.412, change:-1.10, icon:''},
          {sym:'DOGE', name:'Dogecoin', price:0.123, change:3.40, icon:''},
          {sym:'DOT', name:'Polkadot', price:6.85, change:-0.45, icon:''}
        ];
      }
    }
  },

  // gentle live simulation for non-crypto so tickers feel alive
  jitter(){
    const bump = arr => arr.forEach(x=>{ const d=(Math.random()-0.5)*0.004; x.price=+(x.price*(1+d)).toFixed(x.price<10?4:2); x.change=+(x.change+(Math.random()-0.5)*0.15).toFixed(2); });
    bump(this.forex); bump(this.stocks); bump(this.metals); bump(this.indices);
  },

  async init(){
    this.seedStatic();
    await this.fetchCrypto();
    setInterval(()=>{ this.jitter(); this.refreshTickers(); }, 4000);
    // refresh real crypto every 60s
    setInterval(()=>this.fetchCrypto(), 60000);
  },

  fmt(p){ if(p>=1000) return p.toLocaleString('en-US',{maximumFractionDigits:2}); if(p>=1) return p.toFixed(2); return p.toFixed(4); },
  fmtChg(c){ const s=c>=0?'+':''; return s+c.toFixed(2)+'%'; },

  tickerHTML(){
    const item = (x,name)=>`<span class="ticker-item"><span class="sym">${x.sym}</span> <span>${this.fmt(x.price)}</span> <span class="${x.change>=0?'badge-up':'badge-down'}">${this.fmtChg(x.change)}</span></span>`;
    const all = [...this.crypto.map(c=>({...c,sym:c.sym})), ...this.forex, ...this.stocks.slice(0,5), ...this.metals, ...this.indices];
    const html = all.map(item).join('');
    return html+html; // duplicate for seamless loop
  },

  refreshTickers(){
    document.querySelectorAll('.ticker-track').forEach(t=>{ t.innerHTML = this.tickerHTML(); });
    // refresh watchlists that subscribe
    document.querySelectorAll('[data-watch]').forEach(el=>{
      const cat = el.getAttribute('data-watch');
      const list = this[cat]||[];
      el.innerHTML = list.slice(0,8).map(x=>`
        <div class="watch-item">
          <span class="sym"><span class="coin">${x.sym.slice(0,2)}</span>${x.sym}</span>
          <span>${this.fmt(x.price)}</span>
          <span class="${x.change>=0?'badge-up':'badge-down'}">${this.fmtChg(x.change)}</span>
        </div>`).join('');
    });
  }
};

/* ---------- AI Support Chat ---------- */
const AIChat = {
  KB: [
    {k:['deposit','fund','crypto','wallet','how to deposit'], a:'You can deposit using crypto (BTC, ETH, USDT-TRC20, USDT-ERC20, LTC). Go to Dashboard → Deposit, pick a coin, and send to the address shown. Your balance updates after blockchain confirmation (usually 10–30 minutes). Need help picking a network? I can guide you.'},
    {k:['withdraw','withdrawal','cash out','payout'], a:'To withdraw, go to Dashboard → Withdraw, enter the amount and your destination wallet address. Withdrawals are reviewed and processed by our team, usually within a few hours. Make sure your address is correct — crypto transfers are irreversible.'},
    {k:['bonus','130','sign up','credit','welcome'], a:'Every new account receives a $130 promotional credit as a welcome bonus. You can use it to explore trading. T&Cs apply — the bonus is a trading credit and certain conditions apply before withdrawal. Want me to explain the terms?'},
    {k:['verify','kyc','identity','document'], a:'Account verification (KYC) helps protect your account and is required for withdrawals above certain limits. You can complete it in Settings → Verification. Upload a government ID and a proof of address. It usually takes 24–48 hours.'},
    {k:['password','login','reset','change password','forgot'], a:'You can change your password anytime in Settings → Security. If you forgot it, an agent can help you reset it securely. Would you like me to connect you with an agent?'},
    {k:['interest','earn','apy','yield','daily'], a:'You can earn daily interest on idle cash balances. Rates vary by currency. Go to the Earn section on your dashboard to enable it. Interest is paid daily and you can withdraw anytime.'},
    {k:['copy','copy trade','follow','social'], a:'Copy trading lets you automatically mirror the trades of top-performing traders. Browse traders in the Copy Trading section, review their stats, and click Follow. You stay in control and can stop anytime.'},
    {k:['fees','commission','spread','cost'], a:'Fees depend on your account type. Standard accounts have $0 commission with spreads from 1.5 pips. Pro and ECN accounts offer tighter spreads with small commissions. See Account Types for full details.'},
    {k:['support','agent','human','help','speak'], a:"I'm notifying our support team right now. An agent will respond in your support inbox shortly. You can also reach support from your dashboard. Is there anything else I can help with meanwhile?"},
    {k:['hello','hi','hey','salam','hola','bonjour','cześć','你好','مرحبا'], a:"Hello! 👋 I'm your TradeVerse assistant. I can help with deposits, withdrawals, verification, fees, copy trading and more. What can I do for you?"},
    {k:['risk','safe','scam','trust','legit','regulated'], a:'TradeVerse includes clear risk disclosures: trading carries risk and you may get back less than you invested. We never guarantee returns. Always invest only what you can afford to lose. You can read our full Risk Disclosure in the footer.'}
  ],
  reply(text){
    const q = text.toLowerCase();
    let best=null, bestScore=0;
    for(const e of this.KB){
      const score = e.k.reduce((s,k)=> s + (q.includes(k)?k.length:0), 0);
      if(score>bestScore){ bestScore=score; best=e; }
    }
    if(best && bestScore>0) return best.a;
    return "I'm not sure I caught that. I can help with deposits, withdrawals, verification, fees, copy trading, interest, or connecting you to a human agent. Could you rephrase?";
  },
  needsHuman(text){
    const q=text.toLowerCase();
    return ['agent','human','speak','manager','complaint','urgent','can\'t login','cannot login','reset my password','problem'].some(p=>q.includes(p));
  }
};

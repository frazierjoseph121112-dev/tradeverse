/* TradeVerse — Auth, persistence & data store (localStorage based, backend-ready) */
const TV = {
  KEY: 'tv_data_v1',
  SESSION: 'tv_session',
  ADMIN: 'tv_admin',

  /* ---------- storage ---------- */
  load(){ try{ return JSON.parse(localStorage.getItem(TV.KEY)) || this.seed(); }catch(e){ return this.seed(); } },
  save(d){ localStorage.setItem(TV.KEY, JSON.stringify(d)); },
  seed(){
    const d = {
      users: [],
      wallets: this.defaultWallets(),
      broadcasts: [],
      support: {},      // { userId: [ {from:'user'|'admin'|'bot', text, ts} ] }
      activity: [],
      deposits: [],     // {id, userId, method, amount, status, ts, addr}
      withdrawals: [],  // {id, userId, amount, status, ts, addr}
      aiLogs: []
    };
    this.save(d);
    return d;
  },

  defaultWallets(){
    return [
      { id:'btc', name:'Bitcoin (BTC)', network:'Bitcoin', address:'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', icon:'₿' },
      { id:'eth', name:'Ethereum (ETH)', network:'ERC-20', address:'0x71C7656EC7ab88b098defB751B7401B5f6d8976F', icon:'Ξ' },
      { id:'usdt_trc', name:'Tether (USDT)', network:'TRC-20', address:'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE', icon:'₮' },
      { id:'usdt_erc', name:'Tether (USDT)', network:'ERC-20', address:'0x71C7656EC7ab88b098defB751B7401B5f6d8976F', icon:'₮' },
      { id:'ltc', name:'Litecoin (LTC)', network:'Litecoin', address:'ltc1qg9stkxrszkdqsuj92lm4c7akvk36zvhqw7pypk', icon:'Ł' }
    ];
  },

  /* ---------- session ---------- */
  session(){ try{ return JSON.parse(localStorage.getItem(TV.SESSION)); }catch(e){ return null; } },
  setSession(u){ localStorage.setItem(TV.SESSION, JSON.stringify(u)); },
  clearSession(){ localStorage.removeItem(TV.SESSION); },
  adminSession(){ return localStorage.getItem(TV.ADMIN)==='1'; },
  setAdmin(v){ if(v) localStorage.setItem(TV.ADMIN,'1'); else localStorage.removeItem(TV.ADMIN); },

  /* ---------- users ---------- */
  findUser(email){ const d=this.load(); return d.users.find(u=>u.email.toLowerCase()===email.toLowerCase()); },
  getUser(id){ const d=this.load(); return d.users.find(u=>u.id===id); },

  signup({name,email,password,country,referral}){
    email = (email||'').trim().toLowerCase();
    if(this.findUser(email)) return {ok:false, error:'Account already exists. Please log in.'};
    const d = this.load();
    // Resolve referrer if a referral code was provided
    let referrer = null;
    if(referral){
      referral = referral.trim();
      // Match by referral code OR by email
      referrer = d.users.find(u=>u.referralCode===referral || u.email.toLowerCase()===referral.toLowerCase());
    }
    // Generate a unique referral code for the new user
    const refCode = 'TV' + (Date.now().toString(36).toUpperCase()).slice(-6) + Math.floor(Math.random()*900+100);
    const user = {
      id: 'u_'+Date.now()+Math.floor(Math.random()*1000),
      name: name.trim(),
      email,
      password,                 // NOTE: demo only; real deployment must hash server-side
      country: country || 'United States',
      lang: getLang(),
      referral: referral||'',
      referralCode: refCode,    // this user's own code to share
      referredBy: referrer ? referrer.id : null,  // who referred this user
      joined: Date.now(),
      verified: false,
      // account
      balance: 0,
      bonus: 130,                // promotional sign-up credit
      holdings: [],              // {symbol, qty, avgPrice}
      pies: [ {name:'Starter Pie', value:130, items:['BTC','ETH','AAPL']} ],
      transactions: [
        { id:'t_'+Date.now(), type:'bonus', amount:130, status:'completed', desc:'Sign-up promotional credit', ts:Date.now() }
      ],
      notifications: [
        { id:'n1', text:'Welcome to TradeVerse! You received a $130 promotional credit.', ts:Date.now(), read:false }
      ],
      // referral program
      referrals: [],             // [{userId, name, email, status:'pending'|'completed', bonus, ts}]
      referralEarnings: 0,       // total $ earned from referrals
      settings:{ kyc:false }
    };
    d.users.push(user);
    // Track the referral on the referrer's record
    if(referrer){
      referrer.referrals = referrer.referrals || [];
      referrer.referrals.push({
        userId: user.id,
        name: user.name,
        email: user.email,
        status: 'pending',
        bonus: 50,
        ts: Date.now()
      });
      referrer.notifications = referrer.notifications || [];
      referrer.notifications.push({id:'n'+Date.now(), text:`${user.name} signed up with your referral link! Earn $50 when they make their first deposit.`, ts:Date.now(), read:false});
      d.activity.push({ts:Date.now(), type:'referral_signup', text:`Referral: ${referrer.email} referred ${user.email}`});
    }
    d.activity.push({ts:Date.now(), type:'signup', userId:user.id, text:`New user: ${user.name} (${user.email})`});
    this.save(d);
    this.setSession({id:user.id, email:user.email, name:user.name});
    return {ok:true, user};
  },

  login(email, password){
    const u = this.findUser(email);
    if(!u) return {ok:false, error:'No account found with that email.'};
    if(u.password!==password) return {ok:false, error:'Incorrect password.'};
    this.setSession({id:u.id, email:u.email, name:u.name});
    return {ok:true, user:u};
  },

  adminLogin(email, password){
    if(email.trim().toLowerCase()==='admin@tradeverse.io' && password==='TradeVerse@2025'){
      this.setAdmin(true);
      return {ok:true};
    }
    return {ok:false, error:'Invalid admin credentials.'};
  },

  changePassword(userId, curr, next){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false,error:'User not found.'};
    if(u.password!==curr) return {ok:false,error:'Current password is incorrect.'};
    if(next.length<6) return {ok:false,error:'New password must be at least 6 characters.'};
    u.password = next;
    this.save(d);
    return {ok:true};
  },

  /* ---------- transactions (real) ---------- */
  requestDeposit(userId, method, amount, addr){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false};
    const dep = { id:'d_'+Date.now(), userId, method, amount, status:'pending', ts:Date.now(), addr };
    d.deposits.push(dep);
    u.notifications.push({id:'n'+Date.now(), text:`Deposit request of $${amount} via ${method} submitted. Awaiting confirmation.`, ts:Date.now(), read:false});
    d.activity.push({ts:Date.now(),type:'deposit_request',userId,text:`Deposit request $${amount} (${method})`});
    this.save(d);
    return {ok:true, dep};
  },

  requestWithdrawal(userId, amount, addr){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false};
    if(u.balance < amount) return {ok:false,error:'Insufficient balance.'};
    const wd = { id:'w_'+Date.now(), userId, amount, status:'pending', ts:Date.now(), addr };
    d.withdrawals.push(wd);
    u.balance -= amount; // hold funds
    u.notifications.push({id:'n'+Date.now(), text:`Withdrawal request of $${amount} submitted for processing.`, ts:Date.now(), read:false});
    u.transactions.push({id:'t_'+Date.now(), type:'withdrawal', amount:-amount, status:'pending', desc:'Withdrawal request', ts:Date.now()});
    d.activity.push({ts:Date.now(),type:'withdrawal_request',userId,text:`Withdrawal request $${amount}`});
    this.save(d);
    return {ok:true, wd};
  },

  /* admin approve deposit (real: only after you verify on-chain) */
  approveDeposit(depId){
    const d=this.load();
    const dep = d.deposits.find(x=>x.id===depId);
    if(!dep||dep.status!=='pending') return {ok:false};
    dep.status='completed';
    const u=d.users.find(x=>x.id===dep.userId);
    if(u){
      u.balance += dep.amount;
      u.transactions.push({id:'t_'+Date.now(), type:'deposit', amount:dep.amount, status:'completed', desc:`Deposit via ${dep.method}`, ts:Date.now()});
      u.notifications.push({id:'n'+Date.now(), text:`Your deposit of $${dep.amount} has been credited to your account.`, ts:Date.now(), read:false});
      // ---- Referral bonus: grant $50 to referrer on first completed deposit ----
      if(u.referredBy && !u._refBonusPaid){
        const referrer = d.users.find(x=>x.id===u.referredBy);
        if(referrer){
          u._refBonusPaid = true;  // mark so we only pay once
          referrer.balance += 50;
          referrer.referralEarnings = (referrer.referralEarnings||0) + 50;
          referrer.transactions = referrer.transactions || [];
          referrer.transactions.push({id:'t_'+Date.now(), type:'referral_bonus', amount:50, status:'completed', desc:`Referral bonus — ${u.name} made first deposit`, ts:Date.now()});
          referrer.notifications = referrer.notifications || [];
          referrer.notifications.push({id:'n'+Date.now(), text:`🎉 Referral bonus! ${u.name} made their first deposit. You earned $50.`, ts:Date.now(), read:false});
          // update the referral record on the referrer
          if(referrer.referrals){
            const rec = referrer.referrals.find(r=>r.userId===u.id);
            if(rec){ rec.status='completed'; rec.bonusPaidAt=Date.now(); }
          }
          d.activity.push({ts:Date.now(), type:'referral_bonus', text:`Referral bonus $50 paid to ${referrer.email} (referred ${u.email})`});
        }
      }
    }
    d.activity.push({ts:Date.now(),type:'deposit_approved',text:`Deposit ${depId} approved ($${dep.amount})`});
    this.save(d);
    return {ok:true};
  },
  rejectDeposit(depId){ const d=this.load(); const dep=d.deposits.find(x=>x.id===depId); if(dep){dep.status='rejected';} this.save(d); return {ok:true}; },
  approveWithdrawal(wdId){ const d=this.load(); const wd=d.withdrawals.find(x=>x.id===wdId); if(wd){wd.status='completed'; const u=d.users.find(x=>x.id===wd.userId); if(u){u.transactions.push({id:'t_'+Date.now(),type:'withdrawal',amount:-wd.amount,status:'completed',desc:'Withdrawal processed',ts:Date.now()}); u.notifications.push({id:'n'+Date.now(),text:`Your withdrawal of $${wd.amount} has been processed.`,ts:Date.now(),read:false});}} d.activity.push({ts:Date.now(),type:'withdrawal_approved',text:`Withdrawal ${wdId} approved`}); this.save(d); return {ok:true}; },
  rejectWithdrawal(wdId){ const d=this.load(); const wd=d.withdrawals.find(x=>x.id===wdId); if(wd){wd.status='rejected'; const u=d.users.find(x=>x.id===wd.userId); if(u){u.balance+=wd.amount; u.notifications.push({id:'n'+Date.now(),text:`Your withdrawal request was declined. Funds returned.`,ts:Date.now(),read:false});}} this.save(d); return {ok:true}; },

  /* ---------- wallets (admin editable) ---------- */
  updateWallet(id, address, name){ const d=this.load(); const w=d.wallets.find(x=>x.id===id); if(w){w.address=address; if(name)w.name=name; d.activity.push({ts:Date.now(),type:'wallet_update',text:`Wallet ${id} updated`});} this.save(d); return {ok:true}; },

  /* ---------- messaging ---------- */
  broadcast(subject, body){
    const d=this.load();
    d.users.forEach(u=>{
      u.notifications.push({id:'n'+Date.now()+Math.random(), text:`${subject}: ${body}`, ts:Date.now(), read:false, broadcast:true});
      u.transactions = u.transactions; // keep
    });
    d.broadcasts.push({subject, body, ts:Date.now()});
    d.activity.push({ts:Date.now(),type:'broadcast',text:`Broadcast: ${subject}`});
    this.save(d);
    return {ok:true};
  },

  sendSupport(userId, text, from){
    const d=this.load();
    if(!d.support[userId]) d.support[userId]=[];
    d.support[userId].push({from, text, ts:Date.now()});
    if(from==='user'){
      d.activity.push({ts:Date.now(),type:'support_msg',userId,text:`Support message from ${userId}`});
    }
    this.save(d);
  },

  /* AI monitor log (anomaly flags) */
  logAI(text){ const d=this.load(); d.aiLogs.push({ts:Date.now(), text}); if(d.aiLogs.length>50) d.aiLogs.shift(); this.save(d); },

  markNotifRead(userId){ const d=this.load(); const u=d.users.find(x=>x.id===userId); if(u) u.notifications.forEach(n=>n.read=true); this.save(d); },

  /* ---------- referral helpers ---------- */
  getReferralLink(userId){
    const u = this.getUser(userId);
    if(!u) return '';
    const base = location.origin + location.pathname.replace(/[^/]*$/,'');
    return base + 'signup.html?ref=' + (u.referralCode || '');
  },
  getReferralStats(userId){
    const u = this.getUser(userId);
    if(!u) return {invited:0, earned:0, pending:0, referrals:[]};
    const refs = u.referrals || [];
    return {
      invited: refs.length,
      earned: u.referralEarnings || 0,
      pending: refs.filter(r=>r.status==='pending').length,
      referrals: refs
    };
  },
  // Backfill referral code for users created before the referral feature
  ensureReferralCode(userId){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(u && !u.referralCode){
      u.referralCode = 'TV' + (Date.now().toString(36).toUpperCase()).slice(-6) + Math.floor(Math.random()*900+100);
      u.referrals = u.referrals || [];
      u.referralEarnings = u.referralEarnings || 0;
      this.save(d);
    }
    return u ? u.referralCode : '';
  }
};

/* simple toast */
function toast(msg, type='info'){
  let wrap = document.querySelector('.toast-wrap');
  if(!wrap){ wrap=document.createElement('div'); wrap.className='toast-wrap'; document.body.appendChild(wrap); }
  const el = document.createElement('div');
  el.className = 'toast '+type;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateX(20px)'; setTimeout(()=>el.remove(),300); }, 4000);
}

/* theme */
function getTheme(){ return localStorage.getItem('tv_theme') || 'light'; }
function setTheme(t){ localStorage.setItem('tv_theme', t); document.documentElement.setAttribute('data-theme', t); updateThemeToggle(); }
function toggleTheme(){ setTheme(getTheme()==='dark'?'light':'dark'); }
function updateThemeToggle(){ document.querySelectorAll('.theme-toggle').forEach(b=>{ b.textContent = getTheme()==='dark'?'☀️':'🌙'; }); }
function initTheme(){ document.documentElement.setAttribute('data-theme', getTheme()); }

/* email-notification intent (demo: logs to activity; real deployment wires to SMTP/SendGrid) */
function notifyEmail(userId, subject, body){
  const d = TV.load(); const u = d.users.find(x=>x.id===userId);
  const to = u ? u.email : 'unknown';
  d.activity.push({ts:Date.now(), type:'email', userId, text:`Email to ${to}: ${subject}`});
  TV.save(d);
  console.log(`[EMAIL] to:${to} subject:${subject} body:${body}`);
}

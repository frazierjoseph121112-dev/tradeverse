/* TradeVerse — Auth, persistence & data store (localStorage based, backend-ready) */
const TV = {
  KEY: 'tv_data_v1',
  SESSION: 'tv_session',
  ADMIN: 'tv_admin',
  ADMIN_EMAIL: 'tv_admin_email',   // where admin "receives" alert emails (demo: activity log)

  /* ---------- storage ---------- */
  load(){ try{ const d=JSON.parse(localStorage.getItem(TV.KEY)); if(d){ return this.migrate(d); } return this.seed(); }catch(e){ return this.seed(); } },
  save(d){ localStorage.setItem(TV.KEY, JSON.stringify(d)); },
  migrate(d){
    // Ensure new fields exist on older saved data
    if(!d.copyTraders) d.copyTraders = this.defaultCopyTraders();
    if(!d.copyRelations) d.copyRelations = [];
    if(!d.socialPosts) d.socialPosts = [];
    if(!d.competitions) d.competitions = this.defaultCompetitions();
    if(!d.competitionEntries) d.competitionEntries = [];
    if(!d.stakingPools) d.stakingPools = this.defaultStakingPools();
    if(!d.stakes) d.stakes = [];
    if(!d.economicEvents) d.economicEvents = this.defaultEconomicEvents();
    if(!d.advancedOrders) d.advancedOrders = [];
    if(!d.apiKeys) d.apiKeys = [];
    if(!d.paperAccounts) d.paperAccounts = {};
    return d;
  },
  seed(){
    const d = {
      users: [],
      wallets: this.defaultWallets(),
      broadcasts: [],
      support: {},        // { userId: [ {from:'user'|'admin'|'bot', text, ts, lang, originalText} ] }
      activity: [],
      deposits: [],       // {id, userId, method, amount, status, ts, addr, rejectReason, reviewReason}
      withdrawals: [],    // {id, userId, amount, status, ts, addr, rejectReason, reviewReason}
      transactions: [],   // admin-generated transactions {id, userId, type, amount, desc, ts, status, generatedBy, backdated}
      aiLogs: [],
      adminAlerts: [],    // emails "sent" to admin {id, to, subject, body, ts, category}
      kycReviews: [],     // {id, userId, status:'pending'|'approved'|'rejected'|'more_info', ts, reason}
      bankLinks: [],      // {id, userId, bankName, accountNumber, routingNumber, status, ts, rejectReason}
      templates: this.defaultTemplates(),
      userActivity: {},    // { userId: [ {action, ts, detail} ] }
      copyTraders: this.defaultCopyTraders(),  // seeded top traders for copy trading
      copyRelations: [],    // {id, followerId, traderId, allocAmount, active, sinceTs, copiedPositions:[]}
      socialPosts: [],      // {id, userId, author, text, ts, likes:[], comments:[{userId,author,text,ts}], assetTag}
      competitions: this.defaultCompetitions(),  // seeded trading tournaments
      competitionEntries: [],  // {id, competitionId, userId, score, joinedTs}
      stakingPools: this.defaultStakingPools(),  // {id, asset, apy, minStake, totalStaked, icon}
      stakes: [],           // {id, userId, poolId, amount, stakedTs, rewardsAccrued, status:'active'|'unstaked'}
      economicEvents: this.defaultEconomicEvents(),  // upcoming events
      advancedOrders: [],   // {id, userId, symbol, type:'limit'|'stop'|'trailing_stop'|'oco', price, qty, side, status, tp, sl, trailPercent}
      apiKeys: [],          // {id, userId, key, secret, label, permissions:{read,trade,withdraw}, createdTs, active}
      paperAccounts: {}     // { userId: {balance, positions:[], trades:[], initialBalance} }
    };
    this.save(d);
    return d;
  },

  /* ---------- copy trading: seeded top traders ---------- */
  defaultCopyTraders(){
    const now = Date.now();
    return [
      { id:'trader_alex', name:'Alex Morgan', avatar:'🧑‍💼', country:'🇺🇸 USA', riskScore:'Medium',
        followers:1247, copiers:89, winRate:68.4, roi90d:23.7, roi1y:87.2,
        maxDrawdown:8.3, avgHoldDays:14, totalTrades:542, assetsTraded:['crypto','stocks'],
        bio:'Swing trader focused on tech stocks and major cryptos. Risk management first.',
        verified:true, premium:false, minCopy:200, performanceHistory:[12,15,11,18,22,19,25,23,21,24,20,23] },
      { id:'trader_sofia', name:'Sofia Chen', avatar:'👩‍💼', country:'🇸🇬 Singapore', riskScore:'Low',
        followers:2103, copiers:156, winRate:74.1, roi90d:15.3, roi1y:62.8,
        maxDrawdown:4.1, avgHoldDays:30, totalTrades:318, assetsTraded:['forex','metals'],
        bio:'Conservative forex & gold trader. Long-term positions with tight stops.',
        verified:true, premium:true, minCopy:500, performanceHistory:[8,9,11,10,12,13,14,13,15,14,15,15] },
      { id:'trader_marco', name:'Marco Rossi', avatar:'🧔', country:'🇮🇹 Italy', riskScore:'High',
        followers:892, copiers:64, winRate:61.2, roi90d:41.8, roi1y:152.6,
        maxDrawdown:18.7, avgHoldDays:3, totalTrades:1204, assetsTraded:['crypto'],
        bio:'High-frequency crypto scalper. Volatility is opportunity. 24/7 trader.',
        verified:false, premium:false, minCopy:100, performanceHistory:[20,25,18,30,35,28,42,38,40,45,39,41] },
      { id:'trader_nadia', name:'Nadia Al-Rashid', avatar:'👩', country:'🇦🇪 UAE', riskScore:'Medium',
        followers:1756, copiers:112, winRate:71.8, roi90d:19.4, roi1y:78.3,
        maxDrawdown:6.9, avgHoldDays:7, totalTrades:687, assetsTraded:['crypto','forex','indices'],
        bio:'Multi-asset momentum trader. Combining crypto with forex and indices for diversification.',
        verified:true, premium:true, minCopy:300, performanceHistory:[10,14,12,16,18,17,19,20,19,18,20,19] },
      { id:'trader_james', name:'James Okonkwo', avatar:'🧑‍🔬', country:'🇳🇬 Nigeria', riskScore:'Medium',
        followers:534, copiers:38, winRate:66.7, roi90d:28.1, roi1y:95.4,
        maxDrawdown:11.2, avgHoldDays:10, totalTrades:401, assetsTraded:['stocks','shares'],
        bio:'Value investor in emerging markets. Africa-focused equity positions.',
        verified:true, premium:false, minCopy:150, performanceHistory:[14,16,15,20,22,25,28,26,27,29,28,28] },
      { id:'trader_yuki', name:'Yuki Tanaka', avatar:'👩‍💻', country:'🇯🇵 Japan', riskScore:'Low',
        followers:1398, copiers:97, winRate:76.9, roi90d:12.1, roi1y:48.6,
        maxDrawdown:3.2, avgHoldDays:45, totalTrades:203, assetsTraded:['stocks','metals'],
        bio:'Patient dividend investor. Quality stocks and precious metals for the long haul.',
        verified:true, premium:true, minCopy:1000, performanceHistory:[6,7,8,8,9,10,11,11,12,12,12,12] }
    ];
  },

  /* ---------- copy trading methods ---------- */
  getCopyTraders(filter){
    const d=this.load();
    let traders = (d.copyTraders||[]).slice();
    if(filter==='top_roi') traders.sort((a,b)=>b.roi90d-a.roi90d);
    else if(filter==='top_winrate') traders.sort((a,b)=>b.winRate-a.winRate);
    else if(filter==='low_risk') traders.sort((a,b)=>{
      const order={Low:0,Medium:1,High:2}; return order[a.riskScore]-order[b.riskScore];
    });
    else if(filter==='most_copied') traders.sort((a,b)=>b.copiers-a.copiers);
    else traders.sort((a,b)=>b.followers-a.followers);
    return traders;
  },

  getCopyTrader(traderId){
    const d=this.load();
    return (d.copyTraders||[]).find(t=>t.id===traderId);
  },

  followTrader(userId, traderId, allocAmount){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false, error:'User not found'};
    const trader=this.getCopyTrader(traderId);
    if(!trader) return {ok:false, error:'Trader not found'};
    if(allocAmount < trader.minCopy) return {ok:false, error:`Minimum copy amount is $${trader.minCopy}`};
    d.copyRelations = d.copyRelations || [];
    const existing = d.copyRelations.find(r=>r.followerId===userId && r.traderId===traderId && r.active);
    if(existing) return {ok:false, error:'Already copying this trader'};
    const rel = { id:'cr_'+Date.now(), followerId:userId, traderId, allocAmount:parseFloat(allocAmount),
      active:true, sinceTs:Date.now(), copiedPositions:[], pnl:0 };
    d.copyRelations.push(rel);
    // simulate initial copied positions
    const assets=['BTC','ETH','AAPL','EUR/USD','XAU/USD'];
    rel.copiedPositions = assets.slice(0, Math.floor(Math.random()*3)+2).map(sym=>({
      symbol:sym, side:Math.random()>0.3?'long':'short', entryPrice:Math.random()*50000+100,
      qty:parseFloat((allocAmount/ (Math.floor(Math.random()*3)+2) / 100).toFixed(4)),
      currentPrice:0, pnl:0, openTs:Date.now()
    }));
    trader.copiers = (trader.copiers||0)+1;
    trader.followers = (trader.followers||0)+1;
    this.logActivity(userId, 'copy_trading_follow', `Started copying ${trader.name} with $${allocAmount}`);
    this.save(d);
    return {ok:true, relation:rel};
  },

  unfollowTrader(userId, relationId){
    const d=this.load();
    d.copyRelations = d.copyRelations || [];
    const rel = d.copyRelations.find(r=>r.id===relationId);
    if(!rel) return {ok:false, error:'Copy relation not found'};
    rel.active=false;
    rel.unfollowedTs=Date.now();
    const trader=this.getCopyTrader(rel.traderId);
    if(trader){ trader.copiers=Math.max(0,(trader.copiers||0)-1); }
    this.logActivity(userId, 'copy_trading_unfollow', `Stopped copying ${trader?trader.name:'trader'}`);
    this.save(d);
    return {ok:true};
  },

  getCopyRelations(userId){
    const d=this.load();
    return (d.copyRelations||[]).filter(r=>r.followerId===userId);
  },

  updateCopyPnL(){
    // simulate PnL updates for all active copy relations
    const d=this.load();
    if(!d.copyRelations) return;
    d.copyRelations.forEach(rel=>{
      if(!rel.active) return;
      rel.copiedPositions.forEach(pos=>{
        const change=(Math.random()-0.45)*0.05;
        pos.currentPrice = pos.currentPrice || pos.entryPrice;
        pos.currentPrice = pos.entryPrice*(1+change);
        pos.pnl = pos.side==='long'
          ? (pos.currentPrice - pos.entryPrice)*pos.qty
          : (pos.entryPrice - pos.currentPrice)*pos.qty;
      });
      rel.pnl = rel.copiedPositions.reduce((s,p)=>s+p.pnl,0);
    });
    this.save(d);
  },

  /* ---------- social trading feed ---------- */
  createPost(userId, text, assetTag){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false, error:'User not found'};
    if(!text || text.trim().length<1) return {ok:false, error:'Post cannot be empty'};
    const post = { id:'post_'+Date.now(), userId, author:u.name, avatar:'🧑', text:text.trim(),
      ts:Date.now(), likes:[], comments:[], assetTag: assetTag||'' };
    d.socialPosts = d.socialPosts||[];
    d.socialPosts.unshift(post);
    this.logActivity(userId, 'social_post', 'Published a trading idea');
    this.save(d);
    return {ok:true, post};
  },

  getPosts(limit){
    const d=this.load();
    let posts = (d.socialPosts||[]).slice();
    if(limit) posts = posts.slice(0, limit);
    return posts;
  },

  likePost(userId, postId){
    const d=this.load();
    const post = (d.socialPosts||[]).find(p=>p.id===postId);
    if(!post) return {ok:false};
    post.likes = post.likes||[];
    const idx = post.likes.indexOf(userId);
    if(idx>=0) post.likes.splice(idx,1); else post.likes.push(userId);
    this.save(d);
    return {ok:true, liked: post.likes.includes(userId), count:post.likes.length};
  },

  commentPost(userId, postId, text){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false};
    const post = (d.socialPosts||[]).find(p=>p.id===postId);
    if(!post) return {ok:false};
    post.comments = post.comments||[];
    post.comments.push({ userId, author:u.name, text:text.trim(), ts:Date.now() });
    this.save(d);
    return {ok:true, comments:post.comments};
  },

  /* ---------- trading competitions ---------- */
  defaultCompetitions(){
    const now=Date.now();
    return [
      { id:'comp_1', title:'Crypto Masters Cup', description:'Trade crypto pairs and climb the leaderboard for a share of $50,000!',
        prizePool:50000, entryFee:0, assetClass:'crypto', status:'active',
        startTs: now-86400000*3, endTs: now+86400000*11, participants:1284,
        rules:'Highest ROI wins. Min 5 trades required. No bots.' },
      { id:'comp_2', title:'Forex Sprint Challenge', description:'Fast-paced forex trading competition. 7 days only!',
        prizePool:25000, entryFee:50, assetClass:'forex', status:'active',
        startTs: now-86400000*1, endTs: now+86400000*6, participants:642,
        rules:'Forex pairs only. Leverage capped at 1:30. Real accounts only.' },
      { id:'comp_3', title:'Stock Showdown 2024', description:'Pick the best-performing stock portfolio over 30 days.',
        prizePool:100000, entryFee:100, assetClass:'stocks', status:'upcoming',
        startTs: now+86400000*5, endTs: now+86400000*35, participants:0,
        rules:'Stocks & shares only. Long positions. Max 10 positions.' },
      { id:'comp_4', title:'Gold Rush Tournament', description:'Trade gold and silver in this precious metals showdown.',
        prizePool:15000, entryFee:0, assetClass:'metals', status:'active',
        startTs: now-86400000*7, endTs: now+86400000*7, participants:389,
        rules:'XAU/USD and XAG/USD only. Min position $100.' }
    ];
  },

  getCompetitions(status){
    const d=this.load();
    let comps = (d.competitions||[]).slice();
    if(status) comps = comps.filter(c=>c.status===status);
    return comps;
  },

  joinCompetition(userId, compId){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false, error:'User not found'};
    const comp = (d.competitions||[]).find(c=>c.id===compId);
    if(!comp) return {ok:false, error:'Competition not found'};
    if(comp.status!=='active' && comp.status!=='upcoming') return {ok:false, error:'Competition not open'};
    d.competitionEntries = d.competitionEntries||[];
    if(d.competitionEntries.find(e=>e.competitionId===compId && e.userId===userId))
      return {ok:false, error:'Already registered'};
    const entry = { id:'entry_'+Date.now(), competitionId:compId, userId, score:0,
      pnl:0, trades:0, joinedTs:Date.now() };
    d.competitionEntries.push(entry);
    comp.participants = (comp.participants||0)+1;
    this.logActivity(userId, 'competition_join', `Joined ${comp.title}`);
    this.save(d);
    return {ok:true, entry};
  },

  leaveCompetition(userId, compId){
    const d=this.load();
    d.competitionEntries = (d.competitionEntries||[]).filter(e=>!(e.competitionId===compId && e.userId===userId));
    const comp=(d.competitions||[]).find(c=>c.id===compId);
    if(comp) comp.participants=Math.max(0,(comp.participants||0)-1);
    this.save(d);
    return {ok:true};
  },

  getCompetitionLeaderboard(compId){
    const d=this.load();
    const entries = (d.competitionEntries||[]).filter(e=>e.competitionId===compId);
    entries.forEach(e=>{
      const u=d.users.find(x=>x.id===e.userId);
      e.name = u ? u.name : 'Anonymous';
      e.avatar = '🧑';
    });
    // add some seeded competitors for realism
    if(entries.length<10){
      const names=['TraderPro','CryptoKing','ForexNinja','GoldMiner','StockWizard','MoonShot','DiamondHands','BullRunBear'];
      names.forEach((n,i)=>{
        if(!entries.find(e=>e.name===n)){
          entries.push({ id:'seed_'+i, name:n, avatar:['🧑‍💼','👑','🥷','⛏️','🧙','🚀','💎','🐂'][i],
            pnl: Math.random()*40000-5000, trades:Math.floor(Math.random()*80)+10, score:Math.random()*100 });
        }
      });
    }
    entries.sort((a,b)=>(b.pnl||0)-(a.pnl||0));
    entries.forEach((e,i)=>e.rank=i+1);
    return entries;
  },

  isUserInCompetition(userId, compId){
    const d=this.load();
    return !!(d.competitionEntries||[]).find(e=>e.competitionId===compId && e.userId===userId);
  },

  /* ---------- admin: competition management ---------- */
  createCompetition(title, description, prizePool, entryFee, assetClass, durationDays){
    const d=this.load();
    const now=Date.now();
    const comp={ id:'comp_'+Date.now(), title, description, prizePool:parseFloat(prizePool),
      entryFee:parseFloat(entryFee), assetClass, status:'upcoming', startTs: now+86400000,
      endTs: now+86400000*(1+parseInt(durationDays||30)), participants:0,
      rules:'Admin-created competition.' };
    d.competitions = d.competitions||[];
    d.competitions.push(comp);
    this.save(d);
    return {ok:true, comp};
  },

  endCompetition(compId){
    const d=this.load();
    const comp=(d.competitions||[]).find(c=>c.id===compId);
    if(comp){ comp.status='ended'; comp.endTs=Date.now(); this.save(d); return {ok:true}; }
    return {ok:false};
  },

  /* ---------- staking & yield ---------- */
  defaultStakingPools(){
    return [
      { id:'pool_eth', asset:'Ethereum', symbol:'ETH', apy:5.2, minStake:0.1, totalStaked:12400, icon:'Ξ', color:'#627eea' },
      { id:'pool_btc', asset:'Bitcoin', symbol:'BTC', apy:3.8, minStake:0.01, totalStaked:8900, icon:'₿', color:'#f7931a' },
      { id:'pool_usdt', asset:'Tether', symbol:'USDT', apy:8.5, minStake:100, totalStaked:450000, icon:'₮', color:'#26a17b' },
      { id:'pool_sol', asset:'Solana', symbol:'SOL', apy:7.1, minStake:1, totalStaked:34000, icon:'◎', color:'#9945ff' },
      { id:'pool_ada', asset:'Cardano', symbol:'ADA', apy:4.5, minStake:50, totalStaked:120000, icon:'₳', color:'#0033ad' },
      { id:'pool_dot', asset:'Polkadot', symbol:'DOT', apy:6.8, minStake:10, totalStaked:56000, icon:'●', color:'#e6007a' }
    ];
  },

  getStakingPools(){
    const d=this.load();
    return d.stakingPools||[];
  },

  stake(userId, poolId, amount){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false, error:'User not found'};
    const pool=(d.stakingPools||[]).find(p=>p.id===poolId);
    if(!pool) return {ok:false, error:'Staking pool not found'};
    if(amount < pool.minStake) return {ok:false, error:`Minimum stake is ${pool.minStake} ${pool.symbol}`};
    const stake={ id:'stake_'+Date.now(), userId, poolId, amount:parseFloat(amount),
      stakedTs:Date.now(), rewardsAccrued:0, status:'active', apyAtStake:pool.apy };
    d.stakes=d.stakes||[];
    d.stakes.push(stake);
    pool.totalStaked=(pool.totalStaked||0)+parseFloat(amount);
    this.logActivity(userId, 'stake', `Staked ${amount} ${pool.symbol} at ${pool.apy}% APY`);
    this.save(d);
    return {ok:true, stake};
  },

  unstake(userId, stakeId){
    const d=this.load();
    const stake=(d.stakes||[]).find(s=>s.id===stakeId);
    if(!stake || stake.userId!==userId) return {ok:false, error:'Stake not found'};
    if(stake.status!=='active') return {ok:false, error:'Already unstaked'};
    // calculate rewards based on time staked
    const daysStaked=(Date.now()-stake.stakedTs)/86400000;
    stake.rewardsAccrued = stake.amount * (stake.apyAtStake/100) * (daysStaked/365);
    stake.status='unstaked';
    stake.unstakedTs=Date.now();
    const pool=(d.stakingPools||[]).find(p=>p.id===stake.poolId);
    if(pool) pool.totalStaked=Math.max(0,(pool.totalStaked||0)-stake.amount);
    this.logActivity(userId, 'unstake', `Unstaked ${stake.amount} ${pool?pool.symbol:''} with ${stake.rewardsAccrued.toFixed(4)} rewards`);
    this.save(d);
    return {ok:true, stake};
  },

  getUserStakes(userId){
    const d=this.load();
    return (d.stakes||[]).filter(s=>s.userId===userId);
  },

  updateStakeRewards(){
    const d=this.load();
    if(!d.stakes) return;
    d.stakes.forEach(s=>{
      if(s.status==='active'){
        const daysStaked=(Date.now()-s.stakedTs)/86400000;
        s.rewardsAccrued = s.amount * (s.apyAtStake/100) * (daysStaked/365);
      }
    });
    this.save(d);
  },

  /* ---------- economic calendar ---------- */
  defaultEconomicEvents(){
    const now=Date.now();
    const day=86400000;
    return [
      { id:'ev_1', time:new Date(now+day).toISOString(), country:'🇺🇸', currency:'USD', event:'Non-Farm Payrolls', impact:'high', forecast:'180K', previous:'175K', actual:'' },
      { id:'ev_2', time:new Date(now+day+3600000*4).toISOString(), country:'🇪🇺', currency:'EUR', event:'ECB Interest Rate Decision', impact:'high', forecast:'4.50%', previous:'4.50%', actual:'' },
      { id:'ev_3', time:new Date(now+day*2).toISOString(), country:'🇬🇧', currency:'GBP', event:'GDP Growth Rate QoQ', impact:'medium', forecast:'0.2%', previous:'0.1%', actual:'' },
      { id:'ev_4', time:new Date(now+day*2+3600000*8).toISOString(), country:'🇯🇵', currency:'JPY', event:'BoJ Policy Rate', impact:'high', forecast:'-0.10%', previous:'-0.10%', actual:'' },
      { id:'ev_5', time:new Date(now+day*3).toISOString(), country:'🇺🇸', currency:'USD', event:'CPI Inflation YoY', impact:'high', forecast:'3.1%', previous:'3.2%', actual:'' },
      { id:'ev_6', time:new Date(now+day*4).toISOString(), country:'🇨🇳', currency:'CNY', event:'Industrial Production YoY', impact:'medium', forecast:'4.5%', previous:'4.2%', actual:'' },
      { id:'ev_7', time:new Date(now+day*5).toISOString(), country:'🇦🇺', currency:'AUD', event:'Employment Change', impact:'medium', forecast:'25K', previous:'30K', actual:'' },
      { id:'ev_8', time:new Date(now+day*7).toISOString(), country:'🇺🇸', currency:'USD', event:'FOMC Statement', impact:'high', forecast:'-', previous:'-', actual:'' },
      { id:'ev_9', time:new Date(now+day*8).toISOString(), country:'🇩🇪', currency:'EUR', event:'ZEW Economic Sentiment', impact:'low', forecast:'15.3', previous:'10.7', actual:'' },
      { id:'ev_10', time:new Date(now+day*10).toISOString(), country:'🇨🇦', currency:'CAD', event:'BoC Interest Rate', impact:'high', forecast:'5.00%', previous:'5.00%', actual:'' }
    ];
  },

  getEconomicEvents(filter){
    const d=this.load();
    let events=(d.economicEvents||[]).slice();
    if(filter==='high') events=events.filter(e=>e.impact==='high');
    else if(filter==='medium') events=events.filter(e=>e.impact==='medium'||e.impact==='high');
    return events.sort((a,b)=>new Date(a.time)-new Date(b.time));
  },

  /* ---------- advanced order types ---------- */
  placeAdvancedOrder(userId, symbol, type, side, qty, price, tp, sl, trailPercent){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false, error:'User not found'};
    const order={ id:'ord_'+Date.now(), userId, symbol, type, side, qty:parseFloat(qty),
      price:parseFloat(price)||0, tp:parseFloat(tp)||0, sl:parseFloat(sl)||0,
      trailPercent:parseFloat(trailPercent)||0, status:'open', createdTs:Date.now() };
    d.advancedOrders=d.advancedOrders||[];
    d.advancedOrders.push(order);
    this.logActivity(userId, 'advanced_order', `Placed ${type} ${side} order for ${symbol}`);
    this.save(d);
    return {ok:true, order};
  },

  cancelAdvancedOrder(userId, orderId){
    const d=this.load();
    const order=(d.advancedOrders||[]).find(o=>o.id===orderId);
    if(!order || order.userId!==userId) return {ok:false};
    order.status='cancelled';
    this.save(d);
    return {ok:true};
  },

  getUserAdvancedOrders(userId){
    const d=this.load();
    return (d.advancedOrders||[]).filter(o=>o.userId===userId).sort((a,b)=>b.createdTs-a.createdTs);
  },

  /* ---------- API keys ---------- */
  generateApiKey(userId, label, permissions){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false, error:'User not found'};
    const genKey=()=>{ let k=''; const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for(let i=0;i<32;i++) k+=chars[Math.floor(Math.random()*chars.length)]; return k; };
    const apiKey={ id:'key_'+Date.now(), userId, key:'tv-'+genKey(), secret:genKey()+genKey(),
      label:label||'My API Key', permissions: permissions||{read:true,trade:false,withdraw:false},
      createdTs:Date.now(), active:true };
    d.apiKeys=d.apiKeys||[];
    d.apiKeys.push(apiKey);
    this.logActivity(userId, 'api_key_create', `Created API key: ${label}`);
    this.save(d);
    return {ok:true, apiKey};
  },

  revokeApiKey(userId, keyId){
    const d=this.load();
    const key=(d.apiKeys||[]).find(k=>k.id===keyId && k.userId===userId);
    if(!key) return {ok:false};
    key.active=false;
    key.revokedTs=Date.now();
    this.logActivity(userId, 'api_key_revoke', `Revoked API key: ${key.label}`);
    this.save(d);
    return {ok:true};
  },

  getUserApiKeys(userId){
    const d=this.load();
    return (d.apiKeys||[]).filter(k=>k.userId===userId).sort((a,b)=>b.createdTs-a.createdTs);
  },

  /* ---------- paper trading / demo mode ---------- */
  getPaperAccount(userId){
    const d=this.load();
    if(!d.paperAccounts) d.paperAccounts={};
    if(!d.paperAccounts[userId]){
      d.paperAccounts[userId]={ balance:100000, positions:[], trades:[], initialBalance:100000 };
      this.save(d);
    }
    return d.paperAccounts[userId];
  },

  paperTrade(userId, symbol, side, qty, price){
    const d=this.load(); const acct=this.getPaperAccount(userId);
    if(!acct) return {ok:false};
    qty=parseFloat(qty); price=parseFloat(price);
    const cost=qty*price;
    if(side==='buy' && cost>acct.balance) return {ok:false, error:'Insufficient paper balance'};
    if(side==='buy'){
      acct.balance-=cost;
      const existing=acct.positions.find(p=>p.symbol===symbol);
      if(existing){ existing.qty+=qty; existing.avgPrice=((existing.avgPrice*existing.qty)+cost)/(existing.qty+qty); }
      else acct.positions.push({symbol,qty,avgPrice:price,openTs:Date.now()});
    } else {
      const pos=acct.positions.find(p=>p.symbol===symbol);
      if(!pos || pos.qty<qty) return {ok:false, error:'Not enough positions to sell'};
      acct.balance+=qty*price; pos.qty-=qty;
      if(pos.qty<=0) acct.positions=acct.positions.filter(p=>p.symbol!==symbol);
    }
    acct.trades.unshift({symbol,side,qty,price,ts:Date.now(),pnl:0});
    d.paperAccounts[userId]=acct;
    this.save(d);
    return {ok:true, account:acct};
  },

  resetPaperAccount(userId){
    const d=this.load();
    d.paperAccounts=d.paperAccounts||{};
    d.paperAccounts[userId]={ balance:100000, positions:[], trades:[], initialBalance:100000 };
    this.logActivity(userId, 'paper_reset', 'Reset paper trading account to $100,000');
    this.save(d);
    return {ok:true};
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

  /* ---------- message templates ---------- */
  defaultTemplates(){
    return {
      promotional: [
        { id:'promo1', name:'🎉 Limited-Time Deposit Bonus', subject:'Double Your Deposit — 100% Match This Week Only!',
          body:'Dear {name},\n\nFor a limited time, TradeVerse is offering a 100% deposit match bonus! Deposit any amount this week and we\'ll match it dollar-for-dollar in trading credit.\n\nThis offer ends soon — don\'t miss out on doubling your trading power.\n\nTrade now: {link}\n\nBest regards,\nThe TradeVerse Team' },
        { id:'promo2', name:'📈 New Trading Pairs Added', subject:'New Crypto Pairs Now Available',
          body:'Dear {name},\n\nGreat news! We\'ve just added new cryptocurrency trading pairs to the platform. You can now trade even more assets with tight spreads and real-time pricing.\n\nExplore the new markets today.\n\nBest regards,\nThe TradeVerse Team' },
        { id:'promo3', name:'🔥 Zero Commission Weekend', subject:'Trade Commission-Free This Weekend',
          body:'Dear {name},\n\nThis weekend, enjoy zero commission on all stock and ETF trades at TradeVerse. It\'s the perfect time to diversify your portfolio.\n\nHappy trading!\nThe TradeVerse Team' },
        { id:'promo4', name:'💎 VIP Account Upgrade Offer', subject:'Upgrade to VIP — Exclusive Benefits Await',
          body:'Dear {name},\n\nYou\'re invited to upgrade to a VIP account and enjoy premium benefits: tighter spreads, a dedicated account manager, priority withdrawals, and exclusive market insights.\n\nContact us to upgrade today.\n\nThe TradeVerse Team' }
      ],
      referral: [
        { id:'ref1', name:'🤝 Refer & Earn $50', subject:'Invite Friends, Earn $50 Each!',
          body:'Dear {name},\n\nYour referral code {refCode} is ready to share! For every friend who signs up using your link and makes their first deposit, you\'ll earn $50 — instantly credited to your account.\n\nShare your link: {refLink}\n\nStart earning today!\nThe TradeVerse Team' },
        { id:'ref2', name:'🏆 You\'re Close to a Referral Milestone', subject:'Keep Sharing — Your Next $50 is One Referral Away!',
          body:'Dear {name},\n\nYou\'ve already earned {refEarnings} from referrals! Keep sharing your link and watch your earnings grow. Every successful referral adds $50 to your balance.\n\nYour link: {refLink}\n\nThe TradeVerse Team' }
      ],
      motivational: [
        { id:'mot1', name:'💪 Trading Journey Encouragement', subject:'You\'re on the Right Track, {name}!',
          body:'Dear {name},\n\nEvery great trader started exactly where you are now. The key to success is consistency, patience, and continuous learning. You\'ve already taken the most important step — you started.\n\nKeep exploring the markets, use your demo balance to practice, and remember: even the pros were beginners once.\n\nYou\'ve got this!\nThe TradeVerse Team' },
        { id:'mot2', name:'🌟 Market Opportunity Alert', subject:'Exciting Opportunities in Today\'s Markets',
          body:'Dear {name},\n\nThe markets are buzzing with opportunity today. Whether it\'s crypto, forex, or stocks, there\'s always a chance to learn and grow your portfolio.\n\nLog in to your dashboard and explore what\'s moving. Remember to trade responsibly and within your risk tolerance.\n\nThe TradeVerse Team' },
        { id:'mot3', name:'🎓 Learn & Grow Reminder', subject:'Level Up Your Trading Skills',
          body:'Dear {name},\n\nKnowledge is your best trading tool. Check out our educational resources to sharpen your strategy, understand risk management, and make more informed decisions.\n\nVisit the Learn section on your dashboard.\n\nThe TradeVerse Team' }
      ],
      rejection: [
        { id:'rej1', name:'❌ Deposit Rejected', subject:'Your Deposit Could Not Be Verified',
          body:'Dear {name},\n\nWe were unable to verify your recent deposit. This may be due to:\n\n• The transaction was not found on the blockchain\n• The funds were sent to the wrong network\n• The transaction is still pending confirmation\n\nReason: {reason}\n\nPlease double-check the network and address, then try again. If you believe this is an error, contact our support team.\n\nThe TradeVerse Team' },
        { id:'rej2', name:'❌ Withdrawal Rejected', subject:'Your Withdrawal Request Was Declined',
          body:'Dear {name},\n\nYour withdrawal request has been declined. Funds have been returned to your account balance.\n\nReason: {reason}\n\nCommon reasons include: incorrect wallet address, incomplete account verification, or unusual account activity.\n\nIf you have questions, please contact support.\n\nThe TradeVerse Team' },
        { id:'rej3', name:'❌ KYC Rejected', subject:'Account Verification — Action Needed',
          body:'Dear {name},\n\nYour account verification documents could not be approved at this time.\n\nReason: {reason}\n\nPlease re-submit your documents with clear, high-quality images and ensure all information matches your registration details.\n\nThe TradeVerse Team' }
      ],
      review: [
        { id:'rev1', name:'⏳ Deposit Under Review', subject:'Your Deposit Is Being Reviewed',
          body:'Dear {name},\n\nYour deposit is currently under review by our team. This is a standard security procedure.\n\nReason: {reason}\n\nWe\'ll notify you as soon as the review is complete. Thank you for your patience.\n\nThe TradeVerse Team' },
        { id:'rev2', name:'⏳ Withdrawal Under Review', subject:'Your Withdrawal Is Under Review',
          body:'Dear {name},\n\nYour withdrawal request is being reviewed by our compliance team. This is part of our commitment to keeping your funds safe.\n\nReason: {reason}\n\nYou\'ll be notified once processing is complete.\n\nThe TradeVerse Team' }
      ],
      welcome: [
        { id:'wel1', name:'👋 Welcome to TradeVerse', subject:'Welcome to TradeVerse — Your $130 Bonus is Ready!',
          body:'Dear {name},\n\nWelcome to TradeVerse! Your account is ready and we\'ve credited a $130 promotional bonus to get you started.\n\nHere\'s what you can do next:\n• Explore live markets (crypto, forex, stocks, metals, indices)\n• Make your first deposit to start trading\n• Set up your referral link to earn $50 per friend\n• Choose your preferred language in Settings\n\nWe\'re here to help — our AI assistant and support team are available 24/7.\n\nHappy trading!\nThe TradeVerse Team' }
      ]
    };
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
  getAllUsers(){ return this.load().users; },

  /* ---------- user activity tracking ---------- */
  logActivity(userId, action, detail){
    const d=this.load();
    if(!d.userActivity) d.userActivity = {};
    if(!d.userActivity[userId]) d.userActivity[userId] = [];
    d.userActivity[userId].push({ action, ts: Date.now(), detail: detail||'' });
    if(d.userActivity[userId].length > 200) d.userActivity[userId] = d.userActivity[userId].slice(-200);
    this.save(d);
  },
  getUserActivity(userId){
    const d=this.load();
    return d.userActivity?.[userId] || [];
  },
  recordLogin(userId){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(u){
      u.lastLogin = Date.now();
      u.loginHistory = u.loginHistory || [];
      u.loginHistory.push({ ts: Date.now() });
      if(u.loginHistory.length > 50) u.loginHistory = u.loginHistory.slice(-50);
    }
    this.save(d);
    this.logActivity(userId, 'login', 'User logged in');
  },

  signup({name,email,password,country,referral,lang,kyc}){
    email = (email||'').trim().toLowerCase();
    if(this.findUser(email)) return {ok:false, error:'Account already exists. Please log in.'};
    const d = this.load();
    let referrer = null;
    if(referral){
      referral = referral.trim();
      referrer = d.users.find(u=>u.referralCode===referral || u.email.toLowerCase()===referral.toLowerCase());
    }
    const refCode = 'TV' + (Date.now().toString(36).toUpperCase()).slice(-6) + Math.floor(Math.random()*900+100);
    const userLang = lang || getLang() || 'en';
    const user = {
      id: 'u_'+Date.now()+Math.floor(Math.random()*1000),
      name: name.trim(),
      email,
      password,
      country: country || 'United States',
      lang: userLang,
      referral: referral||'',
      referralCode: refCode,
      referredBy: referrer ? referrer.id : null,
      joined: Date.now(),
      lastLogin: null,
      loginHistory: [],
      verified: false,
      kycStatus: kyc ? 'pending' : 'not_submitted',  // pending | approved | rejected | more_info | not_submitted
      kyc: kyc || null,  // full KYC data submitted at signup
      // account
      balance: 0,
      bonus: 130,
      holdings: [],
      pies: [ {name:'Starter Pie', value:130, items:['BTC','ETH','AAPL']} ],
      transactions: [
        { id:'t_'+Date.now(), type:'bonus', amount:130, status:'completed', desc:'Sign-up promotional credit', ts:Date.now() }
      ],
      notifications: [
        { id:'n1', text:this.welcomeNotif(userLang, name.trim()), ts:Date.now(), read:false }
      ],
      referrals: [],
      referralEarnings: 0,
      settings:{ kyc:false, twoFactor:false, priceAlerts:[] },
      // per-asset-class sub-balances
      balances: { crypto: 0, stocks: 0, shares: 0, forex: 0, metals: 0 },
      bankLink: null  // { bankName, accountNumber, routingNumber, status }
    };
    d.users.push(user);
    if(referrer){
      referrer.referrals = referrer.referrals || [];
      referrer.referrals.push({ userId: user.id, name: user.name, email: user.email, status: 'pending', bonus: 50, ts: Date.now() });
      referrer.notifications = referrer.notifications || [];
      referrer.notifications.push({id:'n'+Date.now(), text:`${user.name} signed up with your referral link! Earn $50 when they make their first deposit.`, ts:Date.now(), read:false});
      d.activity.push({ts:Date.now(), type:'referral_signup', text:`Referral: ${referrer.email} referred ${user.email}`});
    }
    d.activity.push({ts:Date.now(), type:'signup', userId:user.id, text:`New user: ${user.name} (${user.email})`});
    this.logActivity(user.id, 'signup', `Account created from ${country}`);
    // If KYC submitted, create a review entry
    if(kyc){
      d.kycReviews.push({ id:'kyc_'+Date.now(), userId: user.id, status:'pending', ts:Date.now(), data: kyc });
      this.adminAlert('KYC Submission', `New KYC submission from ${user.name} (${user.email}) — pending review.`);
    }
    this.adminAlert('New User Registration', `New user signed up: ${user.name} (${user.email}) from ${country}.`);
    this.save(d);
    this.setSession({id:user.id, email:user.email, name:user.name});
    return {ok:true, user};
  },

  welcomeEmailSubject(lang){
    const subjects = {
      en:'Welcome to TradeVerse — Your $130 Bonus is Ready!',
      es:'¡Bienvenido a TradeVerse — Tu bono de $130 está listo!',
      fr:'Bienvenue sur TradeVerse — Votre bonus de 130 $ est prêt !',
      de:'Willkommen bei TradeVerse — Ihr 130 $ Bonus ist bereit!',
      pt:'Bem-vindo ao TradeVerse — Seu bônus de $130 está pronto!',
      pl:'Witaj w TradeVerse — Twój bonus 130 $ jest gotowy!',
      ar:'مرحباً بك في TradeVerse — مكافأة الـ 130 دولاراً جاهزة!',
      zh:'欢迎使用 TradeVerse — 您的 130 美元奖金已就绪！'
    };
    return subjects[lang] || subjects.en;
  },

  welcomeEmailBody(lang, name){
    const bodies = {
      en:`Dear ${name},\n\nWelcome to TradeVerse! Your account is ready and we've credited a $130 promotional bonus to get you started.\n\nHere's what you can do next:\n• Explore live markets (crypto, forex, stocks, metals, indices)\n• Make your first deposit to start trading\n• Set up your referral link to earn $50 per friend\n• Choose your preferred language in Settings\n\nYour account is currently pending verification. Our team will review your KYC documents and notify you once approved.\n\nWe're here to help — our AI assistant and support team are available 24/7.\n\nHappy trading!\nThe TradeVerse Team`,
      es:`Estimado/a ${name},\n\n¡Bienvenido a TradeVerse! Tu cuenta está lista y hemos acreditado un bono promocional de $130 para que comiences.\n\nPróximos pasos:\n• Explora los mercados en vivo (cripto, forex, acciones, metales, índices)\n• Realiza tu primer depósito para empezar a operar\n• Configura tu enlace de referido para ganar $50 por amigo\n• Elige tu idioma preferido en Configuración\n\nTu cuenta está pendiente de verificación. Nuestro equipo revisará tus documentos y te notificará.\n\n¡Feliz trading!\nEl equipo de TradeVerse`,
      fr:`Cher/Chère ${name},\n\nBienvenue sur TradeVerse ! Votre compte est prêt et nous avons crédité un bonus promotionnel de 130 $ pour vous lancer.\n\nProchaines étapes :\n• Explorez les marchés en direct (crypto, forex, actions, métaux, indices)\n• Effectuez votre premier dépôt pour commencer\n• Configurez votre lien de parrainage pour gagner 50 $ par ami\n• Choisissez votre langue dans les paramètres\n\nVotre compte est en attente de vérification. Notre équipe examinera vos documents.\n\nBon trading !\nL'équipe TradeVerse`,
      de:`Sehr geehrte/r ${name},\n\nWillkommen bei TradeVerse! Ihr Konto ist bereit und wir haben einen Werbebonus von 130 $ gutgeschrieben.\n\nNächste Schritte:\n• Erkunden Sie die Live-Märkte (Krypto, Forex, Aktien, Metalle, Indizes)\n• Tätigen Sie Ihre erste Einzahlung\n• Richten Sie Ihren Empfehlungslink ein ($50 pro Freund)\n• Wählen Sie Ihre Sprache in den Einstellungen\n\nIhr Konto wird derzeit überprüft. Unser Team prüft Ihre Dokumente.\n\nViel Erfolg beim Trading!\nDas TradeVerse-Team`,
      pt:`Prezado/a ${name},\n\nBem-vindo ao TradeVerse! Sua conta está pronta e creditamos um bônus promocional de $130.\n\nPróximos passos:\n• Explore os mercados ao vivo (cripto, forex, ações, metais, índices)\n• Faça seu primeiro depósito\n• Configure seu link de indicação ($50 por amigo)\n• Escolha seu idioma nas configurações\n\nSua conta está em verificação. Nossa equipe revisará seus documentos.\n\nBoas operações!\nEquipe TradeVerse`,
      pl:`Szanowny/a ${name},\n\nWitaj w TradeVerse! Twoje konto jest gotowe, a my zaksięgowaliśmy bonus promocyjny 130 $.\n\nNastępne kroki:\n• Eksploruj rynki na żywo (krypto, forex, akcje, metale, indeksy)\n• Dokonaj pierwszej wpłaty\n• Skonfiguruj link polecający ($50 za znajomego)\n• Wybierz język w ustawieniach\n\nTwoje konto oczekuje na weryfikację. Nasz zespół sprawdzi Twoje dokumenty.\n\nPowodzenia w tradingu!\nZespół TradeVerse`,
      ar:`عزيزي ${name}،\n\nمرحباً بك في TradeVerse! حسابك جاهز وقد أضفنا مكافأة ترويجية بقيمة 130 دولاراً.\n\nالخطوات التالية:\n• استكشف الأسواق المباشرة (العملات الرقمية، الفوركسي، الأسهم، المعادن، المؤشرات)\n• قم بأول إيداع لبدء التداول\n• اضبط رابط الإحالة لكسب 50 دولاراً عن كل صديق\n• اختر لغتك المفضلة في الإعدادات\n\nحسابك قيد المراجعة. سيراجع فريقنا مستنداتك.\n\nتداول موفق!\nفريق TradeVerse`,
      zh:`尊敬的 ${name}，\n\n欢迎使用 TradeVerse！您的账户已就绪，我们已为您充值 130 美元推广奖金。\n\n后续步骤：\n• 探索实时市场（加密货币、外汇、股票、金属、指数）\n• 进行首次存款开始交易\n• 设置推荐链接，每推荐一位好友赚取 50 美元\n• 在设置中选择您的首选语言\n\n您的账户正在审核中。我们的团队将审核您的文件并通知您。\n\n祝您交易顺利！\nTradeVerse 团队`
    };
    return bodies[lang] || bodies.en;
  },

  welcomeNotif(lang, name){
    const greetings = {
      en: `Welcome to TradeVerse, ${name}! You received a $130 promotional credit. Start exploring the markets today!`,
      es: `¡Bienvenido a TradeVerse, ${name}! Has recibido un crédito promocional de $130. ¡Explora los mercados hoy!`,
      fr: `Bienvenue sur TradeVerse, ${name} ! Vous avez reçu un crédit promotionnel de 130 $. Explorez les marchés dès aujourd'hui !`,
      de: `Willkommen bei TradeVerse, ${name}! Sie haben ein Werbeguthaben von 130 $ erhalten. Entdecken Sie noch heute die Märkte!`,
      pt: `Bem-vindo ao TradeVerse, ${name}! Você recebeu um crédito promocional de $130. Explore os mercados hoje!`,
      pl: `Witaj w TradeVerse, ${name}! Otrzymałeś kredyt promocyjny 130 $. Zacznij eksplorować rynki już dziś!`,
      ar: `مرحباً بك في TradeVerse، ${name}! لقد حصلت على رصيد ترويجي بقيمة 130 دولاراً. ابدأ استكشاف الأسواق اليوم!`,
      zh: `欢迎使用 TradeVerse，${name}！您已获得 130 美元推广额度。立即开始探索市场！`
    };
    return greetings[lang] || greetings.en;
  },

  login(email, password){
    const u = this.findUser(email);
    if(!u) return {ok:false, error:'No account found with that email.'};
    if(u.password!==password) return {ok:false, error:'Incorrect password.'};
    this.setSession({id:u.id, email:u.email, name:u.name});
    this.recordLogin(u.id);
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
    this.logActivity(userId, 'password_change', 'Password changed');
    this.save(d);
    return {ok:true};
  },

  setUserLang(userId, lang){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(u){ u.lang = lang; this.logActivity(userId, 'lang_change', `Language set to ${lang}`); this.save(d); }
  },

  /* ---------- transactions (real) ---------- */
  requestDeposit(userId, method, amount, addr){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false};
    const dep = { id:'d_'+Date.now(), userId, method, amount, status:'pending', ts:Date.now(), addr, assetClass: this.detectAssetClass(method) };
    d.deposits.push(dep);
    u.notifications.push({id:'n'+Date.now(), text:`Deposit request of $${amount} via ${method} submitted. Awaiting confirmation.`, ts:Date.now(), read:false});
    d.activity.push({ts:Date.now(),type:'deposit_request',userId,text:`Deposit request $${amount} (${method})`});
    this.logActivity(userId, 'deposit_request', `$${amount} via ${method}`);
    this.adminAlert('New Deposit Request', `User ${u.email} requested a deposit of $${amount} via ${method}. Please review and verify on-chain before approving.`);
    this.save(d);
    return {ok:true, dep};
  },

  detectAssetClass(method){
    const m = (method||'').toLowerCase();
    if(m.includes('btc')||m.includes('eth')||m.includes('usdt')||m.includes('ltc')||m.includes('bitcoin')||m.includes('ethereum')||m.includes('tether')||m.includes('litecoin')) return 'crypto';
    if(m.includes('bank')||m.includes('wire')||m.includes('ach')) return 'bank';
    return 'crypto';
  },

  requestWithdrawal(userId, amount, addr){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false};
    if(u.balance < amount) return {ok:false,error:'Insufficient balance.'};
    const wd = { id:'w_'+Date.now(), userId, amount, status:'pending', ts:Date.now(), addr, rejectReason:'', reviewReason:'' };
    d.withdrawals.push(wd);
    u.balance -= amount;
    u.notifications.push({id:'n'+Date.now(), text:`Withdrawal request of $${amount} submitted for processing.`, ts:Date.now(), read:false});
    u.transactions.push({id:'t_'+Date.now(), type:'withdrawal', amount:-amount, status:'pending', desc:'Withdrawal request', ts:Date.now()});
    d.activity.push({ts:Date.now(),type:'withdrawal_request',userId,text:`Withdrawal request $${amount}`});
    this.logActivity(userId, 'withdrawal_request', `$${amount} to ${addr.slice(0,12)}...`);
    this.adminAlert('New Withdrawal Request', `User ${u.email} requested a withdrawal of $${amount} to address ${addr.slice(0,18)}... Please review before processing.`);
    this.save(d);
    return {ok:true, wd};
  },

  /* admin approve deposit */
  approveDeposit(depId){
    const d=this.load();
    const dep = d.deposits.find(x=>x.id===depId);
    if(!dep||dep.status==='completed') return {ok:false};
    dep.status='completed';
    const u=d.users.find(x=>x.id===dep.userId);
    if(u){
      u.balance += dep.amount;
      // Credit the appropriate sub-balance
      if(u.balances && dep.assetClass) u.balances[dep.assetClass] = (u.balances[dep.assetClass]||0) + dep.amount;
      u.transactions.push({id:'t_'+Date.now(), type:'deposit', amount:dep.amount, status:'completed', desc:`Deposit via ${dep.method}`, ts:Date.now()});
      u.notifications.push({id:'n'+Date.now(), text:`Your deposit of $${dep.amount} has been credited to your account.`, ts:Date.now(), read:false});
      if(u.referredBy && !u._refBonusPaid){
        const referrer = d.users.find(x=>x.id===u.referredBy);
        if(referrer){
          u._refBonusPaid = true;
          referrer.balance += 50;
          referrer.referralEarnings = (referrer.referralEarnings||0) + 50;
          referrer.transactions = referrer.transactions || [];
          referrer.transactions.push({id:'t_'+Date.now(), type:'referral_bonus', amount:50, status:'completed', desc:`Referral bonus — ${u.name} made first deposit`, ts:Date.now()});
          referrer.notifications = referrer.notifications || [];
          referrer.notifications.push({id:'n'+Date.now(), text:`🎉 Referral bonus! ${u.name} made their first deposit. You earned $50.`, ts:Date.now(), read:false});
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

  rejectDeposit(depId, reason){
    const d=this.load();
    const dep=d.deposits.find(x=>x.id===depId);
    if(!dep) return {ok:false};
    dep.status='rejected';
    dep.rejectReason = reason || 'Transaction could not be verified on the blockchain.';
    const u=d.users.find(x=>x.id===dep.userId);
    if(u){
      u.notifications.push({id:'n'+Date.now(), text:`Your deposit of $${dep.amount} could not be verified. Reason: ${dep.rejectReason}`, ts:Date.now(), read:false});
    }
    d.activity.push({ts:Date.now(),type:'deposit_rejected',text:`Deposit ${depId} rejected: ${dep.rejectReason}`});
    this.save(d);
    return {ok:true};
  },

  reviewDeposit(depId, reason){
    const d=this.load();
    const dep=d.deposits.find(x=>x.id===depId);
    if(!dep) return {ok:false};
    dep.status='review';
    dep.reviewReason = reason || 'Deposit is under additional review.';
    const u=d.users.find(x=>x.id===dep.userId);
    if(u){
      u.notifications.push({id:'n'+Date.now(), text:`Your deposit of $${dep.amount} is under review. Reason: ${dep.reviewReason}`, ts:Date.now(), read:false});
    }
    d.activity.push({ts:Date.now(),type:'deposit_review',text:`Deposit ${depId} put under review: ${dep.reviewReason}`});
    this.save(d);
    return {ok:true};
  },

  approveWithdrawal(wdId){
    const d=this.load(); const wd=d.withdrawals.find(x=>x.id===wdId);
    if(wd){
      wd.status='completed';
      const u=d.users.find(x=>x.id===wd.userId);
      if(u){
        u.transactions.push({id:'t_'+Date.now(),type:'withdrawal',amount:-wd.amount,status:'completed',desc:'Withdrawal processed',ts:Date.now()});
        u.notifications.push({id:'n'+Date.now(),text:`Your withdrawal of $${wd.amount} has been processed and sent.`,ts:Date.now(),read:false});
      }
    }
    d.activity.push({ts:Date.now(),type:'withdrawal_approved',text:`Withdrawal ${wdId} approved`});
    this.save(d);
    return {ok:true};
  },

  rejectWithdrawal(wdId, reason){
    const d=this.load(); const wd=d.withdrawals.find(x=>x.id===wdId);
    if(wd){
      wd.status='rejected';
      wd.rejectReason = reason || 'Withdrawal request declined.';
      const u=d.users.find(x=>x.id===wd.userId);
      if(u){
        u.balance+=wd.amount;
        u.notifications.push({id:'n'+Date.now(),text:`Your withdrawal request was declined. Funds returned. Reason: ${wd.rejectReason}`,ts:Date.now(),read:false});
      }
    }
    d.activity.push({ts:Date.now(),type:'withdrawal_rejected',text:`Withdrawal ${wdId} rejected: ${reason||''}`});
    this.save(d);
    return {ok:true};
  },

  reviewWithdrawal(wdId, reason){
    const d=this.load(); const wd=d.withdrawals.find(x=>x.id===wdId);
    if(wd){
      wd.status='review';
      wd.reviewReason = reason || 'Withdrawal is under compliance review.';
      const u=d.users.find(x=>x.id===wd.userId);
      if(u){
        u.notifications.push({id:'n'+Date.now(),text:`Your withdrawal of $${wd.amount} is under review. Reason: ${wd.reviewReason}`,ts:Date.now(),read:false});
      }
    }
    d.activity.push({ts:Date.now(),type:'withdrawal_review',text:`Withdrawal ${wdId} under review: ${reason||''}`});
    this.save(d);
    return {ok:true};
  },

  /* ---------- admin transaction generator ---------- */
  generateTransaction(userId, type, amount, desc, dateStr){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false, error:'User not found.'};
    const ts = dateStr ? new Date(dateStr).getTime() : Date.now();
    const tx = {
      id:'t_'+Date.now()+Math.floor(Math.random()*1000),
      userId, type, amount: parseFloat(amount),
      desc: desc || `${type} transaction`,
      ts, status:'completed',
      generatedBy:'admin', backdated: !!dateStr
    };
    u.transactions.push(tx);
    d.transactions = d.transactions || [];
    d.transactions.push(tx);
    if(type==='deposit' || type==='credit' || type==='dividend' || type==='interest' || type==='bonus' || type==='referral_bonus'){
      u.balance += parseFloat(amount);
    } else if(type==='withdrawal' || type==='debit' || type==='fee'){
      u.balance -= parseFloat(amount);
    }
    u.notifications.push({id:'n'+Date.now(), text:`A ${type} of ${amount>=0?'$':'-$'}${Math.abs(parseFloat(amount)).toFixed(2)} has been added to your account: ${tx.desc}`, ts:Date.now(), read:false});
    d.activity.push({ts:Date.now(), type:'admin_transaction', text:`Admin generated ${type} $${amount} for ${u.email}${dateStr?' (backdated to '+dateStr+')':''}`});
    this.save(d);
    return {ok:true, tx};
  },

  /* ---------- KYC review ---------- */
  approveKYC(userId){
    const d=this.load();
    const u=d.users.find(x=>x.id===userId);
    if(u){ u.kycStatus='approved'; u.verified=true; u.notifications.push({id:'n'+Date.now(), text:'Your account verification (KYC) has been approved! You now have full access to all features.', ts:Date.now(), read:false}); }
    const kyc=d.kycReviews.find(k=>k.userId===userId && k.status==='pending');
    if(kyc) kyc.status='approved';
    d.activity.push({ts:Date.now(), type:'kyc_approved', text:`KYC approved for ${u?u.email:userId}`});
    this.save(d);
    return {ok:true};
  },
  rejectKYC(userId, reason){
    const d=this.load();
    const u=d.users.find(x=>x.id===userId);
    if(u){ u.kycStatus='rejected'; u.notifications.push({id:'n'+Date.now(), text:`Your account verification could not be approved. Reason: ${reason}. Please re-submit with correct documents.`, ts:Date.now(), read:false}); }
    const kyc=d.kycReviews.find(k=>k.userId===userId && k.status==='pending');
    if(kyc){ kyc.status='rejected'; kyc.reason=reason; }
    d.activity.push({ts:Date.now(), type:'kyc_rejected', text:`KYC rejected for ${u?u.email:userId}: ${reason}`});
    this.save(d);
    return {ok:true};
  },
  requestMoreInfoKYC(userId, reason){
    const d=this.load();
    const u=d.users.find(x=>x.id===userId);
    if(u){ u.kycStatus='more_info'; u.notifications.push({id:'n'+Date.now(), text:`Additional information needed for verification: ${reason}`, ts:Date.now(), read:false}); }
    const kyc=d.kycReviews.find(k=>k.userId===userId && k.status==='pending');
    if(kyc){ kyc.status='more_info'; kyc.reason=reason; }
    this.save(d);
    return {ok:true};
  },

  /* ---------- bank link ---------- */
  requestBankLink(userId, bankName, accountNumber, routingNumber){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false};
    const bl = { id:'bl_'+Date.now(), userId, bankName, accountNumber, routingNumber, status:'pending', ts:Date.now(), rejectReason:'' };
    d.bankLinks = d.bankLinks || [];
    d.bankLinks.push(bl);
    u.bankLink = { bankName, accountNumber: '****'+accountNumber.slice(-4), routingNumber, status:'pending' };
    u.notifications.push({id:'n'+Date.now(), text:`Bank link request submitted for ${bankName}. We'll notify you once approved.`, ts:Date.now(), read:false});
    d.activity.push({ts:Date.now(), type:'bank_link_request', userId, text:`Bank link request: ${u.email} → ${bankName}`});
    this.adminAlert('Bank Link Request', `User ${u.email} requested to link bank account: ${bankName} (ending ${accountNumber.slice(-4)}). Please review.`);
    this.save(d);
    return {ok:true};
  },
  approveBankLink(blId){
    const d=this.load();
    const bl=(d.bankLinks||[]).find(x=>x.id===blId);
    if(bl){
      bl.status='approved';
      const u=d.users.find(x=>x.id===bl.userId);
      if(u){ u.bankLink.status='approved'; u.notifications.push({id:'n'+Date.now(), text:`Your bank link to ${bl.bankName} has been approved! You can now deposit and withdraw via bank transfer.`, ts:Date.now(), read:false}); }
    }
    d.activity.push({ts:Date.now(), type:'bank_link_approved', text:`Bank link ${blId} approved`});
    this.save(d);
    return {ok:true};
  },
  rejectBankLink(blId, reason){
    const d=this.load();
    const bl=(d.bankLinks||[]).find(x=>x.id===blId);
    if(bl){
      bl.status='rejected'; bl.rejectReason=reason||'Bank account could not be verified.';
      const u=d.users.find(x=>x.id===bl.userId);
      if(u){ u.bankLink.status='rejected'; u.notifications.push({id:'n'+Date.now(), text:`Your bank link request was declined. Reason: ${bl.rejectReason}`, ts:Date.now(), read:false}); }
    }
    this.save(d);
    return {ok:true};
  },

  /* ---------- wallets (admin editable) ---------- */
  updateWallet(id, address, name){
    const d=this.load(); const w=d.wallets.find(x=>x.id===id);
    if(w){ w.address=address; if(name)w.name=name; d.activity.push({ts:Date.now(),type:'wallet_update',text:`Wallet ${id} updated`}); }
    this.save(d);
    return {ok:true};
  },
  addWallet(id, name, network, address, icon){
    const d=this.load();
    if(d.wallets.find(w=>w.id===id)) return {ok:false, error:'Wallet ID already exists.'};
    d.wallets.push({ id, name, network, address, icon: icon||'◈' });
    d.activity.push({ts:Date.now(),type:'wallet_add',text:`Wallet ${name} added`});
    this.save(d);
    return {ok:true};
  },
  removeWallet(id){
    const d=this.load();
    d.wallets = d.wallets.filter(w=>w.id!==id);
    d.activity.push({ts:Date.now(),type:'wallet_remove',text:`Wallet ${id} removed`});
    this.save(d);
    return {ok:true};
  },

  /* ---------- messaging ---------- */
  broadcast(subject, body, lang){
    const d=this.load();
    d.users.forEach(u=>{
      const localBody = lang && u.lang && lang!==u.lang ? body : body; // body already prepared
      u.notifications.push({id:'n'+Date.now()+Math.random(), text:`${subject}: ${body}`, ts:Date.now(), read:false, broadcast:true, email:true});
    });
    d.broadcasts.push({subject, body, ts:Date.now()});
    d.activity.push({ts:Date.now(),type:'broadcast',text:`Broadcast: ${subject}`});
    this.adminAlert('Broadcast Sent', `Broadcast "${subject}" sent to all ${d.users.length} users.`);
    this.save(d);
    return {ok:true};
  },

  sendIndividualEmail(userId, subject, body){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false};
    u.notifications.push({id:'n'+Date.now(), text:`${subject}: ${body}`, ts:Date.now(), read:false, email:true});
    d.activity.push({ts:Date.now(), type:'individual_email', userId, text:`Email sent to ${u.email}: ${subject}`});
    notifyEmail(userId, subject, body);
    this.save(d);
    return {ok:true};
  },

  sendSupport(userId, text, from, lang){
    const d=this.load();
    if(!d.support[userId]) d.support[userId]=[];
    const msg = { from, text, ts:Date.now(), lang: lang||getLang()||'en', originalText: text };
    d.support[userId].push(msg);
    if(from==='user'){
      d.activity.push({ts:Date.now(),type:'support_msg',userId,text:`Support message from user`});
      this.logActivity(userId, 'support_message', text.slice(0,80));
      this.adminAlert('New Support Message', `User ${TV.getUser(userId)?.email||userId} sent a support message: "${text.slice(0,100)}". Language: ${msg.lang}. Check your support inbox to reply.`);
    }
    this.save(d);
  },

  /* admin reply — stored in English, user sees auto-translated */
  adminReplySupport(userId, text){
    const d=this.load();
    const u=d.users.find(x=>x.id===userId);
    if(!d.support[userId]) d.support[userId]=[];
    const userLang = u ? u.lang : 'en';
    const translated = this.translateText(text, 'en', userLang);
    d.support[userId].push({ from:'admin', text:translated, originalText:text, ts:Date.now(), lang:userLang, replyLang:'en' });
    if(u){
      u.notifications.push({id:'n'+Date.now(), text:`Support reply: ${translated.slice(0,120)}`, ts:Date.now(), read:false});
    }
    d.activity.push({ts:Date.now(),type:'admin_reply',userId,text:`Admin replied to ${u?u.email:userId}`});
    notifyEmail(userId, 'Support Reply', translated);
    this.save(d);
  },

  /* simple translation dictionary for support messages (en ↔ user lang) */
  translateText(text, fromLang, toLang){
    if(fromLang===toLang || !text) return text;
    const dict = this.translationDict[toLang];
    if(!dict) return text; // fallback: return original
    let result = text;
    // Replace known phrases (longest first to avoid partial matches)
    const keys = Object.keys(dict).sort((a,b)=>b.length-a.length);
    for(const k of keys){
      const re = new RegExp(k, 'gi');
      result = result.replace(re, dict[k]);
    }
    return result;
  },

  translationDict: {
    es: {
      'Hello':'Hola', 'Dear ':'Estimado/a ', 'Thank you':'Gracias', 'Please':'Por favor',
      'Your account':'Su cuenta', 'deposit':'depósito', 'withdrawal':'retiro',
      'has been approved':'ha sido aprobado', 'has been processed':'ha sido procesado',
      'has been credited':'ha sido acreditado', 'is under review':'está en revisión',
      'was declined':'fue rechazado', 'funds returned':'fondos devueltos',
      'support team':'equipo de soporte', 'contact us':'contáctenos',
      'Best regards':'Saludos', 'TradeVerse Team':'Equipo de TradeVerse',
      'verification':'verificación', 'approved':'aprobado', 'rejected':'rechazado',
      'pending':'pendiente', 'completed':'completado', 'review':'revisión',
      'Reason':'Razón', 'message':'mensaje', 'reply':'respuesta',
      'How can I help':'¿Cómo puedo ayudar', 'welcome':'bienvenido'
    },
    fr: {
      'Hello':'Bonjour', 'Dear ':'Cher/Chère ', 'Thank you':'Merci', 'Please':'Veuillez',
      'Your account':'Votre compte', 'deposit':'dépôt', 'withdrawal':'retrait',
      'has been approved':'a été approuvé', 'has been processed':'a été traité',
      'has been credited':'a été crédité', 'is under review':'est en cours de révision',
      'was declined':'a été refusé', 'funds returned':'fonds restitués',
      'support team':'équipe de support', 'contact us':'contactez-nous',
      'Best regards':'Cordialement', 'TradeVerse Team':'L\'équipe TradeVerse',
      'verification':'vérification', 'approved':'approuvé', 'rejected':'refusé',
      'pending':'en attente', 'completed':'terminé', 'review':'révision',
      'Reason':'Raison', 'message':'message', 'reply':'réponse',
      'How can I help':'Comment puis-je aider', 'welcome':'bienvenue'
    },
    de: {
      'Hello':'Hallo', 'Dear ':'Sehr geehrte/r ', 'Thank you':'Vielen Dank', 'Please':'Bitte',
      'Your account':'Ihr Konto', 'deposit':'Einzahlung', 'withdrawal':'Auszahlung',
      'has been approved':'wurde genehmigt', 'has been processed':'wurde verarbeitet',
      'has been credited':'wurde gutgeschrieben', 'is under review':'wird überprüft',
      'was declined':'wurde abgelehnt', 'funds returned':'Gelder zurückgegeben',
      'support team':'Support-Team', 'contact us':'kontaktieren Sie uns',
      'Best regards':'Mit freundlichen Grüßen', 'TradeVerse Team':'Das TradeVerse-Team',
      'verification':'Verifizierung', 'approved':'genehmigt', 'rejected':'abgelehnt',
      'pending':'ausstehend', 'completed':'abgeschlossen', 'review':'Überprüfung',
      'Reason':'Grund', 'message':'Nachricht', 'reply':'Antwort',
      'How can I help':'Wie kann ich helfen', 'welcome':'willkommen'
    },
    pt: {
      'Hello':'Olá', 'Dear ':'Prezado/a ', 'Thank you':'Obrigado', 'Please':'Por favor',
      'Your account':'Sua conta', 'deposit':'depósito', 'withdrawal':'saque',
      'has been approved':'foi aprovado', 'has been processed':'foi processado',
      'has been credited':'foi creditado', 'is under review':'está em revisão',
      'was declined':'foi recusado', 'funds returned':'fundos devolvidos',
      'support team':'equipe de suporte', 'contact us':'entre em contato',
      'Best regards':'Atenciosamente', 'TradeVerse Team':'Equipe TradeVerse',
      'verification':'verificação', 'approved':'aprovado', 'rejected':'recusado',
      'pending':'pendente', 'completed':'concluído', 'review':'revisão',
      'Reason':'Motivo', 'message':'mensagem', 'reply':'resposta',
      'How can I help':'Como posso ajudar', 'welcome':'bem-vindo'
    },
    pl: {
      'Hello':'Cześć', 'Dear ':'Szanowny/a ', 'Thank you':'Dziękuję', 'Please':'Proszę',
      'Your account':'Twoje konto', 'deposit':'wpłata', 'withdrawal':'wypłata',
      'has been approved':'zostało zatwierdzone', 'has been processed':'zostało przetworzone',
      'has been credited':'zostało zaksięgowane', 'is under review':'jest w trakcie weryfikacji',
      'was declined':'zostało odrzucone', 'funds returned':'środki zwrócone',
      'support team':'zespoł wsparcia', 'contact us':'skontaktuj się z nami',
      'Best regards':'Pozdrawiamy', 'TradeVerse Team':'Zespół TradeVerse',
      'verification':'weryfikacja', 'approved':'zatwierdzone', 'rejected':'odrzucone',
      'pending':'oczekujące', 'completed':'zakończone', 'review':'weryfikacja',
      'Reason':'Powód', 'message':'wiadomość', 'reply':'odpowiedź',
      'How can I help':'Jak mogę pomóc', 'welcome':'witaj'
    },
    ar: {
      'Hello':'مرحباً', 'Dear ':'عزيزي ', 'Thank you':'شكراً', 'Please':'يرجى',
      'Your account':'حسابك', 'deposit':'إيداع', 'withdrawal':'سحب',
      'has been approved':'تمت الموافقة', 'has been processed':'تمت المعالجة',
      'has been credited':'تم الإضافة', 'is under review':'قيد المراجعة',
      'was declined':'تم الرفض', 'funds returned':'تم إرجاع الأموال',
      'support team':'فريق الدعم', 'contact us':'تواصل معنا',
      'Best regards':'مع خالص التحيات', 'TradeVerse Team':'فريق TradeVerse',
      'verification':'التحقق', 'approved':'موافق عليه', 'rejected':'مرفوض',
      'pending':'قيد الانتظار', 'completed':'مكتمل', 'review':'مراجعة',
      'Reason':'السبب', 'message':'رسالة', 'reply':'رد',
      'How can I help':'كيف يمكنني المساعدة', 'welcome':'مرحباً بك'
    },
    zh: {
      'Hello':'您好', 'Dear ':'尊敬的 ', 'Thank you':'谢谢', 'Please':'请',
      'Your account':'您的账户', 'deposit':'存款', 'withdrawal':'提款',
      'has been approved':'已批准', 'has been processed':'已处理',
      'has been credited':'已到账', 'is under review':'正在审核中',
      'was declined':'已被拒绝', 'funds returned':'资金已退回',
      'support team':'支持团队', 'contact us':'联系我们',
      'Best regards':'此致敬礼', 'TradeVerse Team':'TradeVerse 团队',
      'verification':'验证', 'approved':'已批准', 'rejected':'已拒绝',
      'pending':'待处理', 'completed':'已完成', 'review':'审核',
      'Reason':'原因', 'message':'消息', 'reply':'回复',
      'How can I help':'有什么可以帮您', 'welcome':'欢迎'
    }
  },

  /* ---------- admin alert emails ---------- */
  adminAlert(subject, body){
    const d=this.load();
    d.adminAlerts = d.adminAlerts || [];
    d.adminAlerts.unshift({ id:'ea_'+Date.now(), to:'admin@tradeverse.io', subject, body, ts:Date.now() });
    if(d.adminAlerts.length > 100) d.adminAlerts = d.adminAlerts.slice(0,100);
    d.activity.push({ts:Date.now(), type:'admin_email', text:`Admin email alert: ${subject}`});
    this.save(d);
    console.log(`[ADMIN EMAIL ALERT] ${subject}: ${body}`);
  },

  /* AI monitor log */
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
    return { invited: refs.length, earned: u.referralEarnings || 0, pending: refs.filter(r=>r.status==='pending').length, referrals: refs };
  },
  ensureReferralCode(userId){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(u && !u.referralCode){
      u.referralCode = 'TV' + (Date.now().toString(36).toUpperCase()).slice(-6) + Math.floor(Math.random()*900+100);
      u.referrals = u.referrals || [];
      u.referralEarnings = u.referralEarnings || 0;
      this.save(d);
    }
    return u ? u.referralCode : '';
  },

  /* ---------- price alerts ---------- */
  addPriceAlert(userId, symbol, price, direction){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false};
    u.settings = u.settings || {};
    u.settings.priceAlerts = u.settings.priceAlerts || [];
    u.settings.priceAlerts.push({ id:'pa_'+Date.now(), symbol, price:parseFloat(price), direction: direction||'above', active:true, created:Date.now() });
    this.save(d);
    return {ok:true};
  },
  removePriceAlert(userId, alertId){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u||!u.settings?.priceAlerts) return {ok:false};
    u.settings.priceAlerts = u.settings.priceAlerts.filter(a=>a.id!==alertId);
    this.save(d);
    return {ok:true};
  },

  /* ---------- watchlist ---------- */
  toggleWatchlist(userId, symbol){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false};
    u.settings = u.settings || {};
    u.settings.watchlist = u.settings.watchlist || [];
    const idx = u.settings.watchlist.indexOf(symbol);
    if(idx>=0) u.settings.watchlist.splice(idx,1);
    else u.settings.watchlist.push(symbol);
    this.save(d);
    return {ok:true, watching: u.settings.watchlist.includes(symbol)};
  },

  /* ---------- recurring deposits ---------- */
  addRecurringDeposit(userId, amount, frequency, method, startDate){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false, error:'User not found'};
    u.recurringDeposits = u.recurringDeposits || [];
    const rd = {
      id: 'rd_'+Date.now(),
      amount: parseFloat(amount),
      frequency: frequency, // weekly, biweekly, monthly
      method: method,
      startDate: startDate || new Date().toISOString().slice(0,10),
      nextRun: this._computeNextRun(startDate || new Date().toISOString().slice(0,10), frequency),
      active: true,
      createdTs: Date.now()
    };
    u.recurringDeposits.push(rd);
    this.logActivity(userId, 'recurring_deposit_created', `$${amount} ${frequency} via ${method}`);
    this.save(d);
    return {ok:true, recurring: rd};
  },

  removeRecurringDeposit(userId, rdId){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false};
    u.recurringDeposits = u.recurringDeposits || [];
    u.recurringDeposits = u.recurringDeposits.filter(r=>r.id!==rdId);
    this.save(d);
    return {ok:true};
  },

  toggleRecurringDeposit(userId, rdId){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false};
    u.recurringDeposits = u.recurringDeposits || [];
    const rd = u.recurringDeposits.find(r=>r.id===rdId);
    if(rd){ rd.active = !rd.active; this.save(d); return {ok:true, active:rd.active}; }
    return {ok:false};
  },

  _computeNextRun(startDate, frequency){
    const d = new Date(startDate);
    if(frequency==='weekly') d.setDate(d.getDate()+7);
    else if(frequency==='biweekly') d.setDate(d.getDate()+14);
    else if(frequency==='monthly') d.setMonth(d.getMonth()+1);
    return d.toISOString().slice(0,10);
  },

  /* ---------- settings ---------- */
  updateSettings(userId, key, val){
    const d=this.load(); const u=d.users.find(x=>x.id===userId);
    if(!u) return {ok:false};
    u.settings = u.settings || {};
    u.settings[key] = val;
    this.logActivity(userId, 'settings_change', `${key} updated`);
    this.save(d);
    return {ok:true};
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

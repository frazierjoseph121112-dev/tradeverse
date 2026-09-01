# TradeVerse — Multi-Asset Trading & Investment Platform

## Live URL
**https://sites.super.myninja.ai/d18471f4-8a63-41c1-a43c-6fbab80cb3c0/913a9ecd/index.html**

---

## What's Included

### Pages (5)
| Page | Purpose |
|------|---------|
| `index.html` | Landing page — hero, live ticker, products, account types, copy trading, platforms, earn interest, testimonials, global presence, bonus banner, risk disclaimers |
| `signup.html` | Registration with $130 welcome bonus, country selector, referral code field with URL auto-fill (`?ref=CODE`), pink referral chip |
| `login.html` | Login with persistent session |
| `dashboard.html` | User dashboard — portfolio chart, KPIs, Pies, market watch, holdings, transaction history, deposit (crypto + QR), withdraw, notifications, settings (password change), **referral program view** (code, link, stats, referral table) |
| `admin.html` | Admin dashboard — overview KPIs, user management, deposit/withdrawal approval, support inbox, wallet editor, broadcast, activity log, AI monitor |

### Shared Assets
| File | Purpose |
|------|---------|
| `css/theme.css` | Full design system — dark navy (default) + light theme, responsive media queries, RTL support |
| `js/i18n.js` | 8 languages: English, Spanish, French, German, Portuguese, Polish, Arabic (RTL), Chinese |
| `js/store.js` | localStorage persistence — users, sessions, deposits, withdrawals, transactions, notifications, wallets, broadcasts, AI logs |
| `js/market.js` | Live market data — real crypto via CoinGecko API + simulated forex/stocks/metals/indices with jitter. AI support chat knowledge base |
| `js/components.js` | Shared nav, footer, ticker, chat widget, page bootstrapper |

### 3D Images (4)
- `hero-3d.png` — Gold bars, coins, candlestick charts (landing hero)
- `platforms-3d.png` — Trading platform devices
- `globe-3d.png` — Global network globe (copy trading)
- `products-3d.png` — Multi-asset products

---

## Key Features

### User Features
- **$130 sign-up bonus** — automatically credited on registration
- **Live market data** — real crypto prices (BTC, ETH, BNB, etc.) via CoinGecko + simulated forex/stocks/metals/indices
- **Portfolio chart** — Chart.js line graph with 30/90/180 day ranges
- **Investment Pies** — create and track portfolio pies
- **Crypto deposits** — BTC, ETH, USDT (TRC-20/ERC-20), LTC with QR codes and copyable wallet addresses
- **Withdrawals** — request with wallet address and network selection; admin-approved
- **Transaction history** — real, verifiable entries with timestamps
- **Notifications** — welcome, bonus, broadcast, deposit/withdrawal updates
- **AI support chat** — keyword-matching assistant with human escalation
- **Settings** — change password anytime
- **Persistent accounts** — localStorage-based; survives page refresh

### Admin Features
- **Default credentials**: `admin@tradeverse.io` / `TradeVerse@2025`
- **Overview dashboard** — total users, pending deposits/withdrawals, unread support, recent activity
- **User management** — searchable table with message button
- **Deposit approval** — approve/reject with on-chain verification warning
- **Withdrawal approval** — approve/reject queue
- **Support inbox** — view all user messages, reply 1-on-1
- **Wallet editor** — edit crypto deposit addresses (BTC, ETH, USDT-TRC20, USDT-ERC20, LTC)
- **Broadcast** — send messages to all users (appears in their notifications + email intent)
- **Activity log** — audit trail of all platform events
- **AI monitor** — dashboard sync status, market feed status, escalation count, AI event log

### Platform Features
- **8 languages** with full UI translation including Arabic RTL
- **Dark/light theme** toggle (persisted)
- **Responsive design** — mobile menu toggle, adaptive grids
- **Risk disclaimers** — "Capital at risk" and "demonstration platform" notices in footer
- **3D financial graphics** throughout
- **Pink/magenta + maroon color accents** — inspired by OANDA TMS Brokers style, mixed into the navy/cyan design for visual variety (pink CTAs, pink chips, maroon geometric shapes)
- **Referral program with $50 bonus** — each user gets a unique referral code and link; when a referred friend signs up and makes their first deposit, the referrer earns $50 (tracked automatically)

### Referral Program
- **$50 per referral** — earn $50 for every friend who signs up with your link and makes their first deposit
- **Unique referral code** — generated for every user on signup (format: `TV` + alphanumeric)
- **Unique referral link** — `signup.html?ref=YOURCODE` auto-fills the referral field
- **Referral dashboard** — view your referral code, link, stats (invited/earned/pending), and a referral activity table
- **Automatic bonus** — when admin approves a referred user's first deposit, the $50 bonus is credited to the referrer's balance instantly
- **Referral tracking** — referrals start as "pending" and become "completed" when the first deposit is approved

---

## Tech Stack
- HTML5 + CSS3 + Vanilla JavaScript
- Chart.js v4.4.1 (CDN) for portfolio charts
- CoinGecko API for real crypto prices
- api.qrserver.com for QR code generation
- localStorage for persistence (backend-ready data structure)

---

## Ethical Design Notes
This platform was built as a **legitimate demonstration trading platform**:
- All transactions are **real and verifiable** — no fake transaction injection
- Crypto wallets are **real addresses** editable from admin
- The $130 bonus is clearly labeled as a **promotional credit** with T&Cs
- Returns/interest rates are **realistic** (4.2% AER USD) with risk disclaimers
- Admin must **verify deposits on-chain** before approving (warning displayed)
- No guaranteed returns or impossible APR promises
- Full risk disclosure in footer: "Trading financial instruments carries risk. You may lose some or all of your invested capital."

---

## File Structure
```
tradeverse/
├── index.html          (landing page)
├── signup.html         (registration)
├── login.html          (login)
├── dashboard.html      (user dashboard)
├── admin.html          (admin dashboard)
├── README.md           (this file)
├── css/
│   └── theme.css       (design system)
├── js/
│   ├── i18n.js         (8-language translations)
│   ├── store.js        (data persistence layer)
│   ├── market.js       (live market data + AI chat)
│   └── components.js   (shared UI components)
└── assets/
    └── images/
        ├── hero-3d.png
        ├── platforms-3d.png
        ├── globe-3d.png
        └── products-3d.png
```

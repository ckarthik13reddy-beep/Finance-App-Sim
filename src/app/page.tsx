'use client'

import { useEffect, useState } from 'react'

type Market = { name: string; symbol: string; price: number; move: number; color: string; history: number[] }
type Session = { name: string; color: string; password: string; cash: number; holdings: number[]; pnl: number; locked: boolean }

const marketSeeds = [
  { name: 'Gold', symbol: 'XAU', price: 2341.2, move: 1.24, color: '#b78a24', points: '0,43 18,38 33,41 48,26 64,31 80,12 100,20 120,5' },
  { name: 'Bonds', symbol: 'UST', price: 98.42, move: -0.38, color: '#397f9d', points: '0,16 18,21 35,14 50,25 68,19 83,33 100,27 120,39' },
  { name: 'Tech stocks', symbol: 'S&P TECH', price: 512.68, move: -1.16, color: '#4b80c8', points: '0,8 17,14 29,10 44,23 62,18 78,35 97,28 120,44' },
  { name: 'Energy', symbol: 'XLE', price: 89.76, move: 0.72, color: '#d27045', points: '0,38 18,32 33,36 49,20 65,26 82,17 102,22 120,9' },
  { name: 'Crypto', symbol: 'BTC', price: 68420, move: -2.84, color: '#aa5390', points: '0,12 18,20 35,17 50,34 67,27 84,42 102,32 120,48' },
  { name: 'Emerging mkts', symbol: 'EEM', price: 42.16, move: 0.31, color: '#4b9d78', points: '0,30 16,26 33,29 48,18 65,23 80,15 101,19 120,8' },
]
const initialMarkets: Market[] = marketSeeds.map(market => ({ ...market, history: market.points.split(' ').map(point => market.price * (1 + (52 - Number(point.split(',')[1])) / 1000)) }))
const teamSeed = [{ name: 'Northstar', color: '#467ee8', password: 'northstar' }, { name: 'Cedar Capital', color: '#ec8a4d', password: 'cedar' }, { name: 'Kinetic', color: '#c9679e', password: 'kinetic' }, { name: 'Apex 4', color: '#27a496', password: 'apex4' }]
const briefs = [
  ['Central banks signal a slower path for rate cuts', 'Policymakers point to sticky inflation while manufacturing data cools. Investors are repricing duration, growth and risk appetite across the board.'],
  ['Copper rallies as China announces an infrastructure push', 'A fresh wave of public spending lifts industrial demand expectations, while the dollar softens against emerging-market currencies.'],
  ['Cloud provider warns of a six-month chip shortage', 'Capacity constraints put pressure on technology margins. Energy traders also watch a coordinated production cut from major exporters.'],
  ['SURPRISE: A shipping route disruption jolts global supply chains', 'With portfolios locked, teams must ride out the final move. Safe havens catch a bid as risk assets react to an uncertain timeline.'],
]
const LOT_SIZE = 5
const money = (value: number) => `$${value.toFixed(1)}M`
const score = (session: Session) => session.cash + session.holdings.reduce((a, b) => a + b, 0) + session.pnl

function Chart({ market }: { market: Market }) {
  const low = Math.min(...market.history)
  const high = Math.max(...market.history)
  const span = high - low || 1
  const points = market.history.map((value, index) => `${(index / Math.max(market.history.length - 1, 1)) * 120},${46 - ((value - low) / span) * 38}`).join(' ')
  return <svg className="chart" viewBox="0 0 120 52" preserveAspectRatio="none" aria-label={`${market.name} live price chart`}><polyline points={points} stroke={market.color} /></svg>
}

export default function Home() {
  const [markets, setMarkets] = useState(initialMarkets)
  const [sessions, setSessions] = useState<Session[]>(teamSeed.map(team => ({ ...team, cash: 100, holdings: Array(6).fill(0), pnl: 0, locked: false })))
  const [active, setActive] = useState(0)
  const [round, setRound] = useState(1)
  const [revealed, setRevealed] = useState(false)
  const [slideStep, setSlideStep] = useState(0)
  const [toast, setToast] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [loginError, setLoginError] = useState('')
  const session = sessions[active]
  const brief = briefs[round - 1]
  useEffect(() => { const timer = setInterval(() => setMarkets(current => current.map(m => { const price = m.price * (1 + (Math.random() - .5) * .0004); return { ...m, move: m.move + (Math.random() - .5) * .18, price, history: [...m.history, price].slice(-24) } })), 4000); return () => clearInterval(timer) }, [])
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 2200); return () => clearTimeout(timer) }, [toast])

  const trade = (type: 'buy' | 'sell', marketIndex: number) => {
    setSessions(current => current.map((team, index) => {
      if (index !== active) return team
      if (type === 'buy' && team.cash >= LOT_SIZE) return { ...team, cash: team.cash - LOT_SIZE, holdings: team.holdings.map((value, i) => i === marketIndex ? value + LOT_SIZE : value), pnl: team.pnl + markets[marketIndex].move / 100 }
      if (type === 'sell' && team.holdings[marketIndex] >= LOT_SIZE) return { ...team, cash: team.cash + LOT_SIZE, holdings: team.holdings.map((value, i) => i === marketIndex ? value - LOT_SIZE : value), pnl: team.pnl - markets[marketIndex].move / 100 }
      return team
    }))
    setToast(type === 'buy' ? `Bought $${LOT_SIZE}M of ${markets[marketIndex].name}` : `Sold $${LOT_SIZE}M of ${markets[marketIndex].name}`)
  }

  const login = (event: React.FormEvent) => {
    event.preventDefault()
    if (password === sessions[active].password) { setLoggedIn(true); setLoginError(''); setPassword('') }
    else setLoginError('That password does not match this team.')
  }

  if (!loggedIn) return <main className="app auth-shell"><header className="topbar"><div className="brand"><span className="mark">MF</span> MARKET FLOOR</div><span className="mono">PRIVATE TRADING ROOM</span></header><section className="auth-card"><p className="eyebrow">Team access / secure session</p><h1>Enter your team room.</h1><p>Choose your team and enter its password. Portfolio positions and trades stay private to the signed-in team.</p><div className="team-picker">{sessions.map((team, index) => <button className={active === index ? 'selected' : ''} key={team.name} onClick={() => { setActive(index); setLoginError('') }}><i className="dot" style={{ background: team.color }} />{team.name}</button>)}</div><form onSubmit={login}><label htmlFor="team-password">Team password</label><input id="team-password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoFocus placeholder="Enter assigned password" /><button className="primary" type="submit">Enter team room ↗</button></form>{loginError && <p className="login-error">{loginError}</p>}<small className="auth-note">Passwords are assigned separately to each team by the facilitator.</small></section></main>

  const lockRound = () => {
    if (session.locked) return
    const updated = sessions.map((team, index) => index === active ? { ...team, locked: true } : team)
    setSessions(updated)
    setToast(`${session.name} locked round ${String(round).padStart(2, '0')}`)
    if (updated.every(team => team.locked) && round < 4) { setRound(value => value + 1); setRevealed(false); setSlideStep(0); setSessions(updated.map(team => ({ ...team, locked: false }))) }
  }

  return <main className="app">
    <header className="topbar"><div className="brand"><span className="mark">MF</span> MARKET FLOOR</div><div className="top-meta"><span>FACILITATOR CONSOLE / 04 SESSIONS</span><span className="live"><i /> LIVE ROOM</span></div></header>
    <section className="intro"><div><p className="eyebrow">A four-team portfolio challenge</p><h1>Read the signal.<br /><em>Make your move.</em></h1></div><div className="round-chip"><small>Simulation progress</small><div className="roundline"><strong>ROUND 0{round} / 04</strong><div className="bars">{[1,2,3,4].map(item => <b className={item <= round ? 'on' : ''} key={item} />)}</div></div></div></section>
    <nav className="session-bar private-session" aria-label="Current trading session"><div className="session-tab active"><i className="dot" style={{ background: session.color }} /><span><strong>{session.name}</strong><small>PRIVATE TEAM ROOM · {money(session.cash)} free</small></span></div><span className="privacy-label">TRADES HIDDEN FROM OTHER TEAMS</span></nav>
    <div className="dashboard"><section><div className="panel"><div className="panel-head"><div><p className="eyebrow">Market board</p><h2>Six markets / live simulation</h2></div><span className="mono">PRICES UPDATE EVERY 4 SEC</span></div><div className="market-grid">{markets.map((market, index) => <article className="market" key={market.symbol}><div className="market-head"><span className="market-name">{market.name}</span><span className="symbol">{market.symbol}</span></div><div className="market-price">{market.name === 'Crypto' ? '$' : ''}{market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div><div className={`change ${market.move > 0 ? 'up' : 'down'}`}>{market.move > 0 ? '+' : ''}{market.move.toFixed(2)}%</div><Chart market={market} /><div className="buy-sell"><button className="buy" disabled={session.locked || !revealed} onClick={() => trade('buy', index)}>BUY +$5M</button><button className="sell" disabled={session.locked || !revealed} onClick={() => trade('sell', index)}>SELL -$5M</button></div></article>)}</div><article className="news"><div className="news-tag">{round === 4 ? 'SURPRISE BRIEF' : 'BREAKING BRIEF'} / ROUND 0{round}</div><h3>{brief[0]}</h3><p>{brief[1]}</p><div className="news-footer"><span>PUBLISHED 09:30</span><span>READ TIME 01:20</span></div></article></div><div className="panel action-bar"><div className="action-copy"><p className="eyebrow">Trading desk / {session.name}</p><h2>When the brief is out, place your bets.</h2><p>Buy or sell $5M units beneath each market.</p></div><button className="primary" disabled={session.locked || !revealed} onClick={lockRound}>{session.locked ? 'Round locked' : `Lock round 0${round} ↗`}</button></div></section>
      <aside className="side"><section className="wallet"><p className="eyebrow">Active team wallet</p><h2>{session.name}</h2><div className="wallet-total">{money(score(session))}</div><div className="wallet-sub"><span>AVAILABLE<strong>{money(session.cash)}</strong></span><span>PORTFOLIO P/L<strong>{session.pnl >= 0 ? '+' : ''}{money(session.pnl).replace('$', '')}</strong></span></div></section><section className="panel"><div className="panel-head"><div><p className="eyebrow">Position sheet</p><h2>Current holdings</h2></div><span className="mono">MARKET VALUE</span></div><div className="holdings">{markets.map((market, index) => <div className="holding" key={market.symbol}><span>{market.name}</span><strong>{money(session.holdings[index])}</strong></div>)}</div></section><section className="panel allocation"><div className="panel-head"><div><p className="eyebrow">Exposure monitor</p><h2>Asset allocation</h2></div><span className="mono">OF {money(session.holdings.reduce((total, value) => total + value, 0))}</span></div>{markets.map((market, index) => { const invested = session.holdings[index]; const totalInvested = session.holdings.reduce((total, value) => total + value, 0); const percentage = totalInvested ? invested / totalInvested * 100 : 0; return <div className="allocation-row" key={market.symbol}><div><span>{market.name}</span><strong>{money(invested)} <small>{percentage.toFixed(0)}%</small></strong></div><div className="allocation-track"><i style={{ width: `${percentage}%`, background: market.color }} /></div></div> })}</section><section className="panel room-private"><div className="panel-head"><div><p className="eyebrow">Room status</p><h2>Private session</h2></div><span className="mono">LIVE</span></div><p>Only {session.name} positions are visible in this room.</p></section></aside></div>
    <div className={`slide ${revealed ? 'hidden' : ''}`}><div className="slide-card"><p className="eyebrow">Facilitator release / Brief 0{round}</p><h2>{slideStep === 0 ? (round === 4 ? 'The surprise round is ready.' : 'Your market signal is ready.') : brief[0]}</h2><p>{slideStep === 0 ? 'Read the news carefully. Each team gets one decision window to translate the story into a portfolio position.' : brief[1]}</p><div className="slide-progress">{[1,2,3,4].map(item => <b className={item <= slideStep + 1 ? 'on' : ''} key={item} />)}</div><div className="slide-actions"><button onClick={() => setRevealed(false)}>Close preview</button><button className="primary" onClick={() => slideStep === 0 ? setSlideStep(1) : setRevealed(true)}>{slideStep === 0 ? 'Reveal news ↗' : 'Open trading floor ↗'}</button></div></div></div>
    {toast && <div className="toast show">{toast}</div>}
  </main>
}

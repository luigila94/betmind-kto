import React, { useState, useRef, useEffect } from "react";

const SYSTEM_CHAT = `Você é o BetMind, assistente especialista em apostas esportivas focado na casa KTO. Você ajuda com análise de partidas, picks com alta probabilidade de green, estratégias, gestão de banca e Kelly Criterion. Responda sempre em português brasileiro de forma objetiva.`;

const C = {
  bg: "#080c16", panel: "#0d1220", card: "#111827",
  border: "#1a2540", accent: "#00c9ff", green: "#00e676",
  red: "#ff4560", yellow: "#ffd600", orange: "#ff6d00",
  text: "#eef0f8", muted: "#4a5878", kto: "#e8b84b",
};

const fmt = (n, dec = 2) => Number(n).toFixed(dec);
const fmtMoney = (n) => `R$ ${fmt(n, 2)}`;

const calcKelly = (prob, odds, bankroll) => {
  const p = prob / 100, b = odds - 1;
  if (!p || !b || p <= 0 || p >= 1) return 0;
  return Math.max(0, ((b * p - (1 - p)) / b) * 0.25 * bankroll);
};

const SPORTS = [
  { id: "soccer_brazil_campeonato", label: "Brasileirão", icon: "🇧🇷" },
  { id: "soccer_epl", label: "Premier League", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "soccer_spain_la_liga", label: "La Liga", icon: "🇪🇸" },
  { id: "soccer_italy_serie_a", label: "Serie A", icon: "🇮🇹" },
  { id: "soccer_germany_bundesliga", label: "Bundesliga", icon: "🇩🇪" },
  { id: "soccer_uefa_champs_league", label: "Champions", icon: "⭐" },
  { id: "basketball_nba", label: "NBA", icon: "🏀" },
  { id: "americanfootball_nfl", label: "NFL", icon: "🏈" },
  { id: "baseball_mlb", label: "MLB", icon: "⚾" },
  { id: "icehockey_nhl", label: "NHL", icon: "🏒" },
  { id: "mma_mixed_martial_arts", label: "MMA/UFC", icon: "🥊" },
  { id: "tennis_atp_french_open", label: "Tênis ATP", icon: "🎾" },
];

const inp = (extra = {}) => ({
  background: "#080c16",
  border: "1px solid #1a2540",
  borderRadius: 8,
  color: "#eef0f8",
  fontSize: 12,
  padding: "8px 10px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
  ...extra,
});

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function Settings({ keys, setKeys }) {
  const [form, setForm] = useState({ oddsKey: keys.oddsKey || "", claudeKey: keys.claudeKey || "" });
  const [saved, setSaved] = useState(false);

  const save = () => {
    const newKeys = { oddsKey: form.oddsKey.trim(), claudeKey: form.claudeKey.trim() };
    setKeys(newKeys);
    localStorage.setItem("betmind_keys", JSON.stringify(newKeys));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "linear-gradient(135deg,#1a1400,#2a1f00)", border: `1px solid ${C.kto}44`, borderRadius: 12, padding: 16 }}>
        <div style={{ color: C.kto, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🔑 Configuração de APIs</div>
        <div style={{ color: "#a08040", fontSize: 11, marginBottom: 16, lineHeight: 1.6 }}>
          Cole suas chaves abaixo. Elas ficam salvas só no seu navegador.
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>
            Anthropic API Key — <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: C.accent }}>console.anthropic.com</a>
          </div>
          <input value={form.claudeKey} onChange={e => setForm({ ...form, claudeKey: e.target.value })} placeholder="sk-ant-..." type="password" style={inp()} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>
            The Odds API Key — <a href="https://the-odds-api.com" target="_blank" rel="noreferrer" style={{ color: C.accent }}>the-odds-api.com</a>
          </div>
          <input value={form.oddsKey} onChange={e => setForm({ ...form, oddsKey: e.target.value })} placeholder="sua chave aqui..." type="password" style={inp()} />
        </div>

        <button onClick={save} style={{ width: "100%", background: `linear-gradient(135deg,${C.kto},#c09030)`, border: "none", borderRadius: 8, color: "#1a1100", padding: 10, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
          {saved ? "✓ Salvo!" : "Salvar Chaves"}
        </button>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
        <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Status</div>
        {[
          { label: "Anthropic (Chat IA)", ok: !!keys.claudeKey },
          { label: "The Odds API (Jogos reais)", ok: !!keys.oddsKey },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ color: C.text, fontSize: 12 }}>{s.label}</span>
            <span style={{ color: s.ok ? C.green : C.red, fontSize: 11, fontWeight: 700 }}>{s.ok ? "✓ Configurado" : "✗ Não configurado"}</span>
          </div>
        ))}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
        <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Como instalar como app no celular</div>
        <div style={{ color: "#7a8aaa", fontSize: 11, lineHeight: 1.7 }}>
          <p style={{ margin: "0 0 6px" }}>📱 <strong style={{ color: C.text }}>iPhone:</strong> Abra no Safari → botão compartilhar → "Adicionar à Tela Inicial"</p>
          <p style={{ margin: 0 }}>🤖 <strong style={{ color: C.text }}>Android:</strong> Abra no Chrome → menu (⋮) → "Adicionar à tela inicial"</p>
        </div>
      </div>
    </div>
  );
}

// ─── ANÁLISE KTO ──────────────────────────────────────────────────────────────
function AnaliseKTO({ bankroll, keys }) {
  const [sport, setSport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("");

  const fetchAndAnalyze = async (s) => {
    if (!keys.oddsKey) { setError("Configure sua The Odds API Key na aba ⚙️ Config."); return; }
    setSport(s); setLoading(true); setError(null); setGames([]); setAnalysis(null);

    try {
      // Direct call works outside Claude/browser restrictions
      setStep("fetching");
      const url = `https://api.the-odds-api.com/v4/sports/${s.id}/odds/?apiKey=${keys.oddsKey}&regions=eu&markets=h2h,totals&oddsFormat=decimal`;
      const res = await fetch(url);

      if (!res.ok) {
        const t = await res.text();
        let msg = `Erro ${res.status}`;
        try { const j = JSON.parse(t); msg = j.message || msg; } catch {}
        setError(msg);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setError("Nenhum jogo encontrado para este esporte agora. Tente outra liga.");
        setLoading(false);
        return;
      }

      const formatted = data.slice(0, 10).map(g => {
        const book = g.bookmakers?.find(b => b.key === "kto") || g.bookmakers?.[0];
        const h2h = book?.markets?.find(m => m.key === "h2h");
        const totals = book?.markets?.find(m => m.key === "totals");
        return {
          match: `${g.home_team} x ${g.away_team}`,
          time: new Date(g.commence_time).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
          bookmaker: book?.title || "—",
          h2h: h2h?.outcomes || [],
          totals: totals?.outcomes || [],
        };
      });
      setGames(formatted);

      if (!keys.claudeKey) {
        setError("Configure sua Anthropic API Key na aba ⚙️ Config para receber análise IA.");
        setLoading(false);
        return;
      }

      // AI analysis
      setStep("analyzing");
      const gamesText = formatted.map(g => {
        const h2hStr = g.h2h.map(o => `${o.name}: @${o.price}`).join(", ");
        const totalsStr = g.totals.map(o => `${o.name} ${o.point || ""}: @${o.price}`).join(", ");
        return `• ${g.match} (${g.time}) | H2H: ${h2hStr} | Totais: ${totalsStr}`;
      }).join("\n");

      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": keys.claudeKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-opus-4-7",
          max_tokens: 1500,
          system: `Você é um analista de apostas esportivas especializado na KTO. Analise os jogos com odds reais e retorne EXATAMENTE um JSON válido sem markdown:
{"picks":[{"match":"Nome do jogo","market":"Mercado","pick":"Seleção exata","odds":1.75,"greenRate":72,"confidence":"Alta","reasoning":"Justificativa técnica em 1-2 frases","expectedReturn":26.0,"risk":"Baixo"}]}
Selecione os 4-5 melhores picks com maior taxa histórica de green. greenRate: % estimada de acerto histórico. Priorize Over/Under com odds 1.7-2.1 e favoritos claros no H2H.`,
          messages: [{ role: "user", content: `Analise estes jogos REAIS e escolha os melhores picks:\n${gamesText}\n\nBanca: R$ ${fmt(bankroll, 2)}. Retorne apenas JSON.` }],
        }),
      });

      const aiJson = await aiRes.json();
      if (aiJson.error) { setError(`Erro IA: ${JSON.stringify(aiJson.error)}`); setLoading(false); return; }
      const raw = aiJson.content?.map(c => c.text || "").join("") || "";
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) { setError("Erro ao processar análise. Tente novamente."); setLoading(false); return; }
      setAnalysis(JSON.parse(match[0]));
    } catch (e) {
      setError(`Erro: ${e.message}`);
    } finally {
      setLoading(false); setStep("");
    }
  };

  const confColor = c => c === "Alta" ? C.green : c === "Média" ? C.yellow : C.orange;
  const riskColor = r => r === "Baixo" ? C.green : r === "Médio" ? C.yellow : C.red;
  const greenBar = pct => (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: pct >= 75 ? `linear-gradient(90deg,${C.green},#00ff99)` : pct >= 60 ? `linear-gradient(90deg,${C.yellow},#ffaa00)` : `linear-gradient(90deg,${C.orange},#ff9900)`, transition: "width 0.8s" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: pct >= 75 ? C.green : pct >= 60 ? C.yellow : C.orange, minWidth: 34 }}>{pct}%</span>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "linear-gradient(135deg,#1a1400,#2a1f00)", border: `1px solid ${C.kto}44`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: C.kto, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#1a1100" }}>KTO</div>
        <div>
          <div style={{ color: C.kto, fontWeight: 700, fontSize: 13 }}>Análise KTO — Odds Reais</div>
          <div style={{ color: "#a08040", fontSize: 10 }}>Jogos ao vivo + IA analisa os melhores picks</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
        {SPORTS.map(s => (
          <button key={s.id} onClick={() => fetchAndAnalyze(s)} style={{ background: sport?.id === s.id ? `${C.kto}22` : C.card, border: `1px solid ${sport?.id === s.id ? C.kto : C.border}`, borderRadius: 10, padding: "9px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <span style={{ fontSize: 9, color: sport?.id === s.id ? C.kto : C.muted, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{s.label}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 10 }}>
            {[0,1,2].map(d => <div key={d} style={{ width: 8, height: 8, borderRadius: "50%", background: C.kto, animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${d*0.2}s` }} />)}
          </div>
          <div style={{ color: C.kto, fontSize: 12, fontWeight: 700 }}>{step === "fetching" ? "📡 Buscando odds reais da KTO..." : "🤖 IA analisando os melhores picks..."}</div>
          <div style={{ color: C.muted, fontSize: 10, marginTop: 4 }}>{step === "fetching" ? "Conectando à The Odds API..." : "Calculando taxa de green e retorno..."}</div>
        </div>
      )}

      {error && <div style={{ background: "#ff456011", border: `1px solid ${C.red}44`, borderRadius: 10, padding: 12, color: C.red, fontSize: 12 }}>{error}</div>}

      {games.length > 0 && !loading && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 13 }}>
          <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>📡 {games.length} Jogos Encontrados</div>
          {games.map((g, i) => (
            <div key={i} style={{ padding: "7px 0", borderBottom: i < games.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: C.text, fontSize: 11, fontWeight: 600 }}>{g.match}</span>
                <span style={{ color: C.muted, fontSize: 10 }}>{g.time}</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                {g.h2h.map((o, j) => <span key={j} style={{ color: C.muted, fontSize: 10 }}>{o.name}: <span style={{ color: C.kto, fontWeight: 700 }}>@{o.price}</span></span>)}
                {g.totals.slice(0, 2).map((o, j) => <span key={j} style={{ color: C.muted, fontSize: 10 }}>{o.name} {o.point}: <span style={{ color: C.accent, fontWeight: 700 }}>@{o.price}</span></span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {analysis && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>🏆 {analysis.picks?.length} Melhores Picks</span>
            <span style={{ color: C.green, fontSize: 10, fontWeight: 700 }}>● ODDS REAIS</span>
          </div>
          {[...analysis.picks].sort((a, b) => b.greenRate - a.greenRate).map((pick, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 13, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, height: 3, borderRadius: "12px 12px 0 0", width: `${pick.greenRate}%`, background: pick.greenRate >= 75 ? `linear-gradient(90deg,${C.green},#00ff99)` : pick.greenRate >= 60 ? `linear-gradient(90deg,${C.yellow},#ffaa00)` : `linear-gradient(90deg,${C.orange},#ff9900)` }} />
              <div style={{ position: "absolute", top: 9, right: 11, background: i === 0 ? C.kto : C.border, color: i === 0 ? "#1a1100" : C.muted, borderRadius: 20, fontSize: 9, fontWeight: 700, padding: "2px 7px" }}>{i === 0 ? "🏆 TOP" : `#${i+1}`}</div>
              <div style={{ marginBottom: 7, paddingRight: 70 }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: 12 }}>{pick.match}</div>
              </div>
              <div style={{ background: C.bg, borderRadius: 7, padding: "7px 9px", marginBottom: 8, border: `1px solid ${C.border}` }}>
                <div style={{ color: C.accent, fontWeight: 700, fontSize: 13 }}>{pick.pick}</div>
                <div style={{ color: C.muted, fontSize: 10 }}>{pick.market} · <span style={{ color: C.kto, fontWeight: 700 }}>@{pick.odds}</span></div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ color: C.muted, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Taxa de Green</div>
                {greenBar(pick.greenRate)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5, marginBottom: 8 }}>
                {[
                  { label: "Confiança", value: pick.confidence, color: confColor(pick.confidence) },
                  { label: "Retorno", value: `+${fmt(pick.expectedReturn, 0)}%`, color: C.green },
                  { label: "Risco", value: pick.risk, color: riskColor(pick.risk) },
                  { label: "Kelly", value: fmtMoney(calcKelly(pick.greenRate, pick.odds, bankroll)), color: C.kto },
                ].map(st => (
                  <div key={st.label} style={{ background: C.bg, borderRadius: 6, padding: "5px 6px", border: `1px solid ${C.border}` }}>
                    <div style={{ color: C.muted, fontSize: 8, textTransform: "uppercase" }}>{st.label}</div>
                    <div style={{ color: st.color, fontSize: 10, fontWeight: 700 }}>{st.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ color: "#7a8aaa", fontSize: 10, lineHeight: 1.5, fontStyle: "italic" }}>💡 {pick.reasoning}</div>
            </div>
          ))}
          <div style={{ background: "#ff456008", border: `1px solid ${C.red}33`, borderRadius: 8, padding: "7px 11px", color: "#7a5050", fontSize: 10, textAlign: "center" }}>
            ⚠ Odds reais da KTO. Apostas envolvem risco. Jogue com responsabilidade.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ bets, bankroll, dailyGoal, setDailyGoal }) {
  const [editGoal, setEditGoal] = useState("");
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const won = bets.filter(b => b.result === "win");
  const lost = bets.filter(b => b.result === "loss");
  const pending = bets.filter(b => b.result === "pending");
  const todayProfit = bets.filter(b => new Date(b.id).toDateString() === new Date().toDateString()).reduce((acc, b) => {
    if (b.result === "win") return acc + b.stake * (b.odds - 1);
    if (b.result === "loss") return acc - b.stake;
    return acc;
  }, 0);
  const totalProfit = bets.reduce((acc, b) => {
    if (b.result === "win") return acc + b.stake * (b.odds - 1);
    if (b.result === "loss") return acc - b.stake;
    return acc;
  }, 0);
  const invested = bets.filter(b => b.result !== "pending").reduce((acc, b) => acc + b.stake, 0);
  const roiPct = invested > 0 ? (totalProfit / invested) * 100 : 0;
  const winRate = (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length)) * 100 : 0;
  const goalProgress = dailyGoal > 0 ? Math.min(100, (todayProfit / dailyGoal) * 100) : 0;
  const goalReached = todayProfit >= dailyGoal && dailyGoal > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: goalReached ? "#00e67615" : "linear-gradient(135deg,#1a1400,#2a1f00)", border: `1px solid ${goalReached ? C.green : C.kto}44`, borderRadius: 12, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ color: goalReached ? C.green : C.kto, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{goalReached ? "✓ Meta Atingida!" : "Meta Diária"}</span>
          <button onClick={() => setShowGoalEdit(!showGoalEdit)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: 10, padding: "2px 8px", cursor: "pointer" }}>Editar</button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
          <div>
            <div style={{ color: C.muted, fontSize: 10 }}>Hoje</div>
            <div style={{ color: todayProfit >= 0 ? C.green : C.red, fontSize: 22, fontWeight: 700, fontFamily: "monospace" }}>{fmtMoney(todayProfit)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: C.muted, fontSize: 10 }}>Meta</div>
            <div style={{ color: C.kto, fontSize: 16, fontWeight: 700, fontFamily: "monospace" }}>{fmtMoney(dailyGoal)}</div>
          </div>
        </div>
        <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 4, width: `${Math.max(0, goalProgress)}%`, background: goalReached ? `linear-gradient(90deg,${C.green},#00ff99)` : todayProfit < 0 ? C.red : `linear-gradient(90deg,${C.kto},#ffdd80)`, transition: "width 0.6s" }} />
        </div>
        <div style={{ color: C.muted, fontSize: 10, marginTop: 4 }}>{dailyGoal > 0 ? `${fmt(Math.max(0, goalProgress), 0)}% da meta` : "Defina uma meta diária"}</div>
        {showGoalEdit && (
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <input value={editGoal} onChange={e => setEditGoal(e.target.value)} placeholder="Meta diária (R$)" type="number" style={inp({ flex: 1 })} />
            <button onClick={() => { setDailyGoal(parseFloat(editGoal) || 0); setShowGoalEdit(false); }} style={{ background: C.kto, border: "none", borderRadius: 6, color: "#1a1100", padding: "7px 12px", cursor: "pointer", fontWeight: 700, fontSize: 11 }}>OK</button>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
        {[
          { label: "Banca Atual", value: fmtMoney(bankroll), color: C.kto },
          { label: "Lucro Total", value: fmtMoney(totalProfit), color: totalProfit >= 0 ? C.green : C.red },
          { label: "ROI", value: `${fmt(roiPct)}%`, color: roiPct >= 0 ? C.green : C.red },
          { label: "Win Rate", value: `${fmt(winRate, 0)}%`, color: C.yellow },
        ].map(s => (
          <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: 18, fontWeight: 700, fontFamily: "monospace", marginTop: 3 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.accent}33`, borderRadius: 12, padding: 14 }}>
        <div style={{ color: C.accent, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>⚡ Sugestão Kelly para Hoje</div>
        <div style={{ color: C.muted, fontSize: 10, marginBottom: 10 }}>Baseado na sua banca de {fmtMoney(bankroll)}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[
            { label: "Segura", prob: 65, odds: 1.75, color: C.green },
            { label: "Média", prob: 60, odds: 1.90, color: C.yellow },
            { label: "Ousada", prob: 55, odds: 2.10, color: C.orange },
          ].map(s => (
            <div key={s.label} style={{ background: C.bg, borderRadius: 8, padding: "8px 10px", border: `1px solid ${C.border}`, textAlign: "center" }}>
              <div style={{ color: C.muted, fontSize: 9, marginBottom: 3 }}>{s.label}</div>
              <div style={{ color: s.color, fontSize: 14, fontWeight: 700, fontFamily: "monospace" }}>{fmtMoney(calcKelly(s.prob, s.odds, bankroll))}</div>
              <div style={{ color: C.muted, fontSize: 9, marginTop: 2 }}>@{s.odds} · {s.prob}%</div>
            </div>
          ))}
        </div>
        <div style={{ color: C.muted, fontSize: 10, marginTop: 8, textAlign: "center" }}>Kelly fracionado 25% — proteção de banca</div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Apostas</span>
          <span style={{ color: C.muted, fontSize: 11 }}>{bets.length} total</span>
        </div>
        <div style={{ display: "flex", gap: 3, height: 8, borderRadius: 4, overflow: "hidden", background: C.border }}>
          {bets.length > 0 && <>
            <div style={{ width: `${won.length / bets.length * 100}%`, background: C.green }} />
            <div style={{ width: `${lost.length / bets.length * 100}%`, background: C.red }} />
            <div style={{ width: `${pending.length / bets.length * 100}%`, background: C.yellow }} />
          </>}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 7 }}>
          {[["🟢","Green",won.length],["🔴","Red",lost.length],["🟡","Aguard.",pending.length]].map(([icon,label,count]) => (
            <span key={label} style={{ color: C.muted, fontSize: 11 }}>{icon} {count} {label}</span>
          ))}
        </div>
      </div>

      {bets.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
          <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Últimas Apostas</div>
          {[...bets].reverse().slice(0, 5).map((b, i, arr) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div>
                <div style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{b.match}</div>
                <div style={{ color: C.muted, fontSize: 10 }}>{b.market} · @{b.odds}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: C.muted, fontSize: 10 }}>{fmtMoney(b.stake)}</div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: b.result === "win" ? "#00e67620" : b.result === "loss" ? "#ff456020" : "#ffd60020", color: b.result === "win" ? C.green : b.result === "loss" ? C.red : C.yellow }}>
                  {b.result === "win" ? "GREEN" : b.result === "loss" ? "RED" : "AGUARD."}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────
function Chat({ keys }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Olá! Sou o **BetMind KTO** ⚡\n\nPergunte sobre análises, picks, Kelly ou estratégias na KTO." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    if (!keys.claudeKey) { setMessages(p => [...p, { role: "assistant", content: "❌ Configure sua Anthropic API Key na aba ⚙️ Config." }]); return; }
    const userMsg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs); setInput(""); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": keys.claudeKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-opus-4-7", max_tokens: 1000, system: SYSTEM_CHAT, messages: newMsgs.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      setMessages(p => [...p, { role: "assistant", content: data.content?.map(c => c.text || "").join("") || "Erro." }]);
    } catch (e) {
      setMessages(p => [...p, { role: "assistant", content: `❌ Erro: ${e.message}` }]);
    } finally { setLoading(false); }
  };

  const renderText = text => text.split("\n").map((line, i) => {
    const html = line.replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong>${t}</strong>`);
    return <p key={i} style={{ margin: "2px 0", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: html }} />;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", gap: 10 }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "86%", padding: "9px 12px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? `linear-gradient(135deg,${C.kto}25,#a0800030)` : C.card, border: `1px solid ${m.role === "user" ? C.kto+"40" : C.border}`, color: C.text, fontSize: 12 }}>
              {m.role === "assistant" && <div style={{ color: C.kto, fontSize: 10, fontWeight: 700, marginBottom: 3 }}>BETMIND KTO ⚡</div>}
              {renderText(m.content)}
            </div>
          </div>
        ))}
        {loading && <div style={{ display: "flex", gap: 4, padding: "8px 12px" }}>{[0,1,2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: C.kto, animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${d*0.2}s` }} />)}</div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 7 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Pergunte sobre apostas na KTO..." style={inp({ flex: 1, borderRadius: 10, padding: "9px 12px" })} />
        <button onClick={send} disabled={loading} style={{ background: `linear-gradient(135deg,${C.kto},#c09030)`, border: "none", borderRadius: 10, color: "#1a1100", padding: "9px 13px", cursor: loading ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700, opacity: loading ? 0.6 : 1 }}>➤</button>
      </div>
    </div>
  );
}

// ─── BANCA ────────────────────────────────────────────────────────────────────
function Banca({ bets, setBets, bankroll, setBankroll }) {
  const [form, setForm] = useState({ match: "", market: "", odds: "", stake: "", prob: "", result: "pending" });
  const [editBankroll, setEditBankroll] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const kellySuggested = form.prob && form.odds ? calcKelly(parseFloat(form.prob), parseFloat(form.odds), bankroll) : null;

  const addBet = () => {
    if (!form.match || !form.odds || !form.stake) return;
    const newBet = { ...form, odds: parseFloat(form.odds), stake: parseFloat(form.stake), id: Date.now() };
    setBets(p => [...p, newBet]);
    if (form.result === "win") setBankroll(b => b + parseFloat(form.stake) * (parseFloat(form.odds) - 1));
    if (form.result === "loss") setBankroll(b => b - parseFloat(form.stake));
    setForm({ match: "", market: "", odds: "", stake: "", prob: "", result: "pending" });
  };

  const updateResult = (id, result) => {
    setBets(prev => prev.map(b => {
      if (b.id !== id) return b;
      let delta = 0;
      if (b.result === "pending" && result === "win") delta = b.stake * (b.odds - 1);
      if (b.result === "pending" && result === "loss") delta = -b.stake;
      if (b.result === "win" && result === "pending") delta = -b.stake * (b.odds - 1);
      if (b.result === "loss" && result === "pending") delta = b.stake;
      if (b.result === "win" && result === "loss") delta = -(b.stake * (b.odds - 1)) - b.stake;
      if (b.result === "loss" && result === "win") delta = b.stake + b.stake * (b.odds - 1);
      setBankroll(br => br + delta);
      return { ...b, result };
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Banca KTO</span>
          <button onClick={() => setShowEdit(!showEdit)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: 10, padding: "2px 8px", cursor: "pointer" }}>Ajustar</button>
        </div>
        <div style={{ color: C.kto, fontSize: 28, fontWeight: 700, fontFamily: "monospace" }}>{fmtMoney(bankroll)}</div>
        {showEdit && (
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <input value={editBankroll} onChange={e => setEditBankroll(e.target.value)} placeholder="Novo valor (R$)" type="number" style={inp({ flex: 1 })} />
            <button onClick={() => { setBankroll(parseFloat(editBankroll) || bankroll); setShowEdit(false); }} style={{ background: C.kto, border: "none", borderRadius: 6, color: "#1a1100", padding: "7px 11px", cursor: "pointer", fontWeight: 700, fontSize: 11 }}>OK</button>
          </div>
        )}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 13 }}>
        <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Nova Aposta + Kelly</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <input value={form.match} onChange={e => setForm({...form, match: e.target.value})} placeholder="Partida" style={inp()} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            <input value={form.market} onChange={e => setForm({...form, market: e.target.value})} placeholder="Mercado" style={inp()} />
            <input value={form.odds} onChange={e => setForm({...form, odds: e.target.value})} placeholder="Odds KTO" type="number" style={inp()} />
          </div>
          <div style={{ background: C.bg, border: `1px solid ${C.accent}33`, borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ color: C.accent, fontSize: 10, fontWeight: 700, marginBottom: 5 }}>⚡ Kelly — Sua estimativa</div>
            <input value={form.prob} onChange={e => setForm({...form, prob: e.target.value})} placeholder="Probabilidade estimada (%)" type="number" style={inp({ background: C.card })} />
            {kellySuggested !== null && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 7 }}>
                <span style={{ color: C.muted, fontSize: 10 }}>Kelly sugere:</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: C.kto, fontWeight: 700, fontSize: 14, fontFamily: "monospace" }}>{fmtMoney(kellySuggested)}</span>
                  <button onClick={() => setForm({...form, stake: fmt(kellySuggested, 2)})} style={{ background: C.kto, border: "none", borderRadius: 6, color: "#1a1100", fontSize: 10, fontWeight: 700, padding: "3px 8px", cursor: "pointer" }}>Usar</button>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            <input value={form.stake} onChange={e => setForm({...form, stake: e.target.value})} placeholder="Valor R$" type="number" style={inp()} />
            <select value={form.result} onChange={e => setForm({...form, result: e.target.value})} style={inp()}>
              <option value="pending">Pendente</option>
              <option value="win">Green ✓</option>
              <option value="loss">Red ✗</option>
            </select>
          </div>
          <button onClick={addBet} style={{ background: `linear-gradient(135deg,${C.kto},#c09030)`, border: "none", borderRadius: 8, color: "#1a1100", padding: 9, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>+ Registrar Aposta</button>
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 13 }}>
        <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Histórico</div>
        {bets.length === 0 && <p style={{ color: C.muted, fontSize: 12, textAlign: "center", padding: "12px 0" }}>Nenhuma aposta registrada.</p>}
        {[...bets].reverse().map(b => (
          <div key={b.id} style={{ background: C.bg, borderRadius: 8, padding: "9px 10px", marginBottom: 6, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{b.match}</span>
              <button onClick={() => setBets(p => p.filter(x => x.id !== b.id))} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, padding: 0 }}>🗑</button>
            </div>
            <div style={{ color: C.muted, fontSize: 10, marginBottom: 5 }}>{b.market} · @{b.odds} · {fmtMoney(b.stake)}</div>
            <div style={{ display: "flex", gap: 5 }}>
              {["pending","win","loss"].map(r => (
                <button key={r} onClick={() => updateResult(b.id, r)} style={{ fontSize: 9, padding: "3px 8px", borderRadius: 20, cursor: "pointer", border: "none", fontWeight: 700, background: b.result === r ? (r === "win" ? C.green : r === "loss" ? C.red : C.yellow) : C.border, color: b.result === r ? C.bg : C.muted }}>
                  {r === "win" ? "GREEN" : r === "loss" ? "RED" : "AGUARD."}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CALCULADORA ──────────────────────────────────────────────────────────────
function Calculadora({ bankroll }) {
  const [mode, setMode] = useState("kelly");
  const [kelly, setKelly] = useState({ prob: "", odds: "" });
  const [sure, setSure] = useState({ odds1: "", odds2: "", stake: "" });
  const [result, setResult] = useState(null);

  const calcKellyFull = () => {
    const p = parseFloat(kelly.prob) / 100, b = parseFloat(kelly.odds) - 1;
    if (!p || !b) return;
    const f = (b * p - (1 - p)) / b;
    const ip = 1 / parseFloat(kelly.odds);
    setResult({ type: "kelly", fullKelly: Math.max(0, f * 100), halfKelly: Math.max(0, f * 0.5 * 100), quarterKelly: Math.max(0, f * 0.25 * 100), stakeFullKelly: Math.max(0, f) * bankroll, stakeHalfKelly: Math.max(0, f * 0.5) * bankroll, stakeQuarterKelly: Math.max(0, f * 0.25) * bankroll, hasValue: p > ip, impliedProb: ip * 100, edge: (p - ip) * 100 });
  };

  const calcSure = () => {
    const o1 = parseFloat(sure.odds1), o2 = parseFloat(sure.odds2), s = parseFloat(sure.stake);
    if (!o1 || !o2 || !s) return;
    const total = 1/o1 + 1/o2;
    setResult({ type: "sure", isSure: total < 1, s1: s*(1/o1)/total, s2: s*(1/o2)/total, total: total*100, profit: total < 1 ? (s/total)-s : null });
  };

  const box = (label, val, color = C.text) => (
    <div style={{ background: C.bg, borderRadius: 7, padding: "8px 9px", border: `1px solid ${C.border}` }}>
      <div style={{ color: C.muted, fontSize: 9, textTransform: "uppercase" }}>{label}</div>
      <div style={{ color, fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>{val}</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      <div style={{ display: "flex", gap: 7 }}>
        {[["kelly","Kelly Criterion"],["sure","Surebet"]].map(([k,l]) => (
          <button key={k} onClick={() => { setMode(k); setResult(null); }} style={{ flex: 1, padding: 9, borderRadius: 8, border: "none", cursor: "pointer", background: mode === k ? C.kto : C.card, color: mode === k ? "#1a1100" : C.muted, fontWeight: 700, fontSize: 11 }}>{l}</button>
        ))}
      </div>

      {mode === "kelly" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 13 }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 12, marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>Kelly Criterion</div>
          <div style={{ color: C.muted, fontSize: 10, marginBottom: 10 }}>Banca: {fmtMoney(bankroll)}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <input value={kelly.prob} onChange={e => setKelly({...kelly, prob: e.target.value})} placeholder="Sua probabilidade estimada (%)" type="number" style={inp()} />
            <input value={kelly.odds} onChange={e => setKelly({...kelly, odds: e.target.value})} placeholder="Odds na KTO" type="number" style={inp()} />
            <button onClick={calcKellyFull} style={{ background: `linear-gradient(135deg,${C.kto},#c09030)`, border: "none", borderRadius: 8, color: "#1a1100", padding: 9, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Calcular</button>
          </div>
          {result?.type === "kelly" && (
            <>
              <div style={{ marginTop: 10, marginBottom: 8, padding: "7px 10px", borderRadius: 7, background: result.hasValue ? "#00e67610" : "#ff456010", border: `1px solid ${result.hasValue ? C.green : C.red}33`, color: result.hasValue ? C.green : C.red, fontSize: 11, fontWeight: 600 }}>
                {result.hasValue ? `✓ Value bet! Edge de +${fmt(result.edge)}%` : `✗ Sem value — edge ${fmt(result.edge)}%`}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Kelly Completo", pct: result.fullKelly, stake: result.stakeFullKelly, risk: "Alto", color: C.red },
                  { label: "½ Kelly (recomendado)", pct: result.halfKelly, stake: result.stakeHalfKelly, risk: "Médio", color: C.yellow },
                  { label: "¼ Kelly (conservador)", pct: result.quarterKelly, stake: result.stakeQuarterKelly, risk: "Baixo", color: C.green },
                ].map(k => (
                  <div key={k.label} style={{ background: C.bg, borderRadius: 8, padding: "9px 11px", border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ color: C.text, fontSize: 11, fontWeight: 600 }}>{k.label}</div>
                      <div style={{ color: C.muted, fontSize: 10 }}>Risco: <span style={{ color: k.color }}>{k.risk}</span> · {fmt(k.pct)}%</div>
                    </div>
                    <div style={{ color: k.color, fontSize: 15, fontWeight: 700, fontFamily: "monospace" }}>{fmtMoney(k.stake)}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
                {box("Prob. Implícita", `${fmt(result.impliedProb)}%`, C.muted)}
                {box("Sua Estimativa", `${kelly.prob}%`, C.accent)}
              </div>
            </>
          )}
        </div>
      )}

      {mode === "sure" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 13 }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 12, marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>Surebet</div>
          <div style={{ color: C.muted, fontSize: 10, marginBottom: 10 }}>Arbitragem entre KTO e outra casa.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <input value={sure.odds1} onChange={e => setSure({...sure, odds1: e.target.value})} placeholder="Odds KTO" type="number" style={inp()} />
            <input value={sure.odds2} onChange={e => setSure({...sure, odds2: e.target.value})} placeholder="Odds outra casa" type="number" style={inp()} />
            <input value={sure.stake} onChange={e => setSure({...sure, stake: e.target.value})} placeholder="Total a apostar (R$)" type="number" style={inp()} />
            <button onClick={calcSure} style={{ background: `linear-gradient(135deg,${C.kto},#c09030)`, border: "none", borderRadius: 8, color: "#1a1100", padding: 9, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Analisar</button>
          </div>
          {result?.type === "sure" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
                {box("Apostar KTO", fmtMoney(result.s1), C.kto)}
                {box("Apostar Casa 2", fmtMoney(result.s2), C.accent)}
                {box("Margem", `${fmt(result.total)}%`, result.isSure ? C.green : C.red)}
                {result.isSure && box("Lucro Garantido", fmtMoney(result.profit), C.green)}
              </div>
              <div style={{ marginTop: 8, padding: "7px 10px", borderRadius: 7, background: result.isSure ? "#00e67610" : "#ff456010", border: `1px solid ${result.isSure ? C.green : C.red}33`, color: result.isSure ? C.green : C.red, fontSize: 11, fontWeight: 600 }}>
                {result.isSure ? "⚡ Surebet confirmada!" : `✗ Não é surebet. Margem = ${fmt(result.total)}%`}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState(0);
  const [bets, setBets] = useState([]);
  const [bankroll, setBankroll] = useState(100);
  const [dailyGoal, setDailyGoal] = useState(15);
  const [keys, setKeys] = useState(() => {
    try { return JSON.parse(localStorage.getItem("betmind_keys") || "{}"); } catch { return {}; }
  });

  const tabDefs = [
    { label: "Dashboard", icon: "📊" },
    { label: "KTO", icon: "🏆" },
    { label: "Chat", icon: "🤖" },
    { label: "Banca", icon: "💰" },
    { label: "Calc", icon: "🧮" },
    { label: "Config", icon: "⚙️" },
  ];

  const hasKeys = keys.claudeKey && keys.oddsKey;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "system-ui,sans-serif", color: C.text, display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1a2540; border-radius: 2px; }
        input::placeholder { color: #4a5878; }
        select option { background: #0d1220; }
        @keyframes pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1.2)} }
        a { color: #00c9ff; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg,${C.panel} 0%,${C.bg} 100%)`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.kto, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, color: "#1a1100" }}>KTO</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.5 }}>BetMind</div>
            <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>
              {hasKeys ? <span style={{ color: C.green }}>● Odds ao vivo ativo</span> : <span style={{ color: C.red }}>● Configure as APIs</span>}
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 9, color: C.muted }}>Banca</div>
            <div style={{ fontFamily: "monospace", fontSize: 13, color: C.kto, fontWeight: 700 }}>{fmtMoney(bankroll)}</div>
          </div>
        </div>
      </div>

      {/* First time banner */}
      {!hasKeys && tab !== 5 && (
        <div onClick={() => setTab(5)} style={{ background: `linear-gradient(135deg,#1a1400,#2a1f00)`, border: `1px solid ${C.kto}44`, margin: "10px 13px 0", borderRadius: 10, padding: "10px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: C.kto, fontSize: 12, fontWeight: 700 }}>⚙️ Configure suas API Keys</div>
            <div style={{ color: "#a08040", fontSize: 10, marginTop: 2 }}>Toque para habilitar odds reais e Chat IA</div>
          </div>
          <span style={{ color: C.kto, fontSize: 18 }}>›</span>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "13px" }}>
        {tab === 0 && <Dashboard bets={bets} bankroll={bankroll} dailyGoal={dailyGoal} setDailyGoal={setDailyGoal} />}
        {tab === 1 && <AnaliseKTO bankroll={bankroll} keys={keys} />}
        {tab === 2 && <Chat keys={keys} />}
        {tab === 3 && <Banca bets={bets} setBets={setBets} bankroll={bankroll} setBankroll={setBankroll} />}
        {tab === 4 && <Calculadora bankroll={bankroll} />}
        {tab === 5 && <Settings keys={keys} setKeys={setKeys} />}
      </div>

      {/* Bottom Nav */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", borderTop: `1px solid ${C.border}`, background: C.panel, padding: "5px 0", position: "sticky", bottom: 0 }}>
        {tabDefs.map((t, i) => (
          <button key={t.label} onClick={() => setTab(i)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "5px 0" }}>
            <span style={{ fontSize: 15 }}>{t.icon}</span>
            <span style={{ fontSize: 8, color: tab === i ? C.kto : C.muted, fontWeight: tab === i ? 700 : 400 }}>{t.label}</span>
            {tab === i && <div style={{ width: 12, height: 2, borderRadius: 1, background: C.kto }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

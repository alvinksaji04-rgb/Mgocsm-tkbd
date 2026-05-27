const { useState, useEffect, useRef } = React;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const EDITOR_PIN = "Editor@2021";
const VIEWER_PIN = "Viewer@2021";

// Monthly tenure months: Apr to Mar
const TENURE_MONTHS = [
  { key: "apr", label: "Apr" },
  { key: "may", label: "May" },
  { key: "jun", label: "Jun" },
  { key: "jul", label: "Jul" },
  { key: "aug", label: "Aug" },
  { key: "sep", label: "Sep" },
  { key: "oct", label: "Oct" },
  { key: "nov", label: "Nov" },
  { key: "dec", label: "Dec" },
  { key: "jan", label: "Jan" },
  { key: "feb", label: "Feb" },
  { key: "mar", label: "Mar" },
];

// Event types
const EVENT_TYPES = [
  { key: "meeting",   label: "Meeting",   icon: "🔵", color: "rgba(100,150,255,0.15)", border: "rgba(100,150,255,0.4)" },
  { key: "worship",   label: "Worship",   icon: "✝️",  color: "rgba(255,150,100,0.15)", border: "rgba(255,150,100,0.4)" },
  { key: "study",     label: "Study",     icon: "📖", color: "rgba(200,100,255,0.15)", border: "rgba(200,100,255,0.4)" },
  { key: "service",   label: "Service",   icon: "🤝", color: "rgba(255,200,50,0.15)",  border: "rgba(255,200,50,0.4)"  },
  { key: "initiative",label: "Initiative",icon: "🟢", color: "rgba(100,220,100,0.12)", border: "rgba(100,220,100,0.3)" },
];
function getEventType(key) { return EVENT_TYPES.find(e => e.key === key) || EVENT_TYPES[0]; }

// ─── FIREBASE HELPERS ─────────────────────────────────────────────────────────
function useFirebase() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const fbRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.__firebase) {
        clearInterval(interval);
        const { db, ref, onValue } = window.__firebase;
        fbRef.current = ref(db, "mgocsm");
        onValue(fbRef.current, (snapshot) => {
          const val = snapshot.val();
          if (val) {
            setData(val);
          } else {
            const defaultData = { tenures: {}, members: [], editorPin: EDITOR_PIN, viewerPin: VIEWER_PIN };
            setData(defaultData);
            window.__firebase.set(ref(db, "mgocsm"), defaultData);
          }
          setLoading(false);
        });
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  async function saveData(newData) {
    if (!window.__firebase) return;
    const { db, ref, set } = window.__firebase;
    try {
      await set(ref(db, "mgocsm"), newData);
    } catch (e) {
      console.error("Firebase save error:", e);
    }
  }

  return { data, setData, saveData, loading };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getTenureYears(tenure) {
  const [s] = tenure.split("-");
  return parseInt(s);
}
function genId() { return Math.random().toString(36).slice(2, 9); }
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = {
  lock: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  user: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  users: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87"/></svg>,
  plus: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  edit: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>,
  logout: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  key: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="7" cy="17" r="4"/><path d="M10.85 13.15L19 5M18 6l2 2"/></svg>,
  x: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  calendar: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #020810 0%, #071020 40%, #0d1a35 70%, #020810 100%)",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: "#e8f4fc",
    position: "relative",
    overflow: "hidden",
  },
  bgPattern: {
    position: "fixed", inset: 0, zIndex: 0,
    backgroundImage: `radial-gradient(circle at 20% 20%, rgba(74,158,218,0.06) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(74,158,218,0.06) 0%, transparent 50%)`,
    pointerEvents: "none",
  },
  container: { maxWidth: 480, margin: "0 auto", padding: "0 16px", position: "relative", zIndex: 1 },
  loginWrap: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 },
  logoCircle: { width: 90, height: 90, borderRadius: "50%", border: "3px solid #4a9eda", overflow: "hidden", marginBottom: 12, background: "#fff" },
  logoImg: { width: "100%", height: "100%", objectFit: "contain" },
  appTitle: { fontSize: 22, fontWeight: "bold", color: "#a8d8f0", textAlign: "center", letterSpacing: 1, marginBottom: 2 },
  appSub: { fontSize: 13, color: "#8bb8d4", textAlign: "center", marginBottom: 6, letterSpacing: 2 },
  appMotto: { fontSize: 11, color: "#6b9ab8", textAlign: "center", marginBottom: 28, letterSpacing: 3, textTransform: "uppercase" },
  loginCard: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(74,158,218,0.3)", borderRadius: 16, padding: 24, width: "100%", maxWidth: 340 },
  loginTabRow: { display: "flex", gap: 8, marginBottom: 20 },
  loginTab: (active) => ({
    flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid",
    borderColor: active ? "#4a9eda" : "rgba(74,158,218,0.2)",
    background: active ? "rgba(74,158,218,0.2)" : "transparent",
    color: active ? "#a8d8f0" : "#6b9ab8", fontSize: 12, cursor: "pointer", fontFamily: "Georgia,serif",
  }),
  label: { fontSize: 12, color: "#6b9ab8", marginBottom: 6, display: "block", letterSpacing: 1 },
  input: {
    width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(74,158,218,0.3)",
    background: "rgba(5,13,26,0.5)", color: "#e8f4fc", fontSize: 14, fontFamily: "Georgia,serif",
    outline: "none", boxSizing: "border-box", marginBottom: 14,
  },
  btn: (variant = "primary") => ({
    width: "100%", padding: "11px 0", borderRadius: 8, border: "none",
    background: variant === "primary" ? "linear-gradient(135deg,#2979c8,#4a9eda,#7ec8f0)" : "rgba(255,255,255,0.1)",
    color: variant === "primary" ? "#050d1a" : "#e8f4fc",
    fontFamily: "Georgia,serif", fontSize: 14, fontWeight: "bold", cursor: "pointer", marginBottom: 8,
  }),
  err: { color: "#ff6b6b", fontSize: 12, marginBottom: 10, textAlign: "center" },
  topBar: {
    background: "rgba(5,13,26,0.7)", borderBottom: "1px solid rgba(74,158,218,0.2)",
    padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
    position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(8px)",
  },
  topTitle: { fontSize: 14, color: "#a8d8f0", fontWeight: "bold", letterSpacing: 0.5 },
  topRole: { fontSize: 10, color: "#6b9ab8", letterSpacing: 2 },
  iconBtn: { background: "none", border: "none", color: "#6b9ab8", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" },
  nav: {
    display: "flex", gap: 4, padding: "10px 16px",
    background: "rgba(5,13,26,0.4)", borderBottom: "1px solid rgba(74,158,218,0.1)", overflowX: "auto",
  },
  navBtn: (active) => ({
    display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
    borderRadius: 20, border: "1px solid",
    borderColor: active ? "#4a9eda" : "transparent",
    background: active ? "rgba(74,158,218,0.15)" : "transparent",
    color: active ? "#a8d8f0" : "#6b9ab8", fontSize: 12, cursor: "pointer",
    fontFamily: "Georgia,serif", whiteSpace: "nowrap",
  }),
  card: {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(74,158,218,0.15)",
    borderRadius: 12, padding: 16, marginBottom: 12,
  },
  cardTitle: { fontSize: 15, color: "#a8d8f0", fontWeight: "bold", marginBottom: 4 },
  cardSub: { fontSize: 12, color: "#6b9ab8" },
  section: { padding: "16px 16px" },
  sectionTitle: { fontSize: 18, color: "#a8d8f0", fontWeight: "bold", marginBottom: 16, borderBottom: "1px solid rgba(74,158,218,0.2)", paddingBottom: 8 },
  badge: (color) => ({
    display: "inline-block", padding: "2px 10px", borderRadius: 20,
    fontSize: 11, fontWeight: "bold",
    background: color === "green" ? "rgba(80,200,80,0.15)" : color === "red" ? "rgba(200,60,60,0.15)" : "rgba(74,158,218,0.15)",
    color: color === "green" ? "#80e080" : color === "red" ? "#ff8080" : "#a8d8f0",
    border: `1px solid ${color === "green" ? "rgba(80,200,80,0.3)" : color === "red" ? "rgba(200,60,60,0.3)" : "rgba(74,158,218,0.3)"}`,
  }),
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "#06111f", border: "1px solid rgba(74,158,218,0.4)", borderRadius: 16, padding: 24, width: "100%", maxWidth: 380, maxHeight: "88vh", overflowY: "auto" },
  modalTitle: { fontSize: 16, color: "#a8d8f0", fontWeight: "bold", marginBottom: 16 },
  row: { display: "flex", gap: 8, alignItems: "center" },
  smallBtn: (color = "gold") => ({
    padding: "5px 10px", borderRadius: 6, border: "1px solid",
    borderColor: color === "red" ? "rgba(200,60,60,0.4)" : color === "green" ? "rgba(60,200,60,0.4)" : "rgba(74,158,218,0.4)",
    background: "transparent",
    color: color === "red" ? "#ff8080" : color === "green" ? "#80e080" : "#4a9eda",
    fontSize: 11, cursor: "pointer", fontFamily: "Georgia,serif", display: "flex", alignItems: "center", gap: 4,
  }),
  memberCard: {
    display: "flex", alignItems: "center", gap: 12,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(74,158,218,0.15)",
    borderRadius: 12, padding: 12, marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: "50%", border: "2px solid rgba(74,158,218,0.4)",
    background: "rgba(74,158,218,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, color: "#4a9eda", flexShrink: 0, fontWeight: "bold",
  },
  avatar: { width: 48, height: 48, borderRadius: "50%", border: "2px solid rgba(74,158,218,0.4)", objectFit: "cover", background: "#0a1628", flexShrink: 0 },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginTop: 8 },
  calDay: { textAlign: "center", fontSize: 10, color: "#6b9ab8", padding: "4px 0" },
  calCell: (hasEvent, isToday, eventType) => ({
    textAlign: "center", padding: "6px 2px", borderRadius: 6, fontSize: 12, cursor: (hasEvent || isToday) ? "pointer" : "default",
    background: isToday ? "rgba(74,158,218,0.2)" : hasEvent ? getEventType(eventType).color : "transparent",
    color: isToday ? "#a8d8f0" : hasEvent ? "#e8f4fc" : "#6b9ab8",
    border: isToday ? "1px solid rgba(74,158,218,0.5)" : hasEvent ? `1px solid ${getEventType(eventType).border}` : "1px solid transparent",
    fontWeight: hasEvent ? "bold" : "normal",
  }),

  // Monthly payment styles
  monthGrid: {
    display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 4, marginTop: 8,
  },
  monthCell: (paid) => ({
    padding: "6px 2px", borderRadius: 6, textAlign: "center", fontSize: 10,
    background: paid ? "rgba(80,200,80,0.18)" : "rgba(200,60,60,0.12)",
    color: paid ? "#80e080" : "#ff8080",
    border: `1px solid ${paid ? "rgba(80,200,80,0.35)" : "rgba(200,60,60,0.25)"}`,
    cursor: "pointer", fontWeight: "bold",
    transition: "all 0.15s",
  }),
};

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ ...S.loginWrap, gap: 16 }}>
      <div style={{ fontSize: 40 }}>✝</div>
      <div style={{ color: "#a8d8f0", fontSize: 16 }}>MGOCSM Tughlakabad</div>
      <div style={{ color: "#6b9ab8", fontSize: 13 }}>Connecting to database...</div>
      <div style={{ width: 40, height: 4, background: "rgba(74,158,218,0.2)", borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
        <div style={{ width: "60%", height: "100%", background: "#4a9eda", borderRadius: 2, animation: "none" }} />
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {
  const { data, setData, saveData, loading } = useFirebase();
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [selectedTenure, setSelectedTenure] = useState(null);

  // Auto-select latest tenure
  useEffect(() => {
    if (data && !selectedTenure) {
      const keys = Object.keys(data.tenures || {}).sort((a, b) => getTenureYears(b) - getTenureYears(a));
      if (keys.length) setSelectedTenure(keys[0]);
    }
  }, [data, selectedTenure]);

  function upd(fn) {
    setData(prev => {
      const nd = JSON.parse(JSON.stringify(prev));
      fn(nd);
      saveData(nd);
      return nd;
    });
  }

  if (loading) return <LoadingScreen />;
  if (!data) return <LoadingScreen />;

  const tenure = selectedTenure ? (data.tenures || {})[selectedTenure] : null;
  const isEditor = session?.role === "editor";

  if (!session) return <LoginScreen data={data} setSession={setSession} />;

  return (
    <div style={S.app}>
      <div style={S.bgPattern} />
      {/* Top Bar */}
      <div style={S.topBar}>
        <div>
          <div style={S.topTitle}>✝ MGOCSM Tughlakabad</div>
          <div style={S.topRole}>{isEditor ? "EDITOR" : "VIEWER"}</div>
        </div>
        <button style={S.iconBtn} onClick={() => setSession(null)} title="Logout">{Icon.logout}</button>
      </div>

      {/* Nav */}
      <div style={S.nav}>
        {[
          { id: "home", label: "Home", icon: "✝" },
          { id: "members", label: "Members", icon: "👥" },
          { id: "payments", label: "Payments", icon: "💰" },
          { id: "calendar", label: "Calendar", icon: "📅" },
          { id: "meetings", label: "Meetings", icon: "📋" },
          ...(isEditor ? [{ id: "settings", label: "Settings", icon: "⚙️" }] : []),
        ].map(t => (
          <button key={t.id} style={S.navBtn(tab === t.id)} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tenure Selector */}
      {["home", "calendar", "meetings", "payments"].includes(tab) && (
        <div style={{ padding: "10px 16px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#6b9ab8" }}>Tenure:</span>
          {Object.keys(data.tenures || {}).sort((a, b) => getTenureYears(b) - getTenureYears(a)).map(t => (
            <button key={t} style={S.navBtn(selectedTenure === t)} onClick={() => setSelectedTenure(t)}>{t}</button>
          ))}
          {isEditor && (
            <button style={S.navBtn(false)} onClick={() => setModal({ type: "addTenure" })}>
              {Icon.plus} Add
            </button>
          )}
          {!Object.keys(data.tenures || {}).length && <span style={{ fontSize: 12, color: "#6b9ab8" }}>No tenures yet{isEditor ? " — add one!" : ""}</span>}
        </div>
      )}

      {/* Content */}
      <div style={S.section}>
        {tab === "home" && <HomeTab tenure={tenure} tenureKey={selectedTenure} data={data} isEditor={isEditor} upd={upd} setModal={setModal} />}
        {tab === "members" && <MembersTab data={data} isEditor={isEditor} upd={upd} setModal={setModal} selectedTenure={selectedTenure} />}
        {tab === "payments" && <PaymentsTab tenure={tenure} tenureKey={selectedTenure} data={data} isEditor={isEditor} upd={upd} setModal={setModal} />}
        {tab === "calendar" && <CalendarTab tenure={tenure} tenureKey={selectedTenure} isEditor={isEditor} upd={upd} setModal={setModal} />}
        {tab === "meetings" && <MeetingsTab tenure={tenure} tenureKey={selectedTenure} isEditor={isEditor} upd={upd} setModal={setModal} />}
        {tab === "settings" && isEditor && <SettingsTab data={data} upd={upd} setModal={setModal} />}
      </div>

      {/* Modals */}
      {modal && <ModalRouter modal={modal} setModal={setModal} data={data} upd={upd} isEditor={isEditor} />}
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ data, setSession }) {
  const [tab, setTab] = useState("editor");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  function handleEditorLogin() {
    if (pin === (data.editorPin || EDITOR_PIN)) { setSession({ role: "editor" }); return; }
    setErr("Wrong PIN!");
  }
  function handleViewerLogin() { setSession({ role: "viewer" }); }

  return (
    <div style={S.app}>
      <div style={S.bgPattern} />
      <div style={S.loginWrap}>
        <div style={S.logoCircle}>
          <img src="icon.jpg" alt="MGOCSM" style={S.logoImg} />
        </div>
        <div style={S.appTitle}>M.G.O.C.S.M.</div>
        <div style={S.appSub}>St. Joseph's Orthodox Church</div>
        <div style={S.appMotto}>Tughlakabad • Worship • Study • Service</div>

        <div style={S.loginCard}>
          <div style={S.loginTabRow}>
            {["editor", "viewer"].map(t => (
              <button key={t} style={S.loginTab(tab === t)} onClick={() => { setTab(t); setErr(""); setPin(""); }}>
                {t === "editor" ? "🔐 Editor" : "👁 Viewer"}
              </button>
            ))}
          </div>

          {tab === "editor" && (
            <>
              <label style={S.label}>Editor PIN</label>
              <input style={S.input} type="password" placeholder="Enter PIN" value={pin}
                onChange={e => setPin(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleEditorLogin()} />
              {err && <div style={S.err}>{err}</div>}
              <button style={S.btn()} onClick={handleEditorLogin}>{Icon.lock} &nbsp;Login as Editor</button>
            </>
          )}
          {tab === "viewer" && (
            <>
              <p style={{ fontSize: 12, color: "#6b9ab8", marginBottom: 16 }}>View-only access — no PIN required.</p>
              <button style={S.btn()} onClick={handleViewerLogin}>{Icon.user} &nbsp;Enter as Viewer</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HOME TAB ─────────────────────────────────────────────────────────────────
function HomeTab({ tenure, tenureKey, data, isEditor, upd, setModal }) {
  if (!tenure) return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>✝</div>
      <div style={{ color: "#6b9ab8" }}>No tenure selected.{isEditor ? " Add a tenure to get started!" : ""}</div>
    </div>
  );

  const totalMembers = (data.members || []).length;
  const monthlyPay = tenure.monthlyPayments || {};
  // Count how many members have paid ALL months
  const paidAllCount = (data.members || []).filter(m => {
    return TENURE_MONTHS.every(mon => monthlyPay[m.id]?.[mon.key] === true);
  }).length;
  const meetingsCount = (tenure.meetings || []).length;

  return (
    <>
      <div style={{ ...S.card, background: "linear-gradient(135deg,rgba(74,158,218,0.18),rgba(41,121,200,0.08))", border: "1px solid rgba(74,158,218,0.3)", marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#6b9ab8", marginBottom: 4, letterSpacing: 2 }}>CURRENT TENURE</div>
        <div style={{ fontSize: 24, color: "#a8d8f0", fontWeight: "bold" }}>📅 {tenureKey}</div>
        {tenure.theme && <div style={{ fontSize: 13, color: "#8bb8d4", marginTop: 4, fontStyle: "italic" }}>"{tenure.theme}"</div>}
      </div>

      {/* Posts */}
      {tenure.posts && tenure.posts.length > 0 && (
        <>
          <div style={S.sectionTitle}>Committee Posts</div>
          {tenure.posts.map(post => (
            <div key={post.id} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={S.cardTitle}>{post.title}</div>
                <div style={S.cardSub}>{post.holderName || <span style={{ color: "#606060" }}>Vacant</span>}</div>
              </div>
              {isEditor && (
                <button style={S.smallBtn()} onClick={() => setModal({ type: "editPost", tenureKey, post })}>
                  {Icon.edit}
                </button>
              )}
            </div>
          ))}
          {isEditor && (
            <button style={{ ...S.btn("secondary"), marginTop: 4 }} onClick={() => setModal({ type: "addPost", tenureKey })}>
              {Icon.plus} &nbsp;Add Post
            </button>
          )}
        </>
      )}
      {isEditor && (!tenure.posts || tenure.posts.length === 0) && (
        <button style={S.btn("secondary")} onClick={() => setModal({ type: "addPost", tenureKey })}>
          {Icon.plus} &nbsp;Add Committee Post
        </button>
      )}

      {/* Stats */}
      <div style={S.sectionTitle}>Overview</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Members", value: totalMembers, icon: "👥" },
          { label: "Full Paid", value: paidAllCount, icon: "✅" },
          { label: "Meetings", value: meetingsCount, icon: "📋" },
        ].map(s => (
          <div key={s.label} style={{ ...S.card, textAlign: "center", padding: 12 }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 20, color: "#a8d8f0", fontWeight: "bold" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#6b9ab8" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming Events */}
      <UpcomingEvents tenure={tenure} />
    </>
  );
}

function UpcomingEvents({ tenure }) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const events = (tenure?.events || [])
    .filter(e => new Date(e.date) >= today)
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  if (events.length === 0) return null;

  return (
    <>
      <div style={S.sectionTitle}>📅 Upcoming Events</div>
      {events.map(ev => {
        const et = getEventType(ev.type);
        const evDate = new Date(ev.date);
        const diffDays = Math.ceil((evDate - today) / (1000*60*60*24));
        const diffLabel = diffDays === 0 ? "Today!" : diffDays === 1 ? "Tomorrow" : `In ${diffDays} days`;
        return (
          <div key={ev.id} style={{ ...S.card, borderLeft: `3px solid ${et.border}`, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{et.icon}</span>
                <div>
                  <div style={{ fontSize: 13, color: "#e8f4fc", fontWeight: "bold" }}>{ev.title}</div>
                  <div style={{ fontSize: 11, color: "#6b9ab8" }}>{formatDate(ev.date)}</div>
                </div>
              </div>
              <span style={{ ...S.badge(diffDays === 0 ? "green" : "gold"), fontSize: 10, whiteSpace: "nowrap" }}>
                {diffLabel}
              </span>
            </div>
            {ev.brief && <div style={{ fontSize: 11, color: "#8bb8d4", marginTop: 6 }}>{ev.brief}</div>}
          </div>
        );
      })}
    </>
  );
}

// ─── MEMBERS TAB ──────────────────────────────────────────────────────────────
function MembersTab({ data, isEditor, upd, setModal, selectedTenure }) {
  const members = data.members || [];
  const tenure = selectedTenure ? (data.tenures || {})[selectedTenure] : null;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={S.sectionTitle}>Members ({members.length})</div>
        {isEditor && (
          <button style={S.smallBtn()} onClick={() => setModal({ type: "addMember" })}>
            {Icon.plus} Add
          </button>
        )}
      </div>

      {members.length === 0 && (
        <div style={{ textAlign: "center", color: "#6b9ab8", padding: 40 }}>No members yet.</div>
      )}

      {members.map(m => {
        // Count paid months for this member in selected tenure
        const monthlyPay = tenure?.monthlyPayments?.[m.id] || {};
        const paidMonths = TENURE_MONTHS.filter(mon => monthlyPay[mon.key]).length;
        const allPaid = paidMonths === 12;

        return (
          <div key={m.id} style={S.memberCard}>
            {m.photo
              ? <img src={m.photo} alt={m.name} style={S.avatar} onError={e => e.target.style.display = "none"} />
              : <div style={S.avatarPlaceholder}>{m.name?.[0]?.toUpperCase() || "?"}</div>
            }
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: "#e8f4fc", fontWeight: "bold" }}>{m.name}</div>
              {m.role && <div style={{ fontSize: 11, color: "#6b9ab8" }}>{m.role}</div>}
              {selectedTenure && (
                <div style={{ marginTop: 4, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={S.badge(allPaid ? "green" : paidMonths > 0 ? "gold" : "red")}>
                    {paidMonths}/12 months paid
                  </span>
                </div>
              )}
            </div>
            {isEditor && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button style={S.smallBtn()} onClick={() => setModal({ type: "editMember", member: m })}>
                  {Icon.edit}
                </button>
                <button style={S.smallBtn("red")} onClick={() => setModal({ type: "deleteMember", member: m })}>
                  {Icon.trash}
                </button>
                <button style={S.smallBtn("gold")} onClick={() => setModal({ type: "resetPass", member: m })}>
                  {Icon.key}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

// ─── PAYMENTS TAB (Monthly Apr-Mar) ───────────────────────────────────────────
function PaymentsTab({ tenure, tenureKey, data, isEditor, upd, setModal }) {
  const members = data.members || [];
  const [expandedMember, setExpandedMember] = useState(null);

  if (!tenure) return (
    <div style={{ textAlign: "center", color: "#6b9ab8", padding: 40 }}>Select a tenure to view payments.</div>
  );

  function toggleMonth(memberId, monthKey) {
    if (!isEditor) return;
    upd(d => {
      if (!d.tenures[tenureKey].monthlyPayments) d.tenures[tenureKey].monthlyPayments = {};
      if (!d.tenures[tenureKey].monthlyPayments[memberId]) d.tenures[tenureKey].monthlyPayments[memberId] = {};
      const cur = d.tenures[tenureKey].monthlyPayments[memberId][monthKey];
      d.tenures[tenureKey].monthlyPayments[memberId][monthKey] = !cur;
    });
  }

  function markAllPaid(memberId) {
    upd(d => {
      if (!d.tenures[tenureKey].monthlyPayments) d.tenures[tenureKey].monthlyPayments = {};
      if (!d.tenures[tenureKey].monthlyPayments[memberId]) d.tenures[tenureKey].monthlyPayments[memberId] = {};
      TENURE_MONTHS.forEach(mon => {
        d.tenures[tenureKey].monthlyPayments[memberId][mon.key] = true;
      });
    });
  }

  function markAllUnpaid(memberId) {
    upd(d => {
      if (!d.tenures[tenureKey].monthlyPayments) d.tenures[tenureKey].monthlyPayments = {};
      d.tenures[tenureKey].monthlyPayments[memberId] = {};
    });
  }

  const monthlyPay = tenure.monthlyPayments || {};

  // Summary stats
  const totalPaidSlots = members.reduce((acc, m) => {
    return acc + TENURE_MONTHS.filter(mon => monthlyPay[m.id]?.[mon.key]).length;
  }, 0);
  const totalSlots = members.length * 12;

  return (
    <>
      <div style={S.sectionTitle}>💰 Monthly Payments — {tenureKey}</div>

      {/* Summary card */}
      <div style={{ ...S.card, marginBottom: 16, background: "rgba(74,158,218,0.07)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, color: "#6b9ab8" }}>Overall Collection</div>
            <div style={{ fontSize: 20, color: "#a8d8f0", fontWeight: "bold" }}>{totalPaidSlots} / {totalSlots} months</div>
          </div>
          <div style={{ fontSize: 28 }}>
            {totalPaidSlots === totalSlots ? "🎉" : totalPaidSlots > 0 ? "📊" : "📭"}
          </div>
        </div>
        {/* Month header legend */}
        <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
          {TENURE_MONTHS.map(mon => (
            <span key={mon.key} style={{ fontSize: 10, color: "#6b9ab8", padding: "2px 5px", border: "1px solid rgba(74,158,218,0.2)", borderRadius: 4 }}>
              {mon.label}
            </span>
          ))}
        </div>
      </div>

      {members.length === 0 && (
        <div style={{ textAlign: "center", color: "#6b9ab8", padding: 40 }}>No members added yet.</div>
      )}

      {members.map(m => {
        const mPay = monthlyPay[m.id] || {};
        const paidCount = TENURE_MONTHS.filter(mon => mPay[mon.key]).length;
        const allPaid = paidCount === 12;
        const isExpanded = expandedMember === m.id;

        return (
          <div key={m.id} style={{ ...S.card, marginBottom: 10 }}>
            {/* Member row */}
            <div
              style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
              onClick={() => setExpandedMember(isExpanded ? null : m.id)}
            >
              <div style={S.avatarPlaceholder}>{m.name?.[0]?.toUpperCase() || "?"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: "#e8f4fc", fontWeight: "bold" }}>{m.name}</div>
                {m.role && <div style={{ fontSize: 11, color: "#6b9ab8" }}>{m.role}</div>}
                <div style={{ marginTop: 4 }}>
                  <span style={S.badge(allPaid ? "green" : paidCount > 0 ? "gold" : "red")}>
                    {paidCount}/12 months paid
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 18, color: "#6b9ab8" }}>{isExpanded ? "▲" : "▼"}</div>
            </div>

            {/* Expanded monthly grid */}
            {isExpanded && (
              <div style={{ marginTop: 14, borderTop: "1px solid rgba(74,158,218,0.15)", paddingTop: 12 }}>
                {/* Action buttons (editor only) */}
                {isEditor && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <button style={S.smallBtn("green")} onClick={() => markAllPaid(m.id)}>✓ Mark All Paid</button>
                    <button style={S.smallBtn("red")} onClick={() => markAllUnpaid(m.id)}>✗ Mark All Unpaid</button>
                  </div>
                )}

                {/* Month grid — 6 per row */}
                <div style={{ ...S.monthGrid }}>
                  {TENURE_MONTHS.map(mon => {
                    const paid = !!mPay[mon.key];
                    return (
                      <div
                        key={mon.key}
                        style={S.monthCell(paid)}
                        onClick={() => toggleMonth(m.id, mon.key)}
                        title={isEditor ? `Click to toggle ${mon.label}` : ""}
                      >
                        <div style={{ fontSize: 10, marginBottom: 2 }}>{mon.label}</div>
                        <div style={{ fontSize: 14 }}>{paid ? "✓" : "✗"}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Paid months list */}
                <div style={{ marginTop: 10, fontSize: 11, color: "#6b9ab8" }}>
                  {paidCount === 0
                    ? "No months paid yet."
                    : `Paid: ${TENURE_MONTHS.filter(mon => mPay[mon.key]).map(m => m.label).join(", ")}`
                  }
                </div>
                {paidCount > 0 && paidCount < 12 && (
                  <div style={{ marginTop: 4, fontSize: 11, color: "#ff8080" }}>
                    Pending: {TENURE_MONTHS.filter(mon => !mPay[mon.key]).map(m => m.label).join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Overall month-wise summary table */}
      {members.length > 0 && (
        <div style={{ ...S.card, marginTop: 16 }}>
          <div style={S.cardTitle}>Month-wise Summary</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginTop: 8 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", color: "#6b9ab8", padding: "4px 6px", borderBottom: "1px solid rgba(74,158,218,0.2)" }}>Member</th>
                  {TENURE_MONTHS.map(mon => (
                    <th key={mon.key} style={{ color: "#6b9ab8", padding: "4px 3px", borderBottom: "1px solid rgba(74,158,218,0.2)", minWidth: 28 }}>{mon.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map(m => {
                  const mPay = monthlyPay[m.id] || {};
                  return (
                    <tr key={m.id}>
                      <td style={{ color: "#e8f4fc", padding: "4px 6px", borderBottom: "1px solid rgba(74,158,218,0.08)", fontWeight: "bold", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.name.split(" ")[0]}
                      </td>
                      {TENURE_MONTHS.map(mon => (
                        <td key={mon.key} style={{ textAlign: "center", padding: "4px 2px", borderBottom: "1px solid rgba(74,158,218,0.08)" }}>
                          <span style={{ color: mPay[mon.key] ? "#80e080" : "#ff6060", fontSize: 12, fontWeight: "bold" }}>
                            {mPay[mon.key] ? "✓" : "✗"}
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

// ─── CALENDAR TAB ─────────────────────────────────────────────────────────────
function CalendarTab({ tenure, tenureKey, isEditor, upd, setModal }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const events = tenure?.events || [];
  const getEventsForDate = (y, m, d) => {
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return events.filter(e => e.date === dateStr);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const selectedDateStr = selectedDay
    ? `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null;
  const selectedEvents = selectedDateStr ? events.filter(e => e.date === selectedDateStr) : [];

  if (!tenure) return <div style={{ textAlign: "center", color: "#6b9ab8", padding: 40 }}>Select a tenure first.</div>;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button style={S.iconBtn} onClick={() => {
          if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1);
        }}>◀</button>
        <div style={{ color: "#a8d8f0", fontWeight: "bold" }}>{monthNames[viewMonth]} {viewYear}</div>
        <button style={S.iconBtn} onClick={() => {
          if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1);
        }}>▶</button>
      </div>

      <div style={S.calGrid}>
        {dayNames.map(d => <div key={d} style={S.calDay}>{d}</div>)}
        {Array(firstDay).fill(null).map((_, i) => <div key={"e" + i} />)}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1;
          const dayEvents = getEventsForDate(viewYear, viewMonth, day);
          const isToday = today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
          const mainType = dayEvents[0]?.type;
          return (
            <div key={day}
              style={S.calCell(dayEvents.length > 0, isToday, mainType)}
              onClick={() => dayEvents.length > 0 || isEditor ? setSelectedDay(day) : null}
            >
              {day}
              {dayEvents.length > 0 && <div style={{ fontSize: 8, marginTop: 1 }}>
                {dayEvents.map(e => getEventType(e.type).icon).join("")}
              </div>}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8, fontSize: 11, color: "#6b9ab8", flexWrap: "wrap" }}>
        {EVENT_TYPES.map(et => (
          <span key={et.key}>{et.icon} {et.label}</span>
        ))}
      </div>

      {selectedDay && (
        <div style={{ ...S.card, marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={S.cardTitle}>{formatDate(selectedDateStr)}</div>
            {isEditor && (
              <button style={S.smallBtn()} onClick={() => setModal({ type: "addEvent", tenureKey, date: selectedDateStr })}>
                {Icon.plus} Add
              </button>
            )}
          </div>
          {selectedEvents.length === 0 && <div style={{ color: "#6b9ab8", fontSize: 12 }}>No events. {isEditor ? "Add one!" : ""}</div>}
          {selectedEvents.map(ev => {
            const et = getEventType(ev.type);
            return (
              <div key={ev.id} style={{ borderTop: "1px solid rgba(74,158,218,0.1)", paddingTop: 8, marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ ...S.badge("gold"), background: et.color, borderColor: et.border }}>
                    {et.icon} {et.label}
                  </span>
                  {isEditor && <button style={S.smallBtn("red")} onClick={() => upd(d => {
                    d.tenures[tenureKey].events = d.tenures[tenureKey].events.filter(e => e.id !== ev.id);
                  })}>{Icon.trash}</button>}
                </div>
                <div style={{ fontSize: 14, color: "#e8f4fc", marginTop: 6, fontWeight: "bold" }}>{ev.title}</div>
                {ev.brief && <div style={{ fontSize: 12, color: "#8bb8d4", marginTop: 4, whiteSpace: "pre-wrap" }}>{ev.brief}</div>}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ─── MEETINGS TAB ─────────────────────────────────────────────────────────────
function MeetingsTab({ tenure, tenureKey, isEditor, upd, setModal }) {
  if (!tenure) return <div style={{ textAlign: "center", color: "#6b9ab8", padding: 40 }}>Select a tenure first.</div>;
  const meetings = tenure.meetings || [];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={S.sectionTitle}>Meetings ({meetings.length})</div>
        {isEditor && (
          <button style={S.smallBtn()} onClick={() => setModal({ type: "addMeeting", tenureKey })}>
            {Icon.plus} Add
          </button>
        )}
      </div>
      {meetings.length === 0 && <div style={{ textAlign: "center", color: "#6b9ab8", padding: 40 }}>No meetings recorded yet.</div>}
      {[...meetings].reverse().map(m => (
        <div key={m.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={S.badge("gold")}>📋 Meeting</span>
              <div style={{ ...S.cardTitle, marginTop: 6 }}>{m.title}</div>
              <div style={S.cardSub}>{formatDate(m.date)}{m.venue ? ` • ${m.venue}` : ""}</div>
            </div>
            {isEditor && (
              <div style={{ display: "flex", gap: 4 }}>
                <button style={S.smallBtn()} onClick={() => setModal({ type: "editMeeting", tenureKey, meeting: m })}>{Icon.edit}</button>
                <button style={S.smallBtn("red")} onClick={() => upd(d => {
                  d.tenures[tenureKey].meetings = d.tenures[tenureKey].meetings.filter(x => x.id !== m.id);
                })}>{Icon.trash}</button>
              </div>
            )}
          </div>
          {m.brief && <div style={{ fontSize: 13, color: "#8bb8d4", marginTop: 10, whiteSpace: "pre-wrap", borderTop: "1px solid rgba(74,158,218,0.1)", paddingTop: 8 }}>{m.brief}</div>}
          {m.decisions && m.decisions.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: "#6b9ab8", marginBottom: 4 }}>DECISIONS:</div>
              {m.decisions.map((dec, i) => (
                <div key={i} style={{ fontSize: 12, color: "#e8f4fc", display: "flex", gap: 6, marginBottom: 3 }}>
                  <span style={{ color: "#4a9eda" }}>•</span> {dec}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({ data, upd, setModal }) {
  return (
    <>
      <div style={S.sectionTitle}>Settings</div>
      <div style={S.card}>
        <div style={S.cardTitle}>Change Editor PIN</div>
        <div style={S.cardSub}>Update the Editor access PIN</div>
        <div style={{ marginTop: 12 }}>
          <button style={S.smallBtn()} onClick={() => setModal({ type: "changePin" })}>Change PIN</button>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>Current Editor PIN</div>
        <div style={{ marginTop: 8, fontSize: 14, color: "#4a9eda" }}>
          <strong>{data.editorPin || EDITOR_PIN}</strong>
        </div>
        <div style={S.cardSub}>Share with committee members who need edit access.</div>
      </div>
    </>
  );
}

// ─── MODAL ROUTER ─────────────────────────────────────────────────────────────
function ModalRouter({ modal, setModal, data, upd, isEditor }) {
  const close = () => setModal(null);
  if (modal.type === "addTenure") return <AddTenureModal close={close} upd={upd} />;
  if (modal.type === "addPost") return <AddPostModal close={close} upd={upd} tenureKey={modal.tenureKey} />;
  if (modal.type === "editPost") return <EditPostModal close={close} upd={upd} tenureKey={modal.tenureKey} post={modal.post} />;
  if (modal.type === "addMember") return <AddMemberModal close={close} upd={upd} />;
  if (modal.type === "editMember") return <EditMemberModal close={close} upd={upd} member={modal.member} />;
  if (modal.type === "deleteMember") return <DeleteMemberModal close={close} upd={upd} member={modal.member} />;
  if (modal.type === "resetPass") return <ResetPassModal close={close} upd={upd} member={modal.member} />;
  if (modal.type === "addEvent") return <AddEventModal close={close} upd={upd} tenureKey={modal.tenureKey} date={modal.date} />;
  if (modal.type === "addMeeting") return <AddMeetingModal close={close} upd={upd} tenureKey={modal.tenureKey} />;
  if (modal.type === "editMeeting") return <EditMeetingModal close={close} upd={upd} tenureKey={modal.tenureKey} meeting={modal.meeting} />;
  if (modal.type === "changePin") return <ChangePinModal close={close} upd={upd} data={data} />;
  return null;
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function ModalWrap({ title, close, children }) {
  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && close()}>
      <div style={S.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={S.modalTitle}>{title}</div>
          <button style={S.iconBtn} onClick={close}>{Icon.x}</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddTenureModal({ close, upd }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [theme, setTheme] = useState("");
  function submit() {
    const key = `${year}-${String(year + 1).slice(-2)}`;
    upd(d => {
      if (!d.tenures) d.tenures = {};
      if (!d.tenures[key]) d.tenures[key] = { posts: [], meetings: [], events: [], monthlyPayments: {} };
      if (theme) d.tenures[key].theme = theme;
    });
    close();
  }
  return (
    <ModalWrap title="Add New Tenure" close={close}>
      <label style={S.label}>Start Year</label>
      <input style={S.input} type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} />
      <div style={{ fontSize: 12, color: "#4a9eda", marginBottom: 12 }}>Tenure: {year}-{String(year + 1).slice(-2)}</div>
      <label style={S.label}>Theme (optional)</label>
      <input style={S.input} type="text" placeholder="e.g. Renewal & Growth" value={theme} onChange={e => setTheme(e.target.value)} />
      <button style={S.btn()} onClick={submit}>Create Tenure</button>
    </ModalWrap>
  );
}

function AddPostModal({ close, upd, tenureKey }) {
  const [title, setTitle] = useState("");
  const [holder, setHolder] = useState("");
  function submit() {
    if (!title) return;
    upd(d => {
      if (!d.tenures[tenureKey].posts) d.tenures[tenureKey].posts = [];
      d.tenures[tenureKey].posts.push({ id: genId(), title, holderName: holder });
    });
    close();
  }
  return (
    <ModalWrap title="Add Post" close={close}>
      <label style={S.label}>Post Title</label>
      <input style={S.input} type="text" placeholder="e.g. President, Secretary" value={title} onChange={e => setTitle(e.target.value)} />
      <label style={S.label}>Holder Name</label>
      <input style={S.input} type="text" placeholder="Name of the person" value={holder} onChange={e => setHolder(e.target.value)} />
      <button style={S.btn()} onClick={submit}>Add Post</button>
    </ModalWrap>
  );
}

function EditPostModal({ close, upd, tenureKey, post }) {
  const [title, setTitle] = useState(post.title);
  const [holder, setHolder] = useState(post.holderName || "");
  function submit() {
    upd(d => {
      const idx = d.tenures[tenureKey].posts.findIndex(p => p.id === post.id);
      if (idx > -1) { d.tenures[tenureKey].posts[idx].title = title; d.tenures[tenureKey].posts[idx].holderName = holder; }
    });
    close();
  }
  function del() {
    upd(d => { d.tenures[tenureKey].posts = d.tenures[tenureKey].posts.filter(p => p.id !== post.id); });
    close();
  }
  return (
    <ModalWrap title="Edit Post" close={close}>
      <label style={S.label}>Post Title</label>
      <input style={S.input} type="text" value={title} onChange={e => setTitle(e.target.value)} />
      <label style={S.label}>Holder Name</label>
      <input style={S.input} type="text" value={holder} onChange={e => setHolder(e.target.value)} />
      <button style={S.btn()} onClick={submit}>Save</button>
      <button style={S.btn("secondary")} onClick={del}>Delete Post</button>
    </ModalWrap>
  );
}

function AddMemberModal({ close, upd }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [photo, setPhoto] = useState("");
  function submit() {
    if (!name) return;
    upd(d => {
      if (!d.members) d.members = [];
      d.members.push({ id: genId(), name, role, photo, password: "" });
    });
    close();
  }
  return (
    <ModalWrap title="Add Member" close={close}>
      <label style={S.label}>Full Name *</label>
      <input style={S.input} type="text" placeholder="e.g. Alvin K Saji" value={name} onChange={e => setName(e.target.value)} />
      <label style={S.label}>Role / Designation</label>
      <input style={S.input} type="text" placeholder="e.g. Treasurer" value={role} onChange={e => setRole(e.target.value)} />
      <label style={S.label}>Photo URL (optional)</label>
      <input style={S.input} type="text" placeholder="https://..." value={photo} onChange={e => setPhoto(e.target.value)} />
      <button style={S.btn()} onClick={submit}>Add Member</button>
    </ModalWrap>
  );
}

function EditMemberModal({ close, upd, member }) {
  const [name, setName] = useState(member.name);
  const [role, setRole] = useState(member.role || "");
  const [photo, setPhoto] = useState(member.photo || "");
  function submit() {
    upd(d => {
      const idx = (d.members || []).findIndex(m => m.id === member.id);
      if (idx > -1) { d.members[idx].name = name; d.members[idx].role = role; d.members[idx].photo = photo; }
    });
    close();
  }
  return (
    <ModalWrap title="Edit Member" close={close}>
      <label style={S.label}>Full Name</label>
      <input style={S.input} type="text" value={name} onChange={e => setName(e.target.value)} />
      <label style={S.label}>Role</label>
      <input style={S.input} type="text" value={role} onChange={e => setRole(e.target.value)} />
      <label style={S.label}>Photo URL</label>
      <input style={S.input} type="text" value={photo} onChange={e => setPhoto(e.target.value)} />
      <button style={S.btn()} onClick={submit}>Save Changes</button>
    </ModalWrap>
  );
}

function DeleteMemberModal({ close, upd, member }) {
  function confirm() {
    upd(d => { d.members = (d.members || []).filter(m => m.id !== member.id); });
    close();
  }
  return (
    <ModalWrap title="Delete Member" close={close}>
      <p style={{ color: "#e8f4fc", marginBottom: 16 }}>Remove <strong>{member.name}</strong>? This cannot be undone.</p>
      <button style={{ ...S.btn(), background: "#c0392b", color: "#fff" }} onClick={confirm}>Yes, Delete</button>
      <button style={S.btn("secondary")} onClick={close}>Cancel</button>
    </ModalWrap>
  );
}

function ResetPassModal({ close, upd, member }) {
  function confirm() {
    upd(d => {
      const idx = (d.members || []).findIndex(m => m.id === member.id);
      if (idx > -1) d.members[idx].password = "";
    });
    close();
  }
  return (
    <ModalWrap title="Reset Password" close={close}>
      <p style={{ color: "#e8f4fc", marginBottom: 16 }}>Reset password for <strong>{member.name}</strong>?</p>
      <button style={{ ...S.btn(), background: "#4a9eda", color: "#050d1a" }} onClick={confirm}>Reset</button>
      <button style={S.btn("secondary")} onClick={close}>Cancel</button>
    </ModalWrap>
  );
}

function AddEventModal({ close, upd, tenureKey, date }) {
  const [type, setType] = useState("meeting");
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  function submit() {
    if (!title) return;
    upd(d => {
      if (!d.tenures[tenureKey].events) d.tenures[tenureKey].events = [];
      d.tenures[tenureKey].events.push({ id: genId(), date, type, title, brief });
    });
    close();
  }
  return (
    <ModalWrap title={`Add Event — ${formatDate(date)}`} close={close}>
      <label style={S.label}>Type</label>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {EVENT_TYPES.map(et => (
          <button key={et.key} style={{
            ...S.navBtn(type === et.key),
            padding: "6px 10px", fontSize: 11,
          }} onClick={() => setType(et.key)}>
            {et.icon} {et.label}
          </button>
        ))}
      </div>
      <label style={S.label}>Title *</label>
      <input style={S.input} type="text" placeholder="e.g. Monthly Meeting" value={title} onChange={e => setTitle(e.target.value)} />
      <label style={S.label}>Brief / Details</label>
      <textarea style={{ ...S.input, height: 80, resize: "vertical" }} placeholder="What happened..." value={brief} onChange={e => setBrief(e.target.value)} />
      <button style={S.btn()} onClick={submit}>Add Event</button>
    </ModalWrap>
  );
}

function AddMeetingModal({ close, upd, tenureKey }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [venue, setVenue] = useState("");
  const [brief, setBrief] = useState("");
  const [dec, setDec] = useState("");
  const [decisions, setDecisions] = useState([]);
  function addDec() { if (dec) { setDecisions(d => [...d, dec]); setDec(""); } }
  function submit() {
    if (!title) return;
    upd(d => {
      if (!d.tenures[tenureKey].meetings) d.tenures[tenureKey].meetings = [];
      d.tenures[tenureKey].meetings.push({ id: genId(), title, date, venue, brief, decisions });
    });
    close();
  }
  return (
    <ModalWrap title="Add Meeting Record" close={close}>
      <label style={S.label}>Title *</label>
      <input style={S.input} type="text" placeholder="e.g. April Monthly Meeting" value={title} onChange={e => setTitle(e.target.value)} />
      <label style={S.label}>Date</label>
      <input style={S.input} type="date" value={date} onChange={e => setDate(e.target.value)} />
      <label style={S.label}>Venue</label>
      <input style={S.input} type="text" placeholder="e.g. Church Hall" value={venue} onChange={e => setVenue(e.target.value)} />
      <label style={S.label}>Meeting Brief</label>
      <textarea style={{ ...S.input, height: 80, resize: "vertical" }} placeholder="Summary..." value={brief} onChange={e => setBrief(e.target.value)} />
      <label style={S.label}>Decisions</label>
      <div style={S.row}>
        <input style={{ ...S.input, flex: 1, marginBottom: 0 }} type="text" placeholder="Add decision..." value={dec}
          onChange={e => setDec(e.target.value)} onKeyDown={e => e.key === "Enter" && addDec()} />
        <button style={S.smallBtn()} onClick={addDec}>{Icon.plus}</button>
      </div>
      <div style={{ marginBottom: 12, marginTop: 6 }}>
        {decisions.map((d, i) => (
          <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
            <span style={{ color: "#4a9eda", fontSize: 12 }}>•</span>
            <span style={{ fontSize: 12, color: "#e8f4fc", flex: 1 }}>{d}</span>
            <button style={S.smallBtn("red")} onClick={() => setDecisions(ds => ds.filter((_, j) => j !== i))}>{Icon.x}</button>
          </div>
        ))}
      </div>
      <button style={S.btn()} onClick={submit}>Save Meeting</button>
    </ModalWrap>
  );
}

function EditMeetingModal({ close, upd, tenureKey, meeting }) {
  const [title, setTitle] = useState(meeting.title);
  const [date, setDate] = useState(meeting.date);
  const [venue, setVenue] = useState(meeting.venue || "");
  const [brief, setBrief] = useState(meeting.brief || "");
  const [decisions, setDecisions] = useState(meeting.decisions || []);
  const [dec, setDec] = useState("");
  function addDec() { if (dec) { setDecisions(d => [...d, dec]); setDec(""); } }
  function submit() {
    upd(d => {
      const idx = d.tenures[tenureKey].meetings.findIndex(m => m.id === meeting.id);
      if (idx > -1) d.tenures[tenureKey].meetings[idx] = { ...d.tenures[tenureKey].meetings[idx], title, date, venue, brief, decisions };
    });
    close();
  }
  return (
    <ModalWrap title="Edit Meeting" close={close}>
      <label style={S.label}>Title</label>
      <input style={S.input} type="text" value={title} onChange={e => setTitle(e.target.value)} />
      <label style={S.label}>Date</label>
      <input style={S.input} type="date" value={date} onChange={e => setDate(e.target.value)} />
      <label style={S.label}>Venue</label>
      <input style={S.input} type="text" value={venue} onChange={e => setVenue(e.target.value)} />
      <label style={S.label}>Brief</label>
      <textarea style={{ ...S.input, height: 80, resize: "vertical" }} value={brief} onChange={e => setBrief(e.target.value)} />
      <label style={S.label}>Decisions</label>
      <div style={S.row}>
        <input style={{ ...S.input, flex: 1, marginBottom: 0 }} type="text" placeholder="Add decision..." value={dec}
          onChange={e => setDec(e.target.value)} onKeyDown={e => e.key === "Enter" && addDec()} />
        <button style={S.smallBtn()} onClick={addDec}>{Icon.plus}</button>
      </div>
      <div style={{ marginBottom: 12, marginTop: 6 }}>
        {decisions.map((d, i) => (
          <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
            <span style={{ color: "#4a9eda", fontSize: 12 }}>•</span>
            <span style={{ fontSize: 12, color: "#e8f4fc", flex: 1 }}>{d}</span>
            <button style={S.smallBtn("red")} onClick={() => setDecisions(ds => ds.filter((_, j) => j !== i))}>{Icon.x}</button>
          </div>
        ))}
      </div>
      <button style={S.btn()} onClick={submit}>Save Changes</button>
    </ModalWrap>
  );
}

function ChangePinModal({ close, upd, data }) {
  const [current, setCurrent] = useState("");
  const [newPin, setNewPin] = useState("");
  const [err, setErr] = useState("");
  function submit() {
    const actual = data.editorPin || EDITOR_PIN;
    if (current !== actual) { setErr("Current PIN is wrong!"); return; }
    if (newPin.length < 4) { setErr("New PIN must be at least 4 characters!"); return; }
    upd(d => { d.editorPin = newPin; });
    close();
  }
  return (
    <ModalWrap title="Change Editor PIN" close={close}>
      <label style={S.label}>Current PIN</label>
      <input style={S.input} type="password" value={current} onChange={e => setCurrent(e.target.value)} />
      <label style={S.label}>New PIN</label>
      <input style={S.input} type="password" value={newPin} onChange={e => setNewPin(e.target.value)} />
      {err && <div style={S.err}>{err}</div>}
      <button style={S.btn()} onClick={submit}>Update PIN</button>
    </ModalWrap>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));

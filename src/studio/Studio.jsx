import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  Plus,
  Minus,
  X,
  Play,
  Pause,
  Heart,
  Shuffle,
  BookOpen,
  FlaskConical,
  MoveUpRight,
  Layers3,
  Timer,
  ChevronDown,
  Volume2,
  VolumeX,
  Check,
  Square,
  Headphones,
  Disc3,
  Menu,
} from "lucide-react";
import { MOVES, TRACKS, LAB_MODES } from "./data";
import { useStored, validIds, validEntries, validPlaylists } from "./storage";
import {
  buildLabPrompt,
  formatTimer,
  sessionPhase,
  sessionDraft,
  journalStats,
  mergeJournalDraft,
} from "./model";
import { StudioContext, useStudio } from "./studio-context";
import { usePractice } from "../practice/practice-context";
import CountDisplay from "../practice/CountDisplay";
import { useAuth } from "../auth-context";
import { toLocalISODate, formatISODate } from "../api";

const NAV = [
  ["/dictionary", "Dictionary"],
  ["/lab", "Lab"],
  ["/music", "Music"],
  ["/history", "History"],
  ["/journal", "Journal"],
];
const isPreview = () =>
  typeof window !== "undefined" &&
  /(?:chatgpt\.site|sites-preview)/.test(window.location.hostname);

export function StudioLayout() {
  const [selected, setSelected, selectionError] = useStored(
    "freestylin.v2.lab-moves",
    [],
    validIds,
  );
  const [savedMoves, setSavedMoves, savedError] = useStored(
    "freestylin.v2.saved-moves",
    [],
    validIds,
  );
  const [favourites, setFavourites, favouriteError] = useStored(
    "freestylin.v2.music-favourites",
    [],
    validIds,
  );
  const [playlists, setPlaylists, playlistError] = useStored(
    "freestylin.v2.playlists",
    [],
    validPlaylists,
  );
  const [session, setSession] = useState(null);
  const [track, setTrack] = useState(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tempoOpen, setTempoOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const toggleMove = (id) =>
    setSelected((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
    );
  const toggleSaved = (id) =>
    setSavedMoves((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
    );
  const toggleFavourite = (id) =>
    setFavourites((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
    );
  const playTrack = (item) => {
    setTrack(item);
    setPlayerOpen(true);
  };
  const error = selectionError || savedError || favouriteError || playlistError;
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  return (
    <StudioContext.Provider
      value={{
        selected,
        setSelected,
        toggleMove,
        savedMoves,
        toggleSaved,
        favourites,
        toggleFavourite,
        playlists,
        setPlaylists,
        session,
        setSession,
        track,
        playTrack,
      }}
    >
      <div className="studio">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <header className="studio-header">
          <Link className="brand" to="/" aria-label="Freestylin home">
            <span className="brand-stamp">
              F<span>↗</span>
            </span>
            <span>
              FREE
              <br />
              STYLIN<span className="brand-period">.</span>
            </span>
          </Link>
          <nav
            aria-label="Main navigation"
            className={menuOpen ? "main-nav open" : "main-nav"}
          >
            {NAV.map(([url, label]) => (
              <NavLink key={url} to={url} onClick={() => setMenuOpen(false)}>
                {label}
                {label === "Lab" && selected.length > 0 && (
                  <span className="nav-count">{selected.length}</span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="style-switch"
              onClick={() => setStyleOpen(!styleOpen)}
              aria-expanded={styleOpen}
            >
              HIP-HOP <ChevronDown size={13} />
            </button>
            <button
              className="mobile-menu icon-button"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={21} />
            </button>
            {user ? (
              <button className="account-link" onClick={logout}>
                Sign out
              </button>
            ) : isPreview() ? (
              <span className="account-link guest-label">Guest workspace</span>
            ) : (
              <Link className="account-link" to="/login">
                Sign in <ArrowUpRight size={13} />
              </Link>
            )}
          </div>
          {styleOpen && (
            <div className="style-popover">
              <p className="eyebrow">PICK YOUR PRACTICE</p>
              <button
                onClick={() => {
                  setStyleOpen(false);
                }}
              >
                <span>Hip-Hop</span>
                <Check size={16} />
              </button>
              {["House", "Popping", "Krump", "Waacking", "Breaking"].map(
                (style) => (
                  <div className="future-style" key={style}>
                    <span>{style}</span>
                    <small>Future edition</small>
                  </div>
                ),
              )}
              <p>One style. A foundation to build on.</p>
            </div>
          )}
        </header>
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="studio-footer">
          <Link className="footer-wordmark" to="/">
            FREESTYLIN<span>↗</span>
          </Link>
          <p>Learn the foundations. Find your own way.</p>
          <span>HIP-HOP EDITION / VOL. 01</span>
          <Link to="/dictionary">
            Back to the dictionary <ArrowUpRight size={14} />
          </Link>
        </footer>
        {error && (
          <p role="alert" className="storage-error">
            {error}
          </p>
        )}
        <div className="practice-dock">
          {track && (
            <div
              className={`persistent-player ${playerOpen ? "expanded" : ""}`}
            >
              <div className="player-heading">
                <Disc3 size={20} />
                <button
                  onClick={() => setPlayerOpen(!playerOpen)}
                  aria-expanded={playerOpen}
                >
                  <span>{track.title}</span>
                  <small>{track.artist} · YouTube player</small>
                </button>
                <button
                  className="icon-button"
                  aria-label={playerOpen ? "Minimise player" : "Expand player"}
                  onClick={() => setPlayerOpen(!playerOpen)}
                >
                  <ChevronDown size={18} />
                </button>
                <button
                  className="icon-button"
                  aria-label="Stop and close music"
                  onClick={() => setTrack(null)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="player-embed">
                <iframe
                  key={track.id}
                  src={`https://www.youtube-nocookie.com/embed/${track.video}`}
                  title={`${track.title} by ${track.artist}`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
                <a
                  href={`https://www.youtube.com/watch?v=${track.video}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Player unavailable? Open on YouTube <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
          )}
          <div className="tempo-dock">
            <button
              className="tempo-toggle"
              aria-expanded={tempoOpen}
              onClick={() => setTempoOpen(!tempoOpen)}
            >
              <span className="status-dot" /> COUNT & TEMPO{" "}
              <ChevronDown size={14} />
            </button>
            <Tempo compact />
            {tempoOpen && (
              <div className="tempo-expanded">
                <Tempo />
              </div>
            )}
          </div>
        </div>
      </div>
    </StudioContext.Provider>
  );
}

function Tempo({ compact = false }) {
  const {
    bpm,
    setBpm,
    isRunning,
    toggle,
    muted,
    setMuted,
    subdivision,
    setSubdivision,
    tapTempo,
  } = usePractice();
  const [tapMessage, setTapMessage] = useState("");
  if (compact)
    return (
      <div className="compact-tempo">
        <span>
          {bpm}
          <small>BPM</small>
        </span>
        <button
          aria-label={isRunning ? "Stop metronome" : "Start metronome"}
          className="icon-button"
          onClick={toggle}
        >
          {isRunning ? <Square size={14} /> : <Play size={14} />}
        </button>
      </div>
    );
  return (
    <div className="tempo-panel">
      <div className="tempo-title">
        <p className="eyebrow">FIND YOUR PULSE</p>
        <span>8-COUNT METRONOME</span>
      </div>
      <CountDisplay />
      <label className="tempo-slider">
        <span>
          <strong>{bpm}</strong> BPM
        </span>
        <input
          aria-label="Metronome BPM"
          type="range"
          min="30"
          max="240"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
        />
      </label>
      <div className="tempo-buttons">
        <button className="action small" onClick={toggle}>
          {isRunning ? <Square size={14} /> : <Play size={14} />}{" "}
          {isRunning ? "Stop" : "Start"}
        </button>
        <button
          onClick={() => {
            const next = tapTempo();
            setTapMessage(next ? `${next} BPM` : "Keep tapping");
          }}
        >
          Tap tempo
        </button>
        <button onClick={() => setMuted(!muted)} aria-pressed={muted}>
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}{" "}
          {muted ? "Silent" : "Sound"}
        </button>
      </div>
      <p className="tap-message" role="status">
        {tapMessage}
      </p>
      <div className="filter-row" aria-label="Rhythmic subdivision">
        {[
          [1, "Counts"],
          [2, "Eighths"],
          [4, "Sixteenths"],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={subdivision === value}
            className={subdivision === value ? "selected" : ""}
            onClick={() => setSubdivision(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="edition-circle">01</span> A SPACE TO FIND YOUR
            FREESTYLE
          </p>
          <h1>
            LEARN IT.
            <br />
            <span className="outline-type">FLIP IT.</span>
            <br />
            MAKE IT{" "}
            <span className="yours">
              YOURS
              <ArrowUpRight />
            </span>
          </h1>
          <p className="hero-description">
            A movement is just the beginning.
            <br />
            Dig into Hip-Hop. Take it to the lab.
            <br />
            Keep what you discover.
          </p>
          <div className="hero-actions">
            <Link className="action yellow" to="/dictionary">
              Explore the dictionary <ArrowUpRight size={19} />
            </Link>
            <Link className="text-link" to="/lab">
              Go to the lab <ArrowRight size={17} />
            </Link>
          </div>
          <p className="hero-footnote">
            FOUNDATIONS FIRST. YOUR EXPRESSION NEXT.
          </p>
        </div>
        <div className="hero-art">
          <img
            src="/hiphop-collage.webp"
            alt="Original collage of a Hip-Hop dancer finding their groove"
          />
          <div className="hero-art-stamp">
            <span>
              NO TWO
              <br />
              ROUNDS
              <br />
              THE SAME.
            </span>
            <MoveUpRight size={40} />
          </div>
          <div className="art-caption">
            THE FLOOR IS YOURS. / HIP-HOP VOL. 01
          </div>
        </div>
      </section>
      <div className="ticker" aria-hidden="true">
        <span>GROOVE</span> × <span>EXPLORE</span> × <span>REPEAT</span> ×{" "}
        <span>REFLECT</span> × <span>GROOVE</span> × <span>EXPLORE</span> ×{" "}
        <span>REPEAT</span> × <span>REFLECT</span> ×
      </div>
      <Dictionary embedded />
      <section className="lab-callout">
        <div>
          <p className="eyebrow">KNOW THE STEP. NOW ASK “WHAT IF?”</p>
          <h2>
            TAKE IT
            <br />
            SOMEWHERE NEW.
          </h2>
          <p>
            Flip one movement. Connect a few. Set a rule.
            <br />
            The lab is where your vocabulary becomes your voice.
          </p>
        </div>
        <Link className="action orange" to="/lab">
          Enter the lab <ArrowUpRight size={22} />
        </Link>
      </section>
    </>
  );
}

export function Dictionary({ embedded = false }) {
  const { selected, toggleMove, savedMoves, toggleSaved } = useStudio();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All movements");
  const [savedOnly, setSavedOnly] = useState(false);
  const [detail, setDetail] = useState(null);
  const visible = MOVES.filter(
    (move) =>
      (category === "All movements" || move.category === category) &&
      (!savedOnly || savedMoves.includes(move.id)) &&
      `${move.name} ${move.description} ${move.teacher}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  return (
    <section
      className={`dictionary section-wrap ${embedded ? "embedded" : ""}`}
      aria-labelledby="dictionary-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            {embedded ? "02" : "01"} / THE MOVEMENT DICTIONARY
          </p>
          <h2 id="dictionary-title">
            BUILD YOUR
            <br />
            <span className="subtle-type">VOCABULARY.</span>
          </h2>
        </div>
        <div className="section-intro">
          <p>
            Start with a foundation. Watch it, understand it,
            <br className="desktop-only" /> then make room for your own
            interpretation.
          </p>
          <span className="catalogue-count">
            HIP-HOP <span>/</span> {String(MOVES.length).padStart(2, "0")}{" "}
            MOVEMENTS
          </span>
        </div>
      </div>
      <div className="dictionary-tools">
        <label className="search-field">
          <Search size={18} />
          <input
            aria-label="Search movements"
            placeholder="Find a movement, groove or teacher…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              aria-label="Clear search"
              className="icon-button"
              onClick={() => setQuery("")}
            >
              <X size={16} />
            </button>
          )}
        </label>
        <button
          className={`saved-filter ${savedOnly ? "selected" : ""}`}
          aria-pressed={savedOnly}
          onClick={() => setSavedOnly(!savedOnly)}
        >
          <Heart size={16} fill={savedOnly ? "currentColor" : "none"} /> Saved (
          {savedMoves.length})
        </button>
      </div>
      <div className="dictionary-filter">
        <div className="filter-row">
          {["All movements", "Groove", "Party dance", "Footwork"].map(
            (item) => (
              <button
                key={item}
                aria-pressed={category === item}
                className={category === item ? "selected" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ),
          )}
        </div>
        <span>
          {visible.length} {visible.length === 1 ? "movement" : "movements"}
        </span>
      </div>
      <div className="movement-grid">
        {visible.map((move) => (
          <article key={move.id} className={`move-card accent-${move.color}`}>
            <button
              className="move-image"
              aria-label={`View ${move.name} tutorial`}
              onClick={() => setDetail(move)}
            >
              <img
                src={`https://i.ytimg.com/vi/${move.video}/hqdefault.jpg`}
                alt={`${move.name} video reference`}
                loading="lazy"
              />
              <span className="move-index">
                HH / {String(MOVES.indexOf(move) + 1).padStart(2, "0")}
              </span>
              <span className="image-play">
                <Play size={20} fill="currentColor" />
              </span>
              <span className="reference-label">
                WATCH REFERENCE <ArrowUpRight size={12} />
              </span>
            </button>
            <div className="move-body">
              <div className="move-meta">
                <span>{move.category}</span>
                <button
                  className={`icon-button save-move ${savedMoves.includes(move.id) ? "saved" : ""}`}
                  aria-label={`${savedMoves.includes(move.id) ? "Unsave" : "Save"} ${move.name}`}
                  aria-pressed={savedMoves.includes(move.id)}
                  onClick={() => toggleSaved(move.id)}
                >
                  <Heart
                    size={16}
                    fill={
                      savedMoves.includes(move.id) ? "currentColor" : "none"
                    }
                  />
                </button>
              </div>
              <button className="move-title" onClick={() => setDetail(move)}>
                {move.name}
                <ArrowUpRight size={19} />
              </button>
              <p>{move.description}</p>
              <div className="move-bottom">
                <span>{move.level}</span>
                <button
                  className={
                    selected.includes(move.id) ? "add-move added" : "add-move"
                  }
                  aria-label={`${selected.includes(move.id) ? "Remove" : "Add"} ${move.name} ${selected.includes(move.id) ? "from" : "to"} Lab`}
                  aria-pressed={selected.includes(move.id)}
                  onClick={() => toggleMove(move.id)}
                >
                  {selected.includes(move.id) ? (
                    <Check size={14} />
                  ) : (
                    <Plus size={14} />
                  )}{" "}
                  {selected.includes(move.id) ? "In your lab" : "Add to lab"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {visible.length === 0 && (
        <div className="empty-state">
          <Search size={28} />
          <h3>No movements found.</h3>
          <p>Try another name or clear your filters.</p>
          <button
            className="action"
            onClick={() => {
              setQuery("");
              setCategory("All movements");
              setSavedOnly(false);
            }}
          >
            Reset filters
          </button>
        </div>
      )}
      {selected.length > 0 && (
        <div className="selection-shelf">
          <span>
            <span className="number-badge">{selected.length}</span>{" "}
            {selected.length === 1 ? "movement" : "movements"} on your lab list
          </span>
          <Link className="text-link" to="/lab">
            Take them into the lab <ArrowRight size={17} />
          </Link>
        </div>
      )}
      <p className="source-note">
        A first edition, built to practise with. Teaching versions vary.
        Reference videos stay credited to their teachers; Freestylin’s lab
        exercises are starting points for exploration.
      </p>
      {detail && <MovementDialog move={detail} close={() => setDetail(null)} />}
    </section>
  );
}

function MovementDialog({ move, close }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const { selected, toggleMove } = useStudio();
  const navigate = useNavigate();
  useEffect(() => {
    const element = ref.current;
    element.showModal();
    return () => {
      element.close();
    };
  }, []);
  return (
    <dialog
      className="movement-dialog"
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      aria-labelledby="movement-title"
    >
      <div className="dialog-inner">
        <div className="dialog-top">
          <p className="eyebrow">MOVEMENT NOTES / HIP-HOP</p>
          <button
            className="icon-button"
            aria-label="Close movement details"
            onClick={close}
          >
            <X />
          </button>
        </div>
        <div className="dialog-layout">
          <div>
            <div className="reference-video">
              {loaded ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${move.video}`}
                  title={`${move.name} reference`}
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button onClick={() => setLoaded(true)}>
                  <img
                    src={`https://i.ytimg.com/vi/${move.video}/hqdefault.jpg`}
                    alt=""
                  />
                  <span>
                    <Play size={26} /> Load tutorial
                  </span>
                </button>
              )}
            </div>
            <p className="video-credit">{move.teacher}</p>
            <a
              className="text-link"
              href={`https://www.youtube.com/watch?v=${move.video}`}
              target="_blank"
              rel="noreferrer"
            >
              Watch on YouTube <ArrowUpRight size={13} />
            </a>
          </div>
          <div>
            <p className="eyebrow">
              {move.category} / {move.level}
            </p>
            <h2 id="movement-title">{move.name}</h2>
            <p>{move.description}</p>
            <h3>WHAT TO EXPLORE</h3>
            <ol>
              {move.cues.map((cue) => (
                <li key={cue}>{cue}</li>
              ))}
            </ol>
            <div className="drill-note">
              <p className="eyebrow">TRY THIS</p>
              <p>{move.drill}</p>
            </div>
            <div className="dialog-actions">
              <button
                className="action yellow"
                onClick={() => {
                  if (!selected.includes(move.id)) toggleMove(move.id);
                  close();
                  navigate("/lab");
                }}
              >
                Take into lab <ArrowUpRight size={17} />
              </button>
              <button
                className="action"
                aria-pressed={selected.includes(move.id)}
                onClick={() => toggleMove(move.id)}
              >
                {selected.includes(move.id) ? (
                  <Minus size={15} />
                ) : (
                  <Plus size={15} />
                )}{" "}
                {selected.includes(move.id)
                  ? "Remove from list"
                  : "Add to list"}
              </button>
            </div>
            <a
              className="source-link"
              href={move.source}
              target="_blank"
              rel="noreferrer"
            >
              View teaching source <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function Lab() {
  const { selected, toggleMove, session, setSession } = useStudio();
  const [mode, setMode] = useState(() => session?.mode || "variation");
  const [rounds, setRounds] = useState(() => session?.rounds || 3);
  const [roundSeconds, setRoundSeconds] = useState(
    () => session?.roundSeconds || 60,
  );
  const [restSeconds, setRestSeconds] = useState(
    () => session?.restSeconds ?? 15,
  );
  const [variant, setVariant] = useState(0);
  const [error, setError] = useState("");
  const { bpm } = usePractice();
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!session?.running) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [session?.running]);
  const elapsed = session
    ? session.elapsedMs +
      (session.running ? Math.max(0, now - session.startedAt) : 0)
    : 0;
  const phase = session ? sessionPhase(session, elapsed) : null;
  const icons = [Shuffle, Layers3, MoveUpRight, Timer];
  function build() {
    try {
      const plan = buildLabPrompt(mode, selected, variant);
      setSession({
        ...plan,
        rounds,
        roundSeconds,
        restSeconds,
        elapsedMs: 0,
        running: false,
        startedAt: null,
      });
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }
  function toggleTimer() {
    const time = Date.now();
    setNow(time);
    setSession((previous) =>
      previous.running
        ? {
            ...previous,
            running: false,
            elapsedMs: previous.elapsedMs + time - previous.startedAt,
            startedAt: null,
          }
        : { ...previous, running: true, startedAt: time },
    );
  }
  function logSession() {
    const actualElapsed =
      session.elapsedMs +
      (session.running ? Date.now() - session.startedAt : 0);
    const draft = sessionDraft(session, actualElapsed, bpm);
    setSession((previous) => ({
      ...previous,
      running: false,
      startedAt: null,
      elapsedMs: actualElapsed,
    }));
    navigate("/journal", { state: { labDraft: draft } });
  }
  return (
    <section className="section-wrap lab-page">
      <PageHeading
        number="02"
        label="THE PRACTICE LAB"
        title={
          <>
            ASK “WHAT IF?”
            <br />
            <span className="subtle-type">THEN TRY IT.</span>
          </>
        }
        description="Choose how you want to explore. A little structure can open up a lot of possibilities."
      />
      <div className="mode-grid">
        {LAB_MODES.map((item, i) => {
          const Icon = icons[i];
          return (
            <button
              key={item.id}
              className={`mode-card ${mode === item.id ? "active" : ""}`}
              aria-pressed={mode === item.id}
              onClick={() => setMode(item.id)}
            >
              <span className="mode-number">
                {item.number}
                <Icon size={19} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
              <span className="mode-check">
                {mode === item.id ? <Check size={16} /> : <Plus size={16} />}
              </span>
            </button>
          );
        })}
      </div>
      <div className="lab-layout">
        <div className="lab-setup">
          <div className="panel-title">
            <h3>YOUR INGREDIENTS</h3>
            <Link to="/dictionary">
              Browse dictionary <ArrowUpRight size={13} />
            </Link>
          </div>
          <p className="muted">
            {mode === "connections"
              ? "Pick two or more movements to connect."
              : mode === "constraints"
                ? "Add movements, or leave it open for freestyle."
                : "Pick at least one movement to start with."}
          </p>
          <div className="ingredient-list">
            {MOVES.map((move) => (
              <button
                key={move.id}
                className={
                  selected.includes(move.id)
                    ? "ingredient chosen"
                    : "ingredient"
                }
                aria-pressed={selected.includes(move.id)}
                onClick={() => toggleMove(move.id)}
              >
                <span>{move.name}</span>
                {selected.includes(move.id) ? (
                  <Check size={15} />
                ) : (
                  <Plus size={15} />
                )}
              </button>
            ))}
          </div>
          <h3>MAKE SOME SPACE</h3>
          <div className="session-settings">
            <label>
              Rounds
              <select
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "round" : "rounds"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Each round
              <select
                value={roundSeconds}
                onChange={(e) => setRoundSeconds(Number(e.target.value))}
              >
                {[30, 60, 90, 120, 180].map((n) => (
                  <option key={n} value={n}>
                    {n} sec
                  </option>
                ))}
              </select>
            </label>
            <label>
              Between rounds
              <select
                value={restSeconds}
                onChange={(e) => setRestSeconds(Number(e.target.value))}
              >
                {[0, 15, 30, 60].map((n) => (
                  <option key={n} value={n}>
                    {n === 0 ? "No rest" : `${n} sec rest`}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error && (
            <p className="inline-error" role="alert">
              {error}
            </p>
          )}
          <button className="action yellow full-width" onClick={build}>
            {session ? "Build a new lab" : "Build my lab"}{" "}
            <ArrowUpRight size={19} />
          </button>
          {session && (
            <p className="fine-print">
              Building a new lab replaces the current timer and exercise. Log it
              first if you want to keep it.
            </p>
          )}
          <div className="lab-tempo">
            <Tempo />
          </div>
        </div>
        <div className="session-workspace">
          {session ? (
            <>
              <div className="panel-title">
                <span className="eyebrow">YOUR EXPLORATION</span>
                <span className="tag">{session.title}</span>
              </div>
              <div className="session-movements">
                {session.movementNames.length ? (
                  session.movementNames.map((name) => (
                    <span key={name}>{name}</span>
                  ))
                ) : (
                  <span>Open freestyle</span>
                )}
              </div>
              <h3 className="exercise-prompt">{session.prompt}</h3>
              <button
                className="text-link"
                onClick={() => {
                  const next = variant + 1;
                  setVariant(next);
                  const plan = buildLabPrompt(
                    session.mode,
                    MOVES.filter((m) =>
                      session.movementNames.includes(m.name),
                    ).map((m) => m.id),
                    next,
                  );
                  setSession((previous) => ({
                    ...previous,
                    prompt: plan.prompt,
                  }));
                }}
              >
                Try another angle <Shuffle size={15} />
              </button>
              <div
                className={`round-timer ${phase.name === "Rest" ? "resting" : ""}`}
              >
                <p className="eyebrow">
                  {phase.complete
                    ? "EXPLORATION COMPLETE"
                    : `${phase.name.toUpperCase()} / ROUND ${phase.round} OF ${session.rounds}`}
                </p>
                <div
                  className="timer-digits"
                  role="timer"
                  aria-label={`${phase.remaining} seconds remaining`}
                >
                  {formatTimer(phase.remaining)}
                </div>
                <div
                  className="timer-progress"
                  role="progressbar"
                  aria-label="Session progress"
                  aria-valuenow={Math.round(phase.progress * 100)}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <span style={{ width: `${phase.progress * 100}%` }} />
                </div>
                <p className="timer-plan">
                  {session.rounds} × {session.roundSeconds}s /{" "}
                  {session.restSeconds}s rest
                </p>
                <div className="timer-actions">
                  <button
                    className="action orange"
                    disabled={phase.complete}
                    onClick={toggleTimer}
                  >
                    {session.running && !phase.complete ? (
                      <Pause size={17} />
                    ) : (
                      <Play size={17} />
                    )}{" "}
                    {phase.complete
                      ? "Complete"
                      : session.running
                        ? "Pause round"
                        : elapsed > 0
                          ? "Resume round"
                          : "Start round"}
                  </button>
                  <button
                    className="action"
                    onClick={() => {
                      setSession((previous) => ({
                        ...previous,
                        running: false,
                        startedAt: null,
                        elapsedMs: 0,
                      }));
                    }}
                  >
                    Reset timer
                  </button>
                </div>
              </div>
              <div className="reflection-callout">
                <BookOpen size={25} />
                <div>
                  <h3>KEEP THE DISCOVERY.</h3>
                  <p>The movements, exercise and time come with you.</p>
                </div>
                <button className="text-link" onClick={logSession}>
                  Reflect & log <ArrowRight size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="lab-empty">
              <div className="lab-orbit">
                <FlaskConical size={54} />
                <span>?</span>
              </div>
              <p className="eyebrow">THIS IS YOUR EXPERIMENT</p>
              <h3>
                NO RIGHT ANSWER.
                <br />
                JUST YOUR NEXT IDEA.
              </h3>
              <p>
                Choose a format and your ingredients.
                <br />
                Build a lab, press play, and see what happens.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function MusicLibrary() {
  const {
    favourites,
    toggleFavourite,
    playlists,
    setPlaylists,
    playTrack,
    track,
  } = useStudio();
  const [view, setView] = useState("discover");
  const [mood, setMood] = useState("All moods");
  const [query, setQuery] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [activeList, setActiveList] = useState("");
  const [message, setMessage] = useState("");
  const [deleteList, setDeleteList] = useState(null);
  const currentList = playlists.find((item) => item.id === activeList);
  const shown = TRACKS.filter(
    (item) =>
      (mood === "All moods" || item.mood === mood) &&
      `${item.title} ${item.artist}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()) &&
      (view !== "favourites" || favourites.includes(item.id)) &&
      (view !== "playlists" || currentList?.trackIds.includes(item.id)),
  );
  function addToList(trackId, listId) {
    if (!listId) return;
    const target = playlists.find((item) => item.id === listId);
    if (target.trackIds.includes(trackId)) {
      setMessage("That track is already in this playlist.");
      return;
    }
    if (
      setPlaylists((items) =>
        items.map((item) =>
          item.id === listId
            ? { ...item, trackIds: [...item.trackIds, trackId] }
            : item,
        ),
      )
    )
      setMessage(`Added to ${target.name}.`);
  }
  function createPlaylist(e) {
    e.preventDefault();
    const name = playlistName.trim();
    if (!name) return;
    const id = crypto.randomUUID();
    if (setPlaylists((items) => [...items, { id, name, trackIds: [] }])) {
      setActiveList(id);
      setPlaylistName("");
      setMessage(`Created ${name}. Add tracks from Discover.`);
    }
  }
  function nextTrack() {
    const pool = shown.length ? shown : TRACKS;
    const index = pool.findIndex((item) => item.id === track?.id);
    playTrack(pool[(index + 1) % pool.length]);
  }
  return (
    <section className="section-wrap music-page">
      <PageHeading
        number="03"
        label="MUSIC FOR MOVEMENT"
        title={
          <>
            FIND YOUR
            <br />
            <span className="subtle-type">NEXT GROOVE.</span>
          </>
        }
        description="A small Hip-Hop selection to start moving. Dig for a track, save what clicks, build your own practice soundtrack."
      />
      <div className="music-feature">
        <div className="record-art">
          <div className="vinyl">
            <div className="vinyl-label">
              F<span>↗</span>
              <small>SIDE A / HIP-HOP</small>
            </div>
          </div>
          <span className="record-sleeve">
            FOR THE
            <br />
            LOVE OF
            <br />
            THE GROOVE.
          </span>
        </div>
        <div className="music-feature-copy">
          <p className="eyebrow">HIP-HOP / LISTEN, THEN MOVE</p>
          <h3>
            LET THE MUSIC
            <br />
            GIVE YOU AN IDEA.
          </h3>
          <p>
            Choose a track below to load its official YouTube player. It stays
            with you when you head into the lab.
          </p>
          <button className="action yellow" onClick={nextTrack}>
            <Shuffle size={17} />{" "}
            {track ? "Discover the next track" : "Find a track"}
          </button>
          <span className="fine-print">
            Playback uses YouTube. Availability and ads depend on the provider.
          </span>
        </div>
      </div>
      <div className="music-layout">
        <aside className="music-sidebar">
          <p className="eyebrow">YOUR RECORD BOX</p>
          {[
            ["discover", "Discover", Disc3],
            ["favourites", "Favourites", Heart],
            ["playlists", "Playlists", Layers3],
          ].map(([id, label, icon]) => {
            const Icon = icon;
            return (
              <button
                key={id}
                className={view === id ? "music-nav active" : "music-nav"}
                onClick={() => setView(id)}
              >
                <Icon size={17} />
                {label}
                <span>
                  {id === "discover"
                    ? TRACKS.length
                    : id === "favourites"
                      ? favourites.length
                      : playlists.length}
                </span>
              </button>
            );
          })}
          <div className="browser-note">
            <span className="status-dot" />
            <p>Favourites and playlists are saved in this browser.</p>
          </div>
          <form className="playlist-form" onSubmit={createPlaylist}>
            <label htmlFor="playlist-name">NEW PLAYLIST</label>
            <div>
              <input
                id="playlist-name"
                value={playlistName}
                maxLength={60}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Name your playlist"
                required
              />
              <button className="icon-button" aria-label="Create playlist">
                <Plus size={18} />
              </button>
            </div>
          </form>
          {playlists.map((item) => (
            <button
              key={item.id}
              className={`playlist-link ${view === "playlists" && item.id === activeList ? "active" : ""}`}
              onClick={() => {
                setActiveList(item.id);
                setView("playlists");
              }}
            >
              ↳ {item.name}
              <span>{item.trackIds.length}</span>
            </button>
          ))}
        </aside>
        <div>
          <div className="track-heading">
            <h3>
              {view === "discover"
                ? "DIG A LITTLE DEEPER."
                : view === "favourites"
                  ? "YOUR FAVOURITES."
                  : currentList?.name || "YOUR PLAYLISTS."}
            </h3>
            {view === "playlists" && currentList && (
              <button
                className="text-link"
                onClick={() => setDeleteList(currentList.id)}
              >
                Delete playlist <X size={13} />
              </button>
            )}
          </div>
          {deleteList && (
            <div className="delete-confirm">
              <p>Delete this playlist? Tracks and favourites will stay.</p>
              <button
                onClick={() => {
                  if (
                    setPlaylists((items) =>
                      items.filter((item) => item.id !== deleteList),
                    )
                  ) {
                    setDeleteList(null);
                    setActiveList("");
                  }
                }}
              >
                Delete playlist
              </button>
              <button onClick={() => setDeleteList(null)}>Cancel</button>
            </div>
          )}
          <div className="music-tools">
            <label className="search-field">
              <Search size={17} />
              <input
                aria-label="Search tracks"
                placeholder="Search tracks or artists…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              aria-label="Filter tracks by mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            >
              {["All moods", "Laid-back", "Grounded", "High energy"].map(
                (value) => (
                  <option key={value}>{value}</option>
                ),
              )}
            </select>
          </div>
          <p className="music-status" role="status">
            {message}
          </p>
          <div className="track-list">
            {shown.map((item) => (
              <article
                className={`track-row accent-${item.color} ${track?.id === item.id ? "current" : ""}`}
                key={item.id}
              >
                <button
                  className="track-cover"
                  aria-label={`Load ${item.title} player`}
                  onClick={() => playTrack(item)}
                >
                  <img
                    loading="lazy"
                    src={`https://i.ytimg.com/vi/${item.video}/hqdefault.jpg`}
                    alt=""
                  />
                  <Play size={18} fill="currentColor" />
                </button>
                <div className="track-info">
                  <span className="eyebrow">
                    HIP-HOP / {item.mood.toUpperCase()}
                  </span>
                  <button
                    className="track-title"
                    onClick={() => playTrack(item)}
                  >
                    {item.title}
                  </button>
                  <p>{item.artist}</p>
                  <small>{item.note}</small>
                </div>
                <div className="track-actions">
                  <button
                    className={`icon-button ${favourites.includes(item.id) ? "saved" : ""}`}
                    aria-label={`${favourites.includes(item.id) ? "Unfavourite" : "Favourite"} ${item.title}`}
                    aria-pressed={favourites.includes(item.id)}
                    onClick={() => toggleFavourite(item.id)}
                  >
                    <Heart
                      size={18}
                      fill={
                        favourites.includes(item.id) ? "currentColor" : "none"
                      }
                    />
                  </button>
                  {playlists.length > 0 && (
                    <select
                      aria-label={`Add ${item.title} to playlist`}
                      value=""
                      onChange={(e) => addToList(item.id, e.target.value)}
                    >
                      <option value="">+ Playlist</option>
                      {playlists.map((list) => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {view === "playlists" && currentList && (
                    <button
                      className="icon-button"
                      aria-label={`Remove ${item.title} from playlist`}
                      onClick={() =>
                        setPlaylists((items) =>
                          items.map((list) =>
                            list.id === activeList
                              ? {
                                  ...list,
                                  trackIds: list.trackIds.filter(
                                    (id) => id !== item.id,
                                  ),
                                }
                              : list,
                          ),
                        )
                      }
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
          {shown.length === 0 && (
            <div className="empty-state">
              <Headphones size={30} />
              <h3>
                {view === "playlists"
                  ? currentList
                    ? "Give this playlist a first track."
                    : "Make room for your music."
                  : view === "favourites"
                    ? "Keep the tracks you come back to."
                    : "No tracks match."}
              </h3>
              <p>
                {view === "playlists"
                  ? "Create a playlist, then add tracks from Discover."
                  : view === "favourites"
                    ? "Tap a heart in Discover to save a favourite."
                    : "Try a different search or mood."}
              </p>
              <button
                className="action"
                onClick={() => {
                  setView("discover");
                  setMood("All moods");
                  setQuery("");
                }}
              >
                Browse all tracks <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function GuestJournal() {
  const [entries, setEntries, storageError] = useStored(
    "freestylin.v2.guest-journal",
    [],
    validEntries,
  );
  const location = useLocation();
  const navigate = useNavigate();
  const today = toLocalISODate();
  const [form, setForm] = useState(() => ({
    date: today,
    ...mergeJournalDraft(
      entries.find((item) => item.date === today),
      location.state?.labDraft,
    ),
    durationMinutes: location.state?.labDraft
      ? mergeJournalDraft(
          entries.find((item) => item.date === today),
          location.state.labDraft,
        ).durationMinutes
      : entries.find((item) => item.date === today)?.durationMinutes || "",
  }));
  const [message, setMessage] = useState("");
  const [deleteDate, setDeleteDate] = useState(null);
  const stats = journalStats(entries, today);
  const editing = entries.some((entry) => entry.date === form.date);
  useEffect(() => {
    if (location.state?.labDraft)
      navigate(location.pathname, { replace: true, state: null });
  }, [location.state?.labDraft, location.pathname, navigate]);
  function selectDate(date) {
    const entry = entries.find((item) => item.date === date);
    setForm({
      date,
      ...mergeJournalDraft(entry, null),
      durationMinutes: entry?.durationMinutes || "",
    });
    setMessage("");
  }
  function save(e) {
    e.preventDefault();
    if (!form.notes.trim() && !form.moves.length) {
      setMessage("Add a reflection or bring a movement from the lab.");
      return;
    }
    const value = {
      ...form,
      durationMinutes: Number(form.durationMinutes || 0),
      notes: form.notes.trim(),
    };
    if (
      setEntries((items) =>
        [...items.filter((item) => item.date !== form.date), value].sort(
          (a, b) => b.date.localeCompare(a.date),
        ),
      )
    )
      setMessage(
        editing
          ? "Your daily entry has been updated."
          : "Session saved. Come back to what you discovered.",
      );
  }
  return (
    <section className="section-wrap journal-page">
      <PageHeading
        number="05"
        label="THE TRAINING JOURNAL"
        title={
          <>
            NOTICE IT.
            <br />
            <span className="subtle-type">COME BACK TO IT.</span>
          </>
        }
        description="Keep the ideas that clicked, the questions that stayed, and the things you want to try next."
      />
      <div className="journal-notice">
        <BookOpen size={18} />
        <p>
          Guest journal · Saved in this browser. Your account journal stays
          separate.
        </p>
        {isPreview() ? (
          <a
            href="https://freestylin.netlify.app/journal"
            target="_blank"
            rel="noreferrer"
          >
            Open account journal <ArrowUpRight size={14} />
          </a>
        ) : (
          <Link to="/login">
            Sign in to your account <ArrowUpRight size={14} />
          </Link>
        )}
      </div>
      <div className="journal-stats">
        {[
          [stats.sessions, "DAYS LOGGED"],
          [stats.minutes, "MINUTES OF PRACTICE"],
          [stats.streak, "DAY STREAK"],
        ].map(([value, label]) => (
          <div key={label}>
            <strong>{String(value).padStart(2, "0")}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="journal-layout">
        <form className="journal-form" onSubmit={save}>
          <div className="panel-title">
            <h3>{editing ? "YOUR DAILY ENTRY" : "LOG A SESSION"}</h3>
            <span className="tag">HIP-HOP</span>
          </div>
          <div className="journal-form-row">
            <label>
              Date
              <input
                type="date"
                aria-label="Journal date"
                max={today}
                required
                value={form.date}
                onChange={(e) => selectDate(e.target.value)}
              />
            </label>
            <label>
              Minutes trained
              <input
                type="number"
                aria-label="Minutes trained"
                min="0"
                max="1440"
                step="1"
                value={form.durationMinutes}
                placeholder="e.g. 30"
                onChange={(e) =>
                  setForm({ ...form, durationMinutes: e.target.value })
                }
              />
            </label>
          </div>
          {editing && (
            <p className="fine-print">
              One entry per day. Saving updates this day’s log.
            </p>
          )}
          {form.moves.length > 0 && (
            <div className="journal-moves">
              {form.moves.map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
          )}
          <fieldset className="energy-field">
            <legend>How was your energy?</legend>
            <div className="energy-options">
              {["Low", "Gentle", "Steady", "Good", "Full"].map((label, i) => (
                <button
                  type="button"
                  key={label}
                  className={form.energy === i + 1 ? "selected" : ""}
                  aria-pressed={form.energy === i + 1}
                  onClick={() =>
                    setForm({
                      ...form,
                      energy: form.energy === i + 1 ? null : i + 1,
                    })
                  }
                >
                  <span>{i + 1}</span>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <label>
            Your reflection
            <textarea
              rows="9"
              required={!form.moves.length}
              maxLength="5000"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="What did you discover? What surprised you? What would you like to revisit?"
            />
          </label>
          {(message || storageError) && (
            <p
              role="status"
              className={storageError ? "inline-error" : "journal-message"}
            >
              {storageError || message}
            </p>
          )}
          <button className="action yellow" type="submit">
            {editing ? "Update daily entry" : "Save session"}{" "}
            <ArrowUpRight size={17} />
          </button>
        </form>
        <div className="journal-history">
          <div className="panel-title">
            <h3>YOUR PRACTICE, OVER TIME.</h3>
            <span>{entries.length} entries</span>
          </div>
          {entries.length === 0 ? (
            <div className="journal-empty">
              <BookOpen size={35} />
              <h3>
                A FIRST PAGE
                <br />
                IS A GOOD START.
              </h3>
              <p>
                No sessions yet. Start in the lab or write a reflection here.
              </p>
              <Link className="text-link" to="/lab">
                Find an experiment <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            entries.map((entry) => (
              <article className="journal-entry" key={entry.date}>
                <p className="eyebrow">{formatISODate(entry.date)}</p>
                <div className="entry-meta">
                  <span>{entry.durationMinutes} MIN</span>
                  <span>
                    {entry.energy ? `ENERGY ${entry.energy}/5` : "HIP-HOP"}
                  </span>
                </div>
                {entry.moves?.length > 0 && <h4>{entry.moves.join(" · ")}</h4>}
                <p className="entry-notes">{entry.notes}</p>
                <div className="entry-actions">
                  <button
                    className="text-link"
                    onClick={() => {
                      selectDate(entry.date);
                      document.getElementById("main").scrollIntoView();
                    }}
                  >
                    Edit entry <ArrowUpRight size={13} />
                  </button>
                  <button
                    className="text-link"
                    onClick={() => setDeleteDate(entry.date)}
                  >
                    Delete <X size={13} />
                  </button>
                </div>
                {deleteDate === entry.date && (
                  <div className="delete-confirm">
                    <p>Delete this daily entry?</p>
                    <button
                      onClick={() => {
                        if (
                          setEntries((items) =>
                            items.filter((item) => item.date !== entry.date),
                          )
                        ) {
                          setDeleteDate(null);
                          if (form.date === entry.date)
                            setForm({
                              date: entry.date,
                              ...mergeJournalDraft(null, null),
                              durationMinutes: "",
                            });
                        }
                      }}
                    >
                      Delete entry
                    </button>
                    <button onClick={() => setDeleteDate(null)}>
                      Keep entry
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export function StyleHistory() {
  return (
    <section className="section-wrap history-page">
      <PageHeading
        number="04"
        label="KNOW WHAT YOU’RE MOVING WITH"
        title={
          <>
            MORE THAN
            <br />
            <span className="subtle-type">THE MOVEMENTS.</span>
          </>
        }
        description="An introduction to the culture behind the practice. Keep learning from the people and communities who shape it."
      />
      <div className="history-feature">
        <span className="history-year">
          1973<span>BRONX, NEW YORK</span>
        </span>
        <div>
          <p className="eyebrow">A LANDMARK IN A LIVING CULTURE</p>
          <h3>
            IT STARTS
            <br />
            WITH A PARTY.
          </h3>
          <p>
            On 11 August 1973, Cindy Campbell and her brother DJ Kool Herc held
            a back-to-school party at 1520 Sedgwick Avenue. Herc extended the
            breaks in records, giving dancers more room to move. This gathering
            is widely remembered as a landmark in Hip-Hop’s beginnings.
          </p>
          <p>
            The culture grew through Black and Latino communities, shared music
            and social spaces. A single date is an entry point into that
            history, not its entire story.
          </p>
          <a
            className="text-link"
            href="https://rediscovering-black-history.blogs.archives.gov/2023/08/11/to-the-hip-hop-and-you-dont-stop-a-tribute-for-the-50th-anniversary-of-hip-hop/"
            target="_blank"
            rel="noreferrer"
          >
            Read the National Archives account <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
      <div className="history-notes">
        <article>
          <span className="eyebrow">01 / LEARN FROM THE SOURCE</span>
          <h3>
            PEOPLE CARRY
            <br />
            THE KNOWLEDGE.
          </h3>
          <p>
            A tutorial shows a teacher’s version. Pay attention to who is
            teaching, the language they use and where their knowledge comes
            from. Compare sources and keep asking questions in classes and
            sessions.
          </p>
          <a
            href="https://web.nypl.org/research/research-catalog/bib/b23047727"
            className="text-link"
            target="_blank"
            rel="noreferrer"
          >
            NYPL · Buddha Stretch oral history <ArrowUpRight size={14} />
          </a>
        </article>
        <article>
          <span className="eyebrow">02 / FROM LEARNING TO LABBING</span>
          <h3>
            THE FOUNDATION
            <br />
            IS A BEGINNING.
          </h3>
          <p>
            Use the dictionary to meet a movement. Use the lab to ask your own
            questions about it. Your journal is a place to notice how that
            relationship changes through practice.
          </p>
          <Link className="text-link" to="/dictionary">
            Meet the movements <ArrowRight size={14} />
          </Link>
        </article>
      </div>
    </section>
  );
}

function PageHeading({ number, label, title, description }) {
  return (
    <div className="section-heading page-heading">
      <div>
        <p className="eyebrow">
          {number} / {label}
        </p>
        <h1>{title}</h1>
      </div>
      <p className="section-intro">{description}</p>
    </div>
  );
}

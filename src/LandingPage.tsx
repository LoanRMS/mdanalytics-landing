import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';

const APP_URL = import.meta.env.VITE_APP_URL || '#';

// ─── Animation Variants ────────────────────────────────────────────────────

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

// ─── Custom Hook: Count-Up ─────────────────────────────────────────────────

function useCountUp(end: number, duration = 2000, triggered = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!triggered) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, triggered]);
  return count;
}

// ─── Reveal ──────────────────────────────────────────────────────────────────

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Floating Orbs ───────────────────────────────────────────────────────────

function FloatingOrbs({ variant = 'hero' }: { variant?: 'hero' | 'cta' }) {
  const reduced = useReducedMotion();
  const orbs =
    variant === 'cta'
      ? [
          { color: 'rgba(52,211,153,0.18)', size: 700, left: '10%', top: '-20%', dx: [0, 50, -30, 0], dy: [0, -40, 60, 0], dur: 22 },
          { color: 'rgba(56,189,248,0.14)', size: 550, left: '60%', top: '20%', dx: [0, -40, 30, 0], dy: [0, 50, -30, 0], dur: 26 },
        ]
      : [
          { color: 'rgba(52,211,153,0.10)', size: 800, left: '-5%', top: '0%', dx: [0, 60, -30, 0], dy: [0, -50, 70, 0], dur: 30 },
          { color: 'rgba(56,189,248,0.08)', size: 650, left: '65%', top: '30%', dx: [0, -50, 35, 0], dy: [0, 60, -35, 0], dur: 35 },
          { color: 'rgba(139,92,246,0.07)', size: 500, left: '30%', top: '55%', dx: [0, 40, -60, 0], dy: [0, -40, 50, 0], dur: 40 },
        ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            left: orb.left,
            top: orb.top,
          }}
          animate={reduced ? {} : { x: orb.dx, y: orb.dy }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
        />
      ))}
    </div>
  );
}

// ─── Spotlight Card ──────────────────────────────────────────────────────────

function SpotlightCard({
  children,
  className = '',
  spotColor = 'rgba(52,211,153,0.08)',
  spotSize = 320,
}: {
  children: React.ReactNode;
  className?: string;
  spotColor?: string;
  spotSize?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduced || !spotRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      spotRef.current.style.transform = `translate(${e.clientX - rect.left - spotSize / 2}px, ${e.clientY - rect.top - spotSize / 2}px)`;
      spotRef.current.style.opacity = '1';
    },
    [reduced, spotSize]
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { if (spotRef.current) spotRef.current.style.opacity = '0'; }}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        ref={spotRef}
        className="absolute pointer-events-none rounded-full opacity-0 transition-opacity duration-500"
        style={{
          width: spotSize,
          height: spotSize,
          background: `radial-gradient(circle, ${spotColor} 0%, transparent 70%)`,
          top: 0,
          left: 0,
        }}
      />
      {children}
    </div>
  );
}

// ─── Tilt Card ───────────────────────────────────────────────────────────────

function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduced || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 9;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -9;
      ref.current.style.transition = 'none';
      ref.current.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) scale(1.02)`;
    },
    [reduced]
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)';
    ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`h-full ${className}`}
      style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

// ─── Marquee ─────────────────────────────────────────────────────────────────

function Marquee({ items }: { items: string[] }) {
  const reduced = useReducedMotion();
  const tripled = [...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-28 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #080d1a, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-28 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #080d1a, transparent)' }} />
      <motion.div
        className="flex items-center py-1"
        animate={reduced ? {} : { x: ['0%', '-33.33%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {tripled.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 pr-12 text-gray-600 font-semibold text-sm tracking-tight whitespace-nowrap hover:text-gray-400 transition-colors duration-300 cursor-default select-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 shrink-0" />
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Animated Connecting Line ─────────────────────────────────────────────────

function AnimatedLine() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });

  return (
    <motion.div
      ref={ref}
      className="hidden lg:block absolute top-13 h-px origin-left"
      style={{
        left: '20%',
        right: '20%',
        background: 'linear-gradient(to right, rgba(52,211,153,0.15), rgba(52,211,153,0.4), rgba(34,211,238,0.4), rgba(52,211,153,0.15))',
      }}
      initial={{ scaleX: 0 }}
      animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
      transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

// ─── Navbar ─────────────────────────────────────────────────────────────────

function Navbar({ onSignIn }: { onSignIn: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const scrollTo = useCallback((id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const navLinks = [
    { label: 'Features', id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Integrations', id: 'integrations' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#080d1a]/90 backdrop-blur-2xl shadow-[0_1px_0_rgba(255,255,255,0.04),0_4px_32px_rgba(0,0,0,0.4)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="h-8 w-8 rounded-xl bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.45)]">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-100 tracking-tight text-[15px]">MDAnalytics</span>
        </motion.div>

        <motion.nav
          className="hidden md:flex items-center gap-0.5"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {navLinks.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-white/6 transition-all duration-200 relative group"
            >
              {l.label}
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-px bg-emerald-400/50 transition-all duration-300 rounded-full" />
            </button>
          ))}
        </motion.nav>

        <motion.div
          className="hidden md:flex items-center gap-3"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <button onClick={onSignIn} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors duration-200">
            Sign In
          </button>
          <button
            onClick={() => scrollTo('contact')}
            className="relative overflow-hidden px-5 py-2.5 text-sm rounded-xl font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all duration-300 shadow-[0_0_20px_rgba(52,211,153,0.2)] hover:shadow-[0_0_28px_rgba(52,211,153,0.35)] group"
          >
            <span className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-300/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            Request Demo
          </button>
        </motion.div>

        <button
          className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-[#080d1a]/95 backdrop-blur-2xl border-b border-white/[0.07]"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((l) => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="block w-full text-left px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all"
                >
                  {l.label}
                </button>
              ))}
              <div className="pt-3 flex flex-col gap-2 border-t border-white/[0.07] mt-3">
                <button onClick={onSignIn} className="px-4 py-3 text-sm text-gray-300 text-left">Sign In →</button>
                <button
                  onClick={() => scrollTo('contact')}
                  className="px-4 py-3 text-sm rounded-xl font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-center"
                >
                  Request Demo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── Hero Section ────────────────────────────────────────────────────────────

function HeroSection() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });

  const c1 = useCountUp(50000, 2200, statsInView);
  const c2 = useCountUp(10, 1400, statsInView);
  const c3 = useCountUp(7, 1000, statsInView);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-[#080d1a]" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 50% at 20% 40%, rgba(52,211,153,0.13) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 60%, rgba(56,189,248,0.10) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 50% 80%, rgba(139,92,246,0.07) 0%, transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.55) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />
      <FloatingOrbs variant="hero" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32 flex flex-col lg:flex-row items-center gap-16">
        <motion.div
          className="flex-1 text-center lg:text-left"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6 shadow-[0_0_24px_rgba(52,211,153,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Trusted by Armenian financial institutions
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.06] tracking-tight"
          >
            <span className="text-gray-100">Make Smarter</span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #34d399 0%, #22d3ee 50%, #818cf8 100%)' }}
            >
              Loan Decisions,
            </span>
            <br />
            <span className="text-gray-100">Faster.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="mt-6 text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            MDAnalytics aggregates credit intelligence from every source — ACRA, CBA, Ekeng, Velox — and delivers an AI-powered risk score in under two minutes. Replace days of manual work with one unified platform.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button
              onClick={() => scrollTo('contact')}
              className="relative overflow-hidden w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-semibold bg-linear-to-r from-emerald-500 to-cyan-500 text-white transition-all duration-300 shadow-[0_8px_32px_rgba(52,211,153,0.35)] hover:shadow-[0_12px_48px_rgba(52,211,153,0.55)] hover:-translate-y-0.5 group"
            >
              <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              Request a Demo
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-medium text-gray-300 border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/16 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              See How It Works
              <motion.span
                className="inline-block"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </motion.span>
            </button>
          </motion.div>

          <motion.div
            ref={statsRef}
            variants={stagger}
            className="mt-14 grid grid-cols-3 gap-6 max-w-sm mx-auto lg:mx-0"
          >
            {[
              { value: `${c1.toLocaleString()}+`, label: 'Loans Assessed' },
              { value: `${c2}+`, label: 'Institutions' },
              { value: `${c3}`, label: 'Data Sources' },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeInUp} className="text-center lg:text-left">
                <div className="text-2xl font-bold text-gray-100 tabular-nums">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="flex-1 w-full max-w-2xl"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative">
            <div
              className="absolute -inset-6 rounded-3xl opacity-50 blur-3xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(52,211,153,0.22) 0%, rgba(56,189,248,0.14) 50%, transparent 70%)' }}
            />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative rounded-2xl overflow-hidden border border-white/15 shadow-[0_32px_80px_rgba(0,0,0,0.7)] bg-slate-900"
            >
              <div className="bg-slate-950 px-4 py-3 flex items-center gap-3 border-b border-white/[0.07]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex-1 bg-white/5 rounded-lg px-3 py-1 text-xs text-gray-500 text-center">
                  app.mdanalytics.am
                </div>
              </div>
              <MockDashboard />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <span className="text-[10px] tracking-widest uppercase font-medium">Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Mock Dashboard ──────────────────────────────────────────────────────────

function MockDashboard() {
  const rows = [
    { id: 'LG-2026-4231', name: 'Aram Petrosyan', amount: '5,000,000 ֏', score: 742, status: 'Approved' },
    { id: 'LG-2026-4232', name: 'Ani Hovhannisyan', amount: '12,000,000 ֏', score: 695, status: 'In Review' },
    { id: 'LG-2026-4233', name: 'Gevorg Harutyunyan', amount: '8,500,000 ֏', score: 823, status: 'Approved' },
    { id: 'LG-2026-4234', name: 'Mariam Mkrtchyan', amount: '3,200,000 ֏', score: 580, status: 'Rejected' },
    { id: 'LG-2026-4235', name: 'Varduhi Sargsyan', amount: '7,800,000 ֏', score: 711, status: 'In Review' },
  ];

  const statusColor: Record<string, string> = {
    Approved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'In Review': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  const scoreColor = (s: number) =>
    s >= 720 ? 'text-emerald-400' : s >= 650 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="flex bg-[#0a0f1c] text-xs" style={{ height: 360 }}>
      <div className="w-10 shrink-0 bg-slate-950 border-r border-white/[0.07] flex flex-col items-center py-3 gap-3">
        {[
          <path key="h" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
          <path key="g" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
          <path key="c" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
          <path key="s" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
        ].map((d, i) => (
          <button key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center ${i === 1 ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-600 hover:text-gray-400'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{d}</svg>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 py-2.5 bg-slate-900/80 border-b border-white/[0.07] flex items-center gap-3">
          <span className="text-gray-300 font-medium">Loan Groups</span>
          <div className="flex gap-1.5 ml-auto">
            {['Draft', 'Active', 'Approved', 'Rejected'].map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-full bg-white/5 text-gray-500 text-[10px]">{s}</span>
            ))}
          </div>
          <button className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">+ New Group</button>
        </div>

        <div className="px-4 py-3 grid grid-cols-4 gap-3 border-b border-white/[0.07]">
          {[
            { label: 'Total Groups', value: '247' },
            { label: 'Avg Score', value: '714' },
            { label: 'Approved', value: '82%' },
            { label: 'In Review', value: '31' },
          ].map((s) => (
            <div key={s.label} className="bg-white/3 rounded-lg p-2.5">
              <div className="text-gray-500 text-[10px]">{s.label}</div>
              <div className="text-gray-200 font-semibold text-sm mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>
  
        <div className="flex-1 overflow-hidden">
          <div className="grid border-b border-white/[0.07] bg-slate-900/60" style={{ gridTemplateColumns: '1.4fr 1.6fr 1.2fr 0.7fr 0.8fr' }}>
            {['Group ID', 'Applicant', 'Loan Amount', 'Score', 'Status'].map((h) => (
              <div key={h} className="px-3 py-2 text-gray-500 text-[10px] font-medium uppercase tracking-wide">{h}</div>
            ))}
          </div>
          {rows.map((r) => (
            <div
              key={r.id}
              className="grid border-b border-white/4 hover:bg-white/2.5 transition-colors cursor-pointer"
              style={{ gridTemplateColumns: '1.4fr 1.6fr 1.2fr 0.7fr 0.8fr' }}
            >
              <div className="px-3 py-2.5 text-emerald-400 font-mono text-[10px]">{r.id}</div>
              <div className="px-3 py-2.5 text-gray-300 text-[10px]">{r.name}</div>
              <div className="px-3 py-2.5 text-gray-400 text-[10px]">{r.amount}</div>
              <div className={`px-3 py-2.5 font-semibold text-[10px] ${scoreColor(r.score)}`}>{r.score}</div>
              <div className="px-3 py-2.5">
                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-medium ${statusColor[r.status]}`}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Trusted By ──────────────────────────────────────────────────────────────

function TrustedBySection() {
  const institutions = ['Evoca Bank', 'Fast Credit', 'Kamurj', 'ID Bank', 'TellCell Finance', 'Converse Bank'];

  return (
    <section className="py-14 border-y border-white/6 bg-[#080d1a]">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <p className="text-center text-gray-600 text-xs mb-7 tracking-widest uppercase font-medium">
            Trusted by leading Armenian financial institutions
          </p>
        </Reveal>
        <Reveal>
          <Marquee items={institutions} />
        </Reveal>
      </div>
    </section>
  );
}

// ─── Problem Section ─────────────────────────────────────────────────────────

function ProblemSection() {
  const problems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ),
      title: 'Manual Assessment Takes Days',
      description: 'Analysts spend hours hunting down credit reports, tax records, and identity documents from disparate systems — only to repeat the process for every applicant.',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582 4 8 4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
      ),
      title: 'Data Scattered Across Systems',
      description: 'ACRA, CBA, Ekeng, Velox — each system has its own interface, its own login, its own format. Consolidating data for a single borrower is an error-prone, time-consuming ordeal.',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      ),
      title: 'Compliance Risk & Inconsistency',
      description: "Without a structured workflow, different analysts apply different criteria. Audit trails are incomplete, regulatory reviews are stressful, and the risk of a bad lending decision is high.",
    },
  ];

  return (
    <section className="py-24 bg-[#080d1a]" id="problem">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium mb-4">
            The Problem
          </div>
          <h2 className="text-4xl font-bold text-gray-100 tracking-tight">
            Loan decisions shouldn't take days
          </h2>
          <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
            Armenian financial institutions are losing competitive advantage — and accepting unnecessary risk — because credit assessment infrastructure hasn't kept pace.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <TiltCard>
                <SpotlightCard
                  spotColor="rgba(239,68,68,0.07)"
                  className="h-full p-7 rounded-2xl bg-white/3 border border-white/8 hover:bg-white/5 hover:border-red-500/15 transition-all duration-300 group"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-red-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all duration-300">
                    {p.icon}
                  </div>
                  <h3 className="text-gray-200 font-semibold text-base mb-3">{p.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{p.description}</p>
                </SpotlightCard>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features Section ────────────────────────────────────────────────────────

function FeaturesSection() {
  const features = [
    {
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      label: 'Unified Data Aggregation',
      title: 'One click. Every data source.',
      description: 'Pull credit history from ACRA and CBA, financial statements from Ekeng, and identity verification from Velox — simultaneously, in seconds.',
      accent: 'emerald',
      span: 'col-span-1 md:col-span-2',
    },
    {
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
      label: 'AI Risk Scoring',
      title: 'Consistent, explainable decisions',
      description: 'ScoreFlex V1 & V2 models with configurable criteria deliver consistent risk scores with full explanability — removing guesswork from credit decisions.',
      accent: 'violet',
      span: 'col-span-1',
    },
    {
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      label: 'Loan Group Management',
      title: 'Complex structures, simple workflows',
      description: 'Handle multi-participant loans with borrowers, guarantors, and co-signers. Every participant assessed together in a single cohesive workflow.',
      accent: 'cyan',
      span: 'col-span-1',
    },
    {
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      label: 'Compliance & Audit Trail',
      title: 'Built for regulatory confidence',
      description: 'Immutable audit logs, role-based access control, and complete decision histories ensure every loan review meets Armenian banking regulations.',
      accent: 'emerald',
      span: 'col-span-1',
    },
    {
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      label: 'Real-Time Analytics',
      title: 'Complete pipeline visibility',
      description: 'Live dashboards, 12-month trend charts, and application-status tracking give management instant visibility into lending performance.',
      accent: 'amber',
      span: 'col-span-1 md:col-span-2',
    },
  ];

  const accentMap: Record<string, { bg: string; border: string; text: string; spot: string; line: string }> = {
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', spot: 'rgba(52,211,153,0.07)', line: 'via-emerald-400/35' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/25', text: 'text-violet-400', spot: 'rgba(139,92,246,0.07)', line: 'via-violet-400/35' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/25', text: 'text-cyan-400', spot: 'rgba(56,189,248,0.07)', line: 'via-cyan-400/35' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/25', text: 'text-amber-400', spot: 'rgba(245,158,11,0.07)', line: 'via-amber-400/35' },
  };

  return (
    <section id="features" className="py-24 bg-[#060a15]">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
            Features
          </div>
          <h2 className="text-4xl font-bold text-gray-100 tracking-tight">
            Everything your team needs to lend confidently
          </h2>
          <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
            From application intake to final decision, MDAnalytics handles the full credit intelligence workflow.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const accent = accentMap[f.accent];
            return (
              <Reveal key={f.label} delay={i * 0.07} className={f.span}>
                <TiltCard>
                  <SpotlightCard
                    spotColor={accent.spot}
                    className="h-full p-7 rounded-2xl bg-white/3 border border-white/8 hover:bg-white/5.5 hover:border-white/[0.14] transition-all duration-300 group cursor-default"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent ${accent.line} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-t-2xl`} />
                    <div className={`w-10 h-10 rounded-xl ${accent.bg} border ${accent.border} ${accent.text} flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300`}>
                      {f.icon}
                    </div>
                    <div className={`text-[11px] font-semibold uppercase tracking-widest ${accent.text} mb-2`}>{f.label}</div>
                    <h3 className="text-gray-200 font-semibold text-lg mb-3 leading-snug">{f.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
                  </SpotlightCard>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Integrations Section ────────────────────────────────────────────────────

function IntegrationsSection() {
  const integrations = [
    {
      name: 'ACRA',
      full: 'Armenian Credit Bureau',
      description: 'Complete credit histories, outstanding obligations, and payment behaviour for all Armenian borrowers.',
      color: 'emerald',
    },
    {
      name: 'CBA',
      full: 'Central Bank of Armenia',
      description: 'Official banking data including account information, credit classifications, and regulatory records.',
      color: 'cyan',
    },
    {
      name: 'Ekeng',
      full: 'Tax & Financial Registry',
      description: 'Verified income statements, tax declarations, and financial standing from the Armenian tax authority.',
      color: 'violet',
    },
    {
      name: 'Velox',
      full: 'Identity Verification',
      description: 'Instant identity verification and customer due diligence against official Armenian databases.',
      color: 'amber',
    },
    {
      name: 'SSO',
      full: 'Enterprise SSO (Keycloak)',
      description: 'Seamless integration with Active Directory and existing identity providers via OpenID Connect.',
      color: 'slate',
    },
  ];

  const colorMap: Record<string, { ring: string; bg: string; text: string; border: string; spot: string }> = {
    emerald: { ring: 'ring-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/25', spot: 'rgba(52,211,153,0.08)' },
    cyan:    { ring: 'ring-cyan-500/20', bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/25', spot: 'rgba(56,189,248,0.08)' },
    violet:  { ring: 'ring-violet-500/20', bg: 'bg-violet-500/10', text: 'text-violet-300', border: 'border-violet-500/25', spot: 'rgba(139,92,246,0.08)' },
    amber:   { ring: 'ring-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/25', spot: 'rgba(245,158,11,0.08)' },
    slate:   { ring: 'ring-slate-500/20', bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/25', spot: 'rgba(148,163,184,0.06)' },
  };

  return (
    <section id="integrations" className="py-24 bg-[#080d1a]">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
            Integrations
          </div>
          <h2 className="text-4xl font-bold text-gray-100 tracking-tight">
            Every Armenian data source, unified
          </h2>
          <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
            Pre-built connections to the data sources that matter most to Armenian lenders. No custom integration work required.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {integrations.map((intg, i) => {
            const c = colorMap[intg.color];
            return (
              <Reveal key={intg.name} delay={i * 0.08}>
                <SpotlightCard
                  spotColor={c.spot}
                  className="h-full p-6 rounded-2xl bg-white/3 border border-white/8 hover:border-white/[0.14] transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${c.bg} border ${c.border} ring-4 ${c.ring} flex items-center justify-center group-hover:scale-105 group-hover:ring-8 transition-all duration-300`}>
                      <span className={`font-bold text-sm ${c.text}`}>{intg.name}</span>
                    </div>
                    <div>
                      <div className="text-gray-200 font-semibold text-sm">{intg.name}</div>
                      <div className="text-gray-500 text-xs">{intg.full}</div>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{intg.description}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Pre-built connector
                  </div>
                </SpotlightCard>
              </Reveal>
            );
          })}

          <Reveal delay={0.4}>
            <div className="h-full p-6 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 text-center group hover:border-white/20 hover:bg-white/2 transition-all duration-300 cursor-default">
              <motion.div
                className="w-10 h-10 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 90 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" /></svg>
              </motion.div>
              <div>
                <div className="text-gray-400 text-sm font-medium">Custom Integrations</div>
                <div className="text-gray-600 text-xs mt-1">Connect any system via our open API</div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Create the Loan Group',
      description: 'Register the application with all participants — primary borrower, co-borrowers, and guarantors. Enter loan parameters: amount, term, collateral, and purpose.',
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    },
    {
      number: '02',
      title: 'Aggregate Intelligence',
      description: 'One click triggers simultaneous queries to ACRA, CBA, Ekeng, and Velox. Complete borrower profiles — credit history, income, identity — are assembled automatically.',
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582 4 8 4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>,
    },
    {
      number: '03',
      title: 'Score & Decide',
      description: "ScoreFlex AI models assess risk across every data point, generating an explainable score with criterion-level breakdowns. Your analyst reviews the insight, not the raw data.",
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#060a15]">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
            How It Works
          </div>
          <h2 className="text-4xl font-bold text-gray-100 tracking-tight">
            From application to decision in three steps
          </h2>
          <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
            MDAnalytics eliminates the grunt work so your analysts focus on judgment, not data gathering.
          </p>
        </Reveal>

        <div className="relative">
          <AnimatedLine />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {steps.map((s, i) => (
              <Reveal key={s.number} delay={i * 0.15}>
                <div className="relative text-center lg:text-left group">
                  <div className="relative inline-flex w-26 h-26 rounded-3xl items-center justify-center mb-6 bg-linear-to-br from-emerald-500/15 to-cyan-500/15 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 group-hover:shadow-[0_0_40px_rgba(52,211,153,0.2)] transition-all duration-500">
                    <div className="scale-[1.4]">{s.icon}</div>
                    <motion.div
                      className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-linear-to-br from-emerald-500 to-cyan-500 text-white text-[11px] font-bold flex items-center justify-center shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                      whileInView={{ scale: [0, 1.2, 1] }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.15 + 0.3 }}
                    >
                      {i + 1}
                    </motion.div>
                  </div>
                  <div className="text-gray-600 text-xs font-mono mb-2">{s.number}</div>
                  <h3 className="text-gray-100 font-semibold text-xl mb-4">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-16">
          <motion.div
            className="relative rounded-2xl bg-linear-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 p-10 text-center overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-500/6 to-transparent pointer-events-none"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2.5 }}
            />
            <div
              className="relative text-6xl font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #34d399, #22d3ee)' }}
            >
              &lt; 2 minutes
            </div>
            <div className="mt-3 text-gray-400 text-base relative">
              Average time from application creation to complete risk score — down from 2–3 days with manual processes.
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Benefits / Stats ────────────────────────────────────────────────────────

function BenefitsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();

  const stats = [
    { value: 90, suffix: '%', label: 'Faster Assessment', sub: 'Days reduced to under 2 minutes' },
    { value: 7, suffix: 'x', label: 'More Data Points', sub: 'Versus manual single-source review' },
    { value: 30, suffix: '%', label: 'Lower Default Risk', sub: 'Through comprehensive scoring' },
    { value: 100, suffix: '%', label: 'Audit Compliance', sub: 'Every decision fully traceable' },
  ];

  const counts = [
    useCountUp(stats[0].value, 2000, inView),
    useCountUp(stats[1].value, 1200, inView),
    useCountUp(stats[2].value, 1800, inView),
    useCountUp(stats[3].value, 2200, inView),
  ];

  return (
    <section className="py-24 bg-[#080d1a]">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-4">
            Results
          </div>
          <h2 className="text-4xl font-bold text-gray-100 tracking-tight">
            Real impact on your lending operation
          </h2>
        </Reveal>

        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <SpotlightCard
                spotColor="rgba(52,211,153,0.08)"
                className="p-7 rounded-2xl bg-white/3 border border-white/8 text-center group hover:bg-white/5.5 hover:border-white/14 transition-all duration-300"
              >
                <div className="relative inline-block">
                  {!reduced && (
                    <motion.div
                      className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
                      style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.3) 0%, transparent 70%)' }}
                      animate={inView ? { scale: [0.8, 1.4, 0.8], opacity: [0, 0.6, 0] } : {}}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                    />
                  )}
                  <div
                    className="relative text-5xl font-bold bg-clip-text text-transparent tabular-nums"
                    style={{ backgroundImage: 'linear-gradient(135deg, #34d399, #22d3ee)' }}
                  >
                    {counts[i]}{s.suffix}
                  </div>
                </div>
                <div className="text-gray-200 font-semibold text-sm mt-3">{s.label}</div>
                <div className="text-gray-600 text-xs mt-1">{s.sub}</div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ────────────────────────────────────────────────────────────

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "MDAnalytics transformed our credit assessment workflow. What used to take three days now happens in under two hours. Our analysts focus on judgment calls, not data gathering.",
      name: 'Artur Karapetyan',
      title: 'Head of Retail Credit',
      company: 'Leading Armenian Bank',
      initial: 'A',
      color: 'emerald',
    },
    {
      quote: "The integration with ACRA and CBA means we always have the full picture. Decision consistency has improved dramatically — and so has our portfolio quality.",
      name: 'Narine Grigoryan',
      title: 'Chief Risk Officer',
      company: 'Armenian Credit Organization',
      initial: 'N',
      color: 'cyan',
    },
    {
      quote: "Audit readiness used to be a stressful two-week exercise. Now we pull complete audit trails in minutes. MDAnalytics has made compliance a strength, not a burden.",
      name: 'Tigran Asatryan',
      title: 'Compliance Director',
      company: 'Financial Institution, Armenia',
      initial: 'T',
      color: 'violet',
    },
  ];

  const colorMap: Record<string, { avatar: string; spot: string }> = {
    emerald: { avatar: 'bg-emerald-500/20 text-emerald-300', spot: 'rgba(52,211,153,0.07)' },
    cyan:    { avatar: 'bg-cyan-500/20 text-cyan-300', spot: 'rgba(56,189,248,0.07)' },
    violet:  { avatar: 'bg-violet-500/20 text-violet-300', spot: 'rgba(139,92,246,0.07)' },
  };

  return (
    <section className="py-24 bg-[#060a15]">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-medium mb-4">
            Testimonials
          </div>
          <h2 className="text-4xl font-bold text-gray-100 tracking-tight">
            Trusted by the people who make lending decisions
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <TiltCard>
                <SpotlightCard
                  spotColor={colorMap[t.color].spot}
                  className="h-full p-7 rounded-2xl bg-white/3 border border-white/8 hover:bg-white/5.5 hover:border-white/14 transition-all duration-300 flex flex-col"
                >
                  <div
                    className="text-7xl font-serif leading-none text-emerald-500/10 mb-2 select-none pointer-events-none"
                    aria-hidden="true"
                  >
                    "
                  </div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <motion.svg
                        key={j}
                        className="w-4 h-4 text-amber-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 + j * 0.06, type: 'spring', stiffness: 400 }}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </motion.svg>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/[0.07]">
                    <div className={`w-9 h-9 rounded-full ${colorMap[t.color].avatar} flex items-center justify-center text-sm font-semibold shrink-0`}>
                      {t.initial}
                    </div>
                    <div>
                      <div className="text-gray-200 text-sm font-medium">{t.name}</div>
                      <div className="text-gray-500 text-xs">{t.title} · {t.company}</div>
                    </div>
                  </div>
                </SpotlightCard>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing Section ─────────────────────────────────────────────────────────

function PricingSection({ onContact }: { onContact: () => void }) {
  const features = [
    'Unlimited users & applications',
    'ACRA, CBA, Ekeng, Velox integrations',
    'ScoreFlex V1 & V2 scoring engines',
    'Custom scoring model configuration',
    'Full audit trail & compliance reporting',
    'Role-based access control',
    'Real-time analytics dashboard',
    'Loan calculator',
    'On-premise or private cloud deployment',
    'Dedicated implementation support',
    'SLA-backed uptime guarantee',
    'Armenian language support',
  ];

  return (
    <section id="pricing" className="py-24 bg-[#080d1a]">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-medium mb-4">
            Pricing
          </div>
          <h2 className="text-4xl font-bold text-gray-100 tracking-tight">
            Enterprise-grade pricing for financial institutions
          </h2>
          <p className="mt-4 text-gray-400 text-lg max-w-xl mx-auto">
            MDAnalytics is deployed as a private, on-premise or hosted solution tailored to your institution's scale and requirements.
          </p>
        </Reveal>

        <Reveal>
          <div className="max-w-2xl mx-auto relative">
            <div
              className="absolute -inset-px rounded-3xl opacity-60 blur-xl pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.3), rgba(34,211,238,0.25), rgba(139,92,246,0.2))' }}
            />
            <SpotlightCard
              spotColor="rgba(52,211,153,0.12)"
              spotSize={480}
              className="relative rounded-3xl bg-linear-to-br from-white/[0.07] to-white/3 border border-white/15 p-10 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Enterprise</div>
                  <div className="text-4xl font-bold text-gray-100">Custom pricing</div>
                  <div className="text-gray-500 text-sm mt-1">Tailored to your institution's volume and needs</div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  Most popular
                </div>
              </div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
              >
                {features.map((f) => (
                  <motion.div
                    key={f}
                    variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-gray-400 text-sm">{f}</span>
                  </motion.div>
                ))}
              </motion.div>

              <button
                onClick={onContact}
                className="relative overflow-hidden w-full py-4 rounded-2xl font-semibold text-white text-sm bg-linear-to-r from-emerald-500 to-cyan-500 transition-all duration-300 shadow-[0_8px_32px_rgba(52,211,153,0.35)] hover:shadow-[0_12px_48px_rgba(52,211,153,0.5)] hover:-translate-y-0.5 group"
              >
                <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                Contact Sales
              </button>
              <p className="text-center text-gray-600 text-xs mt-4">Response within one business day · No commitment required</p>
            </SpotlightCard>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── FAQ Section ─────────────────────────────────────────────────────────────

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does the data integration with ACRA, CBA, and other sources work?',
      a: "MDAnalytics connects to each data source via secure, pre-built API integrations. When a credit analyst triggers a data pull, the system queries all connected sources simultaneously and assembles a unified borrower profile — no manual portal logins required. Credentials and endpoints are configured once during onboarding.",
    },
    {
      q: 'Which credit scoring models are supported?',
      a: "The platform includes ScoreFlex V1 and V2, our proprietary multi-criteria scoring engines designed specifically for Armenian lending. Both models are fully configurable — risk officers can adjust weights, thresholds, and criteria sets to reflect your institution's specific lending policy. FICO-compatible scoring is also supported where ACRA provides FICO data.",
    },
    {
      q: 'Is MDAnalytics compliant with Armenian banking regulations?',
      a: "Yes. The system is purpose-built for the Armenian regulatory environment. It maintains immutable audit trails, supports role-based access aligned with four-eyes principles, and generates compliance-ready reports for CBA review. Several institutions have successfully passed regulatory audits using MDAnalytics as their primary system of record.",
    },
    {
      q: 'How long does implementation take?',
      a: "A standard implementation — including API configuration, user onboarding, and integration testing — typically takes 2–4 weeks. Institutions with complex existing workflows or custom scoring requirements may require additional time. Our implementation team works alongside your IT and risk teams throughout the process.",
    },
    {
      q: 'Can MDAnalytics integrate with our existing core banking system?',
      a: "Yes. MDAnalytics exposes a GraphQL API that allows bi-directional integration with core banking systems, CRM platforms, and document management systems. Common integrations include pushing approved loan decisions back into your core system and pulling customer master data for pre-population.",
    },
    {
      q: 'How is sensitive borrower data protected?',
      a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). The platform supports on-premise deployment within your own infrastructure — your data never leaves your environment. For hosted deployments, we use dedicated infrastructure with no data co-mingling between institutions. Authentication via Keycloak with Active Directory integration ensures only authorised users access the system.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-[#060a15]">
      <div className="max-w-4xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-medium mb-4">
            FAQ
          </div>
          <h2 className="text-4xl font-bold text-gray-100 tracking-tight">
            Questions we hear most often
          </h2>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <div
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  open === i
                    ? 'bg-white/6 border-emerald-500/20 shadow-[0_0_24px_rgba(52,211,153,0.05)]'
                    : 'bg-white/3 border-white/[0.07] hover:border-white/10 hover:bg-white/4'
                }`}
              >
                <button
                  className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  <span className="text-gray-200 text-sm font-medium leading-relaxed">{f.q}</span>
                  <motion.span
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      open === i ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'
                    }`}
                    animate={{ rotate: open === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  </motion.span>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-white/[0.07] pt-4">
                        {f.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ───────────────────────────────────────────────────────────────

function FinalCTASection({ onSignIn }: { onSignIn: () => void }) {
  return (
    <section id="contact" className="py-32 bg-[#080d1a] relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(52,211,153,0.13) 0%, transparent 70%)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />
      <FloatingOrbs variant="cta" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <Reveal>
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6 shadow-[0_0_24px_rgba(52,211,153,0.1)]"
            animate={{ boxShadow: ['0 0 24px rgba(52,211,153,0.1)', '0 0 40px rgba(52,211,153,0.2)', '0 0 24px rgba(52,211,153,0.1)'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Now accepting new institutions
          </motion.div>

          <h2 className="text-5xl sm:text-6xl font-bold text-gray-100 tracking-tight leading-tight">
            Ready to modernize
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #34d399 0%, #22d3ee 60%, #818cf8 100%)' }}
            >
              your credit decisions?
            </span>
          </h2>

          <p className="mt-6 text-gray-400 text-lg max-w-xl mx-auto">
            Join the Armenian financial institutions that have replaced slow, manual credit assessment with MDAnalytics' unified intelligence platform.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onSignIn}
              className="relative overflow-hidden w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-semibold bg-linear-to-r from-emerald-500 to-cyan-500 text-white transition-all duration-300 shadow-[0_8px_40px_rgba(52,211,153,0.4)] hover:shadow-[0_12px_56px_rgba(52,211,153,0.6)] hover:-translate-y-0.5 group"
            >
              <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              Sign In to Your Account
            </button>
            <a
              href="mailto:sales@dynamicsolutions.am"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-medium text-gray-300 border border-white/10 bg-white/5 hover:bg-white/9 hover:border-white/20 transition-all duration-300 text-center"
            >
              Contact Sales
            </a>
          </div>

          <p className="mt-8 text-gray-600 text-sm">
            Questions? Email us at{' '}
            <a href="mailto:info@dynamicsolutions.am" className="text-emerald-500 hover:text-emerald-400 transition-colors underline underline-offset-2">
              info@dynamicsolutions.am
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer({ onSignIn }: { onSignIn: () => void }) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const links = {
    Product: [
      { label: 'Features', action: () => scrollTo('features') },
      { label: 'Integrations', action: () => scrollTo('integrations') },
      { label: 'How It Works', action: () => scrollTo('how-it-works') },
      { label: 'Pricing', action: () => scrollTo('pricing') },
    ],
    Resources: [
      { label: 'FAQ', action: () => scrollTo('faq') },
    ],
    Company: [
      { label: 'Contact Us', action: () => scrollTo('contact') },
      { label: 'Sign In', action: onSignIn },
    ],
  };

  return (
    <footer className="bg-[#060a15] border-t border-white/6">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-xl bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-[0_0_16px_rgba(52,211,153,0.35)]">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-200 tracking-tight">MDAnalytics</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Enterprise loan risk management for Armenian financial institutions.
            </p>
            <p className="text-gray-700 text-xs">
              © {new Date().getFullYear()} Dynamic Solutions. All rights reserved.
            </p>
          </div>

          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <div className="text-gray-400 font-medium text-sm mb-4">{section}</div>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={item.action}
                      className="text-gray-600 text-sm hover:text-gray-300 transition-colors duration-200 group flex items-center gap-1"
                    >
                      <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-200 text-emerald-400">›</span>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-700">
          <div>Built with React & Vite · Hosted on Vercel</div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Landing Page ────────────────────────────────────────────────────────────

export default function LandingPage() {
  const handleSignIn = useCallback(() => {
    window.location.href = APP_URL;
  }, []);

  useEffect(() => {
    document.title = 'MDAnalytics — Loan Risk Management for Armenian Banks';
  }, []);

  return (
    <div className="min-h-screen bg-[#080d1a] text-gray-100" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" }}>
      <Navbar onSignIn={handleSignIn} />
      <main>
        <HeroSection />
        <TrustedBySection />
        <ProblemSection />
        <FeaturesSection />
        <IntegrationsSection />
        <HowItWorksSection />
        <BenefitsSection />
        <TestimonialsSection />
        <PricingSection onContact={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} />
        <FAQSection />
        <FinalCTASection onSignIn={handleSignIn} />
      </main>
      <Footer onSignIn={handleSignIn} />
    </div>
  );
}

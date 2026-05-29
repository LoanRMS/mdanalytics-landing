import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';

const SALES_EMAIL = 'info@dynamicsolutions.am';

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

function Navbar() {
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
    { label: 'Integrations', id: 'integrations' },
    { label: 'Intelligence', id: 'intelligence' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? 'bg-[#080d1a]/90 backdrop-blur-2xl shadow-[0_1px_0_rgba(255,255,255,0.04),0_4px_32px_rgba(0,0,0,0.4)]'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-2.5 cursor-pointer"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
          )
          )}
        </motion.nav>

        <motion.div
          className="hidden md:flex items-center gap-3"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
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

  const c1 = useCountUp(2000000, 2200, statsInView);
  const c2 = useCountUp(10, 1000, statsInView);
  const c3 = useCountUp(6, 1400, statsInView);

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
            <span className="text-gray-100">Lend Faster.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="mt-6 text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            MDAnalytics aggregates credit intelligence from every source — ACRA, NORQ, EKENG (multiple sources) — and delivers a risk score in under one minute. Replace days of manual work with one unified platform.
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
            className="mt-14 flex flex-wrap gap-x-8 gap-y-4 justify-center lg:justify-start"
          >
            {[
              { value: `${c1.toLocaleString()}+`, label: 'Loans Assessed' },
              { value: `${c2}+`, label: 'Sources' },
              { value: `${c3}`, label: 'Institutions' },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeInUp} className="text-center lg:text-left">
                <div className="text-2xl font-bold text-gray-100 tabular-nums whitespace-nowrap">{s.value}</div>
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
  const reduced = useReducedMotion();
  const SCROLL_DIST = 330;

  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'checking' | 'done'>('idle');
  const [dataStatus, setDataStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [activeStep, setActiveStep] = useState(0);
  const [flagVisible, setFlagVisible] = useState(false);

  useEffect(() => {
    if (reduced) return;
    let timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.forEach(clearTimeout);
      timers = [];
      setVerifyStatus('idle');
      setDataStatus('idle');
      setActiveStep(0);
      setFlagVisible(false);
      timers.push(
        setTimeout(() => setVerifyStatus('checking'), 900),
        setTimeout(() => { setVerifyStatus('done'); setActiveStep(1); }, 2300),
        setTimeout(() => setActiveStep(2), 4200),
        setTimeout(() => setDataStatus('loading'), 4500),
        setTimeout(() => { setDataStatus('done'); setActiveStep(3); }, 6400),
        setTimeout(() => setFlagVisible(true), 7500),
        setTimeout(() => setActiveStep(4), 12200),
      );
    };
    run();
    const interval = setInterval(run, 22000);
    return () => { timers.forEach(clearTimeout); clearInterval(interval); };
  }, [reduced]);

  const workflowSteps = ['Verify', 'Group', 'Request Data', 'Review', 'Decision'];

  const members = [
    { initials: 'GH', name: 'Gevorg Harutyunyan', doc: '2345678686', role: 'Borrower', roleColor: 'emerald', flag: false },
    { initials: 'AP', name: 'Ashot Petrosyan', doc: '3456789678', role: 'Guarantor', roleColor: 'red', flag: true },
    { initials: 'GF', name: 'Global Finance LLC', doc: '12345667', role: 'Co-signer', roleColor: 'violet', flag: false },
  ];

  const sources = [
    { name: 'ACRA', detail: 'Credit · 36mo' },
    { name: 'ACRA PEK', detail: 'Property lien' },
    { name: 'NORQ', detail: 'Business reg.' },
    { name: 'EKENG', detail: '8 sub-sources' },
    { name: 'Tax Service', detail: '2 obligations', warn: true },
    { name: 'Police Dept.', detail: 'No records' },
  ];

  const signals = [
    { label: 'Payment Consistency', val: 91, ok: true },
    { label: 'Obligation Load', val: 63, warn: true },
    { label: 'Behavioral Trend', val: 87, ok: true },
    { label: 'Relationship Risk', val: 34, ok: false },
  ];

  const navPaths = [
    'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  ];

  const chCircumference = 2 * Math.PI * 20;

  return (
    <div className="flex bg-[#070b15] text-[11px] rounded-xl overflow-hidden border border-white/[0.07] shadow-2xl" style={{ height: 430 }}>

      {/* ── Left Sidebar ── */}
      <div className="w-11 shrink-0 bg-[#04070e] border-r border-white/6 flex flex-col items-center pt-3 pb-3 gap-1">
        {/* Logo */}
        <div className="w-7 h-7 rounded-xl bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mb-2.5 shadow-[0_0_14px_rgba(52,211,153,0.4)]">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        {navPaths.map((d, i) => (
          <button key={i} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${i === 1 ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.18)]' : 'text-gray-700 hover:text-gray-500 hover:bg-white/5'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
            </svg>
          </button>
        ))}
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="h-9 px-3 bg-[#04070e]/90 border-b border-white/5 flex items-center gap-2 shrink-0">
          <span className="text-gray-400 text-[10px]">Credit Assessment</span>
          <svg className="w-3 h-3 text-gray-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-200 text-[10px] font-semibold">#34333</span>
          <span className="px-1.5 py-px rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-[7px] font-medium">In Review</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="flex items-center gap-1 text-[8px] text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              Live
            </span>
            <div className="h-3 w-px bg-white/[0.07]" />
            <button className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[8px] font-medium">+ New Case</button>
          </div>
        </div>

        {/* ── Workflow Stepper ── */}
        <div className="px-3 py-2 border-b border-white/5 bg-[#070b15]/60 flex items-center gap-1 shrink-0 overflow-x-hidden">
          {workflowSteps.map((s, i) => (
            <div key={s} className="flex items-center gap-1 shrink-0">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-semibold border transition-all duration-500 ${i < activeStep
                ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20'
                : i === activeStep
                  ? 'bg-sky-500/12 text-sky-300 border-sky-500/25 shadow-[0_0_10px_rgba(56,189,248,0.12)]'
                  : 'text-gray-700 border-white/5 bg-transparent'
                }`}>
                {i < activeStep && <span className="text-emerald-400 text-[7px]">✓</span>}
                {i === activeStep && (
                  <span className="w-1 h-1 rounded-full bg-sky-400 inline-block" style={{ animation: 'pulse 2s infinite' }} />
                )}
                {s}
              </div>
              {i < workflowSteps.length - 1 && (
                <div className={`w-3 h-px transition-colors duration-700 ${i < activeStep ? 'bg-emerald-500/35' : 'bg-white/8'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Scrolling Content ── */}
        <div className="flex-1 overflow-hidden relative">
          <motion.div
            animate={reduced ? {} : { y: [0, -SCROLL_DIST, -SCROLL_DIST, 0] }}
            transition={{ duration: 26, times: [0, 0.66, 0.87, 1], repeat: Infinity, ease: 'linear' }}
          >

            {/* ── Section 1: Verify + Group Members ── */}
            <div className="px-3 pt-2.5 pb-2">
              <div className="grid grid-cols-5 gap-2">

                {/* Verification */}
                <div className="col-span-2 rounded-xl bg-white/2.5 border border-white/6 p-2.5">
                  <div className="text-[7.5px] font-semibold uppercase tracking-widest text-gray-600 mb-2">1 · Identity Verification</div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex-1 bg-white/4 border border-white/8 rounded-lg px-2 py-1 flex items-center gap-1.5">
                      <svg className="w-2.5 h-2.5 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                      </svg>
                      <span className="text-gray-400 text-[9px] font-mono tracking-wider">2345678</span>
                    </div>
                    <motion.div
                      animate={verifyStatus === 'done' ? { scale: [0.85, 1.08, 1] } : {}}
                      transition={{ duration: 0.35 }}
                      className={`px-1.5 py-1 rounded-lg text-[7.5px] font-semibold whitespace-nowrap border transition-all duration-500 ${verifyStatus === 'idle' ? 'bg-sky-500/12 text-sky-300 border-sky-500/20' :
                        verifyStatus === 'checking' ? 'bg-amber-500/12 text-amber-300 border-amber-500/20' :
                          'bg-emerald-500/12 text-emerald-300 border-emerald-500/20'
                        }`}
                    >
                      {verifyStatus === 'idle' ? 'Verify' : verifyStatus === 'checking' ? '⋯ Checking' : '✓ Verified'}
                    </motion.div>
                  </div>
                  <motion.div
                    animate={{ opacity: verifyStatus === 'done' ? 1 : 0, y: verifyStatus === 'done' ? 0 : 5 }}
                    transition={{ duration: 0.45 }}
                    className="rounded-lg bg-emerald-500/6 border border-emerald-500/18 px-2 py-1.5"
                  >
                    <div className="text-emerald-300 text-[9px] font-semibold leading-tight">Gevorg Harutyunyan</div>
                    <div className="text-gray-600 text-[7.5px] mt-0.5">Born 1985 · Yerevan · Active passport</div>
                  </motion.div>
                  {verifyStatus !== 'done' && (
                    <div className="rounded-lg bg-white/2 border border-white/4 px-2 py-1.5 h-9" />
                  )}
                </div>

                {/* Group Members */}
                <div className="col-span-3 rounded-xl bg-white/2.5 border border-white/6 p-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[7.5px] font-semibold uppercase tracking-widest text-gray-600">2 · Group Members</div>
                    <button className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/15 text-[7.5px] font-medium">
                      + Add Member
                    </button>
                  </div>
                  <div className="space-y-1">
                    {members.map((m) => (
                      <div key={m.name} className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg bg-white/2.5 border border-white/4">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 ${m.roleColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-300' :
                          m.roleColor === 'red' ? 'bg-red-500/20 text-red-300' :
                            'bg-violet-500/20 text-violet-300'
                          }`}>{m.initials}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-300 text-[9px] font-medium truncate">{m.name}</span>
                            {m.flag && (
                              <motion.span animate={{ opacity: [1, 0.45, 1] }} transition={{ duration: 2.2, repeat: Infinity }} className="text-red-400 text-[8px] shrink-0">⚠</motion.span>
                            )}
                          </div>
                          <div className="text-gray-700 text-[7px]">Doc: {m.doc}</div>
                        </div>
                        <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-semibold border shrink-0 ${m.roleColor === 'emerald' ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/18' :
                          m.roleColor === 'red' ? 'bg-red-500/12 text-red-400 border-red-500/18' :
                            'bg-violet-500/12 text-violet-400 border-violet-500/18'
                          }`}>{m.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 2: Request Full Data ── */}
            <div className="px-3 pb-2">
              <div className="rounded-xl bg-white/2.5 border border-white/6 p-2.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[7.5px] font-semibold uppercase tracking-widest text-gray-600">3 · Source Data Collection</div>
                  <motion.button
                    animate={dataStatus === 'idle' ? { boxShadow: ['0 0 0px rgba(52,211,153,0)', '0 0 12px rgba(52,211,153,0.2)', '0 0 0px rgba(52,211,153,0)'] } : {}}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8.5px] font-semibold border transition-all duration-600 ${dataStatus === 'idle' ? 'bg-emerald-500/18 text-emerald-300 border-emerald-500/28' :
                      dataStatus === 'loading' ? 'bg-amber-500/12 text-amber-300 border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                      }`}
                  >
                    {dataStatus === 'idle' && (
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    )}
                    {dataStatus === 'idle' && 'Request Full Data'}
                    {dataStatus === 'loading' && '⋯ Collecting from sources'}
                    {dataStatus === 'done' && '✓ All data received'}
                  </motion.button>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {sources.map((s, i) => {
                    const isDone = dataStatus === 'done';
                    const isLoading = dataStatus === 'loading' && i <= 2;
                    return (
                      <div key={s.name}
                        className={`rounded-lg border px-1.5 py-1.5 transition-all duration-700 ${isDone && s.warn ? 'bg-amber-500/6 border-amber-500/18' :
                          isDone ? 'bg-emerald-500/6 border-emerald-500/18' :
                            isLoading ? 'bg-amber-500/6 border-amber-500/12' :
                              'bg-white/2 border-white/4'
                          }`}
                        style={{ transitionDelay: `${i * 100}ms` }}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mb-1 transition-all duration-500 ${isDone && s.warn ? 'bg-amber-400' :
                          isDone ? 'bg-emerald-500' :
                            isLoading ? 'bg-amber-400 animate-pulse' :
                              'bg-gray-800'
                          }`} style={{ transitionDelay: `${i * 100}ms` }} />
                        <div className="text-gray-300 text-[7.5px] font-medium leading-tight">{s.name}</div>
                        <div className="text-gray-700 text-[6.5px] leading-tight mt-0.5 truncate">{s.detail}</div>
                      </div>
                    );
                  })}
                </div>
                {dataStatus === 'done' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-1.5 pt-1.5 border-t border-white/4 flex items-center justify-between text-[7.5px]">
                    <span className="text-gray-700">Queried {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-emerald-400 font-medium">✓ 5/6 sources clear</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* ── Section 3: Group Overview + Member Tabs ── */}
            <div className="px-3 pb-2">
              {/* Tabs */}
              <div className="flex gap-1 mb-2 items-center">
                {[
                  { label: 'Group Overview', active: true },
                  { label: 'G. Harutyunyan', active: false },
                  { label: 'A. Petrosyan', active: false, flag: true },
                  { label: 'Global Finance LLC', active: false },
                ].map((tab) => (
                  <button key={tab.label} className={`relative px-2 py-0.5 rounded-full text-[7.5px] border font-medium transition-all shrink-0 ${tab.active ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' :
                    tab.flag ? 'bg-red-500/10 text-red-400 border-red-500/15' :
                      'bg-white/2.5 text-gray-500 border-white/6'
                    }`}>
                    {tab.label}
                    {tab.flag && (
                      <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
                        className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                    )}
                  </button>
                ))}
              </div>

              {/* Group Overview Card */}
              <div className="rounded-xl bg-linear-to-br from-white/4 to-white/1 border border-white/[0.07] p-2.5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-gray-100 font-semibold text-[11px] leading-tight">Harutyunyan Credit Group</div>
                    <div className="text-gray-600 text-[8px] mt-0.5">3 members · Agricultural loan · 36-month term · Collateral: residential property</div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-gray-100 font-bold text-[13px] tabular-nums">18,500,000 ֏</div>
                    <div className="text-gray-600 text-[7.5px]">Requested amount</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { l: 'Group Score', v: '793', c: 'text-emerald-400' },
                    { l: 'Risk Level', v: 'Low', c: 'text-emerald-400' },
                    { l: 'Active Loans', v: '2', c: 'text-gray-300' },
                    { l: 'Flags', v: '1 critical', c: 'text-red-400' },
                  ].map((m) => (
                    <div key={m.l} className="bg-white/2.5 rounded-lg px-2 py-1.5 border border-white/4">
                      <div className="text-gray-600 text-[7px]">{m.l}</div>
                      <div className={`${m.c} text-[10px] font-bold tabular-nums mt-0.5`}>{m.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Section 4: CHPlus + Red Flags ── */}
            <div className="px-3 pb-2 grid grid-cols-2 gap-2">

              {/* CHPlus Analytics */}
              <div className="rounded-xl bg-white/2.5 border border-white/6 p-2.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-[0_0_6px_rgba(52,211,153,0.4)]">
                      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-gray-300 text-[9px] font-semibold leading-tight">CHPlus Analytics</div>
                      <div className="text-gray-700 text-[7px]">ACRA · Credit History</div>
                    </div>
                  </div>
                  {/* Mini ring score */}
                  <div className="relative w-9 h-9 shrink-0">
                    <svg viewBox="0 0 48 48" className="w-9 h-9 -rotate-90">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                      <motion.circle
                        cx="24" cy="24" r="20"
                        fill="none" stroke="url(#chg)" strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={chCircumference}
                        initial={{ strokeDashoffset: chCircumference }}
                        animate={{ strokeDashoffset: chCircumference * (1 - 0.793) }}
                        transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      />
                      <defs>
                        <linearGradient id="chg" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#34d399" />
                          <stop offset="100%" stopColor="#22d3ee" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-gray-100 font-bold text-[9px] leading-none">793</span>
                      <span className="text-[6px] text-emerald-400 font-semibold">LOW</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {signals.map((sig, i) => (
                    <div key={sig.label}>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-gray-600 text-[8px]">{sig.label}</span>
                        <span className={`text-[8px] font-semibold tabular-nums ${sig.ok ? 'text-emerald-400' : sig.warn ? 'text-amber-400' : 'text-red-400'}`}>{sig.val}</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${sig.ok ? 'bg-emerald-500' : sig.warn ? 'bg-amber-500' : 'bg-red-500'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${sig.val}%` }}
                          transition={{ duration: 0.85, delay: i * 0.09 + 0.3, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Flags */}
              <div className="rounded-xl bg-white/2.5 border border-white/6 p-2.5">
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-[7.5px] font-semibold uppercase tracking-widest text-gray-600">Risk Flags</span>
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2.1, repeat: Infinity }}
                    className="ml-auto px-1.5 py-px rounded-full bg-red-500/18 text-red-300 border border-red-500/25 text-[7px] font-semibold"
                  >
                    1 Critical
                  </motion.span>
                </div>
                <div className="space-y-1.5">
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: flagVisible ? 1 : 0, x: flagVisible ? 0 : -8 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-lg bg-red-500/8 border border-red-500/20 px-2 py-1.5"
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <svg className="w-2.5 h-2.5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-300 text-[8px] font-semibold">Guarantor Active Default</span>
                    </div>
                    <p className="text-red-400/65 text-[7px] leading-snug">A. Petrosyan linked to LG-2025-0871 · 90+ day default</p>
                  </motion.div>
                  <div className="rounded-lg bg-amber-500/8 border border-amber-500/18 px-2 py-1.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      <svg className="w-2.5 h-2.5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-amber-300 text-[8px] font-semibold">D/I Ratio Warning</span>
                    </div>
                    <p className="text-amber-400/65 text-[7px] leading-snug">72% — approaching 75% approval threshold</p>
                  </div>
                  <div className="rounded-lg bg-sky-500/6 border border-sky-500/15 px-2 py-1.5">
                    <div className="flex items-center gap-1">
                      <svg className="w-2.5 h-2.5 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sky-300 text-[7.5px]">Tax Service · 2 minor obligations flagged</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 5: Decision Engine ── */}
            <div className="px-3 pb-3">
              <div className="rounded-xl bg-white/2.5 border border-white/6 p-2.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[7.5px] font-semibold uppercase tracking-widest text-gray-600">5 · Decision Engine</div>
                  <div className="flex items-center gap-2 text-[7.5px] text-gray-600">
                    <span>Step 3 of 4 · Credit Committee</span>
                    <span className="text-amber-600 font-medium">SLA: 4h remaining</span>
                  </div>
                </div>
                <div className="rounded-lg bg-emerald-500/6 border border-emerald-500/18 px-2.5 py-2 mb-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-emerald-300 font-semibold text-[10px]">Recommendation: Conditional Approval</span>
                  </div>
                  <p className="text-gray-500 text-[8px] leading-relaxed">Score 793 (low risk, top 18%). Guarantor flag requires additional documentation before final sign-off. Income and collateral coverage adequate for requested amount.</p>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <button className="flex-1 py-1.5 rounded-lg bg-emerald-500/18 text-emerald-300 border border-emerald-500/28 text-[8.5px] font-semibold">✓ Approve</button>
                  <button className="flex-1 py-1.5 rounded-lg bg-amber-500/12 text-amber-300 border border-amber-500/22 text-[8.5px]">⟳ Request Info</button>
                  <button className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/18 text-[8.5px]">✕ Decline</button>
                </div>
                <div className="flex items-center gap-2 text-[7.5px] text-gray-700 pt-1.5 border-t border-white/4">
                  <span>Analyst: A. Mkrtchyan</span>
                  <span className="text-gray-800">·</span>
                  <span>Assigned: 2h ago</span>
                  <span className="text-gray-800">·</span>
                  <span className="text-gray-600">Agricultural portfolio</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Trusted By ──────────────────────────────────────────────────────────────

function TrustedBySection() {
  const institutions = ['Evoca Bank', 'FastBank', 'Kamurj UCO', 'ID Bank', 'TelCell', 'Converse Bank'];

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
      description: 'ACRA, ACRA PEK, NORQ, AVV, Business, CES, Civil, Road Police, ICPolice, Taxes, Property, etc. — each system has its own interface, its own login, its own format. Consolidating data for a single borrower is an error-prone, time-consuming ordeal.',
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
            Many financial institutions are losing competitive advantage — and accepting unnecessary risk — because credit assessment infrastructure hasn't kept pace.
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
      description: 'Pull compete credit histories from ACRA, salary information from NORQ and PEK, financial reports from ACRA PEK, demographics from EKENG various sources in seconds.',
      accent: 'emerald',
      span: 'col-span-1 md:col-span-2',
    },
    {
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
      label: 'Risk Assessment',
      title: 'Consistent, explainable decisions',
      description: 'ScoreFlex enables risk assessment through configurable criteria, delivering consistent, fully explainable scores. INquiry surfaces multi-source data and highlights red flags for rapid preliminary screening.',
      accent: 'violet',
      span: 'col-span-1',
    },
    {
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      label: 'Loan Group Management',
      title: 'Complex structures, simple workflows',
      description: 'Handle multi-participant loans across individual and corporate lending — borrowers, guarantors, and co-signers assessed together through a single, user-friendly workflow. Group borrower analysis built in.',
      accent: 'cyan',
      span: 'col-span-1',
    },
    {
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      label: 'Compliance & Audit Trail',
      title: 'Built for regulatory confidence',
      description: 'Immutable audit logs, role-based access control, and complete decision histories ensure every manual and automated approval.',
      accent: 'emerald',
      span: 'col-span-1',
    }
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

// ─── CHPlus Section ───────────────────────────────────────────────────────────

function CHPlusSection() {
  const benefits = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Credit History Analytics',
      description: 'Deep credit intelligence that goes beyond standard bureau reports. Analyzes not just a single borrower but every member of the group, delivering one unified report across all participants — no need to review each one separately. Surfaces behavioral patterns and obligation trends, cross-references related-party obligations, and traces co-borrower and guarantor networks across the loan portfolio to identify circular guarantee structures.',
      accent: 'cyan',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Faster, More Confident Decisions',
      description: 'Pre-interpreted findings and flagged anomalies reduce analyst review time significantly. Your risk officers act on structured conclusions, not unprocessed raw data.',
      accent: 'emerald',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'Intelligence Before the Score',
      description: "MDAnalytics doesn't just score — it thinks. Before a single decision is made, its intelligence engine has already surfaced what matters, giving analysts context-aware insights rather than raw numbers.",
      accent: 'violet',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
        </svg>
      ),
      title: 'Identity & Status Verification',
      description: 'Detects registration anomalies, citizenship issues, document expiration, and conflicting personal data across sources — catching what a clean-looking ID alone won\'t reveal.',
      accent: 'cyan',
    }
  ];

  const accentMap: Record<string, { bg: string; border: string; text: string; spot: string }> = {
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', spot: 'rgba(52,211,153,0.07)' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/25', text: 'text-amber-400', spot: 'rgba(245,158,11,0.07)' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/25', text: 'text-cyan-400', spot: 'rgba(56,189,248,0.07)' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/25', text: 'text-violet-400', spot: 'rgba(139,92,246,0.07)' },
  };

  return (
    <section id="intelligence" className="py-32 relative overflow-hidden" style={{ background: '#050810' }}>
      {/* Radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 65% 55% at 75% 40%, rgba(52,211,153,0.08) 0%, transparent 60%), radial-gradient(ellipse 55% 50% at 20% 65%, rgba(139,92,246,0.05) 0%, transparent 60%)',
        }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.10] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />
      {/* Top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent 8%, rgba(52,211,153,0.45) 38%, rgba(34,211,238,0.45) 62%, transparent 92%)' }}
      />
      {/* Bottom border accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent 8%, rgba(52,211,153,0.2) 38%, rgba(34,211,238,0.2) 62%, transparent 92%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <Reveal className="text-center mb-20">
          <motion.div
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(52,211,153,0.12), rgba(34,211,238,0.08))',
              border: '1px solid rgba(52,211,153,0.28)',
              boxShadow: '0 0 40px rgba(52,211,153,0.12)',
            }}
            animate={{ boxShadow: ['0 0 40px rgba(52,211,153,0.12)', '0 0 60px rgba(52,211,153,0.22)', '0 0 40px rgba(52,211,153,0.12)'] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-5 h-5 rounded-md bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-[0_0_10px_rgba(52,211,153,0.55)]">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-emerald-300 text-xs font-semibold uppercase tracking-widest">
              Flagship Intelligence — Beyond Automated Decisioning
            </span>
          </motion.div>

          <h2 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.06] mb-6">
            <span className="text-gray-100">The intelligence layer</span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #34d399 0%, #22d3ee 50%, #818cf8 100%)' }}
            >
              behind every decision
            </span>
          </h2>
        </Reveal>

        {/* ── Two-column body ─────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-14 xl:gap-20 items-start">

          {/* Left: benefit cards */}
          <div className="space-y-3.5">
            {benefits.map((b, i) => {
              const accent = accentMap[b.accent];
              return (
                <Reveal key={b.title} delay={i * 0.08}>
                  <SpotlightCard
                    spotColor={accent.spot}
                    className="p-5 rounded-2xl bg-white/3 border border-white/8 hover:bg-white/5 hover:border-white/12 transition-all duration-300 group cursor-default"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl ${accent.bg} border ${accent.border} ${accent.text} flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 mt-0.5`}
                      >
                        {b.icon}
                      </div>
                      <div>
                        <h3 className="text-gray-200 font-semibold text-sm mb-1.5 leading-snug">{b.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{b.description}</p>
                      </div>
                    </div>
                  </SpotlightCard>
                </Reveal>
              );
            })}
          </div>

          {/* Right: feature cards */}
          <div className="space-y-3.5">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zm4 0h8M8 12h8M8 16h5" />
                  </svg>
                ),
                title: 'Full Picture, Single Query',
                description: 'Pulls from multiple national registries — passport, business, enforcement, civil, and vehicle — in one request. No more switching between systems or copy-pasting IDs across portals.',
                accent: 'emerald',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                ),
                title: '300+ Automated Red Flags',
                description: 'Every data point is validated against layered rules — expired documents, death records, blocked businesses, unsafe enforcement articles, name mismatches. What takes an analyst hours is surfaced in seconds.',
                accent: 'amber',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Analyst-Ready Output',
                description: 'Data isn\'t just fetched — it\'s structured, color-coded, and pre-interpreted. Risk officers see what needs attention immediately, not a wall of raw registry responses.',
                accent: 'emerald',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: 'Multi-Registry Screening',
                description: 'INquiry pulls from multiple national registries in a single query — civil records, business registries, enforcement data, and more — instantly highlighting inconsistencies and risk signals that manual checks would miss.',
                accent: 'cyan',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Employment & Income Intelligence',
                description: 'NORQ integration surfaces employment history, contract gaps, overlapping jobs, and net income calculations — automatically flagging tenure risks and data inconsistencies lenders care about.',
                accent: 'violet',
              },
            ].map((b, i) => {
              const accent = accentMap[b.accent];
              return (
                <Reveal key={b.title} delay={i * 0.08}>
                  <SpotlightCard
                    spotColor={accent.spot}
                    className="p-5 rounded-2xl bg-white/3 border border-white/8 hover:bg-white/5 hover:border-white/12 transition-all duration-300 group cursor-default"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl ${accent.bg} border ${accent.border} ${accent.text} flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 mt-0.5`}
                      >
                        {b.icon}
                      </div>
                      <div>
                        <h3 className="text-gray-200 font-semibold text-sm mb-1.5 leading-snug">{b.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{b.description}</p>
                      </div>
                    </div>
                  </SpotlightCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Integrations Section ────────────────────────────────────────────────────

function IntegrationsSection() {
  const creditBureaus = [
    {
      name: 'ACRA',
      full: 'Armenian Credit Bureau',
      description: 'Complete credit histories, outstanding obligations, and payment behaviour for all Armenian borrowers.',
      color: 'emerald',
    },
    {
      name: 'ACRA PEK',
      full: 'ACRA Property Registry',
      description: 'Collateral verification and property encumbrance data from the Armenian unified property registry.',
      color: 'cyan',
    },
    {
      name: 'NORQ',
      full: 'State Registry Agency',
      description: 'Official business registration, ownership, and legal entity data from the Armenian State Registry.',
      color: 'amber',
    },
  ];

  const ekengSources = [
    { key: 'AVV', label: 'AVV', desc: 'Population State Register' },
    { key: 'Business', label: 'Business', desc: 'Legal Entities State Register' },
    { key: 'SRC', label: 'PEK', desc: 'State Revenue Committee' },
    { key: 'Civil', label: 'Civil', desc: 'Civil Status Acts Registry' },
    { key: 'Ces', label: 'CES', desc: 'Compulsory Enforcement Service' },
    { key: 'Taxes', label: 'Taxes', desc: 'Unified Municipal E-Governance Platform' },
    { key: 'Police', label: 'Police', desc: 'Road Police (vehicles, violations and more)' },
    { key: 'ICPolice', label: 'IC Police', desc: 'Ministry of Internal Affairs' },
  ];

  const colorMap: Record<string, { ring: string; bg: string; text: string; border: string; spot: string; chip: string }> = {
    emerald: { ring: 'ring-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/25', spot: 'rgba(52,211,153,0.08)', chip: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' },
    cyan: { ring: 'ring-cyan-500/20', bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/25', spot: 'rgba(56,189,248,0.08)', chip: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' },
    violet: { ring: 'ring-violet-500/20', bg: 'bg-violet-500/10', text: 'text-violet-300', border: 'border-violet-500/25', spot: 'rgba(139,92,246,0.08)', chip: 'bg-violet-500/10 border-violet-500/20 text-violet-300' },
    amber: { ring: 'ring-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/25', spot: 'rgba(245,158,11,0.08)', chip: 'bg-amber-500/10 border-amber-500/20 text-amber-300' },
    slate: { ring: 'ring-slate-500/20', bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/25', spot: 'rgba(148,163,184,0.06)', chip: 'bg-slate-500/10 border-slate-500/20 text-slate-300' },
  };

  return (
    <section id="integrations" className="py-24 bg-[#080d1a]">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
            Integrations
          </div>
          <h2 className="text-4xl font-bold text-gray-100 tracking-tight">
            Every data source, unified
          </h2>
          <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
            Pre-built connections to all sources that matter to lenders — credit bureaus, state registries, and government databases. No custom integration work required.
          </p>
        </Reveal>

        {/* Credit Bureau Sources */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
          {creditBureaus.map((intg, i) => {
            const c = colorMap[intg.color];
            return (
              <Reveal key={intg.name} delay={i * 0.08}>
                <SpotlightCard
                  spotColor={c.spot}
                  className="h-full p-6 rounded-2xl bg-white/3 border border-white/8 hover:border-white/[0.14] transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${c.bg} border ${c.border} ring-4 ${c.ring} flex items-center justify-center group-hover:scale-105 group-hover:ring-8 transition-all duration-300 shrink-0`}>
                      <span className={`font-bold text-xs ${c.text} text-center leading-tight px-1`}>{intg.name}</span>
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
        </div>

        {/* Ekeng — Featured Multi-Source Card */}
        <Reveal delay={0.1}>
          <SpotlightCard
            spotColor="rgba(139,92,246,0.08)"
            spotSize={480}
            className="mb-5 p-7 rounded-2xl bg-white/3 border border-white/8 hover:border-violet-500/20 transition-all duration-300 group"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/25 ring-4 ring-violet-500/15 flex items-center justify-center group-hover:scale-105 group-hover:ring-8 transition-all duration-300">
                  <span className="font-bold text-sm text-violet-300">EK</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <div className="text-gray-200 font-semibold text-base">EKENG</div>
                  <div className="text-gray-500 text-xs">Electronic Governance Infrastructure &amp; Innovations</div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  Comprehensive access to all EKENG-connected government registries — from civil records and tax obligations to vehicle data and law-enforcement databases — queried simultaneously through a single API call.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {ekengSources.map((src, i) => (
                    <motion.div
                      key={src.key}
                      className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl bg-violet-500/8 border border-violet-500/15 hover:border-violet-500/30 hover:bg-violet-500/12 transition-all duration-200 cursor-default"
                      initial={{ opacity: 0, scale: 0.92 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <span className="text-violet-300 font-semibold text-xs">{src.label}</span>
                      <span className="text-gray-600 text-[10px] leading-tight">{src.desc}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-white/6 flex items-center gap-1.5 text-xs text-emerald-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              Pre-built connector · All 8 sub-sources queried in parallel
            </div>
          </SpotlightCard>

          <Reveal delay={0.12}>
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
        </Reveal>

        {/* System Integrations + Custom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

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
      description: 'One click triggers simultaneous queries to ACRA, NORQ and Ekeng. Complete borrower profiles — credit history, income, identity, demographics — are assembled automatically.',
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582 4 8 4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>,
    },
    {
      number: '03',
      title: 'Score & Decide',
      description: "ScoreFlex models assess risk across every data point, generating an explainable score with criterion-level breakdowns. Your analyst reviews the insight, not the raw data.",
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
              &lt; 1 minute
            </div>
            <div className="mt-3 text-gray-400 text-base relative">
              Average time from application creation to complete risk score
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
    { value: 90, suffix: '%', label: 'Faster Assessment', sub: 'Hours reduced to under 1 minute' },
    { value: 7, suffix: 'x', label: 'More Data Points', sub: 'Versus manual single-source review' },
    { value: 30, suffix: '%', label: 'Lower Default Risk', sub: 'Data collection and analysis, scoring' },
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

// ─── FAQ Section ─────────────────────────────────────────────────────────────

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does the data integration with ACRA, NORQ, and other sources work?',
      a: "MDAnalytics connects to each data source via secure, pre-built API integrations. When a credit analyst triggers a data pull, the system queries all connected sources simultaneously and assembles a unified borrower profile — no manual portal logins required. Credentials and endpoints are configured once during onboarding.",
    },
    {
      q: 'Which credit scoring models are supported?',
      a: "The platform includes ScoreFlex, our proprietary multi-criteria scoring engine that helps lenders make consistent, explainable credit decisions. Fully configurable, it allows risk teams to customize scoring logic, weights, thresholds, and assessment criteria to match their lending strategy and compliance requirements.",
    },
    {
      q: 'How long does implementation take?',
      a: "A standard implementation — including API configuration, user onboarding, and integration testing — typically takes 1–2 weeks. Our implementation team works alongside your IT and risk teams throughout the process.",
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
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${open === i
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
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${open === i ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'
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

// ─── Demo Request Section ─────────────────────────────────────────────────────

function DemoRequestSection() {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const subject = encodeURIComponent(`Demo Request — ${form.company}`);
    const body = encodeURIComponent(
      `New Demo Request\n\nFull Name: ${form.name}\nCompany: ${form.company}\nEmail: ${form.email}\nPhone: ${form.phone}${form.message ? `\n\nMessage:\n${form.message}` : ''}`
    );
    const a = document.createElement('a');
    a.href = `mailto:${SALES_EMAIL}?subject=${subject}&body=${body}`;
    a.click();
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 500);
  };

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

      <div className="relative max-w-2xl mx-auto px-6">
        <Reveal className="text-center mb-12">
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

          <h2 className="text-4xl sm:text-5xl font-bold text-gray-100 tracking-tight leading-tight">
            See MDAnalytics
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #34d399 0%, #22d3ee 60%, #818cf8 100%)' }}
            >
              in action
            </span>
          </h2>

          <p className="mt-4 text-gray-400 text-lg max-w-xl mx-auto">
            Request a personalized demo and speak with our team. We'll walk you through the platform.
          </p>
        </Reveal>

        <Reveal>
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-center py-16 px-8 rounded-3xl bg-white/3 border border-emerald-500/20 shadow-[0_0_60px_rgba(52,211,153,0.08)]"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_32px_rgba(52,211,153,0.25)]">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-100 mb-3">Thank you.</h3>
                <p className="text-gray-400 text-base">Our team will contact you shortly.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl bg-white/4 border border-white/10 p-8 sm:p-10 shadow-2xl"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Full Name <span className="text-red-400/70">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Artur Karapetyan"
                      value={form.name}
                      onChange={handleChange}
                      className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/40 focus:bg-white/7 transition-all duration-200"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Company <span className="text-red-400/70">*</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      required
                      placeholder="Mock Financial"
                      value={form.company}
                      onChange={handleChange}
                      className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/40 focus:bg-white/7 transition-all duration-200"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Work Email <span className="text-red-400/70">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@company.am"
                      value={form.email}
                      onChange={handleChange}
                      className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/40 focus:bg-white/7 transition-all duration-200"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Phone Number <span className="text-red-400/70">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+374 XX XXX XXX"
                      value={form.phone}
                      onChange={handleChange}
                      className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/40 focus:bg-white/7 transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mb-7">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Message <span className="text-gray-700">(optional)</span>
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    placeholder="Tell us about your institution's needs or any specific questions…"
                    value={form.message}
                    onChange={handleChange}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/40 focus:bg-white/7 transition-all duration-200 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="relative overflow-hidden w-full py-4 rounded-2xl font-semibold text-white text-sm bg-linear-to-r from-emerald-500 to-cyan-500 transition-all duration-300 shadow-[0_8px_32px_rgba(52,211,153,0.35)] hover:shadow-[0_12px_48px_rgba(52,211,153,0.5)] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 group"
                >
                  <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  {loading ? 'Sending…' : 'Request Demo'}
                </button>
                <p className="text-center text-gray-600 text-xs mt-4">
                  We'll respond within one business day. No commitment required.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const links = {
    Product: [
      { label: 'Features', action: () => scrollTo('features') },
      { label: 'Integrations', action: () => scrollTo('integrations') },
      { label: 'Intelligence', action: () => scrollTo('intelligence') },
      { label: 'How It Works', action: () => scrollTo('how-it-works') },
    ],
    Resources: [
      { label: 'FAQ', action: () => scrollTo('faq') },
    ],
    Company: [
      { label: 'Request Demo', action: () => scrollTo('contact') },
      { label: 'Contact Sales', action: () => { window.location.href = `mailto:${SALES_EMAIL}`; } },
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
              Enterprise loan risk management for financial institutions.
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

        <div className="mt-12 pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-gray-700">
          <div className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()}. Powered by{" "}
            <span className="font-medium text-slate-300">MDAnalytics</span>. All
            rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Landing Page ────────────────────────────────────────────────────────────

export default function LandingPage() {
  useEffect(() => {
    document.title = 'MDAnalytics — Loan Risk Management for Armenian Banks';
  }, []);

  return (
    <div className="min-h-screen bg-[#080d1a] text-gray-100" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" }}>
      <Navbar />
      <main>
        <HeroSection />
        <TrustedBySection />
        <ProblemSection />
        <FeaturesSection />
        <IntegrationsSection />
        <CHPlusSection />
        <HowItWorksSection />
        <BenefitsSection />
        <FAQSection />
        <DemoRequestSection />
      </main>
      <Footer />
    </div>
  );
}

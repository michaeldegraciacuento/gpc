import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

function useInView(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, visible };
}

const FadeUp = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => {
    const { ref, visible } = useInView();
    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <Head title="Gitagum Pickleball Club — Play. Connect. Compete.">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:300,400,500,600,700,800,900&family=space-grotesk:400,500,600,700" rel="stylesheet" />
                <meta name="description" content="Gitagum Pickleball Club — A vibrant community of pickleball enthusiasts gathering to play, connect, and compete in Gitagum, Misamis Oriental." />
            </Head>

            <style>{`
                @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
                @keyframes pulse-ring { 0%{transform:scale(.8);opacity:.6} 100%{transform:scale(1.4);opacity:0} }
                @keyframes gradient-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
                @keyframes bounce-slow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .animate-float-delay { animation: float 4s ease-in-out 1s infinite; }
                .animate-float-delay2 { animation: float 4s ease-in-out 2s infinite; }
                .animate-pulse-ring { animation: pulse-ring 2s ease-out infinite; }
                .animate-gradient { background-size: 200% 200%; animation: gradient-shift 6s ease infinite; }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
                .font-display { font-family: 'Space Grotesk', 'Inter', sans-serif; }
            `}</style>

            <div className="min-h-screen bg-white font-[Inter] antialiased">
                {/* ── Navbar ───────────────────────────────── */}
                <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <a href="#" className="flex items-center gap-3">
                                <img src="/image/gpc.png" alt="GPC" className="h-10 w-10 rounded-xl object-cover shadow-md" />
                                <span className={`font-display text-lg font-bold transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>GPC</span>
                            </a>
                            <nav className="hidden items-center gap-8 md:flex">
                                {['About', 'Why Play', 'Community', 'Join'].map((item) => (
                                    <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className={`text-sm font-medium transition-colors hover:text-green-600 ${scrolled ? 'text-gray-700' : 'text-white/90 hover:text-white'}`}>
                                        {item}
                                    </a>
                                ))}
                            </nav>
                            <div className="hidden md:block">
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/30 transition-all hover:bg-green-700 hover:shadow-xl hover:shadow-green-600/40 hover:-translate-y-0.5">
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link href={route('login')} className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/30 transition-all hover:bg-green-700 hover:shadow-xl hover:shadow-green-600/40 hover:-translate-y-0.5">
                                        Sign In
                                    </Link>
                                )}
                            </div>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`rounded-lg p-2 md:hidden ${scrolled ? 'text-gray-700' : 'text-white'}`}>
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMenuOpen
                                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    }
                                </svg>
                            </button>
                        </div>
                        {/* Mobile menu */}
                        <div className={`overflow-hidden transition-all duration-300 md:hidden ${isMenuOpen ? 'max-h-64 pb-4' : 'max-h-0'}`}>
                            <div className={`flex flex-col gap-3 rounded-xl p-4 ${scrolled ? 'bg-gray-50' : 'bg-white/10 backdrop-blur-md'}`}>
                                {['About', 'Why Play', 'Community', 'Join'].map((item) => (
                                    <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={() => setIsMenuOpen(false)} className={`rounded-lg px-3 py-2 text-sm font-medium ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
                                        {item}
                                    </a>
                                ))}
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="mt-1 rounded-lg bg-green-600 px-4 py-2.5 text-center text-sm font-semibold text-white">Dashboard</Link>
                                ) : (
                                    <Link href={route('login')} className="mt-1 rounded-lg bg-green-600 px-4 py-2.5 text-center text-sm font-semibold text-white">Sign In</Link>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Hero ────────────────────────────────── */}
                <section className="relative flex min-h-screen items-center overflow-hidden bg-gray-900">
                    {/* Background image */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-gray-900/70 to-gray-900/90 z-10" />
                        <img src="/image/gitagum.jpg" alt="" className="h-full w-full object-cover" />
                    </div>
                    {/* Animated decorative elements */}
                    <div className="absolute inset-0 z-10 overflow-hidden">
                        <div className="animate-float absolute top-1/4 right-[10%] h-20 w-20 rounded-full bg-green-400/10 blur-xl" />
                        <div className="animate-float-delay absolute bottom-1/3 left-[15%] h-32 w-32 rounded-full bg-yellow-400/10 blur-2xl" />
                        <div className="animate-float-delay2 absolute top-1/2 right-[30%] h-16 w-16 rounded-full bg-green-300/10 blur-lg" />
                    </div>

                    <div className="relative z-20 mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
                        <div className="max-w-3xl">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-300 backdrop-blur-sm animate-bounce-slow">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                                </span>
                                Open for all skill levels
                            </div>
                            <h1 className="font-display text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
                                Play. Connect.{' '}
                                <span className="animate-gradient bg-gradient-to-r from-green-400 via-yellow-300 to-green-400 bg-clip-text text-transparent">
                                    Compete.
                                </span>
                            </h1>
                            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300 sm:text-xl">
                                Gitagum Pickleball Club is a vibrant community of players who come together to enjoy the fastest-growing sport — right here in our hometown.
                            </p>
                            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                                <a href="#join" className="group inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-green-600/30 transition-all hover:bg-green-500 hover:shadow-2xl hover:shadow-green-500/40 hover:-translate-y-0.5">
                                    Join the Club
                                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </a>
                                <a href="#about" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/20 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10">
                                    Learn More
                                </a>
                            </div>
                        </div>
                    </div>
                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 animate-bounce">
                        <svg className="h-6 w-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                    </div>
                </section>

                {/* ── About ──────────────────────────────── */}
                <section id="about" className="relative overflow-hidden py-24 lg:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid items-center gap-16 lg:grid-cols-2">
                            <FadeUp>
                                <div className="relative">
                                    <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-green-100 to-yellow-50 -z-10" />
                                    <img src="/image/gpc.png" alt="Gitagum Pickleball Club" className="w-full max-w-md mx-auto rounded-2xl " />
                                    <div className="absolute -bottom-6 -right-6 rounded-2xl bg-green-600 px-6 py-4 text-white shadow-xl animate-float">
                                        <p className="text-3xl font-bold font-display">GPC</p>
                                        <p className="text-sm text-green-100">Est. 2026</p>
                                    </div>
                                </div>
                            </FadeUp>
                            <div>
                                <FadeUp delay={100}>
                                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-600">About Us</p>
                                </FadeUp>
                                <FadeUp delay={200}>
                                    <h2 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                                        More Than a Sport —{' '}
                                        <span className="text-green-600">It's Community</span>
                                    </h2>
                                </FadeUp>
                                <FadeUp delay={300}>
                                    <p className="mt-6 text-lg leading-relaxed text-gray-600">
                                        Founded by passionate players in Gitagum, Misamis Oriental, our club brings together people of all ages and skill levels. Whether you're picking up a paddle for the first time or you're a seasoned competitor, you'll find your place here.
                                    </p>
                                </FadeUp>
                                <FadeUp delay={400}>
                                    <p className="mt-4 text-lg leading-relaxed text-gray-600">
                                        We believe pickleball is the perfect way to stay active, build friendships, and have fun. Our community is built on respect, sportsmanship, and the shared love of the game.
                                    </p>
                                </FadeUp>
                                <FadeUp delay={500}>
                                    <div className="mt-10 grid grid-cols-3 gap-6">
                                        {[
                                            { number: '50+', label: 'Active Members' },
                                            { number: '3x', label: 'Weekly Sessions' },
                                            { number: '∞', label: 'Good Vibes' },
                                        ].map((stat) => (
                                            <div key={stat.label} className="text-center">
                                                <p className="font-display text-3xl font-bold text-green-600">{stat.number}</p>
                                                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </FadeUp>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Why Play ────────────────────────────── */}
                <section id="why-play" className="relative overflow-hidden bg-gray-50 py-24 lg:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <FadeUp>
                            <div className="mx-auto max-w-2xl text-center">
                                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-600">Why Pickleball?</p>
                                <h2 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                                    The Game Everyone's{' '}
                                    <span className="text-green-600">Talking About</span>
                                </h2>
                                <p className="mt-4 text-lg text-gray-600">Easy to learn, hard to put down. Here's why our members keep coming back.</p>
                            </div>
                        </FadeUp>

                        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { icon: '🏓', title: 'Easy to Learn', desc: 'Pick up the basics in minutes. Our friendly members love helping newcomers get started.' },
                                { icon: '🤝', title: 'Build Friendships', desc: 'Every game is a chance to connect. Our club is a tight-knit community of supportive players.' },
                                { icon: '💪', title: 'Stay Active & Fit', desc: 'A full-body workout disguised as fun. Stay healthy while doing something you genuinely enjoy.' },
                                { icon: '🏆', title: 'Friendly Competition', desc: 'Push your skills with organized matches, ladder play, and occasional tournaments.' },
                                { icon: '👨‍👩‍👧‍👦', title: 'All Ages Welcome', desc: 'From teens to retirees — pickleball is the great equalizer. Everyone plays, everyone belongs.' },
                                { icon: '🌴', title: 'Outdoor Fun', desc: 'Enjoy the beautiful Gitagum weather while playing on our well-maintained courts.' },
                            ].map((item, i) => (
                                <FadeUp key={item.title} delay={i * 100}>
                                    <div className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-green-200">
                                        <div className="mb-4 text-4xl">{item.icon}</div>
                                        <h3 className="font-display text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                        <div className="absolute bottom-0 left-0 h-1 w-0 rounded-b-2xl bg-gradient-to-r from-green-500 to-green-300 transition-all duration-300 group-hover:w-full" />
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Gallery / Community ─────────────────── */}
                <section id="community" className="relative overflow-hidden py-24 lg:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <FadeUp>
                            <div className="mx-auto max-w-2xl text-center">
                                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-600">Our Community</p>
                                <h2 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                                    See You on the{' '}
                                    <span className="text-green-600">Court</span>
                                </h2>
                                <p className="mt-4 text-lg text-gray-600">
                                    From morning rallies to weekend tournaments, there's always a game happening.
                                </p>
                            </div>
                        </FadeUp>

                        <FadeUp delay={200}>
                            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {[
                                    { bg: 'from-green-600 to-green-800', text: 'Scheduled Sessions', sub: 'Mon · Wed · Fri — ∞ hours' },
                                    { bg: 'from-yellow-500 to-orange-500', text: 'Weekend Mixers', sub: 'Every Weekends afternoon' },
                                    { bg: 'from-blue-600 to-indigo-700', text: 'Beginner Clinics', sub: 'Scheduled Monthly' },
                                ].map((card) => (
                                    <div key={card.text} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.bg} p-8 text-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}>
                                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />
                                        <div className="relative z-10">
                                            <h3 className="font-display text-2xl font-bold">{card.text}</h3>
                                            <p className="mt-2 text-white/80">{card.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </FadeUp>

                        {/* <FadeUp delay={300}>
                            <div className="mt-12 rounded-2xl border border-gray-100 bg-gray-50 p-8 sm:p-12">
                                <div className="grid items-center gap-8 lg:grid-cols-2">
                                    <div>
                                        <h3 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">What Our Members Say</h3>
                                        <blockquote className="mt-6 border-l-4 border-green-500 pl-6">
                                            <p className="text-lg italic text-gray-600">
                                                "I joined not knowing a thing about pickleball. Now I can't imagine my week without it. The people here are amazing — it's like a second family."
                                            </p>
                                            <footer className="mt-4 text-sm font-semibold text-gray-900">— A GPC Member</footer>
                                        </blockquote>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { emoji: '🎯', label: 'Focused Play' },
                                            { emoji: '😄', label: 'Great Times' },
                                            { emoji: '🏅', label: 'Tournaments' },
                                            { emoji: '❤️', label: 'Community' },
                                        ].map((item) => (
                                            <div key={item.label} className="rounded-xl bg-white p-6 text-center shadow-sm transition-all hover:shadow-md">
                                                <div className="text-3xl">{item.emoji}</div>
                                                <p className="mt-2 text-sm font-medium text-gray-700">{item.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </FadeUp> */}
                    </div>
                </section>

                {/* ── Join CTA ────────────────────────────── */}
                <section id="join" className="relative overflow-hidden bg-gray-900 py-24 lg:py-32">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="animate-float absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-green-600/20 blur-3xl" />
                        <div className="animate-float-delay absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl" />
                    </div>
                    <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                        <FadeUp>
                            <div className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-300">
                                🏓 No experience needed
                            </div>
                        </FadeUp>
                        <FadeUp delay={100}>
                            <h2 className="font-display mt-8 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
                                Ready to{' '}
                                <span className="animate-gradient bg-gradient-to-r from-green-400 via-yellow-300 to-green-400 bg-clip-text text-transparent">
                                    Play?
                                </span>
                            </h2>
                        </FadeUp>
                        <FadeUp delay={200}>
                            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 sm:text-xl">
                                Grab a paddle and join us on the court. Whether you're a total beginner or an experienced player, there's always room for one more at GPC.
                            </p>
                        </FadeUp>
                        <FadeUp delay={300}>
                            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="group inline-flex items-center gap-2 rounded-full bg-green-600 px-10 py-4 text-lg font-semibold text-white shadow-xl shadow-green-600/30 transition-all hover:bg-green-500 hover:shadow-2xl hover:-translate-y-0.5">
                                        Go to Dashboard
                                        <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </Link>
                                ) : (
                                    <a href="https://www.google.com/maps/place/Gitagum+Municipal+Hall/@8.5939706,124.4032764,838m/data=!3m2!1e3!4b1!4m6!3m5!1s0x32555b63f60c24f3:0xef518c8969cc8d65!8m2!3d8.5939706!4d124.4058513!16s%2Fg%2F11p053v6qv?entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-green-600 px-10 py-4 text-lg font-semibold text-white shadow-xl shadow-green-600/30 transition-all hover:bg-green-500 hover:shadow-2xl hover:-translate-y-0.5">
                                        Get Started
                                        <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </a>
                                )}
                            </div>
                        </FadeUp>
                    </div>
                </section>

                {/* ── Footer ──────────────────────────────── */}
                <footer className="border-t border-gray-100 bg-white py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} GPC. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

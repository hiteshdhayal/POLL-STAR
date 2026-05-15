import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { LiveBadge } from '../components/ui/LiveBadge';
import { ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [pollData, setPollData] = useState([
    { label: 'Absolutely', percent: 68 },
    { label: 'Not at this time', percent: 22 },
    { label: 'Undecided', percent: 10 },
  ]);
  const [responses, setResponses] = useState(1248);

  useEffect(() => {
    const interval = setInterval(() => {
      setPollData(current => {
        // Randomly shift percentages slightly while keeping sum at 100
        const shift = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        if (shift === 0) return current;

        const newData = [...current];
        const targetIdx = Math.floor(Math.random() * 3);
        const sourceIdx = (targetIdx + 1) % 3;

        if (newData[sourceIdx].percent > 5 && newData[targetIdx].percent < 95) {
          newData[sourceIdx].percent -= 1;
          newData[targetIdx].percent += 1;
        }
        return newData;
      });

      setResponses(r => r + (Math.random() > 0.4 ? 1 : 0));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <PageWrapper>
      {/* Hero Section with Faded Japanese Background */}
      <div className="relative overflow-hidden">
        {/* Faded Background Theme */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] blur-[1px]"
          style={{
            backgroundImage: 'url(/japanese-river.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Hero Left */}
            <div className="space-y-8 animate-fade-up">
              <div className="space-y-4">
                <p className="label animation-delay-100">Chapter 01 — Voice of the People</p>
                <h1 className="font-display text-6xl md:text-8xl text-charcoal leading-[0.9] tracking-tighter animation-delay-200">
                  Quiet polls.<br />
                  <span className="text-crimson italic">Loud</span><br />
                  <span className="text-crimson">answers.</span>
                </h1>
              </div>
              
              <p className="text-muted text-lg max-w-md leading-relaxed animation-delay-300">
                A minimalist platform for real-time collective intelligence. 
                Built for clarity, speed, and beautiful decision making.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 animation-delay-400">
                <Link to="/polls/create">
                  <Button size="lg" className="w-full sm:w-auto">
                    Begin a Poll <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                    Open Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Right - Demo Card */}
            <div className="relative animate-fade-up animation-delay-300 hidden lg:block">
              <div className="card relative z-10 p-10 shadow-[0_32px_64px_rgba(26,26,26,0.1)] border-border">
                <div className="flex justify-between items-start mb-8">
                  <LiveBadge />
                  <span className="label bg-charcoal text-white px-2 py-0.5">Open</span>
                </div>
                
                <h3 className="font-display text-3xl text-charcoal mb-8">
                  Should we adopt the four-day work week?
                </h3>

                <div className="space-y-6">
                  {pollData.map((opt, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs uppercase tracking-widest font-semibold">
                        <span>{opt.label}</span>
                        <span>{opt.percent}%</span>
                      </div>
                      <div className="w-full h-1 bg-border overflow-hidden">
                        <div 
                          className="h-full bg-crimson transition-all duration-400"
                          style={{ width: `${opt.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-border flex justify-between items-center text-[10px] uppercase tracking-widest text-muted font-bold">
                  <span>{responses.toLocaleString()} Responses</span>
                  <span>3h remaining</span>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-crimson/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-charcoal/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-6">
        {/* Three Principles Section */}
        <div className="mt-40 space-y-16">
          <div className="text-center space-y-4">
            <p className="label">Philosophy</p>
            <h2 className="font-display text-4xl text-charcoal italic">Built like a tea garden.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { char: '大', title: 'Public Link', desc: 'Instant sharing with unique cryptographic tokens.', sub: 'DAI — GREAT' },
              { char: '間', title: 'Auto Expiry', desc: 'Polls that respect time. Set it and let it fade.', sub: 'MA — SPACE' },
              { char: '観', title: 'Live Counts', desc: 'Real-time synchronization via web sockets.', sub: 'KAN — VIEW' },
            ].map((item, i) => (
              <div key={i} className="text-center space-y-6 animate-fade-up" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                <span className="text-7xl text-crimson opacity-20 font-serif leading-none block">{item.char}</span>
                <div className="space-y-2">
                  <h4 className="font-display text-xl text-charcoal">{item.title}</h4>
                  <p className="text-muted text-sm leading-relaxed px-8">{item.desc}</p>
                </div>
                <p className="text-[10px] tracking-[0.3em] text-muted uppercase font-bold">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="border-t border-border mt-40 py-20 text-center space-y-8">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-display text-xl font-bold text-charcoal tracking-tight">POLL—STAR</span>
          <span className="text-[9px] tracking-[0.3em] text-muted uppercase">投票 · HOSHI</span>
        </Link>
        <p className="text-[10px] uppercase tracking-widest text-muted">© 2025 POLL—STAR · ALL RIGHTS RESERVED</p>
      </footer>
    </PageWrapper>
  );
};

export default LandingPage;

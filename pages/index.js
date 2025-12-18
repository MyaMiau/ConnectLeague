import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HomePage() {
  const heroImages = [
    "/playerbonita.jpg",
    "/playerbonita2.jpg",
    "/playerbonita3.jpg",
    "/playerbonita4.jpg",
    "/camp.jpg",
    "/camp2.jpg",
  ];

  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);
  const [logoSrc, setLogoSrc] = useState("/connect-league-logo.png");

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearTimeout(timeoutRef.current);
  }, [index, heroImages.length]);

  const goPrev = () => {
    clearTimeout(timeoutRef.current);
    setIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goNext = () => {
    clearTimeout(timeoutRef.current);
    setIndex((prev) => (prev + 1) % heroImages.length);
  };

  const goTo = (i) => {
    clearTimeout(timeoutRef.current);
    setIndex(i);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      {/* Background image + overlay */}
      <div className="absolute inset-0">
        <Image
          src="/bgindex.png"
          alt="Background arena"
          fill
          className="object-cover object-center scale-x-[-1] opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/85 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-8 pt-6 flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-zinc-900/80 border border-zinc-700/80">
            <Image
              src={logoSrc}
              alt="Connect League"
              fill
              sizes="64px"
              className="object-cover"
              priority
              onError={() => {
                if (logoSrc === "/connect-league-logo.png") {
                  setLogoSrc("/cl-logo-render.png");
                }
              }}
            />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400">
            Connect League
          </span>
        </header>

        {/* Hero */}
        <main className="flex-1 flex items-center">
          <div className="container mx-auto px-8 py-12 grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side */}
            <div className="space-y-8 max-w-xl">
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                <span className="block text-white">Vença como time</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400">
                  Cresça como jogador.
                </span>
              </h1>

              <p className="text-base md:text-lg text-zinc-200/90 leading-relaxed">
                Conecte jogadores, equipes e oportunidades. Compartilhe partidas, encontre vagas e leve
                sua carreira gamer para o próximo nível.
              </p>

              <div className="flex items-center gap-4">
                <Link href="/login">
                  <button
                    className="px-8 py-3.5 rounded-full text-base font-semibold text-white shadow-[0_20px_60px_rgba(59,130,246,0.45)] transition-transform hover:-translate-y-0.5 cursor-pointer"
                    style={{
                      background:
                        "linear-gradient(90deg,#22d3ee 0%,#6366f1 40%,#a855f7 75%,#ec4899 100%)",
                    }}
                  >
                    Login
                  </button>
                </Link>

                <Link href="/register">
                  <button
                    className="px-8 py-3.5 rounded-full text-base font-semibold border border-white/25 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                    style={{ backdropFilter: "blur(14px)" }}
                  >
                    Cadastre-se
                  </button>
                </Link>
              </div>
            </div>

            {/* Right side - carousel */}
            <div className="relative hidden lg:block">
              <div className="rounded-2xl p-2 bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_30px_80px_rgba(15,23,42,0.9)]">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40">
                  {heroImages.map((src, i) => (
                    <div
                      key={src}
                      className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                      style={{
                        opacity: i === index ? 1 : 0,
                        zIndex: i === index ? 2 : 0,
                      }}
                    >
                      <Image
                        src={src}
                        alt={`Highlight ${i + 1}`}
                        fill
                        sizes="(max-width: 1024px) 80vw, 640px"
                        className="object-cover"
                        priority={i === index}
                      />
                    </div>
                  ))}

                  {/* Carousel controls */}
                  <button
                    aria-label="Imagem anterior"
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center hover:bg-black/65 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    aria-label="Próxima imagem"
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center hover:bg-black/65 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>

                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {heroImages.map((_, i) => (
                      <button
                        key={i}
                        aria-label={`Ir para imagem ${i + 1}`}
                        onClick={() => goTo(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          i === index ? "bg-white scale-110" : "bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
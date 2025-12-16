import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const carouselImages = [
    "/playerbonita.jpg",
    "/playerbonita2.jpg",
    "/playerbonita3.jpg",
    "/playerbonita4.jpg",
    "/camp.jpg",
    "/camp2.jpg",
  ];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (paused) return;
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearTimeout(timeoutRef.current);
  }, [index, paused, carouselImages.length]);

  const goPrev = () => {
    clearTimeout(timeoutRef.current);
    setIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };
  const goNext = () => {
    clearTimeout(timeoutRef.current);
    setIndex((prev) => (prev + 1) % carouselImages.length);
  };
  const goTo = (i) => {
    clearTimeout(timeoutRef.current);
    setIndex(i);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <main className="relative overflow-hidden" style={{ minHeight: "100vh" }}>
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            <Image
              src="/bgindex.png"
              alt="Background arena"
              fill
              style={{
                objectFit: "cover",
                objectPosition: "center",
                transform: "scaleX(-1)",
                opacity: 0.5,
              }}
              priority
            />
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(800px 420px at 36% 45%, rgba(10,20,35,0) 0%, rgba(8,12,20,0.55) 50%, rgba(8,12,20,0.85) 100%)",
            }}
          />
        </div>

        <div className="relative z-20 w-full max-w-7xl mx-auto px-8 py-20">
          {/* logo */}
          <div className="absolute top-6 left-6 z-30 flex items-center gap-3">
            <div className="relative w-20 h-20">
              <Image
                src="/cl-logo-render.png"
                alt="Connect League"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <span className="hidden sm:inline-block text-lg md:text-xl font-extrabold text-white/90">
              Connect League
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12">
            <div className="flex-1 max-w-2xl" style={{ paddingTop: "4vh" }}>
              <h1
                className="font-extrabold text-white leading-tight"
                style={{
                  fontSize: "clamp(3.6rem, 3.5vw, 6.4rem)",
                  lineHeight: 0.98,
                  letterSpacing: "-0.02em",
                  marginBottom: 12,
                  maxWidth: "520px", 
                }}
              >
                Vença como time
                <br />
                Cresça como
                <br />
                jogador.
              </h1>

              <p className="mt-6 text-zinc-300 max-w-xl text-sm md:text-base font-medium">
                Conecte jogadores, equipes e oportunidades. Compartilhe partidas, encontre vagas e leve sua
                carreira gamer para o próximo nível.
              </p>

              <div className="mt-10 flex items-center gap-6">
                <Link href="/login" className="inline-block">
                  <button
                    className="px-6 py-3 rounded-full text-white font-medium transition-transform transform hover:-translate-y-0.5 cursor-pointer"
                    style={{
                      background: "linear-gradient(90deg,#7c3aed,#5b21b6)",
                      boxShadow: "0 10px 30px rgba(99,102,241,0.18)",
                    }}
                  >
                    Login
                  </button>
                </Link>

                <Link href="/register" className="inline-block">
                  <button
                    className="px-6 py-3 rounded-full text-white font-medium border border-white/20 bg-white/3 hover:bg-white/6 cursor-pointer"
                    style={{ backdropFilter: "blur(6px)" }}
                  >
                    Cadastre-se
                  </button>
                </Link>
              </div>
            </div>

            <div
              className="relative select-none"
              style={{
                width: 420,
                marginLeft: 0,
              }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div
                aria-hidden
                className="absolute -left-6 -top-6 w-[460px] h-[360px] rounded-3xl filter blur-3xl opacity-80"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(99,102,241,0.45), rgba(59,130,246,0.09) 40%, transparent 60%)",
                  zIndex: 0,
                }}
              />

              <div
                className="relative rounded-3xl overflow-hidden shadow-2xl"
                style={{
                  border: "1px solid rgba(255,255,255,0.06)",
                  zIndex: 5,
                  height: 420,
                  width: "100%",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                }}
              >
                {carouselImages.map((src, i) => (
                  <div
                    key={src}
                    className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                    style={{
                      opacity: i === index ? 1 : 0,
                      zIndex: i === index ? 6 : 4,
                    }}
                  >
                    <Image
                      src={src}
                      alt={`Player ${i + 1}`}
                      fill
                      sizes="(max-width: 1024px) 80vw, 420px"
                      className="object-cover"
                      priority={i === index}
                    />
                  </div>
                ))}

                <button
                  aria-label="Previous"
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-40 bg-black/40 hover:bg-black/50 rounded-full w-10 h-10 flex items-center justify-center text-white cursor-pointer" 
                  style={{ backdropFilter: "blur(6px)" }}
                >
                  ‹
                </button>
                <button
                  aria-label="Next"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-40 bg-black/40 hover:bg-black/50 rounded-full w-10 h-10 flex items-center justify-center text-white cursor-pointer"
                  style={{ backdropFilter: "blur(6px)" }}
                >
                  ›
                </button>

                <div className="absolute left-1/2 -translate-x-1/2 bottom-5 z-40 flex gap-3">
                  {carouselImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`w-3 h-3 rounded-full ${i === index ? "bg-white" : "bg-white/30"} transition-all`}
                      style={i === index ? { transform: "scale(1.15)" } : undefined}
                    />
                  ))}
                </div>
              </div>
              <div
                aria-hidden
                className="absolute left-6 -bottom-10 w-[360px] h-8 rounded-full filter blur-2xl opacity-70"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(99,102,241,0.35), rgba(59,130,246,0.06) 40%, transparent 60%)",
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
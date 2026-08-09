import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ showText = true, size = "md", className = "" }: LogoProps) {
  const dimensions = {
    sm: { box: "w-8 h-8", text: "text-lg", img: 32 },
    md: { box: "w-10 h-10", text: "text-xl", img: 40 },
    lg: { box: "w-14 h-14", text: "text-2xl", img: 56 },
  }[size];

  return (
    <Link href="/" className={`inline-flex items-center gap-3 group ${className}`}>
      <div className={`relative ${dimensions.box} rounded-xl overflow-hidden shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all duration-300 group-hover:scale-105 border border-violet-500/30`}>
        <Image
          src="/logo.png"
          alt="AtendeIA Logo"
          width={dimensions.img}
          height={dimensions.img}
          className="object-cover w-full h-full"
          priority
        />
      </div>
      {showText && (
        <span className={`${dimensions.text} font-extrabold tracking-tight`}>
          <span className="text-white">Atende</span>
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            IA
          </span>
        </span>
      )}
    </Link>
  );
}

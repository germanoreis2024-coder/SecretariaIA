import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-12 flex-col justify-between">
        <div>
          <Link href="/" className="text-2xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            AtendeIA
          </Link>
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-4">
            Atendimento inteligente via WhatsApp
          </h1>
          <p className="text-lg text-white/80">
            Automatize o atendimento ao cliente com inteligência artificial.
            Respostas instantâneas, 24/7, personalizadas para seu negócio.
          </p>
        </div>
        <div className="text-sm text-white/60">
          © 2026 AtendeIA. Todos os direitos reservados.
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}

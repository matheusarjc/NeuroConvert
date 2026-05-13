import Image from "next/image";

type LockupProps = {
  className?: string;
  /** Caixa de layout (altura × largura máx.) — o PNG mantém proporção com `object-contain`. */
  boxClassName?: string;
  priority?: boolean;
};

/** Lockup horizontal (ícone + wordmark «klarivy») — identidade: fundo escuro, wordmark em branco. */
export function KlarivyLockup({ className = "", boxClassName = "h-8 w-[min(100%,200px)] sm:w-[200px]", priority = false }: LockupProps) {
  return (
    <div className={`relative ${boxClassName} ${className}`}>
      <Image
        src="/brand/klarivy-lockup.png"
        alt="klarivy"
        fill
        className="object-contain object-left"
        sizes="200px"
        priority={priority}
      />
    </div>
  );
}

/** Símbolo K no squircle — barra lateral, avatares, espaços em que a marca já é reconhecida. */
export function KlarivySymbol({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/brand/klarivy-symbol.png"
      alt="klarivy"
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}

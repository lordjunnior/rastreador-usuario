import type { ReactNode } from "react";

/** Capa cinematográfica de ponta a ponta (100vw), sem bordas, fundindo no fundo da página. */
export function LevelCover({ src, alt, children }: { src: string; alt: string; children?: ReactNode }) {
  return <figure className="relative ml-[calc(50%-50vw)] flex min-h-[82vh] w-screen flex-col justify-end overflow-hidden">
    <img src={src} alt={alt} width={1920} height={1080} fetchPriority="high" className="absolute inset-0 h-full w-full animate-[cover-zoom_18s_ease-out_both] object-cover" />
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
    {!children && <div className="h-[82vh]" />}
    {children && <figcaption className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-28 sm:px-10 sm:pb-20">{children}</figcaption>}
  </figure>;
}

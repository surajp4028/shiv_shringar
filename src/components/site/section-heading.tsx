import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  dark = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div className={cn("mx-auto mb-10 max-w-3xl text-center md:mb-14", className)}>
      <div className={cn("flex items-center justify-center gap-3 text-[11px] font-semibold tracking-[0.35em] uppercase", dark ? "text-amber-400/90" : "text-orange-600")}>
        <span className={cn("h-px w-10 bg-gradient-to-r from-transparent", dark ? "to-amber-500/60" : "to-orange-500/60")} />
        {eyebrow}
        <span className={cn("h-px w-10 bg-gradient-to-l from-transparent", dark ? "to-amber-500/60" : "to-orange-500/60")} />
      </div>
      <h2 className={cn("mt-4 font-display text-[2.4rem] leading-[1.1] md:leading-tight font-semibold tracking-tight md:text-6xl", dark ? "text-gold" : "text-sacred")}>
        {title}
      </h2>
      <div className={cn("mx-auto mt-4 flex items-center justify-center gap-2", dark ? "text-amber-400/70" : "text-orange-400")}>
        <span className="h-px w-12 bg-gradient-to-r from-transparent to-current" />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" /></svg>
        <span className="h-px w-12 bg-gradient-to-l from-transparent to-current" />
      </div>
      {description && (
        <p className={cn("mt-4 text-[15px] leading-relaxed md:mt-5 md:text-lg", dark ? "text-stone-400" : "text-stone-600")}>{description}</p>
      )}
    </div>
  );
}

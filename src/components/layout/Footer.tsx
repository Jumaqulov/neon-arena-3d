import { SITE } from "@/lib/data";
import Logo from "@/components/ui/Logo";
import { Placeholder } from "@/components/ui/Placeholder";

function FooterField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="eyebrow text-[12px]!">{label}</dt>
      <dd className="text-[16px] leading-[1.55]">
        <Placeholder>{value}</Placeholder>
      </dd>
    </div>
  );
}

/** Shared site footer (Server Component). */
export default function Footer() {
  return (
    <footer className="site-footer relative z-10 border-t border-line bg-ground">
      <h2 className="sr-only">Aloqa</h2>
      <div className="container-page flex flex-col gap-12 pb-12 pt-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Logo className="self-start" />
            <p className="text-[16px] leading-[1.55] text-muted">{SITE.tagline}</p>
          </div>
          <dl className="flex flex-col gap-6">
            <FooterField label="Manzil" value={SITE.address} />
            <FooterField label="Mo‘ljal" value={SITE.landmark} />
          </dl>
          <dl className="flex flex-col gap-6">
            <FooterField label="Ish vaqti" value={SITE.hours} />
            <FooterField label="Telefon" value={SITE.phone} />
          </dl>
          <div className="flex flex-col gap-2">
            <p id="footer-socials" className="eyebrow text-[12px]!">Ijtimoiy tarmoqlar</p>
            <ul aria-labelledby="footer-socials" className="flex flex-col">
              {SITE.socials.map((s) => (
                <li key={s.label}>
                  {s.href === "#" ? (
                    // no real URL yet: plain text + chip, not a dead link to the page top
                    <span className="inline-flex min-h-11 items-center gap-2.5 text-[16px] font-medium text-muted">
                      {s.label}
                      <Placeholder size="sm">[HAVOLA]</Placeholder>
                    </span>
                  ) : (
                    <a
                      href={s.href}
                      className="inline-flex min-h-11 items-center text-[16px] font-medium text-muted no-underline transition-colors hover:text-ink"
                    >
                      {s.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="font-mono text-[14px] font-medium leading-[1.4] tracking-[0.08em] text-dim">
            © <Placeholder>{SITE.year}</Placeholder> NEON ARENA
          </p>
          <p className="text-[14px] leading-[1.4] text-dim">Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </footer>
  );
}

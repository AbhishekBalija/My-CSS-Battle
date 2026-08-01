import { XIcon, CssBattleIcon } from "../utils/icons";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-background/80">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Row 1: warning line, left */}
        <p className="font-mono-tabular text-sm text-warn whitespace-nowrap">
          {/* permanent production-code disclaimer */}⚠ CSSBattle code is not
          production code. These tricks are clever here and horrifying
          everywhere else.
        </p>

        {/* Row 2: signature + icons, right */}
        <div className="mt-5 flex items-center justify-end gap-x-5">
          <span className="font-mono text-sm italic text-muted-foreground">
            -built by abhi
          </span>
          <a
            href="https://x.com/AbhishekBalija1"
            target="_blank"
            rel="noreferrer"
            aria-label="Follow on X"
            className="inline-flex items-center hover:text-foreground transition-colors"
          >
            <XIcon />
          </a>
          <a
            href="https://cssbattle.dev/player/AbhishekBalija1"
            target="_blank"
            rel="noreferrer"
            aria-label="CSSBattle profile"
            className="inline-flex items-center hover:text-foreground transition-colors"
          >
            <CssBattleIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}

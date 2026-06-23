import { XIcon, CssBattleIcon } from "../utils/icons";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-background/80">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm">
        <p className="font-mono-tabular text-warn">
          {/* permanent production-code disclaimer */}⚠ CSSBattle code is not
          production code. These tricks are clever here and horrifying
          everywhere else.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
          <span>built by abhi</span>
          <a
            href="https://x.com/AbhishekBalija1"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            <XIcon />
          </a>
          <a
            href="https://cssbattle.dev/player/AbhishekBalija1"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            <CssBattleIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}

import VoiceLine from "./VoiceLine";
import { Highlighter } from "@/components/ui/highlighter";
import { TypingAnimation } from "@/components/ui/typing-animation";

const Hero = () => {
  return (
    <section>
      <TypingAnimation
        words={["Hi guys!!!", "Abhi here 👀"]}
        loop
        startOnView
        className="font-mono text-lg sm:text-xl text-foreground/90"
      />
      <VoiceLine className="mt-3 max-w-2xl text-xl leading-snug text-foreground/90">
        This is my{" "}
        <Highlighter
          action="underline"
          color="var(--highlight-underline)"
          animationDuration={800}
          isView
        >
          css golf solutions
        </Highlighter>
        . maybe you'll find a{" "}
        <Highlighter
          action="highlight"
          color="var(--highlight-marker)"
          animationDuration={800}
          isView
        >
          trick
        </Highlighter>{" "}
        you wouldn't have thought of.
      </VoiceLine>
      <VoiceLine className="mt-4 text-sm">
        Want to track your own CSSBattle solutions like this?{" "}
        <a
          href="https://github.com/AbhishekBalija/cssbattle-tracker-extension"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          Get the extension
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </VoiceLine>
    </section>
  );
};

export default Hero;

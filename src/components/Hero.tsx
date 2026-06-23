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
    </section>
  );
};

export default Hero;

export type ToolLink = {
  label: string;
  href: string;
};

export type Tool = {
  title: string;
  href?: string;
  description: string;
  /** Optional related links for compound entries (e.g. a skill pack). */
  links?: ToolLink[];
};

export type UsesCategory = {
  category: string;
  tools: Tool[];
};

export const uses: UsesCategory[] = [
  {
    category: "Workstation",
    tools: [
      {
        title: "14” MacBook Pro, M-series, 32GB RAM",
        description:
          "Daily driver. Handles Spark notebooks, large containers, and a stack of Chrome windows without complaint.",
      },
      {
        title: "NVIDIA GeForce RTX 3090 Ti, 24GB VRAM",
        description:
          "The card behind my local LLM projects. 24GB of VRAM is enough to load a model and try a proof of concept on my own hardware.",
      },
      {
        title: "Mechanical keyboard + vertical mouse",
        description:
          "After years on laptop keyboards, switching to a mechanical board and a vertical mouse has been the biggest comfort upgrade.",
      },
    ],
  },
  {
    category: "AI tools",
    tools: [
      {
        title: "Cursor",
        href: "https://cursor.com",
        description:
          "AI-native editor where I do most of my day-to-day coding. Agent mode plus inline edits beat hopping between chat and an IDE.",
      },
      {
        title: "Claude Code",
        href: "https://claude.com/claude-code",
        description:
          "Coding agent that lives in my terminal. Cuts the time from spec to working code for the kind of side projects I tend to build.",
      },
      {
        title: "Grok Bot",
        href: "https://x.ai/bot",
        description:
          "xAI's agentic AI engineering — a team of bots that work as AI teammates.",
      },
      {
        title: "Ollama",
        href: "https://ollama.com",
        description:
          "How I pull a model and try a quick local LLM proof of concept before an idea earns a bigger stack.",
      },
      {
        title: "Hermes Agent",
        href: "https://hermes-agent.nousresearch.com",
        description:
          "Nous Research's agent for the same kind of local proofs of concept — a small loop I can point at a model on my own machine.",
      },
    ],
  },
  {
    category: "Skills & plugins",
    tools: [
      {
        title: "ponytail",
        href: "https://ponytail.dev/",
        description:
          "Complexity-focused code review skill. Keeps diffs lean and flags YAGNI before it ships.",
      },
      {
        title: "context7",
        href: "https://context7.com/",
        description:
          "Pulls up-to-date library docs into the agent context so answers track the current API, not training cutoff.",
      },
      {
        title: "UI/UX skills",
        description:
          "The set I load when polishing the site — design-system guidance, art direction, craft, and animation — without inventing a new aesthetic every time.",
        links: [
          { label: "UI UX Pro Max", href: "https://uupm.cc/" },
          {
            label: "Taste",
            href: "https://github.com/Leonxlnx/taste-skill",
          },
          {
            label: "Impeccable",
            href: "https://github.com/pbakaus/impeccable",
          },
          {
            label: "emilkowalski/skills",
            href: "https://github.com/emilkowalski/skills",
          },
        ],
      },
    ],
  },
  {
    category: "Barista's counter",
    tools: [
      {
        title: "Breville Bambino Plus",
        description:
          "My go-to espresso machine for dark and medium roasts — quick heat-up, consistent shots, and small enough to live on the counter every day.",
      },
      {
        title: "Bialetti Venus Moka Pot 6 cups",
        description:
          "For espresso-like shots when the beans aren't freshly roasted. Stovetop, no fuss, and still a solid cup.",
      },
      {
        title: "Hario Switch",
        description:
          "Quick pour-over with a valve for immersion brew when I want more control without slowing the morning down.",
      },
    ],
  },
];

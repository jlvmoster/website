export type Tool = {
  title: string;
  href?: string;
  description: string;
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
        href: "https://grok.com",
        description:
          "xAI's Grok for quick research, brainstorming, and a second opinion when I want a different model in the loop.",
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
        title: "UI UX Pro Max",
        href: "https://uupm.cc/",
        description:
          "Design-system and UI/UX guidance for agent-built interfaces — useful when restyling pages without inventing a new aesthetic.",
      },
    ],
  },
];

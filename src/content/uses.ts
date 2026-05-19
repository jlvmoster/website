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
        title: "16” MacBook Pro, M-series, 32GB RAM",
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
    category: "Development tools",
    tools: [
      {
        title: "Bun",
        href: "https://bun.com",
        description:
          "Replaces Node, npm, ts-node, jest, esbuild, and a handful of other tools with one fast runtime.",
      },
      {
        title: "Cloudflare Workers + Static Assets",
        href: "https://developers.cloudflare.com/workers/static-assets/",
        description:
          "How this site is hosted. Free tier covers a personal site comfortably and the dynamic surface is already wired up for when I need it.",
      },
      {
        title: "Claude Code",
        href: "https://claude.com/claude-code",
        description:
          "Coding agent that lives in my terminal. Cuts the time from spec to working code for the kind of side projects I tend to build.",
      },
    ],
  },
  {
    category: "Productivity",
    tools: [
      {
        title: "Linear",
        href: "https://linear.app",
        description: "Tracks the side projects I actually intend to finish.",
      },
      {
        title: "1Password",
        href: "https://1password.com",
        description:
          "Password manager and SSH/git signing agent in one. Keys never touch the disk in plaintext.",
      },
    ],
  },
];

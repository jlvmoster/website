export type Project = {
  name: string;
  description: string;
  link: { href: string; label: string };
  logo: string;
};

export const projects: Project[] = [
  {
    name: "moster.dev",
    description:
      "This site. Built on Bun, React, Tailwind v4, and Cloudflare Workers Static Assets.",
    link: { href: "https://github.com/jlvmoster", label: "github.com" },
    logo: "/images/logos/moster.svg",
  },
];

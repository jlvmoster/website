import { Card } from "../components/Card";
import { Section } from "../components/Section";
import { SimpleLayout } from "../components/SimpleLayout";
import { type Tool, uses } from "../content/uses";
import { slugify } from "../lib/slugify";

function ToolItem({ tool }: { tool: Tool }) {
  return (
    <Card as="li">
      <Card.Title as="h3" href={tool.href}>
        {tool.title}
      </Card.Title>
      <Card.Description>{tool.description}</Card.Description>
      {tool.links && tool.links.length > 0 ? (
        <ul className="relative z-10 mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
          {tool.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer transition-colors duration-200 ease-out hover:text-accent focus-visible:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}

export function UsesPage() {
  return (
    <SimpleLayout
      title="The hardware, software, and small luxuries I use to do my job."
      intro="A running inventory of the tools I actually reach for day to day. I'll keep this current as things change."
    >
      <title>Uses — Jalo Moster</title>
      <meta
        name="description"
        content="The hardware, software, and small luxuries I use to do my job — a running inventory of the tools I actually reach for day to day."
      />
      <nav
        aria-label="Uses categories"
        className="mb-10 flex flex-wrap gap-x-5 gap-y-2 border-b border-zinc-100 pb-6 text-sm font-medium text-zinc-600 dark:border-zinc-700/40 dark:text-zinc-400"
      >
        {uses.map((section) => {
          const id = slugify(section.category);
          return (
            <a
              key={section.category}
              href={`#${id}`}
              className="cursor-pointer py-1 transition-colors duration-200 ease-out hover:text-accent focus-visible:text-accent"
            >
              {section.category}
            </a>
          );
        })}
      </nav>
      <div className="space-y-14">
        {uses.map((section) => (
          <Section
            key={section.category}
            title={section.category}
            id={slugify(section.category)}
          >
            <ul className="space-y-6">
              {section.tools.map((tool) => (
                <ToolItem key={tool.title} tool={tool} />
              ))}
            </ul>
          </Section>
        ))}
      </div>
    </SimpleLayout>
  );
}

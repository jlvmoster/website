import { Card } from "../components/Card";
import { Section } from "../components/Section";
import { SimpleLayout } from "../components/SimpleLayout";
import { type Tool, uses } from "../content/uses";

function ToolItem({ tool }: { tool: Tool }) {
  return (
    <Card as="li">
      {tool.href ? (
        <Card.Title as="h3" href={tool.href}>
          {tool.title}
        </Card.Title>
      ) : (
        <h3 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
          {tool.title}
        </h3>
      )}
      <Card.Description>{tool.description}</Card.Description>
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
      <div className="space-y-20">
        {uses.map((section) => (
          <Section key={section.category} title={section.category}>
            <ul className="space-y-16">
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

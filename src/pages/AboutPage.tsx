import { Container } from "../components/Container";
import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
} from "../components/icons";
import { clsx } from "../lib/clsx";

type SocialItemProps = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: string;
  className?: string;
};

function SocialItem({
  href,
  icon: Icon,
  children,
  className,
}: SocialItemProps) {
  const external = href.startsWith("http");
  return (
    <li className={clsx(className, "flex")}>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="group flex text-sm font-medium text-zinc-800 transition hover:text-accent dark:text-zinc-200"
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-accent" />
        <span className="ml-4">{children}</span>
      </a>
    </li>
  );
}

export function AboutPage() {
  return (
    <Container className="mt-16 sm:mt-32">
      <title>About — Jalo Moster</title>
      <meta
        name="description"
        content="Sr. Lead Software Engineer at Chick-fil-A. Seven years building data-intensive systems in Spark, Databricks, and Delta Lake."
      />
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
        <div className="lg:pl-20">
          <div className="max-w-xs px-2.5 lg:max-w-none">
            <img
              src="/images/portrait.jpg"
              alt="Portrait of Jalo Moster"
              className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
            />
          </div>
        </div>
        <div className="lg:order-first lg:row-span-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
            I'm Jalo Moster. I build data systems.
          </h1>
          <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
            <p>
              I'm a Sr. Lead Software Engineer at Chick-fil-A with over seven
              years of experience designing and shipping data-intensive
              software. My career has been a steady pull toward systems that
              quietly do a lot of work — the pipelines, the architectures, the
              integrations that turn messy inputs into something operators can
              actually use.
            </p>
            <p>
              At Chick-fil-A I lead engineering for the Point of Sale
              Transactions (POSTx) portfolio. My team owns the data architecture
              that collects POS transactions across the chain and turns them
              into the metrics that cross-functional teams rely on to make
              chicken-critical decisions. We work primarily in Spark,
              Databricks, and Delta Lake.
            </p>
            <p>
              Before Chick-fil-A I spent nearly five years at AT&T — first
              through the Technology Development Program as a co-op and
              rotational engineer, then on a tools and insights team that
              supported developer productivity for the broader organization.
              I've also done stints at Motorola Solutions and Georgia Tech
              Research Institute, and I'm a Georgia Tech alum (B.S., Computer
              Engineering, 2019).
            </p>
            <p>
              Outside of work I'm into competitive sports — basketball, disc
              golf, pickleball — and unwind with vinyl records and pursuing the
              perfect latte (and the latte art that comes with it).
            </p>
          </div>
        </div>
        <div className="lg:pl-20">
          <ul>
            <SocialItem href="https://github.com/jlvmoster" icon={GitHubIcon}>
              Follow on GitHub
            </SocialItem>
            <SocialItem
              href="https://instagram.com/jlvmoster"
              icon={InstagramIcon}
              className="mt-4"
            >
              Follow on Instagram
            </SocialItem>
            <SocialItem
              href="https://linkedin.com/in/jlvmoster"
              icon={LinkedInIcon}
              className="mt-4"
            >
              Follow on LinkedIn
            </SocialItem>
            <SocialItem
              href="mailto:jalo@moster.dev"
              icon={MailIcon}
              className="mt-8 border-t border-zinc-100 pt-8 dark:border-zinc-700/40"
            >
              jalo@moster.dev
            </SocialItem>
          </ul>
        </div>
      </div>
    </Container>
  );
}

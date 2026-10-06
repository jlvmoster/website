import type { ComponentType } from "react";
import { Container } from "../components/Container";
import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
} from "../components/icons";
import { clsx } from "../lib/clsx";

type ContactItemProps = {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
};

function ContactItem({
  href,
  icon: Icon,
  label,
  value,
  className,
}: ContactItemProps) {
  const external = href.startsWith("http");
  return (
    <li className={clsx(className, "flex")}>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="group flex w-full items-start gap-4 text-sm transition"
      >
        <Icon className="mt-0.5 h-5 w-5 flex-none fill-zinc-500 text-zinc-500 transition group-hover:fill-accent group-hover:text-accent dark:fill-zinc-400 dark:text-zinc-400" />
        <span className="min-w-0 flex-auto">
          <span className="block text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            {label}
          </span>
          <span className="mt-0.5 block font-medium text-zinc-800 transition group-hover:text-accent dark:text-zinc-200">
            {value}
          </span>
        </span>
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
              className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 transition duration-500 ease-out hover:rotate-0 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:rotate-3 dark:bg-zinc-800 dark:ring-white/10"
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
          <ul className="space-y-5">
            <ContactItem
              href="https://github.com/jlvmoster"
              icon={GitHubIcon}
              label="GitHub"
              value="@jlvmoster"
            />
            <ContactItem
              href="https://instagram.com/jlvmoster"
              icon={InstagramIcon}
              label="Instagram"
              value="@jlvmoster"
            />
            <ContactItem
              href="https://linkedin.com/in/jlvmoster"
              icon={LinkedInIcon}
              label="LinkedIn"
              value="jlvmoster"
            />
            <ContactItem
              href="mailto:jalo@moster.dev"
              icon={MailIcon}
              label="Email"
              value="jalo@moster.dev"
              className="border-t border-zinc-100 pt-5 dark:border-zinc-700/40"
            />
          </ul>
        </div>
      </div>
    </Container>
  );
}

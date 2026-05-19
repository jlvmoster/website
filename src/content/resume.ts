export type Role = {
  company: string;
  title: string;
  logo: string;
  start: string;
  end: string;
};

export const resume: Role[] = [
  {
    company: "Chick-fil-A",
    title: "Sr. Lead Software Engineer",
    logo: "/images/logos/chickfila.svg",
    start: "2023",
    end: "Present",
  },
  {
    company: "AT&T",
    title: "Professional System Engineer",
    logo: "/images/logos/att.svg",
    start: "2018",
    end: "2023",
  },
  {
    company: "Motorola Solutions",
    title: "Software Engineer",
    logo: "/images/logos/motorola.svg",
    start: "2018",
    end: "2018",
  },
  {
    company: "Georgia Tech Research Institute",
    title: "Research / Software Engineer",
    logo: "/images/logos/gtri.svg",
    start: "2017",
    end: "2017",
  },
];

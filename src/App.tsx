import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { Writing } from "./components/Writing";

export function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Writing />
      <About />
      <Contact />
    </>
  );
}

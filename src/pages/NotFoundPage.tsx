import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div>
      <title>Not found — Jalo Moster</title>
      <meta name="description" content="That page doesn't exist." />
      <h1>Page not found.</h1>
      <Link to="/">Return home</Link>
    </div>
  );
}

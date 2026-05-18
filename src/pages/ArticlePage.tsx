import { useParams } from "react-router-dom";

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  return <h1>Article: {slug}</h1>;
}

import { Helmet } from "react-helmet-async";

const BASE_URL = "https://my-css-battle-sol.vercel.app";
const SITE_NAME = "CSS Battle Solutions";

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
}

export default function SEO({
  title,
  description = "Minimal CSS Battle solutions with golfed code. Browse solved targets, daily challenges, and analytics. Pure CSS art, under 300 characters.",
  path = "",
  image = `${BASE_URL}/og-image.png`,
}: SEOProps) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — Minimal CSS Art & Code Golf`;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}

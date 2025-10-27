import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: string;
  schema?: object | object[];
}

export const SEO = ({ 
  title, 
  description, 
  canonical, 
  ogImage = "https://www.nius.cz/og-image.jpg",
  ogType = "website",
  schema
}: SEOProps) => {
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="Nurse in Prague" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>
      
      {schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify(Array.isArray(schema) ? schema : schema)
        }} />
      )}
    </>
  );
};

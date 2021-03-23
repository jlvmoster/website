import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

const withSiteMetadata = Component => props => {
  const { site } = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
          links {
            label
            path
          }
        }
      }
    }
  `);

  return <Component metadata={site.siteMetadata} {...props} />;
};

export default withSiteMetadata;

<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:output method="html" indent="yes" encoding="UTF-8"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap - Nurse in Prague</title>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          
          header {
            background: #fff;
            padding: 30px;
            margin-bottom: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          h1 {
            color: #2563eb;
            font-size: 28px;
            margin-bottom: 10px;
          }
          
          .description {
            color: #666;
            font-size: 14px;
          }
          
          .stats {
            display: flex;
            gap: 20px;
            margin-top: 20px;
          }
          
          .stat {
            background: #f0f9ff;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 14px;
            color: #2563eb;
          }
          
          table {
            width: 100%;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          thead {
            background: #2563eb;
            color: #fff;
          }
          
          th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
          }
          
          tbody tr {
            border-bottom: 1px solid #e5e7eb;
          }
          
          tbody tr:hover {
            background: #f9fafb;
          }
          
          td {
            padding: 15px;
            font-size: 14px;
          }
          
          .url-cell {
            color: #2563eb;
            word-break: break-all;
          }
          
          .url-cell a {
            color: #2563eb;
            text-decoration: none;
          }
          
          .url-cell a:hover {
            text-decoration: underline;
          }
          
          .priority-high {
            color: #16a34a;
            font-weight: 600;
          }
          
          .priority-medium {
            color: #2563eb;
          }
          
          .priority-low {
            color: #6b7280;
          }
          
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          }
          
          .badge-weekly {
            background: #dbeafe;
            color: #1e40af;
          }
          
          .badge-monthly {
            background: #fef3c7;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>XML Sitemap</h1>
            <p class="description">This sitemap contains <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong> URLs for Nurse in Prague (nius.cz)</p>
            <div class="stats">
              <div class="stat">🔗 Total URLs: <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong></div>
              <div class="stat">📅 Last Modified: <strong><xsl:value-of select="sitemap:urlset/sitemap:url[1]/sitemap:lastmod"/></strong></div>
            </div>
          </header>
          
          <table>
            <thead>
              <tr>
                <th style="width: 50%">URL</th>
                <th>Priority</th>
                <th>Change Frequency</th>
                <th>Last Modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td class="url-cell">
                    <a href="{sitemap:loc}" target="_blank">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td>
                    <xsl:choose>
                      <xsl:when test="sitemap:priority = '1.0'">
                        <span class="priority-high"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:when>
                      <xsl:when test="sitemap:priority &gt;= '0.8'">
                        <span class="priority-medium"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="priority-low"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <td>
                    <xsl:choose>
                      <xsl:when test="sitemap:changefreq = 'weekly'">
                        <span class="badge badge-weekly"><xsl:value-of select="sitemap:changefreq"/></span>
                      </xsl:when>
                      <xsl:when test="sitemap:changefreq = 'monthly'">
                        <span class="badge badge-monthly"><xsl:value-of select="sitemap:changefreq"/></span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="badge"><xsl:value-of select="sitemap:changefreq"/></span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <td><xsl:value-of select="sitemap:lastmod"/></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>

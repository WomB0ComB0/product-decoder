/**
 * Copyright 2025 Mike Odnis
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { app } from "@packages/shared";

export const seo = ({
  title,
  description = app.description,
  keywords = app.keywords.join(", "),
  image,
  url = app.url,
  siteName = app.name,
  locale = "en_US",
  imageAlt = `${app.name} Logo`,
  imageType = "image/png",
  imageWidth = "1200",
  imageHeight = "630",
}: {
  title: string;
  description?: string;
  image?: string;
  keywords?: string;
  url?: string;
  siteName?: string;
  locale?: string;
  imageAlt?: string;
  imageType?: string;
  imageWidth?: string;
  imageHeight?: string;
}) => {
  const imageUrl = `${process.env.BASE_URL}${image || "/assets/images/logo.png"}`;
  const pageUrl = url || process.env.BASE_URL;

  return [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:creator", content: "@mike_odnis" },
    { name: "twitter:site", content: "@mike_odnis" },
    ...(image
      ? [
          { name: "twitter:image", content: imageUrl },
          { name: "twitter:image:alt", content: imageAlt },
        ]
      : []),
    // Open Graph
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: pageUrl },
    { property: "og:site_name", content: siteName },
    { property: "og:locale", content: locale },
    ...(image
      ? [
          { property: "og:image", content: imageUrl },
          { property: "og:image:secure_url", content: imageUrl },
          { property: "og:image:type", content: imageType },
          { property: "og:image:width", content: imageWidth },
          { property: "og:image:height", content: imageHeight },
          { property: "og:image:alt", content: imageAlt },
        ]
      : []),
  ];
};

import { createClient } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: "production",
  apiVersion: "2024-02-16",
  useCdn: false,
});

/**
 * Ova funkcija se sada zove getSiteSettings kako bi odgovarala uvozu u Navigation.tsx
 * Prošireno za dohvaćanje objekata 'prices' i 'multipliers' te svih vidljivosti stranica
 */
export async function getSiteSettings() {
  const query = `*[_type == "siteSettings"][0]{
    prices,
    multipliers,
    showHome,
    showServices,
    showEstimates,
    showTracking,
    showCompanies
  }`;
  
  try {
    return await client.fetch(query);
  } catch (error) {
    console.error("CMS Fetch Error:", error);
    return null;
  }
}

/**
 * Funkcija za dohvaćanje dinamičkih tekstova
 */
export async function getPageTexts(pageId: string) {
  const query = `*[_type == "pageContent" && pageId == $pageId][0]`;
  return await client.fetch(query, { pageId });
}
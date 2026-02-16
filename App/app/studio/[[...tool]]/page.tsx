"use client";

/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 */

import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

export default function StudioPage() {
  return (
    <div className="flex flex-col min-h-[calc(100dvh-64px)] overflow-hidden">
      {/* Globalni CSS fiks za fiksno pozicioniranje Studija */}
      <style>{`
        div[id="sanity"] {
          height: 100% !important;
          position: relative !important;
          display: flex !important;
          flex-direction: column !important;
        }
        /* Ako Sanity i dalje pokušava pobjeći iz kontejnera */
        .sanity-app-container {
          position: relative !important;
          height: 100% !important;
        }
      `}</style>
      
      <div className="flex-1 relative w-full">
        <NextStudio config={config} />
      </div>
    </div>
  )
}
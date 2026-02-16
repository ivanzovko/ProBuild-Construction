import { type SchemaTypeDefinition } from 'sanity'
import { siteSettings } from './siteSettings' // 1. Uvezi shemu koju smo napravili

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [siteSettings], // 2. Dodaj je u ovaj niz
}
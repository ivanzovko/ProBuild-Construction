import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Global Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'prices',
      title: 'Base Prices by Project Type (€/m2)',
      type: 'object',
      initialValue: {
        house: 1650,
        apartment: 950,
        renovation: 600
      },
      fields: [
        { 
          name: 'house', 
          title: 'House (€/m2)', 
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        },
        { 
          name: 'apartment', 
          title: 'Apartment (€/m2)', 
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        },
        { 
          name: 'renovation', 
          title: 'Renovation (€/m2)', 
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        },
      ]
    }),
    defineField({
      name: 'multipliers',
      title: 'Quality Multipliers (Ratio)',
      type: 'object',
      description: 'Standard is the base (1.0). Budget decreases (e.g., 0.85), Luxury increases (e.g., 1.7)',
      initialValue: {
        budget: 0.85,
        standard: 1,
        luxury: 1.7
      },
      fields: [
        { 
          name: 'budget', 
          title: 'Budget Option (multiplier)', 
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        },
        { 
          name: 'standard', 
          title: 'Standard Option (multiplier)', 
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        },
        { 
          name: 'luxury', 
          title: 'Luxury Option (multiplier)', 
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        },
      ]
    }),
    defineField({
      name: 'showHome',
      title: 'Show Home Page',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showServices',
      title: 'Show Services Page',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showEstimates',
      title: 'Show Estimates Page',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showTracking',
      title: 'Show Live Tracking Page',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showCompanies',
      title: 'Show For Companies Link',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
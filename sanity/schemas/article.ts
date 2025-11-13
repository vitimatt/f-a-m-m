import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Product', value: 'product' },
          { title: 'News', value: 'news' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'layout',
      title: 'Layout (News only)',
      type: 'string',
      options: {
        list: [
          { title: '1 col text, img right', value: 'text-left-img-right' },
          { title: '1 col text, img left', value: 'text-right-img-left' },
          { title: '2 col text, imgs above right', value: 'text-full-img-above-right' },
          { title: '2 col text, imgs above left', value: 'text-full-img-above-left' },
        ],
        layout: 'dropdown',
      },
      hidden: ({ document }) => document?.type !== 'news',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 10,
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'type',
      subtitle: 'text',
      media: 'images.0',
    },
    prepare(selection) {
      const { title, subtitle } = selection
      return {
        title: title ? title.charAt(0).toUpperCase() + title.slice(1) : 'Article',
        subtitle: subtitle ? subtitle.substring(0, 50) + '...' : '',
        media: selection.media,
      }
    },
  },
})


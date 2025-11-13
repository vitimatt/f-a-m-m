import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'model3dRed',
      title: '3D Model (Red)',
      type: 'file',
      options: {
        accept: '.glb,.gltf,.obj,.fbx,.usdz',
      },
    }),
    defineField({
      name: 'model3dGrey',
      title: '3D Model (Grey)',
      type: 'file',
      options: {
        accept: '.glb,.gltf,.obj,.fbx,.usdz',
      },
    }),
    defineField({
      name: 'model3dGreen',
      title: '3D Model (Green)',
      type: 'file',
      options: {
        accept: '.glb,.gltf,.obj,.fbx,.usdz',
      },
    }),
    defineField({
      name: 'svgOutline',
      title: 'SVG Outline',
      type: 'file',
      options: {
        accept: '.svg',
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'svgOutline',
    },
  },
})


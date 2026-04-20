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
        accept: '.glb,.gltf,.obj,.fbx',
      },
    }),
    defineField({
      name: 'model3dGrey',
      title: '3D Model (Grey)',
      type: 'file',
      options: {
        accept: '.glb,.gltf,.obj,.fbx',
      },
    }),
    defineField({
      name: 'model3dGreen',
      title: '3D Model (Green)',
      type: 'file',
      options: {
        accept: '.glb,.gltf,.obj,.fbx',
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
    defineField({
      name: 'lightMultiplier',
      title: 'Light Multiplier',
      type: 'number',
      description: 'Multiplier for the strength of all lights (default: 1.0). Increase to make the scene brighter, decrease to make it darker.',
      initialValue: 1.0,
      validation: (Rule) => Rule.min(0).max(10),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'svgOutline',
    },
  },
})


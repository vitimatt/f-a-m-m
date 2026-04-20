# FAMM - Next.js + Sanity CMS

A modern, production-ready Next.js 14 project with an embedded Sanity Studio. Perfect for content-driven websites with a seamless editing experience.

## 🚀 Features

- **Next.js 14+** with App Router and TypeScript
- **Embedded Sanity Studio** at `/studio` (no separate folder needed)
- **Pre-configured** with Sanity project ID: `hr22noqz` and dataset: `production`
- **Basic Post Schema** included (title, slug, body)
- **Beautiful UI** with modern design
- **Ready for Netlify** deployment out of the box

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Sanity account (free at [sanity.io](https://sanity.io))

## 🛠️ Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=hr22noqz
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

> **Note:** These values are already configured for the provided Sanity project. If you're using your own Sanity project, update the `NEXT_PUBLIC_SANITY_PROJECT_ID` accordingly.

### 3. Run Development Server

```bash
npm run dev
```

The application will start at:
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Sanity Studio:** [http://localhost:3000/studio](http://localhost:3000/studio)

That's it! Both the Next.js frontend and Sanity Studio run together with a single command.

## 📝 Creating Content

1. Navigate to [http://localhost:3000/studio](http://localhost:3000/studio)
2. Sign in with your Sanity account
3. Create a new "Post" document
4. Fill in the title, generate a slug, and add body content
5. Click "Publish"
6. Return to the homepage to see your content

## 🌐 Deploying to Netlify

### Option 1: Deploy via Netlify UI (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your Git provider and select your repository
5. Netlify will automatically detect the settings from `netlify.toml`
6. Click "Deploy site"

The environment variables are already configured in `netlify.toml`, so no additional setup is needed!

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# Deploy
netlify deploy --prod
```

### Verify Deployment

After deployment, both routes should work:
- `https://your-site.netlify.app/` - Frontend
- `https://your-site.netlify.app/studio` - Sanity Studio

## 📁 Project Structure

```
f-a-m-m/
├── app/
│   ├── studio/
│   │   └── [[...index]]/
│   │       └── page.tsx       # Embedded Sanity Studio
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Homepage
│   └── globals.css            # Global styles
├── sanity/
│   ├── lib/
│   │   └── client.ts          # Sanity client configuration
│   └── schemas/
│       ├── index.ts           # Schema exports
│       └── post.ts            # Post schema definition
├── sanity.config.ts           # Sanity Studio configuration
├── next.config.js             # Next.js configuration
├── netlify.toml               # Netlify deployment configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## 🎨 Customization

### Adding New Schemas

1. Create a new schema file in `sanity/schemas/`:

```typescript
// sanity/schemas/page.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    // Add more fields...
  ],
})
```

2. Import and add it to `sanity/schemas/index.ts`:

```typescript
import post from './post'
import page from './page'

export const schemaTypes = [post, page]
```

### Styling

Edit `app/globals.css` to customize the design. The project uses a modern purple gradient theme by default.

### Fetching Data

Use the Sanity client in your components:

```typescript
import { client } from '@/sanity/lib/client'

const data = await client.fetch(`*[_type == "post"]`)
```

## 🔒 Security Notes

### For Production

Consider adding a Sanity API token for authenticated requests:

1. Go to [manage.sanity.io](https://manage.sanity.io)
2. Select your project
3. Go to "API" → "Tokens"
4. Create a new token with appropriate permissions
5. Add to Netlify environment variables:
   ```
   SANITY_API_TOKEN=your_token_here
   ```

### CORS Configuration

To allow your deployed site to communicate with Sanity:

1. Go to [manage.sanity.io](https://manage.sanity.io)
2. Select your project
3. Go to "API" → "CORS Origins"
4. Add your Netlify domain (e.g., `https://your-site.netlify.app`)

## 🐛 Troubleshooting

### Studio not loading

- Ensure all dependencies are installed: `npm install`
- Check that environment variables are set correctly
- Verify the Sanity project ID in `.env.local`

### Build errors on Netlify

- Check the build logs in Netlify dashboard
- Ensure `netlify.toml` is in the root directory
- Verify all dependencies are in `package.json` (not devDependencies)

### Cannot sign in to Studio

- Make sure you have access to the Sanity project (project ID: hr22noqz)
- Check CORS settings in Sanity dashboard
- Clear browser cache and cookies

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Netlify Documentation](https://docs.netlify.com)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT

---

**Built with ❤️ using Next.js and Sanity**


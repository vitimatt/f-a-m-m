# Public Assets

This folder contains static assets that are served directly by Next.js.

## Folders

- **`/logo`** - Place your logo files here (e.g., logo.svg, logo.png)
- **`/fonts`** - Place your font files here (e.g., .woff, .woff2, .ttf)

## Usage

### Accessing Logo in Code
```tsx
<img src="/logo/your-logo.svg" alt="Logo" />
```

### Using Custom Fonts
1. Place font files in `/public/fonts/`
2. Add font-face declaration in `app/globals.css`:

```css
@font-face {
  font-family: 'YourFont';
  src: url('/fonts/your-font.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
```

3. Use in your CSS:
```css
body {
  font-family: 'YourFont', sans-serif;
}
```


# Alpha Centauri

This project is designed as a starting point for Vite projects hosted on Cloudflare. This is a template project that uses:

- TypeScript
- React
- Vite (with Cloudflare plugin)
- Vitest
- Playwright
- ESLint
- Prettier
- GitHub Actions
- Wrangler

## Quick Start

Your quick start steps will be split up logically by platform concern:

- Cloudflare
- Application code

## Quick Start: Cloudflare Portion

1. Create a new Cloudflare "Workers & Pages" Application ([details](#create-a-new-cloudflare-application))
2. Optional: If you bought a domain for this, point WWW to apex ([details](#point-www-to-apex))
3. Disable web analytics ([details](#disable-web-analytics))
4. Point HTTP to HTTPS ([details](#point-http-to-https))
5. Create preview environments for PR's ([details](#create-preview-environments))

### Create a New Cloudflare Application

Write something. Anything. Read it when using it. Edit these instructions to make them better before moving onto the next step.

### Point WWW to apex

Write something. Anything. Read it when using it. Edit these instructions to make them better before moving onto the next step.

### Disable web analytics

Write something. Anything. Read it when using it. Edit these instructions to make them better before moving onto the next step.

### Point HTTP to HTTPS

Write something. Anything. Read it when using it. Edit these instructions to make them better before moving onto the next step.

### Create Preview Environments

Write something. Anything. Read it when using it. Edit these instructions to make them better before moving onto the next step.

## Quick Start: Application Code

1. Get to "Hello World" deployed; Cloudflare setup, GitHub setup, CI, dev container
2. Style guide created
3. Pick fonts: 1 heading font, 1 body text font
4. Pick color scheme relying on one of the main four brands
5. Define primitive design elements like buttons, links, headings
6. If a motif arises, use it

## Development

### Start a dev server

```bash
npm run dev
```

### Build the app

```bash
npm run build
```

## Deployment

### Deploying to Preview Environments

This project was intended to work with GitHub and Cloudflare to deploy each branch associated with a pull request to `main` to a new preview environment

### Deploying to Production

This project was intended to work with GitHub and Cloudflare to deploy all changes merged to `main` to production

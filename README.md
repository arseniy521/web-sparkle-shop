# www.nius.cz

The public site of NIUS, home nursing and IV drips in Prague. A static [Astro](https://astro.build)
site with Tailwind 4; the order form is a React island. Published to GitHub Pages.

```sh
npm ci            # Node 24 or later
npm run dev       # http://localhost:8080
npm run checks    # lint, types, unit tests, build, SEO, browser scenarios
npm run build     # dist/
```

Rules, commands and the publication process: [AGENTS.md](AGENTS.md). Changes reach `main` only
through pull requests with green checks; publication is manual, through the "Publish NIUS" workflow.

The old Vite + React site is kept in the branch `backup/old-site`.

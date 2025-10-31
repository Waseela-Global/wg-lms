# LMS

Minimal bench setup plus the exact steps needed to get the LMS frontend running locally.

## Quick Install (Bench)

1. Create a site if needed:
```
bench new-site your-site.example
```
2. Fetch the app:
```
bench get-app https://github.com/Waseela-Global/wg-lms.git
```
3. Install the app:
```
bench --site your-site.example install-app lms
```
4. Restart bench services:
```
bench restart
```

## Local Frontend Setup

Follow these steps to mirror the fully functional UI (same as the production site) on your local bench.

### Bench & Site Configuration

1. Make sure the site you installed on (e.g. `waseela.dev`) exists and bench is running with `bench start`.
2. Allow the default site to answer any host so `http://localhost:8000` works:
   - Edit `sites/common_site_config.json` and set `"serve_default_site": true`.
   - Restart bench:
```
bench restart
```
3. If you’d rather hit the real hostname (instead of relying on `localhost`), add it to `/etc/hosts`:
```
bench --site waseela.dev add-to-hosts
```

### Build the SPA Assets

The LMS UI is a Vite single-page app. Any 404 on `/assets/lms/frontend/...` means the bundles are missing.

1. Install frontend packages:
```
cd apps/lms/frontend
yarn install
```
2. Build and copy assets into the site:
```
cd /Users/saadalikhan/Saad/Office/frappe-bench
bench build --app lms
```
   - This runs `yarn build` and copies everything into `sites/assets/lms/frontend/`.
3. After frontend changes, rerun `bench build --app lms` and `bench restart`.

### Verify the UI

- With `serve_default_site: true`: visit `http://localhost:8000/lms/courses`
- With host mapping: visit `http://waseela.dev:8000/lms/courses`

Hard-refresh to bust cached assets.

### Troubleshooting

- **404 on `/lms/courses`**
  - Confirm `serve_default_site` is `true` *or* run `bench --site <site> add-to-hosts`.
  - Ensure the `lms` app is installed on the site: `bench --site <site> list-apps`.

- **404 on `/assets/lms/frontend/...`**
  - Run `yarn install` in `apps/lms/frontend`.
  - Run `bench build --app lms`.
  - Check that `sites/assets/lms/frontend/index.html` and `.../assets/index-*.js` exist.

- **Missing favicon/PWA files**
  - These live under `apps/lms/lms/public/frontend/`; `bench build --app lms` copies them over.

- **Permission errors when running bench commands**
  - Make sure your user owns `frappe-bench/logs/` or run the command with elevated permissions when necessary.

Keep the README updated as the workflow evolves.

# Layers of Time: frontend

React (Vite) site that reads everything from the Django API in `backend/`.
Place this folder's contents at the **project root, next to `backend/`**: the seed
command loads images from `<root>/public/images`.

```
layersoftime/
├── backend/        Django API (unchanged)
├── public/images/  your existing images (used by `seed_portfolio`)
├── src/            this app
└── package.json
```

## Run it

```bash
# 1. Backend (terminal 1)
cd backend
cp .env.example .env          # set DB_PASSWORD etc.; CORS already allows http://localhost:5173
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_portfolio   # optional: loads projects/drawings/photography/contact
python manage.py createsuperuser  # then add interiors + competitions at /admin/
python manage.py runserver        # http://localhost:8000

# 2. Frontend (terminal 2, project root)
npm install
npm run dev                       # http://localhost:5173
```

Other scripts: `npm run build`, `npm run lint`, `npm test`.
The API URL defaults to `http://localhost:8000/api`; override with `VITE_API_BASE_URL` (see `.env.example`).

## Structure

| Folder | Responsibility |
| --- | --- |
| `src/api/` | The only code that talks to the backend: `httpClient` (timeouts, abort, `ApiError`), `createListResource` (one factory for every endpoint), `resources.js` |
| `src/hooks/` | `useQuery` (loading/error/success, cancels stale requests), `useCategoryFilter`, `usePageTitle` |
| `src/components/` | Reusable UI: `AsyncBoundary`, `SafeImage`, `Gallery` + `Lightbox`, `FilterTabs`, `CategoryBrowser`, `ContactDetails` |
| `src/features/projects/` | Project-specific UI: `StrataHero`, `ProjectCard`, image helpers |
| `src/pages/` | One component per route; `galleryConfigs.js` drives Drawings, Photography and Interiors through a single `GalleryPage` |
| `src/config/` | Env values and route constants |

Data flow: **page → `useQuery` → `api/*Api.list()` → `httpClient.get()` → Django**, then `AsyncBoundary` renders loading / error / empty / data.

## Common changes

- **New gallery-style page** (items with a category + image): add one entry to `GALLERY_CONFIGS` and a nav item in `config/routes.js`.
- **New endpoint**: `export const fooApi = createListResource('foo')` in `api/resources.js`.
- **Pagination turned on in DRF**: already handled; `list()` accepts `{ results: [...] }`. Add `?page=` handling in the page that needs it.

## Production notes

- `VITE_API_BASE_URL` is baked in at build time. Add your real site origin to `CORS_ALLOWED_ORIGINS` in `backend/.env`.
- Serve `dist/` with an SPA fallback (all paths to `index.html`), otherwise a refresh on `/projects/oculus-house` returns 404.
- Django only serves `/media/` when `DEBUG=True`; in production serve uploaded images with your web server or object storage.

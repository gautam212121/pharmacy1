Project: Pharmacy (Next.js frontend + Express/Mongo backend)

Short mission for an AI contributor
- Keep the Next.js frontend in `pharmacy/` and the Express backend in `backend/` functional and consistent. Small, focused PRs: fix type mismatches, ensure image URLs match between backend and frontend, and preserve socket events (product-updated, labtest-updated, new-order).

Big-picture architecture (quick)
- Frontend: Next.js 15 (app dir) TypeScript + React 19, Tailwind CSS. Key folder: `pharmacy/app/` for pages and components. Uses Next's Image component and `next.config.js` remotePatterns to allow loading images from backend uploads.
- Backend: Express server (`backend/server.js`) with Mongoose models in `backend/models/` and REST routes in `backend/routes/`. File uploads handled with multer; uploaded files are served from `/uploads`.
- Real-time: Socket.IO used between backend and frontend. Events to watch: `product-updated`, `labtest-updated`, `new-order`, `order-updated`.

Key integration points
- Image URLs: Backend stores image paths as `/uploads/<filename>` in model fields named `image`. Frontend renders them by prefixing with backend base URL, e.g. `http://localhost:5000${product.image}`. Confirm `next.config.js` allows `http://localhost:5000/uploads/**` (already present).
- Upload endpoint: `POST http://localhost:5000/api/upload` (used by admin panel). Multer returns `imageUrl` in the response body in the current admin code.
- API endpoints:
  - Products: `GET/POST/PUT/DELETE http://localhost:5000/api/products` (model field `image`)
  - Lab Tests: `GET/POST/DELETE http://localhost:5000/api/lab-tests` (model field `image`)
  - Orders: `POST http://localhost:5000/api/orders`

Project-specific conventions and patterns
- Models use `image` (not `img`) and `description` (not `desc`) for products. Several places in the frontend historically used `img`/`desc` — prefer `image`/`description`.
- Cart context (`pharmacy/app/context/cartContext.tsx`) exposes `addToCart(product: { _id,title,amount })`. When calling it from components, pass a minimal object with these keys rather than only an id.
- Admin UI uses `image` and `preview` patterns: upload returns `res.data.imageUrl` and the admin sets `image` to that returned URL.
- Socket usage: admin and home pages both create a socket connection with `io('http://localhost:5000')` and listen to the same event names. When updating models in admin, emit the corresponding event so frontends refresh.

Common gotchas seen in repo (actionable)
- Type mismatch between frontend Product type and backend model: frontend sometimes expects `img`/`desc` while backend returns `image`/`description`. Check these files as authoritative examples:
  - Backend model: `backend/models/Product.js` (has `image`, `description` stored as `description` in schema)
  - Backend model: `backend/models/LabTest.js` (has `image`)
  - Admin UI: `pharmacy/app/admin/page.tsx` (uses `image`, `preview`, and prefixes `http://localhost:5000${p.image}`)
  - Home UI: `pharmacy/app/home/page.tsx` (should use `image` and `description`) — see existing bug where `No Image` appeared because code checked `img`.
- Next.js Image loading: remotePatterns are configured in `pharmacy/next.config.js` for `http://localhost:5000/uploads/**`. If backend returns a different path (e.g., `/uploads/` vs `/uploads/<name>`), ensure returned `image` values align.
- Cart context signature: `addToCart` expects the full product object, not only an id. Passing only id will break the context; instead pass { _id, title, amount }.

Where to look first when debugging "No Image" or missing images
1. Check backend route/controller that creates the record (e.g., `backend/routes/labtestRoutes.js` or product upload code) — ensure it sets `image` to `/uploads/<filename>`.
2. Verify the persisted document in the DB contains `image` (not `img`) value.
3. Frontend: Search for `img` or `desc` in `pharmacy/app/` and update to `image` / `description`.
4. Confirm `next.config.js` remotePatterns allow the backend host and path.
5. If using Next Image with external URLs, confirm the returned `image` is a relative `/uploads/...` path and prefix with the backend base URL when passing to `Image`.

Small examples found in repo (apply fixes like these)
- Wrong: <code>{p.img ? <Image src={`http://localhost:5000${p.img}`} ... /> : <div>No Image</div>}</code>
  Fix: <code>{p.image ? <Image src={`http://localhost:5000${p.image}`} ... /> : <Image src="/images/placeholder.jpg" ... />}</code>
- Wrong cart call: <code>addToCart(item._id)</code>
  Fix: <code>addToCart({ _id: item._id, title: item.title || item.name, amount: item.amount || item.price })</code>

Developer workflows / commands
- Run frontend dev (pharmacy):
  - Windows cmd:
    cd a:\pharmacy\pharmacy
    npm run dev
- Run backend dev (backend):
  - Windows cmd:
    cd a:\pharmacy\backend
    npm run dev
  - Backend server listens on port 5000 by default; ensure MongoDB is running and the `.env` (if present) is configured.
- Build frontend:
  - cd a:\pharmacy\pharmacy && npm run build

Quick checks to run when editing UI
- Search patterns: `img\b|desc\b|image\b|uploads/` across `pharmacy/app` to find mismatches.
- Check `next.config.js` for remote image allow-listing.

If you change API shapes (e.g., rename `description`), update both admin and home components and add a small unit/feature test (or at minimum a smoke test by running `npm run dev` and verifying the page).

Files to reference while contributing
- Frontend entry: `pharmacy/app/home/page.tsx`, `pharmacy/app/admin/page.tsx`
- Frontend context: `pharmacy/app/context/cartContext.tsx`
- Next config: `pharmacy/next.config.js`
- Backend models & routes: `backend/models/*.js`, `backend/routes/*.js`
- Server: `backend/server.js`

If you need guidance, please open a PR with small changes and include:
- The failing page screenshot (if UI related)
- The network response from the API for the resource in question
- A short note on what you fixed and why (link to files changed)

End of instructions.

# Action Audit

## Auth
- `/login` and `/register` render without AppShell, sidebar, topbar, floating actions, or fixed SOS controls.
- Email/password login submits through NextAuth credentials with loading/error feedback and preserves `callbackUrl`.
- Google/Facebook buttons are only shown when providers are configured and call `signIn` with `callbackUrl`.
- Register submits to `/api/auth/register`, validates password confirmation, shows errors, and redirects to `/login`.
- Auth switch buttons route between `/login` and `/register` with animated panel transitions.

## Dashboard
- `Gửi lại ngay` calls `syncOfflineSOSQueue`, disables while loading, updates queue state, and reports success/partial failure/offline states.
- `Xem chi tiết` opens SOS/report detail modals.
- `Xem trên bản đồ` routes to `/map` when coordinates exist and shows a clear message when coordinates are missing.
- Favorite location save/delete uses API calls, confirms deletion, and refreshes profile data.
- Profile edit expands the real update form and persists through `/api/me`.
- `Xem tất cả` actions expand/collapse the relevant local list instead of doing nothing.

## Reports, Admin, Rescuer
- Reports created from `/contact` are exposed through `/api/reports`.
- Admin and rescuer report detail actions open the report modal.
- Report status actions call `PATCH /api/reports/[id]` and refresh UI.
- SOS status actions in admin/rescuer/map call the existing SOS status APIs and refresh UI.
- Map and directions actions guard missing coordinates with visible feedback.

## Map, Layout, Floating Actions
- GPS controls call geolocation and show loading/error/success states.
- Map layer controls toggle real base/weather layers and refresh weather layers.
- Notification bell opens the notification panel and has empty state.
- Theme toggle updates persisted theme state.
- Floating action menu opens/closes, routes SOS/map actions, calls `tel:114`, and uses Web Share/clipboard fallback for sharing.

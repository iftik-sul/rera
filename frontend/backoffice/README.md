# Back office (frontend)

Static Next.js site built from the Regulatory Authority Figma screens.

## How it's organised

| Path | Purpose |
| :-- | :-- |
| `src/config/roles.ts` | Each role's sidebar menu and sample signed-in user |
| `src/app/<role>/` | One folder per role; one sub-folder per screen |
| `src/components/shell/` | Sidebar, top bar, scrolling workspace — shared by every role |
| `src/components/ui/` | Reusable pieces: KPI cards, panels, tables |
| `src/data/<role>/` | Sample data copied from Figma — swapped for API calls later |
| `src/app/globals.css` | Design tokens (colours, fonts) taken from Figma |
| `public/` | Logo, avatar and icons exported from Figma |

## Rules

- Static export only (`output: "export"`) — no server functions.
- Colours come from the tokens in `globals.css`; don't hard-code new hex values.
- Screen text matches Figma exactly. No internal codes (service numbers, modal IDs, C1/C2/C3) in the UI.

## Signing in (demo)

The start page is a sign-in screen. Each email opens that role's portal.
This is a demo check only, kept in `src/config/accounts.ts` — not real
security. It's replaced by server sign-in (with MFA) when the backend exists.

| Role | Email |
| :-- | :-- |
| Director-General / Registrar | director-general@rera.com |

Passwords are shared with the team separately.

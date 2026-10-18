# RERAN — Real Estate Regulatory Agency platform

Implementation repo. The specification lives in the KnowledgeBase repo
(`iftik-sul/KnowledgeBase`, folder `RERAN/`); the screen designs live in Figma
(file `vBSCiJLpyP8KLCTsmySVrS`). If code and spec disagree, the spec wins.

| Folder | What's in it | Status |
| :-- | :-- | :-- |
| `frontend/backoffice/` | Staff back office (Regulatory Authority roles) — Next.js, static export | In progress — Director-General first |
| `frontend/portal/` | Public / external-user portal (Groups B–H) | Not started |
| `backend/` | Express.js API + PostgreSQL (Prisma) | Not started |

## Run the back office locally

```bash
cd frontend/backoffice
npm install
npm run dev        # http://localhost:3000
npm run build      # writes the static site to frontend/backoffice/out/
```

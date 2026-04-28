# `public/.well-known/`

This directory hosts files that browsers and external services
fetch from `https://oncall.clinic/.well-known/<filename>` for domain
verification. The contents are NOT React/Next.js — they're plain
files served verbatim from Vercel's static asset CDN.

Round 16-C deliverables:

## `apple-developer-merchantid-domain-association`

**Required for Apple Pay** in Stripe Checkout. Without it, iPhone
Safari users will NOT see the "Pay with Apple Pay" button.

### How to provision

Director / Cowork executes from Stripe Dashboard:

1. Go to **Settings → Payment methods → Apple Pay**
2. Click **Add domain** → enter `oncall.clinic`
3. Stripe generates a file with a hash inside (no extension, plain
   text, ~52 characters)
4. **Download** the file
5. **Place it in this directory** with EXACT name:
   `apple-developer-merchantid-domain-association`
   (no `.txt`, no extension, EXACTLY that filename)
6. Commit + push → Vercel rebuild
7. Stripe Dashboard verifies the domain (auto-poll). Once green,
   Apple Pay is live.

### Live verification

```bash
curl -I https://oncall.clinic/.well-known/apple-developer-merchantid-domain-association
# Expected: HTTP/2 200, content-type text/plain
```

### Why a sibling README?

Vercel serves any file in `public/` verbatim. The README is harmless
(also publicly fetchable) but documents the intent for future
maintainers / new dev setups.

## Other potential `.well-known` files

- `security.txt` (RFC 9116) — for security disclosure contact
- `change-password` — Apple/Google password manager redirect

Add as needed; this directory is the single landing spot.

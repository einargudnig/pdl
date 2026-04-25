# Setting up `pdl.einargudni.com`

Goal: route `https://pdl.einargudni.com` to the `pdl` Cloudflare Worker while keeping `einargudni.com` DNS on Vercel.

Worker currently lives at `https://pdl.einargudni.workers.dev` — that keeps working throughout.

---

## Option A — Subdomain delegation (recommended)

Delegate only the `pdl` subdomain to Cloudflare. Everything else on `einargudni.com` stays on Vercel.

### 1. Add the subdomain as a zone in Cloudflare

1. Log in to <https://dash.cloudflare.com> (account: `einargudnig@gmail.com`).
2. Click **Add a Site**.
3. Enter **`pdl.einargudni.com`** (the full subdomain, *not* `einargudni.com`).
4. Pick the **Free** plan.
5. CF will tell you "no DNS records found" — expected. Continue.
6. CF gives you two nameservers, e.g.
   ```
   jean.ns.cloudflare.com
   ryann.ns.cloudflare.com
   ```
   Copy these — you'll need them in step 2.

### 2. Add NS records on Vercel

1. Vercel dashboard → project that owns `einargudni.com` → **Settings** → **Domains**.
2. Click the **...** menu next to `einargudni.com` → **Manage DNS Records** (or go to <https://vercel.com/dashboard/domains>).
3. Click **Add** and create two records:
   | Type | Name  | Value                        |
   | ---- | ----- | ---------------------------- |
   | NS   | `pdl` | `jean.ns.cloudflare.com`     |
   | NS   | `pdl` | `ryann.ns.cloudflare.com`    |

   (Use the actual nameservers CF gave you — the names above are examples.)

4. Save. Propagation usually finishes in 5–15 minutes.

### 3. Wait for CF to verify delegation

In the CF dashboard, the `pdl.einargudni.com` zone will show **Pending Nameserver Update** until it sees the NS records via public DNS. Once CF sees them, the zone flips to **Active** and Universal SSL provisioning starts.

Check progress with:
```sh
dig NS pdl.einargudni.com @1.1.1.1
```
When the result shows the CF nameservers, you're good.

### 4. Wire the route in `wrangler.toml`

Add this block in `wrangler.toml` (next to the existing `[[d1_databases]]` block):

```toml
[[routes]]
pattern = "pdl.einargudni.com"
custom_domain = true
```

### 5. Deploy

```sh
bun run deploy
```

Wrangler will:
- Register `pdl.einargudni.com` as a Custom Domain on the worker.
- Auto-create the proxied DNS record in the CF zone.
- Cloudflare issues a TLS cert for `pdl.einargudni.com` (typically within seconds).

### 6. Verify

```sh
# Should return 401 without creds (basic auth)
curl -I https://pdl.einargudni.com/api/health

# Should return 200 with the crew password
curl -u pdl:<PASSWORD> https://pdl.einargudni.com/api/health
```

Open <https://pdl.einargudni.com> in a browser — basic-auth prompt, then the app loads exactly as it does on `pdl.einargudni.workers.dev`.

If a stale DNS cache is holding things up locally:
```sh
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
```
…or test from a phone on mobile data to bypass the local resolver entirely.

### 7. (Optional) disable the workers.dev URL

Once the custom domain is confirmed working, you can turn off the `pdl.einargudni.workers.dev` URL so only `pdl.einargudni.com` responds. Add to `wrangler.toml`:

```toml
workers_dev = false
```

Redeploy.

---

## Option B — Vercel proxy (fallback)

Use this only if Option A is blocked for some reason. Keeps DNS 100% on Vercel but adds a hop.

1. On Vercel, in any existing project (or a new blank Next.js project), add `pdl.einargudni.com` as a domain.
2. Create a `vercel.json` in that project:
   ```json
   {
     "rewrites": [
       {
         "source": "/:path*",
         "destination": "https://pdl.einargudni.workers.dev/:path*"
       }
     ]
   }
   ```
3. Deploy. Vercel issues the TLS cert for `pdl.einargudni.com` and proxies every request to the workers.dev URL.

**Trade-offs:** every request pays a Vercel → Cloudflare hop (~50–100ms extra), counts toward Vercel bandwidth, and the two-layer basic-auth handshake can confuse some clients (notably iOS PWAs) on first connect.

---

## Rollback

If anything misbehaves:

- **Remove the NS records on Vercel** → DNS reverts, `pdl.einargudni.com` goes back to whatever Vercel was (or wasn't) serving.
- **Remove the `[[routes]]` block from `wrangler.toml`** and redeploy → worker stops responding on the custom domain; `pdl.einargudni.workers.dev` keeps working regardless.

Both changes are independent and reversible within minutes.

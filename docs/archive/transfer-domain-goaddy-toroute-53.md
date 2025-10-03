# Checklist

✅ Domain Transfer & DNS Cut-Over Checklist (GoDaddy → AWS Route 53 + CloudFront)

## Phase 1: Preparation

- [x]  Gerard: Confirm access to **personal GoDaddy account** (where domain is registered)
- [ ]  Stephane: Confirm access to **company AWS account** with Route 53 enabled
- [ ]  Stephane: Verify **billing method** is set up in AWS (credit card on file)
- [x]  Gerard: Check **domain registration details** in [GoDaddy](https://dcc.godaddy.com/control/portfolio/trustie.co/settings?subtab=dns-records)
- [x]  Registrant/Admin/Tech contacts are company details (or update during transfer)
- [x]  Registrant email is accessible and monitored
- [x]  Decide on **email provider** for `trustie.co` (if applicable) Google
- [x]  Export all existing DNS records from GoDaddy (A, CNAME, MX, TXT, SPF, DKIM, DMARC, SRV, etc.) (Saved in website repo trustie-web-Fe/domain-migration
- [x]  Save the current **GoDaddy nameservers** for rollback (just in case)
    
    ![image.png](attachment:635c3d81-b6bf-4be9-b70c-ca9868800428:57e4373c-27ce-45a8-bfd9-bc5c9efd0330.png)
    

## Phase 2: Prepare Domain for Transfer (GoDaddy)

- [x]  Unlock domain in GoDaddy (*Domain Settings → Domain lock → OFF*)
    
    ![image.png](attachment:ff568338-e20b-4152-8348-7b64c0de1ffd:image.png)
    
- [x]  Request **Authorization Code (EPP code)** from GoDaddy
- [x]  Disable **WHOIS privacy** (if enabled)

![image.png](attachment:993864f2-044c-46a9-b558-eb18cba6d0bb:image.png)

![image.png](attachment:a413649f-96e9-4b65-b8e7-9e589e517e42:image.png)

- [ ]  
    
    WZ6T615205334AB21
    
    ![image.png](attachment:788ddb1a-ab5f-4135-8f37-3775dadc7c7b:image.png)
    
- [x]  Set short TTLs (300s) on critical DNS records (A, CNAME, MX) to minimize downtime risk
- [x]  Wait at least 24 hours for TTL changes to propagate

## Phase 3: Initiate Transfer (AWS)

- [ ]  In AWS Route 53 → Registered Domains → *Transfer Domain*
- [ ]  Enter `trustie.co`
- [ ]  Enter **EPP/Auth code** from GoDaddy
- [ ]  Enter company contact details (Registrant, Admin, Tech)
- [ ]  Confirm contact email (must be accessible)
- [ ]  Choose Auto-Renew option if desired
- [ ]  Pay transfer fee (adds 1 year to registration)

## Phase 4: Approve Transfer

- [x]  Receive transfer approval email from GoDaddy
- [x]  Approve immediately to expedite (otherwise wait ~5–7 days)
- [ ]  Confirm in AWS that `trustie.co` shows under *Route 53 → Registered Domains*

## Phase 5: DNS Replication (Route 53)

- [ ]  Create a **Hosted Zone** in Route 53 for `trustie.co`
- [ ]  Re-create all DNS records (copied from GoDaddy)
- [ ]  Apex/root `trustie.co` A/ALIAS
- [ ]  `www` CNAME (or ALIAS)
- [ ]  MX records for email
- [ ]  SPF/DKIM/DMARC TXT records
- [ ]  Any service verification TXT records (Google, AWS SES, etc.)
- [ ]  Any subdomains (app, mail, etc.)

## Phase 6: CloudFront Setup

- [ ]  Request ACM certificate (in **us-east-1**) for `trustie.co` and `www.trustie.co`
- [ ]  Validate via DNS (Route 53 auto-creates validation records if used)
- [ ]  Create CloudFront distribution
- [ ]  Set origin (S3, ALB, EC2, etc.)
- [ ]  Attach ACM certificate
- [ ]  Enable HTTP → HTTPS redirect
- [ ]  Test CloudFront distribution via its default AWS domain (e.g., `d1234abcd.cloudfront.net`)

## Phase 7: Dry-Run Testing

- [ ]  In Route 53, set A/ALIAS for `trustie.co` and `www` → CloudFront distribution
- [ ]  Locally override DNS (`/etc/hosts` or `dig @ns-xxxx.awsdns-xx.com`) to test new Route 53 zone before public cut-over
- [ ]  Verify HTTPS works
- [ ]  Verify TLS cert is valid and matches domain
- [ ]  Verify site loads via CloudFront
- [ ]  Verify redirects (www → apex or apex → www) work as intended

## Phase 8: Cut-Over

- [ ]  In GoDaddy → update **Nameservers** to Route 53 NS records
- [ ]  Confirm update saved correctly
- [ ]  Monitor propagation (use `dig`/`nslookup` against multiple resolvers)
- [ ]  During propagation, confirm both old + new DNS continue serving site (no downtime)

## Phase 9: Post-Cut-Over Validation

- [ ]  Run `dns-cutover-check.sh` (the verification script) against multiple resolvers
- [ ]  Confirm NS records point to AWS Route 53
- [ ]  Confirm Apex + www resolve to CloudFront
- [ ]  Confirm HTTPS valid certificate
- [ ]  Confirm Email (MX, SPF, DKIM, DMARC) working correctly
- [ ]  Verify with real user tests
- [ ]  Open `https://trustie.co`
- [ ]  Open `https://www.trustie.co`
- [ ]  Send/receive email from `@trustie.co`

## Phase 10: Stabilization

- [ ]  After 48 hours, increase TTLs (e.g. back to 3600s or higher)
- [ ]  Delete old GoDaddy DNS zone (to avoid confusion)
- [ ]  Document final configuration in infra docs/Notion
- [ ]  Enable CloudFront logging/monitoring
- [ ]  Set AWS Billing alarms for domain renewals

## Rollback Plan

- [ ]  If cut-over causes issues, switch nameservers in GoDaddy back to **original GoDaddy NS values** (saved earlier)
- [ ]  Because TTLs are short, rollback should propagate in minutes

# Overview

here’s a **step-by-step runbook** for transferring trustie.co from your *personal GoDaddy account* into the *company’s AWS account* so that the company fully owns and controls it.

---

# **📝 Domain Transfer Runbook: GoDaddy → AWS Route 53**

## **1. Preparation (before starting transfer)**

- **Logins**
    - Confirm you can log into your **personal GoDaddy account** (where the domain lives).
    - Confirm you can log into the **company AWS account** with Route 53 enabled.
- **Billing**
    - Ensure the company AWS account has a valid credit card → needed to pay the transfer fee (includes 1-year renewal).
- **Email access**
    - ICANN requires approval via the **domain’s registrant contact email**.
    - Check what email address is on file in GoDaddy under *Registrant Contact*. Update it if needed (and verify you can receive mail there).

---

## **2. Prepare the domain in GoDaddy**

1. **Unlock the domain**
    - In GoDaddy → *Domains* → trustie.co → *Domain Settings* → turn off *Domain Lock*.
2. **Get authorization code (EPP code)**
    - Still in GoDaddy → *Domain Settings* → *Transfer Domain Away from GoDaddy*.
    - Copy the EPP/Auth code (you’ll need this in AWS).
3. **Disable privacy protection (if on)**
    - If WHOIS privacy is enabled, turn it off temporarily so AWS can verify ownership.
4. **Check DNS continuity**
    - Decide if you want to:
        - Keep using GoDaddy nameservers during transfer (safer for continuity).
        - Or pre-create Route 53 hosted zone and switch immediately after transfer.
    - **Best practice:** keep existing DNS until transfer completes, then cut over.

---

## **3. Start transfer in AWS**

1. Go to **Route 53 → Registered Domains → Transfer domain**.
2. Enter trustie.co.
3. Enter the **authorization code** from GoDaddy.
4. Choose **Contact details**:
    - Use company details for Registrant/Admin/Tech contact.
    - Important: use a monitored email address (approval emails go here).
5. Choose **Auto-renew**: enable if you want AWS to handle renewals.
6. Pay the transfer fee (adds 1 year to registration).

---

## **4. Approve the transfer**

- Within minutes/hours you’ll receive an email from the current registrar (GoDaddy) asking to approve the transfer.
- Click the approval link to **expedite**.
- If you do nothing, transfer completes automatically in ~5–7 days.

---

## **5. After transfer completes**

1. In AWS → *Route 53 → Registered Domains*, confirm trustie.co shows up.
2. Create a **Hosted Zone** in Route 53 for trustie.co (if not already).
3. Re-add all necessary DNS records:
    - A/AAAA or Alias → point to CloudFront distribution.
    - MX/SPF/DKIM/DMARC → for email (if you use this domain for email).
    - Any other custom records (e.g. subdomains, verification TXT).
4. Test with dig / nslookup to confirm DNS resolution.

---

## **6. Migrate to CloudFront (optional timing)**

- Once DNS is in Route 53, follow these steps:
    1. Request an ACM certificate (in **us-east-1**) for trustie.co + www.trustie.co.
    2. Create CloudFront distribution with your origin (S3, ALB, EC2, etc.).
    3. Add Alias records in Route 53 for root + www pointing to CloudFront.
    4. Test HTTPS access.

---

# **✅ Quick Checklist**

- Company AWS account billing enabled
- Verify domain registrant email is accessible
- Unlock domain in GoDaddy
- Copy EPP/Auth code
- Disable privacy protection
- Start transfer in AWS Route 53 → pay fee
- Approve transfer via GoDaddy email
- Wait until transfer completes
- Recreate DNS in Route 53
- Attach domain to CloudFront with ACM cert

---

⚠️ **Gotcha:** During transfer, DNS keeps working exactly as it is — nameservers don’t change until you update them. So if you want zero downtime, leave nameservers as GoDaddy’s during transfer, then switch to Route 53 once everything is set up and tested.

---

# DNS cutover plan

Here’s a **DNS cut-over plan** designed to safely move trustie.co from GoDaddy → Route 53/CloudFront with **zero downtime** (or as close as possible).

---

# **🔄 DNS Cut-Over Plan: GoDaddy → Route 53/CloudFront**

## **1. Preparation (1–3 days before cut-over)**

- **Inventory current DNS**
    - Export all DNS records from GoDaddy (A, CNAME, MX, TXT, SRV, etc.).
    - This ensures nothing is lost (esp. email records like MX/SPF/DKIM/DMARC).
- **Create Hosted Zone in Route 53**
    - In AWS → Route 53 → Hosted Zones → Create trustie.co.
    - Manually re-enter all records you exported from GoDaddy.
    - Don’t point at CloudFront yet — first replicate exactly what’s in GoDaddy.
- **Set low TTLs in GoDaddy**
    - Edit key DNS records (A, CNAME, MX) in GoDaddy and reduce TTLs to **300 seconds (5 min)**.
    - Do this at least 24 hours before cut-over so caches around the world expire quickly.

---

## **2. Test CloudFront & ACM (in parallel)**

- **Provision SSL certificate**
    - Use AWS Certificate Manager (ACM) in **us-east-1**.
    - Add trustie.co + www.trustie.co.
    - Validate via DNS (easy if Hosted Zone is ready).
- **Create CloudFront distribution**
    - Origin: S3, ALB, or EC2 (depending on your site).
    - Attach ACM certificate.
    - Test via CloudFront’s default domain (e.g., d12345abcdef.cloudfront.net).

---

## **3. Dry-Run in Route 53 (while still using GoDaddy DNS)**

- In the Route 53 Hosted Zone:
    - Change root (trustie.co) and www A/ALIAS records to point to your CloudFront distribution.
    - Test by overriding locally:
        - On your computer, edit /etc/hosts (Mac/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows) to point trustie.co to the CloudFront IP.
        - Confirm site works with HTTPS before making public.

---

## **4. Cut-Over Day**

1. **Update GoDaddy Nameservers → AWS Nameservers**
    - In GoDaddy → Domain Settings → Nameservers → Custom → paste in the 4 NS records from Route 53.
    - Save changes.
2. **Propagation**
    - Because TTLs were lowered earlier, propagation is usually 5–30 minutes, but allow up to 24 hours globally.
    - During this window:
        - Some users will hit GoDaddy DNS → old origin.
        - Some will hit Route 53 → CloudFront.
    - If both are serving correctly, there’s no downtime.

---

## **5. Post-Cut-Over**

- **Monitoring**
    - Use dig or nslookup to confirm NS records now point to AWS:

```
dig NS trustie.co
dig trustie.co +short
```

- 
- **Verify services**
    - Test web: https://trustie.co and https://www.trustie.co.
    - Test email (if applicable): send + receive.
- **Raise TTLs back up**
    - After 48h, once stable, raise TTLs to 3600s (1h) or higher for efficiency.

---

## **6. Rollback Plan (if needed)**

If something breaks:

- Immediately switch nameservers in GoDaddy back to the original GoDaddy NS values (you saved/exported earlier).
- Because of short TTLs, rollback propagates quickly.

---

# **✅ Key Principles**

- Replicate DNS 1:1 in Route 53 first.
- Lower TTLs before cut-over.
- Test CloudFront via hosts-file before flipping NS.
- Flip nameservers only when confident.
- Monitor closely after switch.

---

# Test Scripts

Here’s a **ready-to-run Bash script** your team can use during and after cut-over to verify DNS, TLS/HTTPS, CloudFront, and email DNS. Save it as dns-cutover-check.sh, make it executable (chmod +x dns-cutover-check.sh), update the config block at the top, and run: ./dns-cutover-check.sh.

```bash
#!/usr/bin/env bash
set -euo pipefail

#############################################
# CONFIG — edit these for your domain/setup #
#############################################
DOMAIN="trustie.co"
WWW_HOST="www.trustie.co"
# If you know your CloudFront hostname, set it to verify www CNAME (optional)
CLOUDFRONT_HOSTNAME="dXXXXXXXXXXXX.cloudfront.net"   # e.g. d3ab12cd34ef56.cloudfront.net
RESOLVERS=("1.1.1.1" "8.8.8.8" "9.9.9.9" "208.67.222.222")  # CF, Google, Quad9, OpenDNS

#############################################
# Pretty output helpers
#############################################
GREEN="$(tput setaf 2 || true)"; RED="$(tput setaf 1 || true)"
YELLOW="$(tput setaf 3 || true)"; BLUE="$(tput setaf 4 || true)"
BOLD="$(tput bold || true)"; RESET="$(tput sgr0 || true)"
pass(){ echo "${GREEN}✅ $*${RESET}"; }
warn(){ echo "${YELLOW}⚠️  $*${RESET}"; }
fail(){ echo "${RED}❌ $*${RESET}"; exit 1; }
info(){ echo "${BLUE}${BOLD}— $* —${RESET}"; }

#############################################
# 1) Registrar / NS / SOA checks
#############################################
info "Parent NS delegation (whois)"
if command -v whois >/dev/null 2>&1; then
  whois "$DOMAIN" | awk 'tolower($0) ~ /name server|nserver|registrar/i {print}'
else
  warn "whois not found; skipping registrar dump"
fi

info "Authoritative NS from DNS"
dig NS "$DOMAIN" +short | sort || true

info "SOA record/serial (useful to spot which side is answering)"
dig SOA "$DOMAIN" +multiline +noall +answer || true

#############################################
# 2) Resolver-by-resolver record checks
#############################################
for r in "${RESOLVERS[@]}"; do
  info "Querying resolver $r"
  echo "A/AAAA ($DOMAIN)"; dig @"$r" "$DOMAIN" A +short; dig @"$r" "$DOMAIN" AAAA +short
  echo "A/AAAA ($WWW_HOST)"; dig @"$r" "$WWW_HOST" A +short; dig @"$r" "$WWW_HOST" AAAA +short
  echo "CNAME ($WWW_HOST)"; dig @"$r" CNAME "$WWW_HOST" +short
  echo "MX ($DOMAIN)"; dig @"$r" MX "$DOMAIN" +short
  echo "TXT ($DOMAIN)"; dig @"$r" TXT "$DOMAIN" +short
  echo
done

#############################################
# 3) CloudFront detection via HTTP headers
#############################################
info "HTTP/HTTPS reachability + CDN fingerprint"
# HTTP should usually 301->HTTPS
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" || true)
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" || true)
echo "http://$DOMAIN -> $HTTP_STATUS"
echo "https://$DOMAIN -> $HTTPS_STATUS"
if [[ "$HTTPS_STATUS" -ge 200 && "$HTTPS_STATUS" -lt 400 ]]; then pass "HTTPS reachable"; else warn "HTTPS not OK ($HTTPS_STATUS)"; fi

# Server header often says CloudFront
HDRS=$(curl -sI "https://$DOMAIN" || true)
echo "$HDRS"
if echo "$HDRS" | grep -qi "Server: CloudFront"; then
  pass "Server header indicates CloudFront"
else
  warn "Server header did not clearly indicate CloudFront (may still be OK if origin serves headers)"
fi

# Check HSTS (optional)
if echo "$HDRS" | grep -qi "strict-transport-security"; then
  pass "HSTS present"
else
  warn "HSTS not present (optional but recommended)"
fi

#############################################
# 4) TLS certificate sanity (CN/SAN, dates)
#############################################
info "TLS certificate (subject/issuer/dates/SAN)"
if command -v openssl >/dev/null 2>&1; then
  echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null \
    | openssl x509 -noout -subject -issuer -dates -ext subjectAltName
else
  warn "openssl not found; skipping certificate dump"
fi

#############################################
# 5) WWW CNAME → CloudFront (if configured)
#############################################
info "CNAME check for $WWW_HOST"
CNAME_TARGET=$(dig CNAME "$WWW_HOST" +short | sed 's/\.$//')
if [[ -n "$CNAME_TARGET" ]]; then
  echo "CNAME $WWW_HOST -> $CNAME_TARGET"
  if [[ -n "$CLOUDFRONT_HOSTNAME" ]]; then
    if [[ "$CNAME_TARGET" == "$CLOUDFRONT_HOSTNAME" ]]; then
      pass "WWW correctly points to expected CloudFront hostname"
    else
      warn "WWW CNAME differs from CLOUDFRONT_HOSTNAME (configured: $CLOUDFRONT_HOSTNAME)"
    fi
  else
    if [[ "$CNAME_TARGET" == *".cloudfront.net" ]]; then
      pass "WWW points to a CloudFront hostname"
    else
      warn "WWW CNAME does not look like CloudFront"
    fi
  fi
else
  warn "No CNAME for $WWW_HOST (you may be using an ALIAS A-record instead)"
fi

#############################################
# 6) Email DNS hygiene (MX/SPF/DKIM/DMARC)
#############################################
info "Email DNS: MX / SPF / DKIM / DMARC"
dig MX "$DOMAIN" +short || true
SPF=$(dig TXT "$DOMAIN" +short | tr -d '"' | grep -i 'v=spf1' || true)
DMARC=$(dig TXT "_dmarc.$DOMAIN" +short | tr -d '"' || true)
echo "SPF:   ${SPF:-'(none found)'}"
echo "DMARC: ${DMARC:-'(none found)'}"
if [[ -z "$SPF" ]]; then warn "SPF not found"; else pass "SPF found"; fi
if [[ -z "$DMARC" ]]; then warn "DMARC not found"; else pass "DMARC found"; fi
echo "DKIM: check your provider-specific selector(s), e.g.:"
echo "  dig TXT selector1._domainkey.$DOMAIN +short"
echo "  dig TXT selector2._domainkey.$DOMAIN +short"

#############################################
# 7) Trace to see who answers (debug helper)
#############################################
info "dig +trace (who is answering right now)"
dig +trace "$DOMAIN" | sed -n '1,120p'
echo
pass "Checks completed for $DOMAIN"
```

## **How to use it effectively**

- **Before cut-over:** set low TTLs and run the script to baseline current answers.
- **During cut-over:** run every few minutes; watch NS answers flip to Route 53 and ensure Server: CloudFront and HTTPS are healthy.
- **After cut-over:** raise TTLs and re-run once more; keep the script in your ops repo.

### **Optional: quick loop for live monitoring**

If you want a quick rolling check during propagation:

```
watch -n 10 "./dns-cutover-check.sh"
```

Sor

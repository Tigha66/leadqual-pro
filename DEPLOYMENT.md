# 🚀 Deployment Guide - LeadQual Pro

## Quick Deploy (15 minutes)

### 1. Deploy Frontend to Vercel

```bash
# Navigate to project
cd lead-qualification-system

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Your app will be live at:** `https://your-app.vercel.app`

---

### 2. Deploy Backend to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set OPENAI_API_KEY=your_key
railway variables set TAVILY_API_KEY=your_key
railway variables set FIRECRAWL_API_KEY=your_key

# Deploy
railway up
```

**Your API will be live at:** `https://your-app.railway.app`

---

### 3. Set Up Database (Neon/Supabase)

```bash
# Create free database at https://neon.tech or https://supabase.com

# Get connection string
# Add to Railway:
railway variables set DATABASE_URL="postgresql://..."

# Run migrations
railway run npx prisma migrate deploy
```

---

## Environment Variables

Create `.env` file with:

```env
# API Keys
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
FIRECRAWL_API_KEY=fc-...

# Database
DATABASE_URL=postgresql://...

# Calendly (for booking)
CALENDLY_API_KEY=...

# Email (for outreach)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App URLs
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

---

## Post-Deployment Checklist

- [ ] Test lead search
- [ ] Verify AI scoring works
- [ ] Test email delivery
- [ ] Test Calendly integration
- [ ] Check database connections
- [ ] Set up monitoring (optional)
- [ ] Configure custom domain (optional)

---

## Pricing (Your Costs)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Vercel | ✅ Free (100GB/mo) | £20/mo (Pro) |
| Railway | ✅ £5 credit/mo | £10/mo (Starter) |
| Neon DB | ✅ Free (0.5GB) | £15/mo (Pro) |
| OpenAI | £0.002/1k tokens | Usage-based |
| Tavily | ✅ 1,000 searches/mo free | £30/mo (Starter) |
| FireCrawl | ✅ 500 pages/mo free | £50/mo (Starter) |

**Total Monthly Cost:** ~£100-200/mo (scales with usage)

**Your Revenue:** £3,000-10,000 setup + £500-2,000/mo per customer

**Profit Margin:** 90%+ after first customer!

---

## Custom Domain (Optional)

```bash
# Buy domain (Namecheap, GoDaddy, etc.)
# ~£10-15/year

# In Vercel dashboard:
# Settings → Domains → Add domain
# Follow DNS instructions

# In Railway dashboard:
# Settings → Domains → Add custom domain
```

---

## Monitoring (Optional)

```bash
# Add Sentry for error tracking
npm install @sentry/nextjs

# Add Vercel Analytics
# Already included with Vercel hosting

# Add Uptime Robot (free)
# https://uptimerobot.com/
# Monitor your API every 5 minutes
```

---

## Scaling

### 10 Customers
- Railway: £50/mo (larger plan)
- Tavily: £100/mo (more searches)
- FireCrawl: £150/mo (more pages)
- **Total:** ~£300/mo
- **Revenue:** £50,000-100,000/mo
- **Profit:** 99%+

### 50 Customers
- Railway: £200/mo
- Tavily: £300/mo
- FireCrawl: £500/mo
- **Total:** ~£1,000/mo
- **Revenue:** £250,000-500,000/mo
- **Profit:** 99%+

---

## Support & Maintenance

### Weekly Tasks (30 min)
- [ ] Check error logs
- [ ] Review customer feedback
- [ ] Update AI prompts if needed
- [ ] Check API usage limits

### Monthly Tasks (2 hours)
- [ ] Review pricing vs. usage
- [ ] Update dependencies
- [ ] Check for new features
- [ ] Customer check-ins

---

## Customer Onboarding

### Day 1: Setup (2 hours)
```
1. Customer signs contract + pays
2. Set up their instance
3. Configure their ICP (Ideal Customer Profile)
4. Connect their CRM + calendar
5. Test with 10 sample leads
```

### Week 1: Training (1 hour)
```
1. Walkthrough dashboard
2. Show how to search leads
3. Explain scoring system
4. Review first batch of leads
5. Adjust criteria if needed
```

### Month 1: Optimization (30 min/week)
```
Week 1: Review lead quality
Week 2: Adjust scoring weights
Week 3: Optimize outreach templates
Week 4: Review ROI + plan next month
```

---

## Ready to Deploy?

**Next Steps:**
1. ✅ Review this guide
2. ✅ Set up accounts (Vercel, Railway, etc.)
3. ✅ Deploy frontend + backend
4. ✅ Test with sample data
5. ✅ Start selling!

**Questions?** Check docs/ folder or contact support.

**First deployment takes 1-2 hours. After that, new deployments take 15 minutes!**

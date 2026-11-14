# Year-1 Cost Estimate (INR): 50 Schools, 50,000 Students, 10,000 Teachers

Planning estimate, not a quotation. Cloud and LLM prices change often; check the vendors' pricing pages before you commit.
Exchange rate used: **1 USD = ₹90**. Amounts: 1 Lakh (L) = ₹1,00,000, 1 Crore (Cr) = ₹100 L.
All cloud amounts exclude 18% GST (claimable as input credit if you are GST-registered).

## 1. Assumptions (from this software)

| Item | Value |
|---|---|
| Schools / students / teachers | 50 / 50,000 / 10,000 (about 60,000+ accounts with admins, parents) |
| Peak concurrent users | about 10% = 5,000–6,000 (school hours, exam-result days are the spikes) |
| Stack | Node/Express API, MongoDB, Socket.IO (live board / classroom), React frontend, file uploads |
| Database size | about 20 GB per year (measured: about 0.3 MB per student per year) plus about 0.5 GB shared textbook AI data |
| File storage | 200 GB to 2 TB (more if students upload homework photos) |
| AI chatbot | 30% of students active, 15 questions/month each, 10 school months, about 3,000 input + 400 output tokens per question (textbook-grounded RAG) = **about 2.25 million chatbot questions per year** |
| Hosting region | AWS Mumbai (low latency for India and Nepal) |

## 2. Cost summary, Year 1

| # | Head | Lean (₹) | Standard (₹) | Type |
|---|---|---|---|---|
| 1 | Development to make it launch-ready | 20 L | 40 L | one-time |
| 2 | Hosting and infrastructure | 13 L | 23 L | yearly |
| 3 | Database (included in hosting, see 3.2) | incl. | incl. | yearly |
| 4 | Authentication, SMS/OTP, email, parent alerts | 3 L | 4 L | yearly |
| 5 | LLM API for AI chatbot and teacher AI tools | 8 L | 12 L | yearly (usage based) |
| 6 | Domain, email workspace, tools | 0.5 L | 1 L | yearly |
| 7 | Security audit, legal, compliance | 4 L | 6 L | one-time |
| 8 | School onboarding, training, support team | 15 L | 25 L | yearly |
| 9 | Marketing and sales (optional) | 0 | 10 L | yearly |
| | **Sub-total** | **63.5 L** | **121 L** | |
| | Contingency 15% | 9.5 L | 18 L | |
| | **Year-1 total** | **about ₹73 L** | **about ₹1.4 Cr** | |

Per student per year: Lean about ₹146, Standard about ₹278.
Running cost only (rows 2–6, repeats every year): about ₹25–41 L, which is **₹50–80 per student per year**.

## 3. Detail

### 3.1 Development: what is still needed for "ready to use"
The core product (all dashboards, report cards, attendance, Smart Board, AI, offline/low-bandwidth) already exists. The remaining work:

| Work | Effort | Standard (₹) |
|---|---|---|
| Load testing and performance tuning for 5,000+ concurrent users (indexes, caching, Redis, Socket.IO scaling) | 6–8 weeks | 6 L |
| Security hardening, rate limits, backups, disaster recovery, monitoring/alerting | 4–6 weeks | 5 L |
| Bulk import tools (students, teachers, results via Excel), multi-school admin, per-school branding | 6–8 weeks | 6 L |
| Mobile apps (Android; iOS optional) or PWA polish | 8–12 weeks | 8 L |
| Parent module and SMS/WhatsApp notifications | 4–6 weeks | 4 L |
| Fixes: PowerPoint/PDF import on Smart Board (CSP), print and PDF checks on real printers, QA across devices | 4 weeks | 3 L |
| Nepali/English content and UI language polish, accessibility | 3 weeks | 2 L |
| Project management, QA, DevOps (CI/CD, staging) | continuous | 6 L |
| **Total** | about 6 months | **about ₹40 L** |

Lean option (founder + 2 developers + 1 part-time DevOps, skip iOS, use the PWA): about ₹20 L.
Typical India monthly rates used: tech lead ₹1.5 L, full-stack developer ₹1 L, DevOps ₹1.2 L, QA ₹70 K, designer ₹80 K, PM ₹1 L.
For context, building this whole product from scratch with an agency would cost roughly ₹80 L–1.2 Cr, so the readiness spend above is much smaller.

After launch, plan **15–20% of development cost per year for maintenance** (about ₹6–8 L), which is covered by the support team line in section 8.

### 3.2 Hosting, database and storage (yearly, AWS Mumbai)

| Item | Sizing | Per month (₹) | Per year (₹) |
|---|---|---|---|
| App servers | 4 × 4 vCPU / 16 GB behind a load balancer | 45,000 | 5.4 L |
| MongoDB (Atlas M40, 3-node replica set, 100 GB) | handles about 5,000 concurrent users | 72,000 | 8.6 L |
| Redis cache and Socket.IO adapter | 1 node, 13 GB | 10,000 | 1.2 L |
| Load balancer, CDN, data transfer | | 25,000 | 3.0 L |
| Object storage (S3) 1–2 TB | | 12,000 | 1.5 L |
| Backups and cross-region copy | 2x DB size | 8,000 | 1.0 L |
| Monitoring (logs, errors, uptime) | | 10,000 | 1.2 L |
| Staging environment | small copy | 12,000 | 1.5 L |
| **Total (Standard)** | | about 1.9 L | **about ₹23 L** |

Lean: one 8 vCPU server pair, MongoDB M30, a cheaper provider or reserved instances, no staging cloud copy = about ₹13 L.
Storage growth: add about 20 GB of database per year. Files can grow quickly if students upload photos (see storage report); compress images and delete old assignments.

### 3.3 Authentication and messaging
The app uses its own JWT login (username/password, roles), so there is **no per-user licence fee**. Third-party auth (Auth0, Cognito at 60,000 users) would add ₹3–8 L per year, so only use it if you need Google/SSO sign-in.

| Item | Assumption | Per year (₹) |
|---|---|---|
| SMS OTP / password reset | 300,000 SMS × ₹0.20, plus DLT registration | 0.7 L |
| Attendance and result alerts to parents (SMS or WhatsApp) | about 500,000 messages × ₹0.25–0.35 | 1.5–2 L |
| Email (SES or similar) | | 0.3 L |
| Push notifications (Firebase) | free tier | 0 |
| Buffer | | 0.5 L |
| **Total** | | **about ₹3–4 L** |

### 3.4 LLM API for the AI chatbot
Cost per question depends on the model. Using the assumptions in section 1:

| Model class | Approx. price (USD per million tokens, input/output) | Cost per question | Chatbot per year (2.25 M questions) |
|---|---|---|---|
| Small/fast model (recommended default) | 1 / 5 | about ₹0.45 | **about ₹10 L** |
| Premium model for everything | 3 / 15 | about ₹1.35 | about ₹30 L |
| Mixed: small model by default, premium only for hard questions | | | about ₹12–15 L |

- Teacher AI tools (quiz generation, lesson plans, 10,000 teachers × 20 requests/month): about ₹3–5 L extra on the small model.
- Embeddings for new textbook content: negligible (under ₹20 K).
- Budget **₹8 L (lean, small model, tight limits) to ₹12 L (standard)** and enforce per-user daily limits, prompt caching, and answer caching of repeated textbook questions. These can cut the bill by 30–50%.
- Verify the exact current per-token prices of the provider you choose before budgeting; the table uses round placeholder prices.

### 3.5 Domain and basic tools

| Item | Per year (₹) |
|---|---|
| Domain (.com / .in / .edu.np) | 700–1,500 |
| SSL certificate | free (Let's Encrypt / cloud) |
| Business email (Google Workspace, 10–15 staff) | 20,000–40,000 |
| Error tracking, uptime monitoring, status page | 20,000–40,000 |
| Design and project tools | 20,000 |
| **Total** | **about ₹0.5–1 L** |

### 3.6 Security, legal, compliance (one-time)

| Item | ₹ |
|---|---|
| Penetration test / VAPT by an external firm | 2–4 L |
| Privacy policy, terms of service, school contracts, DPA | 1–1.5 L |
| Data protection compliance review (children's data; India DPDP Act 2023, and Nepal's own rules for Nepali schools) | 0.5–1 L |
| Company registration / GST / trademark, if not done | 0.5 L |
| ISO 27001 (optional, needed only for some tenders) | 5 L (not in total) |
| **Total** | **about ₹4–6 L** |

### 3.7 Onboarding, training and support (yearly)
Many projects underestimate this. 50 schools need people, not just servers.

| Item | ₹ per year |
|---|---|
| 2 onboarding / training staff (₹35 K each per month) | 8.4 L |
| 3 support staff (₹25 K each per month, phone/WhatsApp, Nepali + English) | 9 L |
| School visits, travel, training material (about ₹10 K per school; mostly remote) | 5 L |
| Data entry and migration help (about ₹5 K per school; schools supply Excel lists) | 2.6 L |
| **Standard** | **about ₹25 L** (Lean about ₹15 L: 2 combined staff, schools do their own data entry) |

### 3.8 Other costs to expect

| Item | Note | Approx. ₹ |
|---|---|---|
| Play Store account | one time | 2,100 |
| Apple Developer account | per year, only if iOS | 8,800 |
| Payment gateway | only if you collect fees online; about 2% of transaction value, not a fixed cost | variable |
| Smart Board / classroom hardware | schools buy their own; not in this budget | 0 |
| Internet and devices at schools | school's responsibility | 0 |
| Textbook content rights | official curriculum PDFs are fine; verify licence for any publisher books | check |
| Marketing: demos, brochures, website, events | optional | up to 10 L |
| Founder/management salary and office | not included anywhere above | extra |
| Price increases and exchange-rate risk (USD cloud and LLM bills) | covered partly by the 15% contingency | |

## 4. What this means for pricing

- Cost to run: about **₹50–80 per student per year** after launch.
- Year 1 total including the one-time work: about ₹146–278 per student.
- To break even in year 1 you would charge about **₹150–300 per student per year**, or about **₹1.5–3 L per school per year** (for 1,000 students). At ₹300 per student the 50 schools bring in about ₹1.5 Cr.
- From year 2 the one-time items drop out, so the yearly cost is mostly hosting, LLM, support and maintenance: about ₹60–90 L for the same 50 schools.

## 5. Biggest levers that move the number

1. **LLM model choice and limits**: can swing ₹8 L to ₹30 L.
2. **Student file uploads**: can add 1–2 TB per year of storage and transfer.
3. **Support and onboarding headcount**: usually the largest running cost.
4. **Lean vs. standard infrastructure**: ₹13 L vs. ₹23 L, depending on how much you can tolerate downtime on result days.

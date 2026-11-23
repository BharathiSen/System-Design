/* ===== Bharathi's 14-week planner (from system_design_tracker.html) ===== */
    var GFG = "https://www.geeksforgeeks.org/system-design/getting-started-with-system-design/";
    var HI = "https://www.hellointerview.com/learn/system-design";
    var PHASES_P = [
      { id: "p1", name: "Phase 1 · Foundations", weeks: "Weeks 1–4" },
      { id: "p2", name: "Phase 2 · Classic design problems", weeks: "Weeks 5–8" },
      { id: "p3", name: "Phase 3 · Low-level design in Python", weeks: "Week 9" },
      { id: "p4", name: "Phase 4 · AI system design", weeks: "Weeks 10–12" },
      { id: "p5", name: "Phase 5 · Capstone projects + resume", weeks: "Week 13" },
      { id: "p6", name: "Phase 6 · Mock interviews + final polish", weeks: "Week 14" }
    ];
    var WEEKS = [
      { n: 1, p: 0, title: "Networking, HTTP and APIs", goal: "Explain what happens from typing a URL to seeing a page, and design a clean REST API.", days: [
        { t: "Kickoff", d: "Read the GfG getting-started guide end to end. Start one notes doc and an Excalidraw board you will reuse all plan.", u: GFG, s: "GfG: Getting Started with System Design" },
        { t: "How the internet works", d: "TCP vs UDP, IP, ports, the TLS handshake, HTTP/1.1 vs 2 vs 3.", u: HI + "/core-concepts/networking-essentials", s: "Hello Interview: Networking Essentials" },
        { t: "HTTP in depth", d: "Methods, status codes, headers, cookies, keep-alive. Hands-on: run `curl -v` against a FastAPI app and read every header.", u: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview", s: "MDN: HTTP overview" },
        { t: "DNS and CDN", d: "Resolution chain, TTLs, edge caching. Hands-on: `dig` your college site and trace each hop.", u: "https://www.cloudflare.com/learning/dns/what-is-dns/", s: "Cloudflare: What is DNS" },
        { t: "API styles", d: "REST vs gRPC vs GraphQL vs WebSockets, and when each fits.", u: "https://grpc.io/docs/what-is-grpc/introduction/", s: "gRPC: Introduction" },
        { t: "API design + first build", d: "Resources, cursor vs offset pagination, versioning, error shapes. Hands-on: a FastAPI tasks API with cursor pagination on PostgreSQL, run with Docker Compose.", u: HI + "/core-concepts/api-design", s: "Hello Interview: API Design" },
        { t: "Weekly review", d: "Rewrite the week from memory. Explain 'what happens when I type a URL' out loud for 10 minutes and record it.", u: "https://www.youtube.com/@hnasr", s: "Hussein Nasser (YouTube)" }
      ]},
      { n: 2, p: 0, title: "Load balancing, scaling and caching", goal: "Scale your API from one box to many, and cache it correctly.", days: [
        { t: "Proxies and API gateways", d: "Forward vs reverse proxy, what a gateway adds (auth, rate limits, routing).", u: "https://www.geeksforgeeks.org/system-design/what-is-api-gateway-system-design/", s: "GfG: API Gateway" },
        { t: "Load balancers", d: "L4 vs L7, round robin, least connections, health checks, sticky sessions.", u: "https://www.geeksforgeeks.org/system-design/what-is-load-balancer-system-design/", s: "GfG: Load Balancer" },
        { t: "Scaling out", d: "Vertical vs horizontal, stateless services, moving sessions to Redis.", u: "https://github.com/donnemartin/system-design-primer", s: "System Design Primer (GitHub)" },
        { t: "Caching patterns", d: "Cache-aside, write-through, write-back, TTLs, LRU eviction.", u: HI + "/core-concepts/caching", s: "Hello Interview: Caching" },
        { t: "Caching problems", d: "Stampede, hot keys, invalidation, stale reads.", u: "https://aws.amazon.com/caching/", s: "AWS: Caching overview" },
        { t: "Hands-on scale lab", d: "Add Redis cache-aside to your API, run two API containers behind nginx, and load-test before and after (locust or `hey`). Note p50 and p99.", u: "https://redis.io/docs/latest/develop/get-started/", s: "Redis: Quick starts" },
        { t: "Consistent hashing + review", d: "Learn consistent hashing, then explain out loud how you would grow your API from 100 to 100k users.", u: HI + "/core-concepts/consistent-hashing", s: "Hello Interview: Consistent Hashing" }
      ]},
      { n: 3, p: 0, title: "Databases", goal: "Pick a database and shape its schema, indexes, replication and sharding with reasons.", days: [
        { t: "Relational basics", d: "Modelling, normalisation, ACID, transactions and isolation levels.", u: "https://www.postgresql.org/docs/current/transaction-iso.html", s: "PostgreSQL: Transaction isolation" },
        { t: "Indexes", d: "B-tree, composite, covering, partial. Hands-on: load 1M rows and compare `EXPLAIN ANALYZE` with and without an index.", u: HI + "/core-concepts/db-indexing", s: "Hello Interview: Database Indexing" },
        { t: "SQL vs NoSQL", d: "Document, key-value, wide-column, graph, and when each wins.", u: "https://www.geeksforgeeks.org/sql/sql-vs-nosql-which-one-is-better-to-use/", s: "GfG: SQL vs NoSQL" },
        { t: "Replication", d: "Leader-follower, multi-leader, sync vs async, read replicas, replication lag.", u: "https://www.geeksforgeeks.org/operating-systems/what-is-replication-in-distributed-system/", s: "GfG: Replication" },
        { t: "Partitioning and sharding", d: "Range vs hash vs directory, resharding, hot partitions.", u: HI + "/core-concepts/sharding", s: "Hello Interview: Sharding" },
        { t: "Consistency, CAP, PACELC", d: "Strong vs eventual, read-your-writes, CAP and its limits. Hands-on: a Postgres read replica in Docker Compose; watch lag.", u: "https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html", s: "Kleppmann: Stop calling databases CP or AP" },
        { t: "Postgres deep dive + review", d: "Read the deep dive, then write a one-page 'which database when' cheat sheet.", u: HI + "/deep-dives/postgres", s: "Hello Interview: PostgreSQL deep dive" }
      ]},
      { n: 4, p: 0, title: "Async work, reliability, security, observability", goal: "Know the plumbing every real system needs. Finish Phase 1.", days: [
        { t: "Queues and pub/sub", d: "Kafka vs RabbitMQ vs SQS, at-least-once delivery, ordering, dead-letter queues.", u: HI + "/deep-dives/kafka", s: "Hello Interview: Kafka deep dive" },
        { t: "Background jobs", d: "Hands-on: a Celery + Redis worker that sends emails, with retries and exponential backoff.", u: "https://docs.celeryq.dev/en/stable/getting-started/first-steps-with-celery.html", s: "Celery: First steps" },
        { t: "Rate limiting", d: "Token bucket, leaky bucket, fixed and sliding windows. Hands-on: a Redis token bucket on one FastAPI route.", u: "https://stripe.com/blog/rate-limiters", s: "Stripe: Rate limiters" },
        { t: "Idempotency and retries", d: "Timeouts, retries, circuit breakers, why exactly-once is hard. Hands-on: an `Idempotency-Key` header on a POST.", u: "https://stripe.com/blog/idempotency", s: "Stripe: Idempotency" },
        { t: "Auth", d: "Sessions vs JWT, OAuth2 and OIDC, RBAC vs ABAC, tenant isolation.", u: "https://oauth.net/2/", s: "OAuth 2.0" },
        { t: "Observability", d: "Logs, metrics, traces, the four golden signals, SLOs. Hands-on: structured logs, request IDs and a `/metrics` route.", u: "https://sre.google/sre-book/monitoring-distributed-systems/", s: "Google SRE: Monitoring" },
        { t: "Phase 1 checkpoint", d: "20-minute self-quiz on every topic so far. Learn the key technologies list and the numbers to know.", u: HI + "/in-a-hurry/key-technologies", s: "Hello Interview: Key Technologies" }
      ]},
      { n: 5, p: 1, title: "Framework, URL shortener, rate limiter", goal: "Lock in the 7-step framework and do your first two full designs.", days: [
        { t: "The framework", d: "Learn the delivery framework and copy the cheat-sheet below onto one card.", u: HI + "/in-a-hurry/delivery", s: "Hello Interview: Delivery framework" },
        { t: "Estimation drills", d: "Five drills: QPS, storage per year, bandwidth, cache size, number of servers.", u: "https://www.geeksforgeeks.org/system-design/back-of-the-envelope-estimation-in-system-design/", s: "GfG: Back-of-the-envelope estimation" },
        { t: "URL shortener: attempt", d: "40 minutes alone on Excalidraw, all seven steps, before reading anything.", u: "https://www.geeksforgeeks.org/system-design/system-design-url-shortening-service/", s: "GfG: URL shortener (read after)" },
        { t: "URL shortener: compare", d: "Compare with the breakdown. Deep dives: base62 IDs, counter vs hash, caching redirects, click analytics.", u: HI + "/problem-breakdowns/bitly", s: "Hello Interview: Bitly" },
        { t: "Rate limiter: attempt", d: "40 minutes alone: a distributed rate limiter for a public API.", u: "https://www.geeksforgeeks.org/system-design/how-to-design-a-rate-limiter-api-learn-system-design/", s: "GfG: Rate limiter (read after)" },
        { t: "Rate limiter: compare + redo", d: "Compare, then deep dive Redis atomicity and multi-region. Timed redo of the URL shortener out loud.", u: HI + "/problem-breakdowns/distributed-rate-limiter", s: "Hello Interview: Rate limiter" },
        { t: "Weekly review", d: "List your five biggest mistakes this week. Watch ByteByteGo's take on both problems.", u: "https://www.youtube.com/@ByteByteGo", s: "ByteByteGo (YouTube)" }
      ]},
      { n: 6, p: 1, title: "Notifications and chat", goal: "Handle fan-out, real-time delivery and offline users.", days: [
        { t: "Notification system: attempt", d: "Email, SMS and push; user preferences; 40 minutes alone.", u: "https://www.geeksforgeeks.org/system-design/design-notification-services-system-design/", s: "GfG: Notification service (read after)" },
        { t: "Notification system: compare", d: "Deep dives: fan-out, templates, retries, dedupe, priority queues.", u: HI + "/problem-breakdowns/notification-system", s: "Hello Interview: Notification system" },
        { t: "Real-time patterns", d: "Polling, long polling, SSE, WebSockets, and how servers find a user's connection.", u: HI + "/patterns/realtime-updates", s: "Hello Interview: Real-time updates" },
        { t: "WhatsApp: attempt", d: "1:1 and group chat, delivery receipts, offline sync; 40 minutes alone.", u: "https://www.geeksforgeeks.org/system-design/designing-whatsapp-messenger-system-design/", s: "GfG: WhatsApp (read after)" },
        { t: "WhatsApp: compare", d: "Deep dives: message ordering, storage, presence, large groups.", u: HI + "/problem-breakdowns/whatsapp", s: "Hello Interview: WhatsApp" },
        { t: "Real-world read + redo", d: "Read how Discord stores messages. Timed redo of chat out loud. Optional: a tiny FastAPI WebSocket chat.", u: "https://discord.com/blog/how-discord-stores-trillions-of-messages", s: "Discord engineering blog" },
        { t: "Weekly review", d: "Update notes and your mistake list. Watch one Gaurav Sen video on chat or notifications.", u: "https://www.youtube.com/@gkcs", s: "Gaurav Sen (YouTube)" }
      ]},
      { n: 7, p: 1, title: "News feed, Dropbox, autocomplete", goal: "Read-heavy systems, large files and precomputation.", days: [
        { t: "News feed: attempt", d: "Post, follow, home timeline; 40 minutes alone.", u: "https://github.com/donnemartin/system-design-primer", s: "System Design Primer" },
        { t: "News feed: compare", d: "Fan-out on write vs on read, the celebrity problem, ranking, pagination.", u: HI + "/problem-breakdowns/fb-news-feed", s: "Hello Interview: News feed" },
        { t: "Dropbox: attempt", d: "Upload, sync, share; 40 minutes alone.", u: "https://www.geeksforgeeks.org/system-design/design-dropbox-a-system-design-interview-question/", s: "GfG: Dropbox (read after)" },
        { t: "Dropbox: compare", d: "Chunking, dedupe, presigned URLs, sync conflicts, metadata DB vs blob store.", u: HI + "/problem-breakdowns/dropbox", s: "Hello Interview: Dropbox" },
        { t: "Search autocomplete", d: "Attempt: tries, precomputed top-k per prefix, caching at the edge. Then read the closely related top-k design.", u: HI + "/problem-breakdowns/top-k", s: "Hello Interview: Top K" },
        { t: "Timed mock", d: "Pick one of this week's three at random and do it in 40 minutes, recorded. Browse ByteByteGo guides for gaps.", u: "https://bytebytego.com/guides/", s: "ByteByteGo guides" },
        { t: "Buffer day", d: "Catch up on anything missed, or rest. Exams or festivals can slide the whole plan; that's fine." }
      ]},
      { n: 8, p: 1, title: "Job scheduler, payments, ticketing", goal: "Correctness under failure and contention. Finish Phase 2.", days: [
        { t: "Job scheduler: attempt", d: "Cron-like distributed scheduler. This is the core of SLA timers in any workflow product, so take it seriously.", u: HI + "/patterns/long-running-tasks", s: "Hello Interview: Long-running tasks" },
        { t: "Job scheduler: compare", d: "Leasing, at-least-once execution, retries, priorities, time-bucketed storage.", u: HI + "/problem-breakdowns/job-scheduler", s: "Hello Interview: Job scheduler" },
        { t: "Payment system: attempt", d: "Payment flow with a provider, refunds, webhooks; 40 minutes alone.", u: "https://stripe.com/blog/idempotency", s: "Stripe: Idempotency (re-read)" },
        { t: "Payment system: compare", d: "Idempotency keys, double-entry ledger, reconciliation, the outbox pattern.", u: HI + "/problem-breakdowns/payment-system", s: "Hello Interview: Payment system" },
        { t: "Ticketmaster", d: "Seat holds, contention, distributed locks, waiting rooms.", u: HI + "/problem-breakdowns/ticketmaster", s: "Hello Interview: Ticketmaster" },
        { t: "Peer mock", d: "40-minute mock with a friend or on Pramp, then redo your weakest problem.", u: "https://www.pramp.com/", s: "Pramp (free peer mocks)" },
        { t: "Phase 2 checkpoint", d: "Rate yourself 1–5 on all nine problems. Redo the lowest two." }
      ]},
      { n: 9, p: 2, title: "Object-oriented and low-level design", goal: "Write clean, tested Python classes for an LLD round.", days: [
        { t: "OOP + SOLID in Python", d: "Classes, `abc`, `dataclasses`, composition over inheritance, SOLID.", u: "https://www.geeksforgeeks.org/system-design/solid-principle-in-programming-understand-with-real-life-examples/", s: "GfG: SOLID principles" },
        { t: "Patterns that come up", d: "Strategy, Observer, State and Factory, with Python examples.", u: "https://refactoring.guru/design-patterns/python", s: "Refactoring Guru: Python patterns" },
        { t: "Parking lot", d: "Requirements, class diagram, then working Python with a few tests.", u: "https://www.geeksforgeeks.org/system-design/design-parking-lot-using-object-oriented-principles/", s: "GfG: Parking lot" },
        { t: "Approval state machine", d: "Draft → Submitted → Approved / Rejected → Escalated in Python with the State pattern and `pytest`. This becomes part of your workflow-engine capstone.", u: "https://refactoring.guru/design-patterns/state", s: "Refactoring Guru: State" },
        { t: "LRU cache + rate limiter LLD", d: "Both as Python classes, including thread-safety basics.", u: "https://github.com/ashishps1/awesome-low-level-design", s: "Awesome Low-Level Design" },
        { t: "Two timed LLD problems", d: "Elevator and Splitwise (or library management), 45 minutes each with code." },
        { t: "Review + AI warm-up", d: "Review LLD notes, then read Chip Huyen's LLM engineering post to start Phase 4.", u: "https://huyenchip.com/2023/04/11/llm-engineering.html", s: "Chip Huyen: Building LLM apps for production" }
      ]},
      { n: 10, p: 3, title: "LLM app architecture and RAG in depth", goal: "Design and build a strong retrieval pipeline, not a toy one.", days: [
        { t: "LLM app anatomy", d: "Context construction, guardrails, router, gateway, cache, the full platform picture.", u: "https://huyenchip.com/2024/07/25/genai-platform.html", s: "Chip Huyen: Building a GenAI platform" },
        { t: "Tokens, sampling, cost", d: "Context windows, temperature and top-p, how token count drives latency and cost.", u: "https://huyenchip.com/2024/01/16/sampling.html", s: "Chip Huyen: Sampling" },
        { t: "RAG end to end", d: "Ingest, chunk, embed, store, retrieve, generate, cite.", u: "https://developers.llamaindex.ai/python/framework/understanding/rag/", s: "LlamaIndex: Understanding RAG" },
        { t: "Chunking, embeddings, vector DBs", d: "Chunk strategies, embedding choice, HNSW vs IVF, pgvector inside Postgres.", u: "https://www.pinecone.io/learn/chunking-strategies/", s: "Pinecone: Chunking strategies" },
        { t: "Hybrid search + reranking", d: "BM25 plus vectors, cross-encoder rerankers, contextual retrieval.", u: "https://www.anthropic.com/research/contextual-retrieval", s: "Anthropic: Contextual retrieval" },
        { t: "Hands-on RAG rebuild", d: "Move your RAG project to Postgres + pgvector with hybrid search and a reranker. Take the free advanced retrieval course alongside.", u: "https://github.com/pgvector/pgvector", s: "pgvector (GitHub)" },
        { t: "Weekly review", d: "Read the LLM patterns write-up and map each pattern to your project.", u: "https://eugeneyan.com/writing/llm-patterns/", s: "Eugene Yan: LLM patterns" }
      ]},
      { n: 11, p: 3, title: "Agents, evaluation, guardrails", goal: "Build agents that are measurable and safe.", days: [
        { t: "Agents and tool calling", d: "Workflows vs agents; routing, chaining, orchestrator-worker, evaluator-optimizer.", u: "https://www.anthropic.com/research/building-effective-agents", s: "Anthropic: Building effective agents" },
        { t: "Agent design", d: "Planning, memory, tool errors, human-in-the-loop approvals. Free LangGraph course alongside.", u: "https://huyenchip.com/2025/01/07/agents.html", s: "Chip Huyen: Agents" },
        { t: "Context engineering + MCP", d: "What goes into the context window, memory, and how tools are exposed with MCP.", u: "https://www.anthropic.com/research/effective-context-engineering-for-ai-agents", s: "Anthropic: Context engineering" },
        { t: "Evaluation", d: "Golden sets, offline evals, LLM-as-judge, RAG metrics (faithfulness, context recall).", u: "https://hamel.dev/blog/posts/evals/", s: "Hamel Husain: Your AI product needs evals" },
        { t: "Hands-on evals", d: "Build a 50-question golden set for your RAG project, score it with Ragas or a judge script, and record the baseline numbers.", u: "https://docs.ragas.io/en/stable/", s: "Ragas docs" },
        { t: "Guardrails and safety", d: "Prompt injection, PII, output validation. Hands-on: add input and output checks to your project.", u: "https://genai.owasp.org/llm-top-10/", s: "OWASP Top 10 for LLM apps" },
        { t: "Weekly review", d: "Read the practical lessons write-up and add three ideas to your project backlog.", u: "https://applied-llms.org/", s: "What we learned from a year of building with LLMs" }
      ]},
      { n: 12, p: 3, title: "Production AI: latency, cost, serving, enterprise", goal: "Answer 'how does this run for 1,000 companies?' Finish Phase 4.", days: [
        { t: "Latency and cost", d: "Streaming, prompt caching, semantic caching, batching, model routing, smaller models.", u: "https://developers.openai.com/api/docs/guides/latency-optimization", s: "OpenAI: Latency optimization" },
        { t: "LLM gateway", d: "One entry point for routing, fallbacks, rate limits, keys and cost tracking per tenant.", u: "https://docs.litellm.ai/", s: "LiteLLM docs" },
        { t: "Serving basics", d: "GPU memory, KV cache, continuous batching, what vLLM does.", u: "https://www.anyscale.com/blog/continuous-batching-llm-inference", s: "Anyscale: Continuous batching" },
        { t: "Fine-tuning vs RAG vs prompting", d: "When each wins, and why most enterprise apps start with RAG.", u: "https://www.deeplearning.ai/courses/finetuning-large-language-models", s: "DeepLearning.AI: Finetuning LLMs" },
        { t: "Enterprise concerns", d: "Tenant data isolation, permission-aware retrieval (filter by ACL at query time), audit logs, PII.", u: "https://www.postgresql.org/docs/current/ddl-rowsecurity.html", s: "PostgreSQL: Row security policies" },
        { t: "AI designs, round 1", d: "Timed: enterprise document Q&A with permissions; customer support copilot. Add tracing to both designs.", u: "https://langfuse.com/docs", s: "Langfuse docs (LLM observability)" },
        { t: "AI designs, round 2", d: "Timed: semantic search over a product catalogue; an LLM gateway for a whole company." }
      ]},
      { n: 13, p: 4, title: "Capstone projects and resume upgrade", goal: "Two portfolio-grade designs, and a project that proves them.", days: [
        { t: "Study workflow platforms", d: "How low-code workflow tools work: forms, workflows, approvals, boards, integrations. Note what such a platform must handle at scale.", u: "https://en.wikipedia.org/wiki/Workflow_management_system", s: "Wikipedia: Workflow management system" },
        { t: "Workflow engine concepts", d: "BPMN basics, durable execution, timers and retries.", u: "https://docs.temporal.io/workflows", s: "Temporal: Workflows" },
        { t: "Capstone 1: model", d: "Requirements and data model for a low-code workflow and approval engine.", u: "https://camunda.com/bpmn/", s: "Camunda: BPMN" },
        { t: "Capstone 1: deep dives", d: "Executing the state machine, SLA timers and escalations, notifications, audit log, multi-tenancy, 10k tenants.", u: "https://docs.aws.amazon.com/whitepapers/latest/saas-architecture-fundamentals/saas-architecture-fundamentals.html", s: "AWS: SaaS architecture fundamentals" },
        { t: "Capstone 2: AI assistant", d: "Plain English → workflow definition, RAG over company forms with permission filters, an agent that acts with the user's own roles." },
        { t: "Resume project upgrade", d: "Add Redis caching, eval results and tracing to your RAG project. Draw its architecture and an 'at 10x' redesign." },
        { t: "Story bank", d: "Write STAR stories for ERNET and each project (see the resume section below)." }
      ]},
      { n: 14, p: 5, title: "Mock interviews and final polish", goal: "Prove it under time pressure, then ship the write-up.", days: [
        { t: "Mock 1: classic design", d: "40 minutes with a friend or on Pramp.", u: "https://www.pramp.com/", s: "Pramp" },
        { t: "Fix the gaps", d: "Rework whatever Mock 1 exposed." },
        { t: "Mock 2: AI design", d: "Enterprise document Q&A with permissions, recorded, 40 minutes." },
        { t: "Mock 3: capstone", d: "Workflow engine end to end in 45 minutes, then 10 rapid questions about your own resume." },
        { t: "Write-up + diagram", d: "One-page capstone write-up and a clean Excalidraw diagram, exported as PDF.", u: "https://excalidraw.com/", s: "Excalidraw" },
        { t: "Final polish", d: "Project README with the diagram and eval numbers. Ask a senior to review the write-up." },
        { t: "Publish and final run", d: "Add the write-up and diagram to your GitHub or portfolio, then do one last timed run of your weakest problem." }
      ]}
    ];

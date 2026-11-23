/* ===== Real engineering stories: one checked link per topic =====
   Every URL was checked to load (HTTP 200) on 2026-11-23. */
const CASES={
"what-is-sd":["Hello Interview","System design in a hurry","A compact guide from former big-tech interviewers to what the round looks like.","https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction"],
"scalability":["Figma","How Figma's databases team lived to tell the scale","How Figma horizontally sharded Postgres after outgrowing one very large database.","https://www.figma.com/blog/how-figmas-databases-team-lived-to-tell-the-scale/"],
"availability":["AWS","Summary of the 2017 Amazon S3 disruption","A mistyped command removed more servers than intended and took S3 in one region down for hours: a real lesson in blast radius.","https://aws.amazon.com/message/41926/"],
"latency":["Colin Scott","Latency numbers every programmer should know, by year","Slide the year and watch memory and SSD get faster while network round trips stay put.","https://colin-scott.github.io/personal_website/research/interactive_latency.html"],
"cap":["Martin Kleppmann","Please stop calling databases CP or AP","Why real databases don't fit neatly into CAP's boxes, from the author of Designing Data-Intensive Applications.","https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html"],
"internet":["Cloudflare","A detailed look at TLS 1.3","How TLS 1.3 cut the handshake to one round trip and removed weak options.","https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/"],
"dns-cdn":["Cloudflare","Understanding how Facebook disappeared from the internet","A routing change made Facebook's DNS servers unreachable, so the whole site vanished for hours in October 2021.","https://blog.cloudflare.com/october-2021-facebook-outage/"],
"proxies-lb":["GitHub","GLB Director: GitHub's open-source load balancer","How GitHub balances traffic at layer 4 and keeps connections alive when servers change.","https://github.blog/2018-08-08-glb-director-open-source-load-balancer/"],
"api-styles":["GitHub","The GitHub GraphQL API","Why GitHub offered GraphQL for its public API: clients fetch exactly what they need in one request.","https://github.blog/2016-09-14-the-github-graphql-api/"],
"api-design":["Stripe","Designing robust and predictable APIs with idempotency","How Stripe uses idempotency keys so a retried payment request never charges twice.","https://stripe.com/blog/idempotency"],
"realtime":["Slack","Real-time messaging","How Slack delivers messages to millions of connected clients over WebSockets.","https://slack.engineering/real-time-messaging/"],
"auth":["Aaron Parecki","OAuth 2 simplified","The clearest walkthrough of OAuth 2.0 flows and tokens.","https://aaronparecki.com/oauth-2-simplified/"],
"sql-nosql":["Discord","How Discord stores billions of messages","Why Discord moved messages from MongoDB to Cassandra, and how they partition by channel and time.","https://discord.com/blog/how-discord-stores-billions-of-messages"],
"acid":["PostgreSQL docs","Transaction isolation","Exactly which anomalies each isolation level allows in Postgres.","https://www.postgresql.org/docs/current/transaction-iso.html"],
"indexing":["Markus Winand","Use The Index, Luke","A free, practical book on how SQL indexes really work.","https://use-the-index-luke.com/"],
"replication":["GitHub","MySQL high availability at GitHub","How GitHub detects a failed primary and promotes a replica automatically.","https://github.blog/2018-06-20-mysql-high-availability-at-github/"],
"sharding":["Notion","Herding elephants: lessons learned from sharding Postgres at Notion","How Notion split one Postgres database into 480 logical shards.","https://www.notion.com/blog/sharding-postgres-at-notion"],
"consistent-hashing":["Amazon","Dynamo: Amazon's highly available key-value store (paper)","The 2007 paper that popularised consistent hashing with virtual nodes and quorum reads/writes.","https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf"],
"caching":["Facebook","Scaling Memcache at Facebook (paper)","How Facebook ran memcached at billions of requests per second, including leases against stampedes.","https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_update.pdf"],
"cache-problems":["Meta","Cache made consistent","How Meta measures and fixes stale cache entries at enormous scale.","https://engineering.fb.com/2022/06/08/core-infra/cache-made-consistent/"],
"blob":["Dropbox","Inside the Magic Pocket","How Dropbox built its own exabyte-scale block storage system.","https://dropbox.tech/infrastructure/inside-the-magic-pocket"],
"special-db":["Uber (H3)","H3: hexagonal hierarchical geospatial indexing","Uber's open-source geo index that splits the world into hexagons for nearby searches.","https://h3geo.org/"],
"queues":["Apache Kafka","Kafka design documentation","Kafka's own explanation of its log, partitions, retention and consumer groups.","https://kafka.apache.org/documentation/"],
"rate-limit":["Stripe","Scaling your API with rate limiters","The four kinds of limiter Stripe runs in production, built on token buckets in Redis.","https://stripe.com/blog/rate-limiters"],
"resilience":["AWS Builders' Library","Timeouts, retries, and backoff with jitter","Amazon's guide to retrying safely without causing retry storms.","https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/"],
"dist-txn":["microservices.io","Pattern: Saga","The saga pattern explained with choreography and orchestration examples.","https://microservices.io/patterns/data/saga.html"],
"observability":["Google SRE book","Monitoring distributed systems","Where the four golden signals come from, and how Google thinks about alerting.","https://sre.google/sre-book/monitoring-distributed-systems/"],
"architecture":["Segment","Goodbye microservices","Why Segment merged 140+ microservices back into a single service.","https://segment.com/blog/goodbye-microservices/"],
"consensus":["Raft","The Raft consensus algorithm","An interactive visualisation of leader election and log replication.","https://raft.github.io/"],
"ids-clocks":["Discord","Snowflake IDs (developer docs)","How Discord's IDs pack a timestamp, worker and sequence number into 64 bits.","https://discord.com/developers/docs/reference"],
"prob-ds":["antirez (Redis)","Redis new data structure: the HyperLogLog","Redis's creator explains counting unique items in about 12 KB.","http://antirez.com/news/75"],
"streaming":["Martin Kleppmann (Confluent)","Turning the database inside out","Why an append-only log of events can sit at the centre of a data system.","https://www.confluent.io/blog/turning-the-database-inside-out-with-apache-samza/"],
"framework":["Hello Interview","Delivery framework","The step-by-step interview structure this site's framework is based on.","https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery"],
"estimation":["System Design Primer","The System Design Primer (GitHub)","The classic open-source study guide, including back-of-the-envelope tables.","https://github.com/donnemartin/system-design-primer"],
"tradeoffs":["AWS Builders' Library","Avoiding fallback in distributed systems","Why Amazon avoids rarely used fallback paths: they tend to fail exactly when needed.","https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/"],
"oop-solid":["Robert C. Martin","Solid relevance","The author of SOLID on why the principles still matter.","https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html"],
"patterns":["Refactoring.Guru","Design patterns catalog","Every classic pattern with diagrams, use cases and code.","https://refactoring.guru/design-patterns/catalog"],
"lld-round":["Ashish Pratap Singh","awesome-low-level-design","A large collection of LLD problems with solutions.","https://github.com/ashishps1/awesome-low-level-design"],
"llm-apps":["Eugene Yan","Patterns for building LLM-based systems & products","Proven patterns: evals, RAG, caching, guardrails and more.","https://eugeneyan.com/writing/llm-patterns/"],
"rag":["Anthropic","Introducing contextual retrieval","Adding context to each chunk before embedding cut retrieval failures by about half in Anthropic's tests.","https://www.anthropic.com/news/contextual-retrieval"],
"agents":["Anthropic","Building effective agents","When to use simple workflows and when an agent is worth it.","https://www.anthropic.com/research/building-effective-agents"],
"llm-serving":["vLLM","Easy, fast and cheap LLM serving with PagedAttention","How managing the KV cache like virtual memory raises serving throughput.","https://blog.vllm.ai/2023/06/20/vllm.html"],
"http-caching":["web.dev (Google)","Prevent unnecessary network requests with the HTTP Cache","A practical guide to Cache-Control, ETags and versioned file names.","https://web.dev/articles/http-cache"],
"security":["GitHub","Behind GitHub's new authentication token formats","Why GitHub prefixed its tokens so leaked secrets can be detected automatically.","https://github.blog/security/application-security/behind-githubs-new-authentication-token-formats/"],
"deployment":["Martin Fowler","Canary release","How rolling a change out to a small group first limits the damage of a bad release.","https://martinfowler.com/bliki/CanaryRelease.html"],
"concurrency":["The Go blog","Share memory by communicating","Go's approach to avoiding shared-memory bugs: pass messages between threads instead of sharing data.","https://go.dev/blog/codelab-share"],
"cloud-map":["AWS Builders' Library","Static stability using availability zones","How AWS designs services to keep working when a whole availability zone fails.","https://aws.amazon.com/builders-library/static-stability-using-availability-zones/"]
};
(function(){
"use strict";
const {V,esc}=window.SQ;
const card=(id,c)=>`<div class="callout story"><div class="ct">Real engineering story · ${esc(c[0])}</div><b>${esc(c[1])}</b><p style="margin:4px 0 6px">${esc(c[2])}</p><a href="${c[3]}" target="_blank" rel="noopener">Read it ↗</a></div>`;
window.SQ.caseCard=id=>CASES[id]?card(id,CASES[id]):"";
const origTopic=V.topic;
V.topic=function(el,id){
  origTopic(el,id);
  const notes=el.querySelector(".notes");if(!notes||!CASES[id])return;
  const deeper=[...notes.querySelectorAll("p.small")].pop();
  if(deeper&&/Go deeper/.test(deeper.textContent))deeper.insertAdjacentHTML("beforebegin",card(id,CASES[id]));else notes.insertAdjacentHTML("beforeend",card(id,CASES[id]));
};
const origLib=V.library;
V.library=function(el){
  origLib(el);
  el.insertAdjacentHTML("beforeend",`<div class="sect"><h2>Real engineering stories</h2><span class="small muted">One per topic · links checked</span></div>
  <div class="grid g2">${TOPICS.filter(t=>CASES[t.id]).map(t=>{const c=CASES[t.id];return `<a class="card pcard" href="${c[3]}" target="_blank" rel="noopener"><span class="eyebrow">${esc(t.title)}</span><h3>${esc(c[1])}</h3><p>${esc(c[0])} · ${esc(c[2])}</p></a>`;}).join("")}</div>`);
};
})();

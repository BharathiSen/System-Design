/* ===== Worlds + topics part 1 ===== */
const WORLDS=[
 {n:1,name:"Foundations",c:"var(--w1)",badge:"Bootstrapped",blurb:"What system design is, and the four properties every answer is judged on."},
 {n:2,name:"Networking & APIs",c:"var(--w2)",badge:"Packet Whisperer",blurb:"How a request travels, and how to design the interface it hits."},
 {n:3,name:"Data & Storage",c:"var(--w3)",badge:"Data Keeper",blurb:"Databases, indexes, replication, sharding, caching and blobs."},
 {n:4,name:"Async & Reliability",c:"var(--w4)",badge:"Fault Tolerant",blurb:"Queues, rate limits, retries, transactions across services, observability."},
 {n:5,name:"Distributed Systems",c:"var(--w5)",badge:"Consensus Reached",blurb:"Consensus, IDs, clocks, probabilistic structures, geo and streaming."},
 {n:6,name:"Interview Craft",c:"var(--w6)",badge:"Interview Ready",blurb:"The delivery framework, napkin math and how to talk trade-offs."},
 {n:7,name:"Low-Level Design",c:"var(--w7)",badge:"Clean Coder",blurb:"OOP, SOLID and the patterns that show up in machine-coding rounds."},
 {n:8,name:"AI System Design",c:"var(--w8)",badge:"Model Wrangler",blurb:"LLM apps, RAG, agents, evals and serving: the Phase 4 of your plan."}
];
const TOPICS=[];
function T(o){TOPICS.push(o);}

/* ---------------- WORLD 1 ---------------- */
T({id:"what-is-sd",w:1,title:"What system design is",mins:10,
tldr:"System design is deciding <b>which components</b> a product needs, <b>how they talk</b>, and <b>which trade-offs</b> you accept so it keeps working as users, data and failures grow.",
notes:`<h3>HLD vs LLD</h3>
<table><tr><th></th><th>High-level design (HLD)</th><th>Low-level design (LLD)</th></tr>
<tr><td>Question</td><td>"Design WhatsApp"</td><td>"Design a parking lot's classes"</td></tr>
<tr><td>Output</td><td>Boxes and arrows: services, DBs, caches, queues</td><td>Classes, interfaces, methods, working code</td></tr>
<tr><td>Judged on</td><td>Scale, availability, trade-offs</td><td>OOP, SOLID, patterns, extensibility</td></tr></table>
<h3>What freshers are actually asked</h3>
<ul><li>Fresher / SDE-1 rounds lean on <b>fundamentals + one classic problem</b> (URL shortener, rate limiter, chat, parking lot LLD). Nobody expects Netflix-level depth.</li>
<li>They want to see you <b>ask questions</b>, <b>structure</b> the answer, and <b>justify</b> choices with a reason, not a buzzword.</li></ul>
<h3>The four things every design is judged on</h3>
<ol><li><b>Scalability</b>: handles more load by adding resources.</li><li><b>Availability</b>: up when users need it.</li><li><b>Performance</b>: latency and throughput are good enough.</li><li><b>Consistency / correctness</b>: users see right data (money must never be wrong).</li></ol>
<p>Every component you add should push one of these, and costs something (money, complexity, staleness).</p>`,
real:`Instagram ran on a handful of servers and Postgres when it had a tiny team; it added sharding, caching and async jobs only when load forced it. Start simple, then scale the part that hurts.`,
say:["\"Before I draw anything, can I confirm the core features and the scale we're designing for?\"","\"I'll start with a simple version that works, then scale the bottlenecks.\""],
traps:["Jumping into Kafka and microservices before stating requirements.","Saying \"it's scalable\" without saying <i>which</i> part scales and how."],
src:[["Hello Interview: intro","https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction"],["AlgoMaster: what is system design","https://algomaster.io/learn/system-design/what-is-system-design"],["GfG: getting started","https://www.geeksforgeeks.org/system-design/getting-started-with-system-design"]],
quiz:[
{q:"Which question is a low-level design (LLD) question?",o:["Design YouTube","Design the classes for a parking lot","Design a CDN","Design a news feed for 500M users"],a:1,why:"LLD is about classes, interfaces and code. The others are high-level architecture."},
{q:"What should you do in the first 5 minutes of a design interview?",o:["Draw the database schema","Pick Kafka vs RabbitMQ","Clarify functional and non-functional requirements","Write the API in code"],a:2,why:"Requirements drive every later choice. Interviewers grade you on asking."},
{q:"A design adds a cache. Which property is it mainly buying, and what does it usually cost?",o:["Consistency; costs latency","Lower latency; risks stale reads","Availability; costs storage only","Security; costs CPU"],a:1,why:"Caches cut latency and DB load but can serve stale data until invalidated or expired."}]});

T({id:"scalability",w:1,title:"Scalability: vertical vs horizontal",mins:12,
tldr:"<b>Vertical</b> = a bigger machine. <b>Horizontal</b> = more machines behind a load balancer. Horizontal only works if app servers are <b>stateless</b>.",
notes:`<table><tr><th></th><th>Vertical (scale up)</th><th>Horizontal (scale out)</th></tr>
<tr><td>How</td><td>More CPU/RAM on one box</td><td>Add boxes + load balancer</td></tr>
<tr><td>Pros</td><td>Simple, no code changes, no network hops</td><td>Near-unlimited, survives a box dying</td></tr>
<tr><td>Cons</td><td>Hardware ceiling, single point of failure, downtime to upgrade</td><td>Needs stateless apps, distributed problems (consistency, coordination)</td></tr></table>
<h3>Stateless services</h3>
<p>A server is stateless when any instance can handle any request. Move session data, uploads and counters <b>out</b> of process memory into Redis, a DB or object storage. Then the load balancer can send a user to any box, and you can add or kill boxes freely.</p>
<h3>Scaling roadmap (single box → millions)</h3>
<ol><li>One server running app + DB.</li><li>Split DB onto its own machine.</li><li>Load balancer + several stateless app servers.</li><li>Cache (Redis) for hot reads; CDN for static files.</li><li>DB read replicas; later sharding.</li><li>Queues for slow work; split services where teams or load differ.</li><li>Multiple data centres / regions.</li></ol>`,
diagram:{w:760,h:250,n:[["u",70,125,"Users","web + mobile","client"],["lb",230,125,"Load balancer","L7","edge"],["a1",400,55,"App server 1","stateless","svc"],["a2",400,125,"App server 2","stateless","svc"],["a3",400,195,"App server 3","stateless","svc"],["r",600,60,"Redis","sessions + cache","cache"],["db",600,190,"Postgres","primary","db"]],e:[["u","lb"],["lb","a1"],["lb","a2"],["lb","a3"],["a2","r"],["a2","db"],["a1","r","",1],["a3","db","",1]]},dcap:"Horizontal scale: state lives in Redis/Postgres, so any app server can serve any user.",
real:`Most startups scale Postgres vertically for a long time (a single large instance goes far). Stateless app tiers are standard on Kubernetes: pods are added by an autoscaler based on CPU or request rate.`,
say:["\"I'll keep the API tier stateless so we can autoscale it; sessions go to Redis.\"","\"The database is the harder thing to scale, so I'll add read replicas before thinking about sharding.\""],
traps:["Sticky sessions are a band-aid, not statelessness: if that box dies, the user's session dies.","Horizontal scaling of the <i>database</i> is much harder than the app tier. Don't wave it away."],
quiz:[
{q:"What must be true of app servers before you can freely add more behind a load balancer?",o:["They run on bigger machines","They're stateless (no per-user data kept in memory)","They each have their own database","They use UDP"],a:1,why:"If state is in process memory, a user's next request might hit a server that doesn't have it."},
{q:"Biggest downside of vertical scaling?",o:["Needs code changes","Hardware ceiling and a single point of failure","Requires a load balancer","Makes queries slower"],a:1,why:"One machine can only get so big, and if it dies, everything dies."},
{q:"Where should user sessions live in a horizontally scaled web app?",o:["In each server's memory","In a shared store like Redis","In cookies only, always","In the load balancer"],a:1,why:"A shared store lets any server read the session. Signed cookies/JWT are another stateless option but have revocation trade-offs."}]});

T({id:"availability",w:1,title:"Availability, reliability and SPOFs",mins:12,
tldr:"Availability = uptime ÷ total time, quoted in <b>nines</b>. You raise it by removing <b>single points of failure</b> with redundancy and failover.",
notes:`<h3>The nines</h3>
<table><tr><th>Availability</th><th>Downtime / year</th><th>Downtime / month</th></tr>
<tr><td>99% (two nines)</td><td>3.65 days</td><td>~7.3 hours</td></tr>
<tr><td>99.9%</td><td>8.76 hours</td><td>~43.8 min</td></tr>
<tr><td>99.99%</td><td>52.6 min</td><td>~4.4 min</td></tr>
<tr><td>99.999%</td><td>5.26 min</td><td>~26 s</td></tr></table>
<h3>Components in series vs parallel</h3>
<ul><li><b>Series</b> (request needs A <i>and</i> B): A × B. Two 99.9% parts → 99.8%. Every extra hop lowers availability.</li>
<li><b>Parallel</b> (either A <i>or</i> B works): 1 − (1−A)(1−B). Two 99% replicas → 99.99%.</li></ul>
<h3>Reliability vs availability</h3>
<p><b>Reliable</b> = does the right thing (correct, no data loss). <b>Available</b> = responds. A system can be available but unreliable (returns wrong data fast).</p>
<h3>Removing SPOFs</h3>
<ul><li>Run ≥2 of everything: LBs (active-passive with a floating IP), app servers, DB replicas with automatic failover.</li>
<li>Spread across availability zones; health checks pull dead nodes out.</li>
<li><b>SLI</b> = what you measure (p99 latency, error rate). <b>SLO</b> = your target (99.9% of requests &lt; 300 ms). <b>SLA</b> = the contract with penalties.</li></ul>`,
real:`AWS states its EC2 SLA per region; real systems put replicas in multiple availability zones so one data-centre fire doesn't take them down.`,
say:["\"Each extra synchronous dependency multiplies in, so I'll keep the critical path short.\"","\"I'll put the DB primary and replica in different zones with automatic failover.\""],
traps:["Adding a single load balancer can itself be a SPOF; say how it's made redundant.","Confusing SLA (contract) with SLO (internal target)."],
quiz:[
{q:"Two services in series, each 99.9% available. Approximate combined availability?",o:["99.9%","99.99%","99.8%","99.0%"],a:2,why:"0.999 × 0.999 ≈ 0.998. Serial dependencies multiply."},
{q:"99.99% availability allows roughly how much downtime per year?",o:["8.8 hours","52.6 minutes","5.3 minutes","3.65 days"],a:1,why:"0.01% of 525,600 minutes ≈ 52.6 minutes."},
{q:"Two independent replicas, each 99% available, behind a failover. Combined?",o:["98%","99%","99.99%","99.5%"],a:2,why:"1 − (0.01 × 0.01) = 0.9999."}]});

T({id:"latency",w:1,title:"Latency, throughput and numbers to know",mins:12,
tldr:"<b>Latency</b> is how long one request takes; <b>throughput</b> is how many you finish per second. Know a few orders of magnitude so you can reason about where time goes.",
notes:`<h3>Percentiles, not averages</h3>
<p>Report <b>p50 / p95 / p99</b>. If p99 is 2 s, 1 in 100 requests is slow; a page that makes 50 backend calls hits that tail often.</p>
<h3>Latency numbers (rough, from Jeff Dean's list)</h3>
<table><tr><th>Operation</th><th>Time</th></tr>
<tr><td>L1 cache reference</td><td>0.5 ns</td></tr><tr><td>Main memory reference</td><td>100 ns</td></tr>
<tr><td>Read 1 MB sequentially from memory</td><td>250 µs</td></tr><tr><td>Round trip in the same data centre</td><td>0.5 ms</td></tr>
<tr><td>Read 1 MB sequentially from SSD</td><td>1 ms</td></tr><tr><td>Disk seek (HDD)</td><td>10 ms</td></tr>
<tr><td>Packet California → Netherlands → California</td><td>150 ms</td></tr></table>
<p>Takeaways: memory ≫ SSD ≫ network across continents. Avoid cross-region calls on the hot path; batch small calls.</p>
<h3>Capacity rules of thumb</h3>
<ul><li>Redis: ~100k simple ops/s per node. Postgres/MySQL: thousands to ~10k simple writes/s on a good node.</li>
<li>Little's Law: concurrent requests = throughput × latency. 1,000 req/s × 0.2 s = 200 in flight.</li></ul>`,
real:`Amazon found that small increases in page latency measurably cut sales, which is why big sites track p99 and set latency budgets per service.`,
say:["\"I'll design for p99 under 200 ms, so the read path should avoid more than one DB round trip.\""],
traps:["Quoting averages. Interviewers expect percentiles.","Assuming throughput and latency always move together: batching raises throughput but can raise latency."],
src:[["Latency numbers (gist)","https://gist.github.com/jboner/2841832"]],
quiz:[
{q:"Which is fastest?",o:["Read 1 MB from SSD","Round trip within a data centre","Main memory reference","Disk seek"],a:2,why:"~100 ns, far faster than the others (0.5 ms, 1 ms, 10 ms)."},
{q:"Why use p99 instead of average latency?",o:["It's easier to compute","Averages hide slow tail requests that users still feel","p99 is always lower","SLAs forbid averages"],a:1,why:"A good average can hide a terrible tail."},
{q:"A service handles 500 req/s with 0.4 s average latency. Roughly how many requests are in flight (Little's Law)?",o:["125","200","1,250","2,000"],a:1,why:"L = λW = 500 × 0.4 = 200."}]});

T({id:"cap",w:1,title:"CAP and PACELC",mins:12,
tldr:"When the network <b>partitions</b>, a distributed store must pick <b>consistency</b> (refuse or wait) or <b>availability</b> (answer, maybe stale). PACELC adds: even without a partition, you trade <b>latency</b> vs consistency.",
notes:`<h3>The three letters</h3>
<ul><li><b>C</b>onsistency (here = linearizability): every read sees the latest write.</li><li><b>A</b>vailability: every request to a live node gets a non-error answer.</li><li><b>P</b>artition tolerance: keeps working when nodes can't talk.</li></ul>
<p>Partitions <i>will</i> happen, so the real choice is <b>CP vs AP during a partition</b>.</p>
<table><tr><th>Choice</th><th>Behaviour in a partition</th><th>Examples</th><th>Use for</th></tr>
<tr><td>CP</td><td>Rejects/blocks some requests to stay correct</td><td>ZooKeeper, etcd, HBase, a single-leader SQL DB</td><td>Payments, inventory, locks, seat booking</td></tr>
<tr><td>AP</td><td>Answers from any replica, reconciles later</td><td>Cassandra, DynamoDB (default reads), DNS</td><td>Feeds, likes, carts, presence</td></tr></table>
<h3>PACELC</h3><p>If <b>P</b>artition: choose <b>A</b> or <b>C</b>; <b>E</b>lse: choose <b>L</b>atency or <b>C</b>onsistency. E.g. DynamoDB/Cassandra are PA/EL; a synchronously replicated SQL DB is PC/EC.</p>
<h3>Consistency models (weak → strong)</h3>
<p>Eventual → read-your-writes → monotonic reads → causal → strong (linearizable). You can mix: strong for balance, eventual for like counts.</p>`,
real:`Cassandra lets you tune per query: with N=3 replicas, writing and reading at QUORUM (2 each) gives W + R > N, so reads overlap the latest write.`,
say:["\"Bookings need CP: I'd rather reject a request than sell the same seat twice. The feed can be AP.\""],
traps:["Saying \"we choose CA\". In a distributed system you can't opt out of partitions.","CAP's C is not ACID's C (ACID C means constraints hold)."],
quiz:[
{q:"During a network partition, a CP system will…",o:["Return possibly stale data","Reject or delay some requests to stay consistent","Lose partition tolerance","Become CA"],a:1,why:"CP gives up availability for some requests during the partition."},
{q:"Which feature fits eventual consistency best?",o:["Bank transfer","Seat booking","Like counter on a post","Distributed lock"],a:2,why:"A like count off by a few for a second harms nobody."},
{q:"N = 3 replicas. Which (W, R) guarantees a read overlaps the latest write?",o:["W=1, R=1","W=1, R=2","W=2, R=2","W=2, R=1"],a:2,why:"Need W + R > N: 2 + 2 = 4 > 3."}]});

/* ---------------- WORLD 2 ---------------- */
T({id:"internet",w:2,title:"How a request travels: TCP, UDP, TLS, HTTP",mins:15,
tldr:"Typing a URL triggers <b>DNS → TCP handshake → TLS handshake → HTTP request</b>. HTTP/2 multiplexes on one connection; HTTP/3 runs on <b>QUIC over UDP</b>.",
notes:`<h3>What happens when you type a URL</h3>
<ol><li>Browser checks caches, then asks DNS for the IP.</li><li>TCP 3-way handshake: SYN → SYN-ACK → ACK (1 round trip).</li><li>TLS 1.3 handshake (1 round trip; 0-RTT on resumption) to agree keys and verify the certificate.</li><li>HTTP request → load balancer → app → DB/cache → response.</li><li>Browser parses HTML, fetches CSS/JS/images (often from a CDN), renders.</li></ol>
<h3>TCP vs UDP</h3>
<table><tr><th>TCP</th><th>UDP</th></tr><tr><td>Connection, ordered, reliable, congestion control</td><td>No connection, no ordering or retries, lower overhead</td></tr><tr><td>Web, APIs, DBs, file transfer</td><td>Video calls, games, DNS queries, QUIC</td></tr></table>
<h3>HTTP versions</h3>
<ul><li><b>1.1</b>: keep-alive, but one request at a time per connection (browsers open ~6).</li><li><b>2</b>: binary, many streams multiplexed on one TCP connection, header compression. Still suffers TCP head-of-line blocking on packet loss.</li><li><b>3</b>: QUIC over UDP; streams are independent so one lost packet doesn't stall others; faster handshakes.</li></ul>
<h3>Status codes to know</h3><p>200 OK · 201 Created · 204 No Content · 301/302 redirects · 304 Not Modified · 400 Bad Request · 401 Unauthenticated · 403 Forbidden · 404 · 409 Conflict · 429 Too Many Requests · 500 · 502 Bad Gateway · 503 Unavailable · 504 Gateway Timeout.</p>`,
say:["\"The first request pays DNS + TCP + TLS round trips, which is why CDNs terminate TLS close to users.\""],
traps:["401 vs 403: 401 = who are you? 403 = I know you, and no.","HTTP/2 does not remove TCP head-of-line blocking; HTTP/3 does."],
src:[["Hussein Nasser (YouTube)","https://www.youtube.com/@hnasr"]],
quiz:[
{q:"Which protocol does HTTP/3 run on?",o:["TCP","QUIC over UDP","SCTP","WebSocket"],a:1,why:"QUIC is built on UDP and handles reliability per stream."},
{q:"A logged-in user requests an admin page they aren't allowed to see. Best status code?",o:["401","403","404","400"],a:1,why:"They're authenticated, just not authorized: 403."},
{q:"Why would a video call use UDP?",o:["It encrypts by default","Late packets are useless, so retransmission isn't worth the delay","It guarantees ordering","It's required by browsers"],a:1,why:"For real-time media, a dropped frame is better than a delayed one."}]});

T({id:"dns-cdn",w:2,title:"DNS and CDNs",mins:12,
tldr:"<b>DNS</b> turns names into IPs through a cached hierarchy. A <b>CDN</b> caches content at edge servers near users, cutting latency and origin load.",
notes:`<h3>DNS resolution</h3>
<ol><li>Browser/OS cache → recursive resolver (ISP or 8.8.8.8).</li><li>Resolver asks a <b>root</b> server → gets the <b>TLD</b> server (.com).</li><li>TLD → the domain's <b>authoritative</b> name server → returns the A/AAAA record.</li><li>Each answer is cached for its <b>TTL</b>.</li></ol>
<p>Records: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), NS, TXT. Low TTL = faster failover, more DNS traffic.</p>
<p>DNS can load-balance (multiple A records, geo-DNS, latency-based routing) but clients cache answers, so failover is slow.</p>
<h3>CDN</h3>
<ul><li><b>Pull CDN</b>: edge fetches from origin on a miss, caches by <code>Cache-Control</code>. Easy; first request is slow.</li><li><b>Push CDN</b>: you upload content ahead of time. Good for big, predictable files.</li><li>Cache static assets, images, video segments, and even API responses that are public and cacheable.</li><li>Invalidate with versioned file names (<code>app.3f9a.js</code>) instead of purging.</li><li>Bonus: TLS termination at the edge, DDoS absorption.</li></ul>`,
real:`Netflix runs its own CDN, Open Connect, placing caching appliances inside ISPs so most video bytes never cross the wider internet.`,
say:["\"Static assets and video segments go through a CDN with long TTLs and versioned names; the origin only serves misses.\""],
traps:["Putting personalised, private responses on a shared CDN cache without <code>Cache-Control: private</code>.","Expecting DNS failover to be instant despite TTL caching."],
src:[["Netflix Open Connect","https://openconnect.netflix.com/"]],
quiz:[
{q:"Order of DNS lookup after the resolver's cache misses?",o:["Authoritative → TLD → root","Root → TLD → authoritative","TLD → root → authoritative","Root → authoritative"],a:1,why:"Root points to the TLD servers, which point to the domain's authoritative servers."},
{q:"Best way to make browsers pick up a new version of app.js served via CDN?",o:["Purge the whole CDN each deploy","Set TTL to 0","Use content-hashed file names like app.3f9a.js","Disable the CDN"],a:2,why:"A new name is a new cache key, so old caches are irrelevant."},
{q:"A pull CDN gets a request for an uncached file. It…",o:["Returns 404","Fetches it from the origin, caches it, returns it","Asks the user to retry","Redirects to the origin permanently"],a:1,why:"That's the definition of pull: populate on miss."}]});

T({id:"proxies-lb",w:2,title:"Proxies, load balancers and API gateways",mins:15,
tldr:"A <b>reverse proxy</b> sits in front of servers. A <b>load balancer</b> is a reverse proxy that spreads traffic. An <b>API gateway</b> adds auth, rate limits and routing for many services.",
notes:`<h3>Forward vs reverse proxy</h3><p><b>Forward</b>: acts for clients (corporate proxy, VPN). <b>Reverse</b>: acts for servers (nginx, Envoy): TLS termination, compression, caching, hiding backends.</p>
<h3>L4 vs L7 load balancing</h3>
<table><tr><th>L4 (transport)</th><th>L7 (application)</th></tr><tr><td>Routes by IP/port, doesn't read HTTP</td><td>Reads URL, headers, cookies</td></tr><tr><td>Very fast, protocol-agnostic</td><td>Path routing (/api → A, /img → B), retries, auth</td></tr><tr><td>AWS NLB</td><td>AWS ALB, nginx, Envoy</td></tr></table>
<h3>Algorithms</h3>
<ul><li><b>Round robin</b> / weighted round robin: simple, assumes equal requests.</li><li><b>Least connections</b>: good when request cost varies (long-lived connections).</li><li><b>IP / consistent hash</b>: same client → same server (cache locality, WebSockets).</li><li><b>Power of two choices</b>: pick 2 random, send to the less loaded.</li></ul>
<p><b>Health checks</b> remove dead servers. Make LBs themselves redundant (active-passive pair or managed LB).</p>
<h3>API gateway</h3><p>Single entry for clients: authentication, rate limiting, request routing to microservices, TLS, request/response transforms, metrics. Variant: <b>BFF</b> (backend for frontend) per client type.</p>`,
diagram:{w:760,h:230,n:[["c",70,115,"Clients","","client"],["gw",240,115,"API gateway","auth · rate limit · route","edge"],["s1",450,45,"User service","","svc"],["s2",450,115,"Order service","","svc"],["s3",450,185,"Search service","","svc"],["d1",650,45,"Users DB","","db"],["d2",650,115,"Orders DB","","db"],["d3",650,185,"Search index","","db"]],e:[["c","gw"],["gw","s1","/users"],["gw","s2","/orders"],["gw","s3","/search"],["s1","d1"],["s2","d2"],["s3","d3"]]},dcap:"An L7 gateway routes by path and handles cross-cutting concerns once.",
say:["\"I'll use an L7 load balancer so I can route /api and /static separately and do health checks.\"","\"WebSocket servers need least-connections or consistent hashing, not plain round robin.\""],
traps:["Calling a CDN a load balancer. Related, not the same.","Forgetting the LB itself must be redundant."],
quiz:[
{q:"You need to route /images to one cluster and /api to another. Which LB?",o:["L4","L7","DNS round robin","None, use a CDN"],a:1,why:"Only L7 understands HTTP paths."},
{q:"Requests vary wildly in cost (some take 10 ms, some 5 s). Best algorithm?",o:["Round robin","Least connections","Random","Static IP hash"],a:1,why:"Least connections avoids piling more work onto a busy server."},
{q:"Which is NOT a typical API gateway job?",o:["Authentication","Rate limiting","Request routing","Running SQL joins for the order service"],a:3,why:"Business/data logic stays in services."}]});

T({id:"api-styles",w:2,title:"API styles: REST, gRPC, GraphQL",mins:12,
tldr:"<b>REST</b> for public resource APIs, <b>gRPC</b> for fast typed service-to-service calls, <b>GraphQL</b> when many clients need flexible shapes of data.",
notes:`<table><tr><th></th><th>REST</th><th>gRPC</th><th>GraphQL</th></tr>
<tr><td>Transport</td><td>HTTP/1.1 or 2, JSON</td><td>HTTP/2, Protobuf (binary)</td><td>HTTP, one endpoint, JSON</td></tr>
<tr><td>Strength</td><td>Simple, cacheable, universal</td><td>Fast, typed contracts, streaming</td><td>Client picks fields; no over/under-fetching</td></tr>
<tr><td>Weakness</td><td>Over-fetching, many round trips</td><td>Browser support needs a proxy, less human-readable</td><td>Caching harder, N+1 queries, query cost limits needed</td></tr>
<tr><td>Use</td><td>Public APIs, CRUD</td><td>Internal microservices</td><td>Mobile + web apps with varied screens</td></tr></table>
<h3>Also know</h3><ul><li><b>WebSockets</b>: bidirectional, persistent. <b>SSE</b>: server → client stream over HTTP. <b>Webhooks</b>: server calls <i>your</i> URL when something happens.</li><li>RPC style ("call a function") vs REST style ("act on a resource").</li></ul>`,
say:["\"Public API in REST for simplicity and caching; internal service calls in gRPC for speed and typed contracts.\""],
traps:["Claiming GraphQL is always faster. It can cause expensive nested queries unless you add limits and DataLoader-style batching."],
quiz:[
{q:"Best fit for high-throughput internal calls between microservices with strict contracts?",o:["REST + JSON","gRPC","GraphQL","SOAP"],a:1,why:"Binary Protobuf over HTTP/2 with generated typed clients."},
{q:"Main thing GraphQL solves?",o:["Encryption","Over- and under-fetching for varied clients","Database sharding","Rate limiting"],a:1,why:"Clients ask for exactly the fields they need in one request."},
{q:"Stripe tells your server when a payment succeeds by calling your URL. That's a…",o:["WebSocket","Webhook","Long poll","gRPC stream"],a:1,why:"Webhook = provider-initiated HTTP callback."}]});

T({id:"api-design",w:2,title:"API design: resources, pagination, idempotency",mins:15,
tldr:"Model <b>resources</b> with nouns and HTTP verbs, paginate with <b>cursors</b>, version deliberately, and make unsafe calls <b>idempotent</b> with keys.",
notes:`<h3>Resource design</h3><pre><code>GET    /v1/users/{id}/orders?cursor=abc&limit=20
POST   /v1/orders                 (create, body = order)
GET    /v1/orders/{id}
PATCH  /v1/orders/{id}            (partial update)
DELETE /v1/orders/{id}</code></pre>
<p>Idempotent verbs: GET, PUT, DELETE (repeating has the same effect). POST and PATCH are not by default.</p>
<h3>Pagination</h3><table><tr><th>Offset (<code>?page=5</code>)</th><th>Cursor (<code>?cursor=&lt;last id&gt;</code>)</th></tr><tr><td>Simple; can jump to page N</td><td>Stable when rows are inserted; fast with an index (<code>WHERE id &lt; :cursor ORDER BY id DESC LIMIT 20</code>)</td></tr><tr><td>Slow for deep pages (DB scans and discards), duplicates/skips when data changes</td><td>Can't jump to an arbitrary page</td></tr></table>
<h3>Idempotency keys</h3><p>Client sends <code>Idempotency-Key: &lt;uuid&gt;</code> on POST. Server stores key → result. A retry with the same key returns the saved result instead of charging twice. Essential for payments and any retried network call.</p>
<h3>Other must-haves</h3><ul><li>Versioning: <code>/v1/</code> in path (simple) or a header.</li><li>Consistent error shape: <code>{"error":{"code":"card_declined","message":"…"}}</code>.</li><li>Auth on every endpoint, rate limits, request IDs for tracing.</li><li>Don't put user IDs from the token in the body; derive them server-side.</li></ul>`,
real:`Stripe's API popularised the Idempotency-Key header: keys are kept for 24 hours and replays return the original response.`,
say:["\"Cursor pagination, because the feed changes constantly and offsets would skip or repeat items.\"","\"POST /payments takes an Idempotency-Key so client retries can't double-charge.\""],
traps:["Verbs in URLs (<code>/createOrder</code>) in a REST design.","Trusting a <code>userId</code> in the request body instead of the auth token."],
src:[["Stripe: idempotency","https://stripe.com/blog/idempotency"]],
quiz:[
{q:"Why prefer cursor over offset pagination for a live feed?",o:["Cursors allow jumping to page 50","New inserts don't cause skipped or duplicate items, and deep pages stay fast","Offsets aren't supported by SQL","Cursors need no index"],a:1,why:"Cursor = 'items after X', stable under inserts and index-friendly."},
{q:"Which HTTP method is NOT idempotent by default?",o:["GET","PUT","DELETE","POST"],a:3,why:"Repeating a POST can create two resources."},
{q:"A mobile app retries POST /payments after a timeout. What stops a double charge?",o:["HTTPS","An Idempotency-Key the server dedupes on","A longer timeout","Using PUT"],a:1,why:"The server recognises the key and returns the original result."}]});

T({id:"realtime",w:2,title:"Real-time: polling, SSE, WebSockets",mins:12,
tldr:"<b>Short polling</b> asks repeatedly, <b>long polling</b> holds the request open until data exists, <b>SSE</b> streams server→client, <b>WebSockets</b> are full duplex.",
notes:`<table><tr><th>Technique</th><th>How</th><th>Good for</th><th>Cost</th></tr>
<tr><td>Short polling</td><td>GET every N seconds</td><td>Rare updates, simplicity</td><td>Wasted requests, delay up to N</td></tr>
<tr><td>Long polling</td><td>Server holds GET until data or timeout, client re-requests</td><td>Fallback when WS blocked</td><td>A request per message</td></tr>
<tr><td>SSE</td><td>One HTTP response that never ends; server pushes events</td><td>Live scores, notifications, LLM token streaming</td><td>One-way only</td></tr>
<tr><td>WebSocket</td><td>HTTP upgrade to a persistent two-way socket</td><td>Chat, multiplayer, collaborative editing</td><td>Stateful connections, harder to scale</td></tr></table>
<h3>Scaling WebSockets</h3><ul><li>Each server holds many open connections; you must know <b>which server holds user X</b>. Keep a map in Redis (user → server) or use pub/sub channels per user/room.</li><li>LB with least-connections; handle reconnects with resume tokens and missed-message sync.</li><li>Heartbeats (ping/pong) detect dead connections.</li></ul>`,
diagram:{w:760,h:240,n:[["a",70,70,"Alice","","client"],["b",70,180,"Bob","","client"],["w1",260,70,"WS server 1","holds Alice","svc"],["w2",260,180,"WS server 2","holds Bob","svc"],["ps",470,125,"Redis pub/sub","user → channel","cache"],["st",660,125,"Message store","","db"]],e:[["a","w1","send",0,1],["b","w2","",0,1],["w1","ps","publish to Bob"],["ps","w2","deliver"],["w1","st","persist",1]]},dcap:"Servers don't talk directly; pub/sub routes a message to whichever server holds the recipient.",
say:["\"Chat needs two-way, low-latency messages, so WebSockets, with a Redis registry of which server holds each user.\"","\"For streaming LLM tokens, SSE is enough because data only flows one way.\""],
traps:["Using plain round robin with no plan for which server owns which connection.","Forgetting offline users: real-time push is an optimisation, the source of truth is the message store."],
quiz:[
{q:"Streaming tokens from an LLM to a browser. Simplest fit?",o:["WebSockets","Server-Sent Events","Short polling","Webhooks"],a:1,why:"One-way server→client stream over plain HTTP."},
{q:"Chat users on different WebSocket servers. How does server 1 deliver to a user on server 2?",o:["Direct DB polling every second","Pub/sub (e.g. Redis) or a user→server registry","Sticky sessions","DNS"],a:1,why:"A routing layer is needed between connection servers."},
{q:"Long polling means…",o:["The client polls every 60 s","The server holds the request open until there's data or a timeout","A persistent bidirectional socket","Server pushes to a client URL"],a:1,why:"Reduces empty responses compared with short polling."}]});

T({id:"auth",w:2,title:"Authentication and authorization",mins:14,
tldr:"<b>AuthN</b> = who you are; <b>AuthZ</b> = what you may do. Sessions are easy to revoke; JWTs are stateless but hard to revoke. <b>OAuth2</b> delegates access; <b>OIDC</b> adds login.",
notes:`<h3>Sessions vs JWT</h3><table><tr><th>Server sessions</th><th>JWT (signed token)</th></tr><tr><td>Random ID in a cookie; data in Redis/DB</td><td>Claims signed by the server; client sends it each request</td></tr><tr><td>Revoke instantly (delete row)</td><td>Valid until expiry; revoke needs a denylist</td></tr><tr><td>Lookup per request</td><td>No lookup; any service can verify the signature</td></tr></table>
<p>Common pattern: <b>short-lived access JWT (5–15 min) + long-lived refresh token</b> stored server-side and rotated.</p>
<h3>OAuth 2.0 and OIDC</h3><ul><li>OAuth2 = <b>authorization</b> framework: "let app X read my Google Drive" without sharing the password. Use the <b>Authorization Code flow with PKCE</b> for web/mobile apps.</li><li>OIDC = identity layer on top: adds an <b>ID token</b> so apps can log users in ("Sign in with Google"). SSO via OIDC or SAML.</li></ul>
<h3>Authorization models</h3><ul><li><b>RBAC</b>: roles (admin, approver) carry permissions.</li><li><b>ABAC</b>: rules on attributes (department = X and amount &lt; 10k).</li><li>Multi-tenant SaaS: every query filtered by <code>tenant_id</code>; Postgres row-level security as a safety net.</li></ul>
<h3>Password storage</h3><p>Never store plain or fast hashes (MD5/SHA-1). Use <b>bcrypt, scrypt or Argon2</b> with a per-user salt.</p>`,
say:["\"Short-lived JWTs so services can verify without a lookup, with refresh tokens in the DB so we can revoke.\"","\"Every query carries tenant_id; RLS in Postgres guards against a missed filter.\""],
traps:["Saying OAuth is an authentication protocol. Login is OIDC on top of OAuth.","Storing sensitive data in a JWT payload: it's signed, not encrypted (base64 is readable)."],
quiz:[
{q:"Main drawback of stateless JWTs?",o:["Can't carry user ID","Hard to revoke before expiry","Need a DB lookup per request","Only work with OAuth"],a:1,why:"No server state means no simple 'log this token out'."},
{q:"'Sign in with Google' is implemented with…",o:["SAML only","OpenID Connect on top of OAuth 2.0","Basic auth","JWT without OAuth"],a:1,why:"OIDC adds the ID token for authentication."},
{q:"How should passwords be stored?",o:["SHA-256 of the password","AES encrypted","bcrypt/Argon2 with a salt","Base64"],a:2,why:"Slow, salted hashing resists brute force."}]});

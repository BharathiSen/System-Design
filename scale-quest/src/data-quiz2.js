/* ===== Extra quiz questions: 4 more per topic (mostly scenarios) =====
   Appended after the originals, so existing question indices stay stable. */
const MOREQ={
"what-is-sd":[
{q:"An interviewer says \"Design Twitter\". What's the best first move?",o:["Draw boxes for every service you know","Ask which features matter and roughly how many users","Pick a database","Start estimating storage"],a:1,why:"Scope first: features and scale decide everything else."},
{q:"Which is a non-functional requirement?",o:["Users can post a tweet","Users can follow others","The feed loads in under 200 ms at p99","Users can like a post"],a:2,why:"Non-functional = how well (speed, availability, scale), not what it does."},
{q:"Your design works for 1,000 users. What's the most useful next question to ask yourself?",o:["Which framework is trendiest?","What breaks first at 100× the traffic?","Can I add more microservices?","Should I rename the services?"],a:1,why:"Finding the first bottleneck is the core skill of system design."},
{q:"Why do interviewers care more about trade-offs than the 'right' answer?",o:["There's usually no single right design; reasoning shows judgement","Trade-offs are easier to grade","They don't know the answer","It saves time"],a:0,why:"Most choices are context-dependent; explaining why is what they score."}],
"scalability":[
{q:"Your single app server is at 95% CPU and the DB is at 20%. Cheapest quick fix?",o:["Shard the database","Add app servers behind a load balancer (if they're stateless)","Add a CDN for the API","Switch to NoSQL"],a:1,why:"The bottleneck is the app tier, and stateless servers scale out easily."},
{q:"A server stores uploaded files on its local disk. What breaks when you add a second server?",o:["Nothing","Requests on the other server can't find the files","The load balancer crashes","DNS fails"],a:1,why:"Local disk is state. Move files to shared object storage like S3."},
{q:"Sticky sessions (same user always hits the same server) mainly cause…",o:["Uneven load and lost sessions when a server dies","Faster DNS","Stronger consistency","Lower memory use"],a:0,why:"Stickiness hides state on servers, which hurts balancing and failover."},
{q:"Which scales a read-heavy SQL database without changing app logic much?",o:["Sharding","Read replicas plus a cache","Moving to a graph DB","Bigger primary keys"],a:1,why:"Replicas and caching spread reads; sharding is a bigger change."}],
"availability":[
{q:"Your only database server dies at 2 a.m. and the site is down. What was missing?",o:["A CDN","A standby replica with automatic failover","More app servers","A bigger disk"],a:1,why:"The DB was a single point of failure."},
{q:"Which improves availability the most for a stateless web tier?",o:["One huge server","Several servers across two availability zones behind a load balancer","A faster CPU","Longer timeouts"],a:1,why:"Redundancy across failure domains removes the SPOF."},
{q:"Availability vs reliability: a system that's up but returns wrong totals is…",o:["Available but not reliable","Reliable but not available","Both","Neither, by definition"],a:0,why:"Up ≠ correct. Reliability is about correct behaviour over time."},
{q:"99.9% availability allows roughly how much downtime per month?",o:["~4 minutes","~43 minutes","~7 hours","~3 days"],a:1,why:"0.1% of ~43,200 minutes ≈ 43 minutes."}],
"latency":[
{q:"Your API's average latency is 80 ms but users complain it's slow. What should you check?",o:["The average again","p95/p99 latency","CPU model","Number of endpoints"],a:1,why:"Tail latency is what unhappy users feel."},
{q:"A page makes 5 sequential calls of ~40 ms each. Simplest way to cut latency?",o:["Make independent calls in parallel","Add more RAM","Use UDP","Increase the timeout"],a:0,why:"Parallel calls take ~40 ms instead of ~200 ms."},
{q:"Batching 100 small writes into one request mainly improves…",o:["Throughput (fewer round trips)","Latency of the first write","Security","Consistency"],a:0,why:"Fewer round trips → more work per second, though individual items may wait slightly."},
{q:"Why avoid a cross-continent database call on every request?",o:["It's not allowed","Each round trip costs ~100+ ms, dominating the latency budget","Databases can't do it","It uses more disk"],a:1,why:"Network distance is the slowest common cost."}],
"cap":[
{q:"Seat booking for a concert: during a partition, which do you prefer?",o:["AP: sell anyway, fix later","CP: refuse or wait rather than double-sell","Neither","Whatever is faster"],a:1,why:"Double-selling a seat is worse than a short error."},
{q:"A social feed during a partition shows a post a few seconds late. This is…",o:["A CP choice","An AP choice: available with stale data","A bug in TCP","Strong consistency"],a:1,why:"AP systems keep answering and converge later."},
{q:"PACELC says that even with no partition, you trade…",o:["Cost vs security","Latency vs consistency","CPU vs memory","Reads vs writes"],a:1,why:"Waiting for replicas to agree adds latency."},
{q:"Read-your-writes consistency guarantees that…",o:["Everyone sees every write instantly","You always see your own latest writes","Writes never fail","Reads are cached"],a:1,why:"It's a per-user guarantee, weaker than strong consistency."}],
"internet":[
{q:"Why is a TLS 1.3 handshake faster than TLS 1.2?",o:["It skips encryption","It needs 1 round trip instead of 2","It uses UDP","It caches pages"],a:1,why:"TLS 1.3 cut the handshake to 1-RTT (0-RTT on resumption)."},
{q:"A POST creates a new order successfully. Best status code?",o:["200 OK","201 Created","204 No Content","302 Found"],a:1,why:"201 signals a new resource was created."},
{q:"HTTP/2's main improvement over HTTP/1.1?",o:["Plain-text headers","Multiplexing many requests on one connection","No TLS","UDP transport"],a:1,why:"One connection carries many streams in parallel."},
{q:"Your server returns 503 during a deploy. What does that tell clients?",o:["The resource never existed","Service temporarily unavailable, try later","Bad request syntax","Permanent redirect"],a:1,why:"503 = temporarily unavailable; often paired with Retry-After."}],
"dns-cdn":[
{q:"You change a DNS record but some users still hit the old IP for an hour. Why?",o:["DNS is broken","Resolvers cached the old answer until its TTL expired","The CDN is down","HTTPS blocks it"],a:1,why:"Lower the TTL before planned changes."},
{q:"What should NOT be cached on a public CDN?",o:["Product images","JS bundles","A logged-in user's private account page","Fonts"],a:2,why:"Personalised responses must not be shared between users."},
{q:"A CDN mainly reduces…",o:["Database writes","Latency for far-away users and load on your origin","Password hashing time","Disk usage on clients"],a:1,why:"Edge servers serve copies close to users."},
{q:"Push CDN vs pull CDN: with a push CDN you…",o:["Wait for users to request files","Upload content to the CDN ahead of time","Can't use HTTPS","Need no origin"],a:1,why:"Push = you place files; pull = CDN fetches on first request."}],
"proxies-lb":[
{q:"A backend server dies. How does the load balancer stop sending it traffic?",o:["Users report it","Health checks mark it unhealthy","DNS TTL","It doesn't"],a:1,why:"Periodic health checks remove dead targets."},
{q:"Least-connections balancing is better than round robin when…",o:["All requests are identical","Request durations vary a lot","There's one server","You need sticky sessions"],a:1,why:"It sends new work to the least busy server."},
{q:"The load balancer itself could become a single point of failure. Usual fix?",o:["Remove it","Run a redundant pair (or a managed LB) with failover","Use bigger servers","Cache it"],a:1,why:"LBs are deployed redundantly too."},
{q:"TLS termination at the load balancer means…",o:["The LB decrypts HTTPS so backends get plain HTTP inside the network","TLS is disabled","Clients use HTTP","Certificates live on every backend"],a:0,why:"Centralises certificates and offloads crypto work."}],
"api-styles":[
{q:"A public API for third-party developers. Safest default?",o:["gRPC","REST with JSON","Raw TCP","GraphQL subscriptions only"],a:1,why:"REST is universally supported and easy to explore."},
{q:"A mobile screen needs data from 4 resources, and round trips are slow on 3G. Good option?",o:["4 REST calls","GraphQL (or a purpose-built endpoint) returning it in one request","FTP","Polling"],a:1,why:"Fewer round trips matter on slow networks."},
{q:"A known downside of GraphQL?",o:["Can't fetch nested data","Caching and expensive-query control are harder","No types","No JSON"],a:1,why:"Arbitrary queries need cost limits and smarter caching."},
{q:"gRPC uses which serialisation by default?",o:["XML","Protocol Buffers (binary)","CSV","YAML"],a:1,why:"Compact binary protobufs with a strict schema."}],
"api-design":[
{q:"Best URL to fetch the comments of post 42?",o:["GET /getComments?post=42","GET /posts/42/comments","POST /comments/fetch","GET /comment-list-42"],a:1,why:"Nouns and nesting, verb from HTTP."},
{q:"You must change a response field in a breaking way. Safest approach?",o:["Change it silently","Release a new version (e.g. /v2) and keep v1 for a while","Email users","Rename the domain"],a:1,why:"Versioning lets old clients keep working."},
{q:"A client sends invalid JSON. Best status code?",o:["500","400 Bad Request","404","201"],a:1,why:"4xx = client's fault; 400 for malformed input."},
{q:"PUT vs PATCH?",o:["Same thing","PUT replaces the whole resource; PATCH updates part of it","PATCH deletes","PUT is only for files"],a:1,why:"PUT is a full replacement; PATCH is a partial update."}],
"realtime":[
{q:"Live cricket score updates to millions of viewers, one-way. Good fit?",o:["WebSockets per user with full duplex","SSE or long polling (one-way push)","FTP","Email"],a:1,why:"One-way push is simpler and cheaper with SSE."},
{q:"A WebSocket server restarts. What should clients do?",o:["Give up","Reconnect with backoff and fetch missed messages","Switch to email","Clear local storage"],a:1,why:"Reconnect plus catch-up keeps the chat consistent."},
{q:"Why do WebSocket servers need special handling behind a load balancer?",o:["They use UDP","Connections are long-lived, so load spreads unevenly and drains slowly","They don't use HTTP at all","They can't use TLS"],a:1,why:"Long connections pin users to servers; plan draining and balancing."},
{q:"Short polling every second for 1M idle users mostly wastes…",o:["Nothing","Requests and server capacity on empty answers","Disk space","DNS lookups only"],a:1,why:"Most polls return nothing new."}],
"auth":[
{q:"A user's phone is stolen. With JWTs that last 30 days, what helps?",o:["Nothing","Short-lived access tokens plus revocable refresh tokens","Longer tokens","Storing JWTs in the URL"],a:1,why:"Short access tokens limit damage; refresh tokens can be revoked."},
{q:"A 401 vs a 403 response?",o:["Same","401 = not authenticated; 403 = authenticated but not allowed","403 = server down","401 = rate limited"],a:1,why:"Who are you? vs you can't do that."},
{q:"Role-based access control (RBAC) means…",o:["Permissions attach to roles, and users get roles","Every user has custom code","Passwords per role","No permissions"],a:0,why:"Manage roles, not individual permissions."},
{q:"Where should a web app store a session ID cookie to resist XSS theft?",o:["localStorage","An HttpOnly, Secure cookie","The URL","A global JS variable"],a:1,why:"HttpOnly cookies can't be read by injected scripts."}],
"sql-nosql":[
{q:"An e-commerce order with items, payment and inventory updates. Default store?",o:["SQL (PostgreSQL) for transactions","A cache","A search engine","A time-series DB"],a:0,why:"Multi-row transactions and constraints favour SQL."},
{q:"Product catalogue where each category has very different attributes. A reasonable option?",o:["A JSON/JSONB column or document store","One table per product","A graph DB","Redis only"],a:0,why:"Flexible attributes fit JSON well."},
{q:"Biggest trade-off of many NoSQL key-value stores?",o:["They can't store strings","Limited joins and ad-hoc queries; you design around access patterns","They're always slower","No replication"],a:1,why:"You model data for known queries."},
{q:"\"We'll use MongoDB because it's web scale.\" Best interviewer follow-up?",o:["Great","Which access patterns need it, and what do you give up?","Use MySQL instead","Add Redis"],a:1,why:"Choices need a reason tied to requirements."}],
"acid":[
{q:"Money moves from A to B, but the server crashes between debit and credit. What prevents lost money?",o:["Caching","Atomicity: the transaction rolls back","Sharding","A CDN"],a:1,why:"All-or-nothing: the half-done transfer is undone."},
{q:"A transaction reads the same row twice and gets different values. That anomaly is a…",o:["Dirty read","Non-repeatable read","Phantom","Deadlock"],a:1,why:"Prevented by Repeatable Read or Serializable."},
{q:"Two transactions each lock a row the other needs. The database will usually…",o:["Wait forever","Detect the deadlock and abort one","Merge them","Ignore locks"],a:1,why:"Deadlock detection picks a victim to roll back."},
{q:"SELECT … FOR UPDATE is used to…",o:["Speed up reads","Lock the selected rows until the transaction ends","Create an index","Back up a table"],a:1,why:"Pessimistic locking for read-then-write flows."}],
"indexing":[
{q:"Query: WHERE email = ? on a 50M-row users table is slow. First fix?",o:["Add an index on email","Add more RAM","Shard immediately","Use a cache for writes"],a:0,why:"A full scan becomes an index lookup."},
{q:"Index on (user_id, created_at). Best query for it?",o:["WHERE created_at > ?","WHERE user_id = ? ORDER BY created_at DESC","WHERE name = ?","ORDER BY random()"],a:1,why:"Leftmost column filters, the second gives the order for free."},
{q:"A column has only two values (true/false). A plain B-tree index on it alone is usually…",o:["Very useful","Not very useful: low selectivity","Required","Faster than a primary key"],a:1,why:"It still matches half the table; partial indexes can help."},
{q:"How do you check if a query uses an index?",o:["Guess","EXPLAIN / EXPLAIN ANALYZE","Restart the DB","Count rows"],a:1,why:"The query plan shows index vs sequential scans."}],
"replication":[
{q:"The leader dies. What must happen before a follower takes over safely?",o:["Nothing","Failover: promote a follower and make clients write to it, avoiding two leaders","Delete the data","Restart DNS"],a:1,why:"Promotion plus fencing prevents split-brain."},
{q:"Synchronous replication to one follower mainly buys…",o:["Lower write latency","No data loss if the leader dies","Fewer servers","Faster reads"],a:1,why:"The write is on two machines before you say 'saved'."},
{q:"A dashboard reads from a replica that is 30 seconds behind. Is that OK?",o:["Never","Often yes for analytics; not for a user checking their own just-made payment","Only on Sundays","Only with NoSQL"],a:1,why:"Match consistency to the use case."},
{q:"Split-brain means…",o:["Two nodes both think they're the leader and accept writes","A disk failure","A slow query","A cache miss"],a:0,why:"It causes conflicting writes; quorums and fencing prevent it."}],
"sharding":[
{q:"A multi-tenant SaaS app. Natural shard key?",o:["Random","tenant_id","created_at","country of the server"],a:1,why:"Keeps each tenant's queries on one shard."},
{q:"One huge tenant overloads its shard. Options?",o:["Ignore it","Give it a dedicated shard or split it further","Delete the tenant","Turn off indexes"],a:1,why:"Hot tenants need special placement."},
{q:"Directory-based sharding uses…",o:["A lookup service mapping keys to shards","Only hashing","DNS","A CDN"],a:0,why:"Flexible placement, at the cost of a lookup component."},
{q:"Before sharding a database, you should usually first try…",o:["Nothing else","Indexes, caching, read replicas and vertical scaling","Microservices","A new language"],a:1,why:"Sharding adds a lot of complexity; exhaust simpler options."}],
"consistent-hashing":[
{q:"With 4 nodes on a ring, a 5th is added. Roughly what share of keys move?",o:["All of them","About 1/5","None","Half"],a:1,why:"Only keys in the new node's arc move."},
{q:"Which systems commonly use consistent hashing?",o:["DynamoDB/Cassandra partitioning and distributed caches","Spreadsheets","DNS root servers only","SMTP"],a:0,why:"It's the standard way to spread keys over changing node sets."},
{q:"A node with twice the capacity should get…",o:["The same number of virtual nodes","About twice as many virtual nodes","Zero","One"],a:1,why:"Virtual node count can be weighted by capacity."},
{q:"Replicating a key to the next 2 nodes clockwise gives…",o:["Faster hashing","Copies on 3 nodes for fault tolerance","Smaller keys","Strong consistency automatically"],a:1,why:"A common replication scheme on hash rings."}],
"caching":[
{q:"A product page reads prices 1,000× per update. What should you cache?",o:["Nothing","The product data, with invalidation on update","Only writes","The password table"],a:1,why:"Read-heavy and rarely changing: ideal for caching."},
{q:"Your cache hit rate is 20%. Likely problem?",o:["Cache too big","Caching the wrong things, too-short TTLs, or a cache too small for the hot set","Too many hits","DNS"],a:1,why:"Low hit rates mean the cache isn't holding the hot data."},
{q:"Write-around caching means writes…",o:["Go to the cache only","Go to the DB only; the cache fills on later reads","Are dropped","Go to both always"],a:1,why:"Avoids filling the cache with data nobody reads."},
{q:"Why set a TTL even with explicit invalidation?",o:["It's required by Redis","A safety net: missed invalidations heal themselves eventually","It speeds up writes","It encrypts data"],a:1,why:"Bugs happen; expiry bounds staleness."}],
"cache-problems":[
{q:"One celebrity profile gets 1M reads/s and overloads one Redis node. Fix?",o:["Delete it","Replicate the hot key (or cache it locally in each app server)","Shorten the TTL","Move it to SQL"],a:1,why:"Spread hot-key reads across copies."},
{q:"Caching a 'not found' result for a short TTL protects against…",o:["Stampedes","Cache penetration","Hot keys","Clock drift"],a:1,why:"Repeated lookups for missing keys stop reaching the DB."},
{q:"Request coalescing (single flight) means…",o:["Every request hits the DB","Concurrent misses for the same key wait for one DB fetch","Requests are dropped","Keys never expire"],a:1,why:"One refill per key prevents a stampede."},
{q:"Users sometimes see old data right after an update. Likely cause?",o:["Stale cache entry not invalidated (or a race on refill)","Too much RAM","DNS","HTTPS"],a:0,why:"Classic cache consistency bug."}],
"blob":[
{q:"Users upload 20 MB videos through your API servers, which become slow. Better design?",o:["Bigger API servers","Presigned URLs so clients upload straight to object storage","Store videos in the DB","Email the videos"],a:1,why:"Keeps heavy bytes off your app tier."},
{q:"Serving user-uploaded images worldwide quickly?",o:["From the DB","Object storage behind a CDN","From the app server's disk","Over FTP"],a:1,why:"CDN edges cache images near users."},
{q:"Two users upload the same file. Saving storage with content hashing is called…",o:["Sharding","Deduplication","Compression","Encryption"],a:1,why:"Store identical chunks once, keyed by hash."},
{q:"Object storage is a poor fit for…",o:["Images","Backups","Frequently updating a few bytes in the middle of a file","Videos"],a:2,why:"Objects are written whole; it's not a random-access file system."}],
"special-db":[
{q:"\"Search products by name with typo tolerance and ranking.\" Best tool?",o:["SQL LIKE '%term%'","A search engine like Elasticsearch","Redis lists","A graph DB"],a:1,why:"Inverted index, fuzzy matching, relevance scoring."},
{q:"Storing server CPU readings every 10 seconds for 1,000 servers. Good fit?",o:["Time-series database","Graph DB","Blob storage","A spreadsheet"],a:0,why:"Optimised for timestamped appends and range queries."},
{q:"\"Find similar support tickets by meaning, not keywords.\" Needs…",o:["Vector search over embeddings","A B-tree","Geohash","A queue"],a:0,why:"Embeddings capture meaning; ANN search finds neighbours."},
{q:"Why keep PostgreSQL as the source of truth when using Elasticsearch for search?",o:["Elasticsearch can't store text","The search index is a rebuildable copy without full transactional guarantees","Postgres is faster at search","Licensing"],a:1,why:"Rebuild the index from the DB if it drifts."}],
"queues":[
{q:"Sending a welcome email shouldn't slow down signup. Design?",o:["Send it inside the signup request","Put an 'email' job on a queue; a worker sends it","Skip emails","Use a cron job yearly"],a:1,why:"Async work keeps the user-facing path fast."},
{q:"With at-least-once delivery, a consumer charges a card twice. Fix?",o:["Exactly-once networks","Make the consumer idempotent (dedupe by message/payment ID)","Bigger queue","Turn off retries"],a:1,why:"Duplicates will happen; make them harmless."},
{q:"Consumers fall behind and the queue grows for hours. First step?",o:["Delete the queue","Check lag metrics, then scale consumers or fix the slow step","Ignore it","Restart the producer"],a:1,why:"Lag tells you how far behind you are."},
{q:"Why can Kafka replay old events while a classic task queue usually can't?",o:["Kafka keeps messages for a retention period; consumers track offsets","Kafka is a database","Task queues are faster","Kafka uses UDP"],a:0,why:"It's a durable log, not a delete-on-read queue."}],
"rate-limit":[
{q:"Where is the best place to apply rate limits for many services?",o:["Each database","At the API gateway or edge","In the browser","In the CDN logs"],a:1,why:"One central place, before the work is done."},
{q:"Rate limiting by IP alone is unfair because…",o:["IPs are long","Many users can share one IP (office, college NAT)","IPs change every second","It's illegal"],a:1,why:"Prefer per-user or per-API-key limits where possible."},
{q:"Why use a Lua script or atomic command in Redis for the counter?",o:["Style","To check-and-increment atomically, avoiding race conditions","To save memory","For encryption"],a:1,why:"Separate GET and SET can let concurrent requests through."},
{q:"A good 429 response should include…",o:["Nothing","A Retry-After header so clients know when to try again","The server's IP","A stack trace"],a:1,why:"Helps well-behaved clients back off correctly."}],
"resilience":[
{q:"Service B is slow, so service A's threads all hang waiting. What was missing?",o:["Timeouts (and maybe a circuit breaker)","More logging","A CDN","Sharding"],a:0,why:"Without timeouts, one slow dependency takes everything down."},
{q:"Retrying immediately and forever on failure can cause…",o:["Faster recovery","A retry storm that overloads the failing service","Better consistency","Lower cost"],a:1,why:"Use limited retries with backoff and jitter."},
{q:"Graceful degradation example?",o:["Return a 500 for everything","Show the feed without recommendations when the recommender is down","Crash quickly","Block all users"],a:1,why:"Keep the core working when extras fail."},
{q:"The bulkhead pattern means…",o:["Separate pools per dependency so one failure can't use up all resources","One big thread pool","No timeouts","Retries in parallel"],a:0,why:"Like ship compartments: a leak stays contained."}],
"dist-txn":[
{q:"Order service saves an order and must publish 'OrderPlaced'. The app crashes between the two. Fix?",o:["Publish first","Transactional outbox: write the event in the same DB transaction, relay it later","Ignore it","Use UDP"],a:1,why:"The outbox removes the dual-write gap."},
{q:"A compensating action for 'charge card' is…",o:["Charge again","Refund the charge","Delete the logs","Retry forever"],a:1,why:"Sagas undo completed steps with compensations."},
{q:"Choreography vs orchestration in sagas?",o:["Same","Choreography: services react to events; orchestration: a coordinator tells each step what to do","Orchestration has no coordinator","Choreography needs 2PC"],a:1,why:"Orchestrators are easier to follow; choreography is more decoupled."},
{q:"Why are sagas only eventually consistent?",o:["They use caches","Other services can see intermediate states before all steps finish","They skip writes","They use UDP"],a:1,why:"There's no global lock across services."}],
"observability":[
{q:"Errors spike right after a deploy. Fastest safe action?",o:["Debug in production for an hour","Roll back, then investigate with logs and traces","Delete logs","Add more servers"],a:1,why:"Restore users first, then find the cause."},
{q:"Why add a request/trace ID to every log line?",o:["Fashion","To follow one request across many services' logs","To encrypt logs","To save disk"],a:1,why:"Correlation across services."},
{q:"An SLO of 99.9% success leaves an 'error budget' of…",o:["0%","0.1% of requests that may fail","10%","1%"],a:1,why:"The budget guides how fast you can ship risky changes."},
{q:"High-cardinality labels (like user_id) on metrics are risky because…",o:["They're illegal","They create huge numbers of time series and blow up the metrics system","They're too accurate","They slow the CPU clock"],a:1,why:"Put per-user detail in logs/traces, not metric labels."}],
"architecture":[
{q:"A 4-person startup with one product. Sensible architecture?",o:["30 microservices","A modular monolith","Serverless functions per line of code","A mainframe"],a:1,why:"Microservices add overhead small teams can't afford."},
{q:"Biggest new problem when splitting into microservices?",o:["Too few files","Network calls, partial failures and distributed data","Fewer deploys","Less monitoring"],a:1,why:"In-process calls become unreliable network calls."},
{q:"Event-driven architecture helps when…",o:["Many services must react to the same business event independently","You need one strongly consistent transaction","There's only one service","You want synchronous replies"],a:0,why:"Publish once; many subscribers react."},
{q:"Each microservice owning its own database mainly gives…",o:["Faster joins","Independent changes and deploys without breaking others","Free transactions across services","Smaller servers"],a:1,why:"Shared databases couple services tightly."}],
"consensus":[
{q:"Why use an odd number of nodes (3, 5) in a consensus cluster?",o:["Tradition","An even number adds cost without tolerating more failures","Odd numbers are faster","Required by TCP"],a:1,why:"4 nodes tolerate 1 failure, same as 3."},
{q:"A 3-node cluster splits into 2 + 1. Which side can still accept writes?",o:["Both","The side with 2 nodes (majority)","The side with 1 node","Neither"],a:1,why:"Only a majority can form a quorum."},
{q:"etcd in Kubernetes is used for…",o:["Serving videos","Storing cluster state consistently","Caching images","Load balancing"],a:1,why:"It's a strongly consistent key-value store built on Raft."},
{q:"Why not build your own consensus algorithm in production?",o:["It's illegal","It's notoriously easy to get subtly wrong; proven tools exist","It's too fast","It needs GPUs"],a:1,why:"Use ZooKeeper/etcd/Raft libraries."}],
"ids-clocks":[
{q:"Why not use the server's wall-clock timestamp as a unique order ID?",o:["Too long","Two orders in the same millisecond (or on two servers) collide","Clocks are always exact","IDs must be strings"],a:1,why:"Timestamps alone aren't unique."},
{q:"UUIDv4 primary keys in a B-tree index cause…",o:["Nothing","Random insert positions, more page splits and poorer cache locality","Shorter keys","Sorted inserts"],a:1,why:"Time-ordered IDs (Snowflake, UUIDv7) insert at the end."},
{q:"NTP keeps server clocks…",o:["Perfectly identical","Close, but with small drift and occasional jumps","Disabled","In UTC+5:30 only"],a:1,why:"Never assume clocks across machines agree exactly."},
{q:"A Lamport clock gives you…",o:["Real time","An ordering consistent with causality (happens-before)","Unique IDs per machine","Time zones"],a:1,why:"A counter that respects cause-and-effect ordering."}],
"prob-ds":[
{q:"A web crawler must skip URLs it has already seen, across billions of URLs, with little memory. Use…",o:["A Bloom filter","A SQL table scan","A linked list","HyperLogLog"],a:0,why:"Membership test with tiny memory; occasional false positives are acceptable."},
{q:"Can you delete items from a standard Bloom filter?",o:["Yes, easily","No (a counting Bloom filter is needed)","Only on Sundays","Only the first item"],a:1,why:"Clearing bits could remove other items."},
{q:"Finding the top 10 trending hashtags in a huge stream with bounded memory. Use…",o:["Count-Min sketch plus a heap","A Bloom filter","A B-tree","UUIDs"],a:0,why:"Approximate frequencies + a top-K heap."},
{q:"A Bloom filter's false positive rate goes up when…",o:["You add more items without growing it","You use fewer items","You delete items","You restart it"],a:0,why:"More set bits → more accidental matches."}],
"streaming":[
{q:"A monthly invoice report for all customers. Batch or stream?",o:["Batch","Stream","Neither","Both are required"],a:0,why:"Bounded data on a schedule = batch."},
{q:"Late events arrive after their 1-minute window closed. Common approach?",o:["Drop everything","Watermarks with allowed lateness, then update the window result","Restart the job","Ignore time"],a:1,why:"Streaming engines handle lateness explicitly."},
{q:"Tumbling vs sliding windows?",o:["Same","Tumbling: fixed, non-overlapping; sliding: overlapping windows that move","Sliding never ends","Tumbling is batch only"],a:1,why:"E.g. per-minute counts vs 'last 5 minutes every 10 s'."},
{q:"Why use CDC instead of the app writing to both the DB and Kafka?",o:["It's slower","It avoids the dual-write problem: the DB log is the single source","It skips the DB","It needs no Kafka"],a:1,why:"Every committed change is captured exactly from the log."}],
"framework":[
{q:"You've spent 20 minutes on requirements in a 45-minute round. Problem?",o:["No, that's ideal","Yes: leave time for the design and deep dives (aim for ~5 min)","Only if the interviewer is junior","Requirements don't matter"],a:1,why:"Time-box each phase."},
{q:"The interviewer pushes on a part of your design. Best response?",o:["Defend it no matter what","Discuss the trade-off and adapt if they raise a real issue","Change topic","Start over"],a:1,why:"Collaboration and flexibility score highly."},
{q:"When should you draw the API?",o:["Never","After entities, before the high-level diagram","At the very end","Only for REST"],a:1,why:"The API defines what the boxes must do."},
{q:"A good wrap-up includes…",o:["Silence","A summary, the bottlenecks, and what you'd do next with more time","A new design","Apologies"],a:1,why:"Shows awareness of limits and next steps."}],
"estimation":[
{q:"5M users each upload 2 photos/day at 500 KB. Storage per day?",o:["~5 GB","~500 GB","~5 TB","~50 TB"],a:2,why:"10M photos × 0.5 MB = 5 TB/day."},
{q:"A server handles ~1,000 requests/s. Peak load is 30k req/s. Servers needed (with ~30% headroom)?",o:["~3","~30","~40","~300"],a:2,why:"30 servers at full load; ~40 with headroom."},
{q:"100M requests/day. Average QPS?",o:["~100","~1,200","~12,000","~120,000"],a:1,why:"100M ÷ ~86,400 ≈ 1,157."},
{q:"A 1 Gbps link can move roughly how many MB per second?",o:["~1,000","~125","~12","~1"],a:1,why:"1 Gbps ÷ 8 bits per byte = 125 MB/s."}],
"tradeoffs":[
{q:"Choosing caching for a bank balance screen, the main risk is…",o:["Too fast","Showing a stale balance","Too much security","Lower cost"],a:1,why:"Consistency-sensitive data needs careful invalidation or no cache."},
{q:"Push (fan-out on write) vs pull (fan-out on read) for feeds: push makes…",o:["Writes cheap and reads expensive","Reads cheap and writes expensive","Both cheap","Both expensive"],a:1,why:"Precomputed timelines cost work at post time."},
{q:"Strong consistency usually costs…",o:["Nothing","Higher latency and lower availability during partitions","Less storage","Fewer servers"],a:1,why:"Agreement takes time and coordination."},
{q:"An honest answer when you don't know a technology the interviewer names?",o:["Bluff","Say so, then reason from first principles about what it must do","Change the subject","Refuse"],a:1,why:"Reasoning beats bluffing."}],
"oop-solid":[
{q:"A User class saves itself to the DB, sends emails and formats PDFs. Which principle is broken?",o:["Single responsibility","Liskov","Interface segregation","None"],a:0,why:"Too many reasons to change."},
{q:"Composition over inheritance means…",o:["Never use classes","Build behaviour by holding other objects instead of deep class hierarchies","Use more inheritance","Use global functions"],a:1,why:"Has-a is more flexible than is-a."},
{q:"A Printer interface forces fax() on a simple printer. Fix?",o:["Implement fax() with pass","Split into smaller interfaces (Printer, Fax)","Delete Printer","Add more methods"],a:1,why:"Interface segregation."},
{q:"Encapsulation protects a BankAccount by…",o:["Making balance public","Keeping balance private and changing it only via deposit/withdraw with checks","Using inheritance","Using globals"],a:1,why:"Invariants are enforced in one place."}],
"patterns":[
{q:"Creating different notification senders (email, SMS, push) from a type string. Pattern?",o:["Factory","Observer","Singleton","Decorator"],a:0,why:"A factory decides which concrete class to build."},
{q:"Adding gift wrap and express delivery to an order's price, in any combination. Pattern?",o:["Decorator","Singleton","State","Adapter"],a:0,why:"Wrap objects to add behaviour step by step."},
{q:"Your code expects a PaymentGateway interface, but a new provider's SDK has different method names. Pattern?",o:["Adapter","Observer","Builder","Strategy"],a:0,why:"Translate one interface into another."},
{q:"Undo/redo in a text editor is a classic use of…",o:["Command","Singleton","Factory","Adapter"],a:0,why:"Commands are objects you can store and reverse."}],
"lld-round":[
{q:"You have 10 minutes left and the code isn't finished. Best move?",o:["Keep typing silently","Get the main flow working end to end and explain what's left","Delete everything","Start a new design"],a:1,why:"A working core beats an unfinished perfect design."},
{q:"Where should 'calculate parking fee' live?",o:["In main()","In a fee/pricing class (Strategy) used by the ticket or exit flow","In the Car class","In the database"],a:1,why:"Isolated pricing is easy to change and test."},
{q:"Why write a small driver/demo?",o:["Interviewers like long code","To prove the classes work together and show the flow","It's required by Python","To add more classes"],a:1,why:"Running code is convincing."},
{q:"Interviewer: 'Now add a VIP parking spot type.' A good design lets you…",o:["Rewrite everything","Add a new subclass or enum value without editing existing logic much","Delete regular spots","Change the database"],a:1,why:"That's the extensibility being tested."}],
"llm-apps":[
{q:"Your LLM bill doubles. Cheapest first step?",o:["Buy GPUs","Measure token usage per feature, trim prompts, cache repeated answers, route easy tasks to a smaller model","Turn off logging","Raise temperature"],a:1,why:"Tokens drive cost; most savings come from usage, not hardware."},
{q:"Temperature 0 is best for…",o:["Creative poems","Consistent extraction and classification","Brainstorming","Jokes"],a:1,why:"Low randomness = repeatable outputs."},
{q:"Why validate an LLM's JSON output before using it?",o:["It's always perfect","Models can return malformed or unexpected fields; validate and retry","For speed","For SEO"],a:1,why:"Never trust model output blindly."},
{q:"A system prompt is…",o:["The user's question","Instructions that set the model's role and rules for the conversation","An error message","The model's weights"],a:1,why:"It shapes behaviour for every turn."}],
"rag":[
{q:"Answers cite the wrong document section. Likely first thing to tune?",o:["The model size","Retrieval: chunking, hybrid search and reranking","Temperature","The UI colour"],a:1,why:"Bad context in → bad answer out."},
{q:"Chunks that are too large cause…",o:["Better precision","Diluted relevance and wasted context tokens","Faster indexing only","No effect"],a:1,why:"Big chunks mix many topics."},
{q:"When is fine-tuning better than RAG?",o:["For fresh, frequently changing facts","For teaching a consistent style or format, not new facts","Never","For permissions"],a:1,why:"RAG for knowledge, fine-tuning for behaviour."},
{q:"The model answers even when retrieval found nothing relevant. Fix?",o:["Higher temperature","Instruct it to say 'I don't know' without supporting context, and check groundedness","Remove citations","Bigger chunks"],a:1,why:"Prevents confident hallucinations."}],
"agents":[
{q:"An agent with a 'delete records' tool should…",o:["Run freely","Require confirmation or tight permissions for destructive actions","Have admin access","Run without logs"],a:1,why:"Least privilege plus human approval for risky steps."},
{q:"An agent loops calling the same tool forever. Guardrail?",o:["None needed","A maximum step/cost budget per task","Higher temperature","More tools"],a:1,why:"Bound loops and spending."},
{q:"A golden evaluation set is…",o:["The model weights","Real example inputs with expected outputs used to score changes","A payment ledger","A cache"],a:1,why:"It catches regressions before users do."},
{q:"Routing pattern in LLM workflows means…",o:["Network routing","Classifying the request and sending it to the right specialised prompt or model","DNS","Load balancing GPUs"],a:1,why:"Cheaper and more accurate than one prompt for everything."}],
"llm-serving":[
{q:"Time to first token is slow because prompts are huge. Lever?",o:["Bigger output","Shorter prompts or prefix (prompt) caching","More logging","Lower batch size to 1"],a:1,why:"Prefill time grows with prompt length."},
{q:"Quantising a model to 8-bit or 4-bit mainly…",o:["Improves accuracy","Cuts memory and cost, with a small quality trade-off","Adds GPUs","Removes the KV cache"],a:1,why:"Fewer bits per weight → smaller footprint."},
{q:"Per-tenant token budgets in an enterprise gateway prevent…",o:["Hallucinations","One team's runaway usage from exhausting shared capacity and budget","Latency","Encryption"],a:1,why:"Fairness and cost control."},
{q:"Why stream tokens to the user?",o:["It's cheaper","The answer starts appearing sooner, which feels faster","It's required","It improves accuracy"],a:1,why:"Perceived latency drops even if total time is the same."}]
};
Object.entries(MOREQ).forEach(([id,qs],ti)=>{const t=TOPICS.find(x=>x.id===id);if(!t)return;
  qs.forEach((q,qi)=>{const n=q.o.length,k=(ti*3+qi*5+id.length)%n;if(k){q.o=q.o.slice(k).concat(q.o.slice(0,k));q.a=(q.a-k+n)%n;}t.quiz.push(q);});});

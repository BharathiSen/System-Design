/* ===== Five more topics freshers get asked about ===== */
T({id:"http-caching",w:2,title:"HTTP caching: Cache-Control and ETags",mins:12,
tldr:"Browsers and CDNs cache responses based on <b>headers</b>. <b>Cache-Control</b> says who may cache and for how long; <b>ETag</b> lets a client ask \"has it changed?\" and get a tiny <b>304 Not Modified</b> instead of the full body.",
notes:`<h3>The headers that matter</h3>
<table><tr><th>Header</th><th>Meaning</th></tr>
<tr><td><code>Cache-Control: max-age=31536000, immutable</code></td><td>Cache for a year and never revalidate. Use for files with a version or hash in the name (<code>app.3f9a.js</code>).</td></tr>
<tr><td><code>Cache-Control: no-cache</code></td><td>You may store it, but must revalidate with the server before each use. (It does <i>not</i> mean "don't cache".)</td></tr>
<tr><td><code>Cache-Control: no-store</code></td><td>Never store it anywhere. Use for sensitive data like bank statements.</td></tr>
<tr><td><code>Cache-Control: private</code> / <code>public</code></td><td><code>private</code>: only the user's browser may cache it, not shared caches like CDNs. <code>public</code>: shared caches may too.</td></tr>
<tr><td><code>s-maxage</code></td><td>A separate lifetime for shared caches (CDNs), overriding <code>max-age</code> there.</td></tr></table>
<h3>Revalidation with ETags</h3>
<ol><li>Server responds with <code>ETag: "v42"</code> (a fingerprint of the content).</li><li>Later the browser asks again with <code>If-None-Match: "v42"</code>.</li><li>If unchanged, the server replies <b>304 Not Modified</b> with no body, saving bandwidth. If changed, it sends 200 with the new body and a new ETag.</li></ol>
<p><code>Last-Modified</code> / <code>If-Modified-Since</code> does the same with timestamps, but is coarser.</p>
<h3>A sensible policy for a web app</h3>
<ul><li><b>Hashed static assets</b> (JS, CSS, images): <code>max-age=31536000, immutable</code>. Deploying a new version changes the file name, so there's nothing stale to purge.</li>
<li><b>HTML pages</b>: <code>no-cache</code> plus an ETag, so users always get the latest page that points at the new asset names.</li>
<li><b>Personal API responses</b>: <code>private</code> (or <code>no-store</code> when sensitive).</li>
<li><b>Public API data</b> (e.g. product listings): a short <code>s-maxage</code> at the CDN, like 30–60 s, absorbs huge read spikes.</li></ul>
<h3>Vary</h3><p><code>Vary: Accept-Encoding</code> tells caches to store separate copies per value of that request header (gzip vs brotli). Be careful with <code>Vary: Cookie</code>: it can destroy CDN hit rates.</p>`,
diagram:{w:760,h:200,n:[["b",80,100,"Browser","private cache","client"],["cdn",330,100,"CDN edge","shared cache","edge"],["o",590,100,"Origin","sets headers","svc"]],e:[["b","cdn","If-None-Match",0,1],["cdn","o","on miss / revalidate",0,1]]},
dcap:"Browsers and CDNs both cache. Headers from the origin decide who may store what, and for how long.",
real:`Most sites ship JS and CSS with a content hash in the file name and a one-year <code>immutable</code> lifetime, while the HTML that references them is revalidated on every visit. A deploy then only needs new HTML; old assets simply stop being requested.`,
say:["\"Static assets get content-hashed names and a one-year immutable cache; HTML is no-cache with ETags, so a deploy is visible immediately.\"","\"For the public product API I'd set s-maxage=60 so the CDN absorbs read spikes.\""],
traps:["Thinking <code>no-cache</code> means 'never cache'. That's <code>no-store</code>.","Caching personalised responses as <code>public</code> on a CDN, leaking one user's data to another."],
src:[["MDN: HTTP caching","https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching"]],
quiz:[
{q:"Which header value means 'store it, but check with the server before every use'?",o:["no-store","no-cache","max-age=0, immutable","public"],a:1,why:"no-cache = revalidate before use; no-store = never store."},
{q:"A browser sends If-None-Match with the old ETag and nothing changed. The server replies…",o:["200 with the full body","304 Not Modified with no body","404","500"],a:1,why:"304 saves sending the body again."},
{q:"Best caching for app.3f9a1c.js (hash in the name)?",o:["no-store","max-age=31536000, immutable","no-cache","private, max-age=60"],a:1,why:"The name changes when content changes, so cache it 'forever'."},
{q:"A user's account page should be cached…",o:["public on the CDN for a day","private (browser only) or not at all","with s-maxage=3600","with Vary: *"],a:1,why:"Never share personalised data through a shared cache."},
{q:"s-maxage applies to…",o:["Only browsers","Shared caches like CDNs and proxies","Only POST requests","Cookies"],a:1,why:"It overrides max-age for shared caches."},
{q:"Why serve HTML with no-cache but assets with a long max-age?",o:["HTML is smaller","HTML must point to the newest asset names right after a deploy","Assets never change","Browsers require it"],a:1,why:"Fresh HTML + immutable hashed assets = instant, safe deploys."},
{q:"Adding Vary: Cookie on a CDN-cached page usually…",o:["Improves hit rate","Ruins the hit rate, since every cookie value gets its own copy","Has no effect","Encrypts the page"],a:1,why:"Each user's cookies differ, so the cache fragments."}]});

T({id:"security",w:2,title:"Security basics for system design",mins:15,
tldr:"Encrypt <b>in transit</b> (TLS) and <b>at rest</b>, never trust input, give every component <b>least privilege</b>, keep <b>secrets</b> out of code, and know the common attack classes (injection, XSS, CSRF, broken access control).",
notes:`<h3>Encryption</h3>
<ul><li><b>In transit</b>: HTTPS/TLS everywhere, including service-to-service inside your network (often via a service mesh with mutual TLS).</li>
<li><b>At rest</b>: disks, databases and object storage encrypted (e.g. AES-256), with keys held in a <b>KMS</b> (key management service), not next to the data.</li>
<li><b>Passwords</b> are never encrypted; they're <b>hashed</b> with a slow, salted algorithm (bcrypt, scrypt, Argon2).</li></ul>
<h3>Common attacks and their standard fixes</h3>
<table><tr><th>Attack</th><th>What happens</th><th>Fix</th></tr>
<tr><td>SQL injection</td><td>User input becomes part of a SQL command</td><td>Parameterised queries / ORM; never build SQL by string concatenation</td></tr>
<tr><td>XSS (cross-site scripting)</td><td>Attacker's script runs in other users' browsers</td><td>Escape output, Content-Security-Policy, HttpOnly cookies</td></tr>
<tr><td>CSRF</td><td>Another site makes the user's browser send a request with their cookies</td><td>SameSite cookies, CSRF tokens</td></tr>
<tr><td>Broken access control (IDOR)</td><td><code>/orders/1002</code> shows someone else's order</td><td>Check ownership on every request, server-side</td></tr>
<tr><td>Brute force / credential stuffing</td><td>Bots try many passwords</td><td>Rate limits, lockouts, MFA</td></tr>
<tr><td>DDoS</td><td>Floods of traffic</td><td>CDN/WAF at the edge, rate limiting, autoscaling</td></tr></table>
<p>Broken access control is #1 on the OWASP Top 10 (2021). Injection is also in the list.</p>
<h3>Secrets</h3>
<ul><li>Never commit API keys or DB passwords to Git. Use a <b>secrets manager</b> (AWS Secrets Manager, HashiCorp Vault) or environment variables injected at deploy time.</li>
<li>Rotate secrets, and give each service its own credentials with only the permissions it needs (<b>least privilege</b>).</li></ul>
<h3>Defence in depth</h3><p>Layers: WAF and rate limits at the edge → authentication at the gateway → authorisation in each service → encrypted data → audit logs. One failed layer shouldn't expose everything.</p>`,
real:`Many real data leaks come from misconfiguration rather than clever hacking: storage buckets accidentally left public, or secrets committed to public repositories. That's why cloud providers now block public bucket access by default and GitHub scans pushes for leaked keys.`,
say:["\"All traffic is TLS, including internal calls; data at rest is encrypted with keys in KMS.\"","\"Every order endpoint checks that the order belongs to the caller. Never trust the ID in the URL alone.\""],
traps:["Saying passwords are 'encrypted'. They're hashed with a slow, salted function.","Only authenticating at the gateway and forgetting per-resource authorisation (IDOR)."],
src:[["OWASP Top 10","https://owasp.org/www-project-top-ten/"]],
quiz:[
{q:"Best defence against SQL injection?",o:["Escaping quotes by hand","Parameterised queries","Hiding error messages","HTTPS"],a:1,why:"Input is sent as data, never as SQL code."},
{q:"GET /orders/1002 returns another customer's order. This is…",o:["XSS","Broken access control (IDOR)","CSRF","A DDoS"],a:1,why:"The server didn't check ownership."},
{q:"Where should a database password for a production service live?",o:["In the Git repo","In a secrets manager, injected at runtime","In the frontend code","In the README"],a:1,why:"Keep secrets out of code and version control."},
{q:"Encryption 'at rest' protects against…",o:["Network sniffing","Someone getting the raw disk or backup files","SQL injection","XSS"],a:1,why:"Stored data is unreadable without the keys."},
{q:"SameSite cookies mainly help prevent…",o:["CSRF","SQL injection","Brute force","Slow queries"],a:0,why:"Browsers won't send the cookie on most cross-site requests."},
{q:"Least privilege means…",o:["Everyone is admin","Each user/service gets only the permissions it needs","No passwords","One shared account"],a:1,why:"It limits damage when something is compromised."},
{q:"An attacker's script runs in other users' browsers via a comment field. Fix?",o:["Bigger servers","Escape/sanitise output and use a Content-Security-Policy","Use UDP","Add an index"],a:1,why:"That's XSS; never render untrusted input as HTML."}]});

T({id:"deployment",w:4,title:"Deployment: Docker, CI/CD, blue-green and canary",mins:14,
tldr:"Package apps as <b>containers</b>, let a <b>CI/CD pipeline</b> test and ship every change, and release safely with <b>rolling</b>, <b>blue-green</b> or <b>canary</b> deploys plus <b>feature flags</b>, so a bad release can be rolled back in minutes.",
notes:`<h3>Containers</h3>
<p>A <b>Docker image</b> bundles your code with its runtime and libraries, so it runs the same on a laptop and in production. <b>Kubernetes</b> (or ECS) runs many containers across machines, restarts crashed ones, and scales them.</p>
<h3>CI/CD pipeline</h3>
<ol><li><b>CI</b> (continuous integration): on every push, build, run unit tests, lint, and scan dependencies.</li><li>Build an image tagged with the commit SHA and push it to a registry.</li><li><b>CD</b> (continuous delivery/deployment): deploy to staging, run integration tests, then promote to production, automatically or with one approval.</li></ol>
<h3>Release strategies</h3>
<table><tr><th>Strategy</th><th>How</th><th>Pros / cons</th></tr>
<tr><td>Rolling</td><td>Replace instances a few at a time</td><td>No extra servers; old and new versions run side by side for a while</td></tr>
<tr><td>Blue-green</td><td>Bring up a full new environment (green), then switch traffic from blue at the load balancer</td><td>Instant switch and instant rollback; needs double capacity during the switch</td></tr>
<tr><td>Canary</td><td>Send 1–5% of traffic to the new version, watch metrics, then ramp up</td><td>Limits the blast radius; needs good monitoring</td></tr>
<tr><td>Feature flags</td><td>Ship code turned off, enable per user or percentage</td><td>Separates deploy from release; flags need cleaning up</td></tr></table>
<h3>Database changes</h3><p>Old and new code run together during a deploy, so schema changes must be <b>backward compatible</b>: <b>expand</b> (add a nullable column) → deploy code that uses it → backfill → <b>contract</b> (drop the old column later). Never rename or drop a column in the same release that stops using it.</p>`,
diagram:{w:760,h:220,n:[["dev",70,110,"Git push","","client"],["ci",230,110,"CI","build + test","svc"],["reg",400,110,"Registry","image:sha","db"],["lb",560,110,"Load balancer","95% / 5%","edge"],["blue",700,60,"Current","v41","svc"],["green",700,165,"Canary","v42","svc"]],e:[["dev","ci"],["ci","reg","push image"],["reg","lb","deploy"],["lb","blue"],["lb","green","5%",1]]},
dcap:"A push triggers build and tests; the new image goes to a small canary slice first, then everyone.",
real:`Large companies rely heavily on canary releases and automated rollback: a new version gets a small share of traffic, and if error rates or latency get worse than the current version's, the rollout stops automatically before most users notice.`,
say:["\"I'd deploy with a canary at 5%, compare error rate and p99 against the current version, and auto-rollback on regression.\"","\"Schema changes follow expand-and-contract, so old and new code can run at the same time.\""],
traps:["Dropping or renaming a DB column in the same deploy, which breaks the instances still running old code.","Treating deploy and release as the same thing. Feature flags let you ship dark and turn things on later."],
src:[["Martin Fowler: Blue-green deployment","https://martinfowler.com/bliki/BlueGreenDeployment.html"]],
quiz:[
{q:"Main benefit of a Docker image?",o:["Faster CPUs","The same packaged app runs identically everywhere","Free hosting","No need for tests"],a:1,why:"It bundles code with its runtime and dependencies."},
{q:"Blue-green deployment gives you…",o:["No extra cost","An instant switch and instant rollback between two full environments","Automatic DB migrations","Canary metrics"],a:1,why:"Flip traffic at the load balancer; flip back if needed."},
{q:"A canary release sends the new version…",o:["To all users","To a small percentage first while you watch metrics","Only to developers","Nowhere"],a:1,why:"It limits the blast radius of a bad release."},
{q:"You must rename a DB column with zero downtime. Safe approach?",o:["Rename it in one release","Expand and contract: add the new column, migrate, switch code, drop the old one later","Stop the site","Use NoSQL"],a:1,why:"Old and new code must both work during the rollout."},
{q:"Feature flags let you…",o:["Skip testing","Deploy code switched off and enable it gradually or per user","Avoid Git","Encrypt traffic"],a:1,why:"Separates deploying from releasing."},
{q:"CI's main job on every push?",o:["Deploy to production directly","Build and run automated tests to catch problems early","Write documentation","Resize servers"],a:1,why:"Fast feedback before anything ships."},
{q:"Why tag images with the commit SHA instead of 'latest'?",o:["Shorter names","You know exactly what's running and can roll back to an exact version","It's faster to pull","Docker requires it"],a:1,why:"Reproducible, traceable deploys."}]});

T({id:"concurrency",w:7,title:"Concurrency for LLD: threads, locks, deadlocks",mins:15,
tldr:"When two threads touch shared data, a <b>race condition</b> can corrupt it. Protect critical sections with <b>locks</b> (or atomic operations), keep them short, always take multiple locks in the <b>same order</b> to avoid <b>deadlock</b>, and prefer thread-safe structures like queues.",
notes:`<h3>Race condition</h3>
<pre><code>if spot.is_free:        # thread A checks… thread B checks too
    spot.assign(car)    # both assign the same spot!</code></pre>
<p>"Check then act" on shared data is the classic bug. Make the check and the update one atomic step.</p>
<h3>Locks in Python</h3>
<pre><code>import threading
class ParkingLot:
    def __init__(self):
        self._lock = threading.Lock()
    def park(self, car):
        with self._lock:                # only one thread at a time in here
            spot = self._find_free_spot()
            if spot is None:
                return None
            spot.assign(car)
            return spot</code></pre>
<ul><li><b>Lock / mutex</b>: one holder at a time. <b>RLock</b>: the same thread can re-enter.</li>
<li><b>Semaphore(n)</b>: up to n holders, e.g. limit 5 concurrent downloads.</li>
<li><b>Condition / Event</b>: wait until something happens.</li>
<li><b>queue.Queue</b> is thread-safe, which makes it ideal for producer–consumer.</li></ul>
<h3>Deadlock</h3><p>Thread 1 holds lock A and waits for B; thread 2 holds B and waits for A. Nobody moves. Prevent it by <b>always acquiring locks in a fixed global order</b>, using timeouts (<code>lock.acquire(timeout=1)</code>), or holding only one lock at a time.</p>
<h3>Lock granularity</h3><p>One global lock is simple but serialises everything. Per-object locks (one per parking floor, one per account) allow more parallelism but raise deadlock risk when an operation needs two of them, like a transfer between two accounts. Then lock them in ID order.</p>
<h3>Python specifics worth knowing</h3><p>CPython's <b>GIL</b> lets only one thread run Python bytecode at a time, so threads help with I/O-bound work but not CPU-bound work. Use <code>multiprocessing</code> for CPU-bound work. The GIL does <i>not</i> make your check-then-act code safe; you still need locks.</p>`,
real:`Booking systems face exactly this race at scale. Inside one process a lock works; across many servers the same idea moves into the database (a conditional UPDATE or row lock) or a distributed lock, as in the Ticketmaster problem.`,
say:["\"Two threads could both see spot 7 free, so the find-and-assign runs under a lock as one critical section.\"","\"For transfers I lock both accounts in ascending ID order to avoid deadlock.\""],
traps:["Assuming the GIL makes code thread-safe. It doesn't protect multi-step operations.","Holding a lock while doing slow I/O (network calls), which blocks every other thread."],
src:[["Python docs: threading","https://docs.python.org/3/library/threading.html"]],
quiz:[
{q:"Two threads both read balance=100 and both write 100-30. Final balance is 70, not 40. This is…",o:["A deadlock","A race condition (lost update)","A memory leak","Starvation"],a:1,why:"Unsynchronised read-modify-write."},
{q:"Simplest fix for the bug above in one Python process?",o:["Sleep between steps","Wrap the read-modify-write in a threading.Lock","Use more threads","Print logs"],a:1,why:"Makes the critical section atomic."},
{q:"Thread 1 locks A then waits for B; thread 2 locks B then waits for A. This is…",o:["Livelock","Deadlock","A race condition","Thrashing"],a:1,why:"Circular wait."},
{q:"Most common way to prevent deadlocks between locks?",o:["Use more locks","Always acquire locks in the same global order","Never use locks","Use bigger servers"],a:1,why:"Breaks the circular wait."},
{q:"Limit a service to 5 simultaneous outgoing API calls. Use…",o:["Lock","Semaphore(5)","Event","Global variable"],a:1,why:"A semaphore allows up to n holders."},
{q:"Python's GIL means…",o:["Your code is automatically thread-safe","Only one thread runs Python bytecode at a time, but check-then-act races still happen","Threads are banned","Locks are not needed for lists ever"],a:1,why:"The GIL doesn't make multi-step operations atomic."},
{q:"A thread-safe way for producers to hand jobs to worker threads?",o:["A shared list with no lock","queue.Queue","A global integer","A file on disk"],a:1,why:"queue.Queue handles locking internally."}]});

T({id:"cloud-map",w:6,title:"Cloud mapping: AWS names for your boxes",mins:10,
tldr:"Interviewers often say \"assume AWS\". Know the managed service behind each box you draw: <b>ALB</b> (load balancer), <b>EC2/ECS/EKS/Lambda</b> (compute), <b>RDS/Aurora</b> (SQL), <b>DynamoDB</b> (NoSQL), <b>ElastiCache</b> (Redis), <b>S3</b> (blobs), <b>CloudFront</b> (CDN), <b>SQS/SNS/Kinesis/MSK</b> (messaging).",
notes:`<h3>The mapping table</h3>
<table><tr><th>Box in your diagram</th><th>AWS</th><th>GCP</th><th>Azure</th></tr>
<tr><td>DNS</td><td>Route 53</td><td>Cloud DNS</td><td>Azure DNS</td></tr>
<tr><td>CDN</td><td>CloudFront</td><td>Cloud CDN</td><td>Azure Front Door / CDN</td></tr>
<tr><td>Load balancer</td><td>ALB (L7), NLB (L4)</td><td>Cloud Load Balancing</td><td>Application Gateway / Load Balancer</td></tr>
<tr><td>API gateway</td><td>API Gateway</td><td>API Gateway / Apigee</td><td>API Management</td></tr>
<tr><td>Servers / containers</td><td>EC2, ECS, EKS (Kubernetes)</td><td>Compute Engine, GKE, Cloud Run</td><td>VMs, AKS, Container Apps</td></tr>
<tr><td>Serverless functions</td><td>Lambda</td><td>Cloud Functions</td><td>Azure Functions</td></tr>
<tr><td>SQL database</td><td>RDS, Aurora</td><td>Cloud SQL, Spanner</td><td>Azure SQL, PostgreSQL Flexible Server</td></tr>
<tr><td>Key-value / NoSQL</td><td>DynamoDB</td><td>Firestore, Bigtable</td><td>Cosmos DB</td></tr>
<tr><td>Cache</td><td>ElastiCache (Redis/Memcached)</td><td>Memorystore</td><td>Azure Cache for Redis</td></tr>
<tr><td>Blob storage</td><td>S3</td><td>Cloud Storage</td><td>Blob Storage</td></tr>
<tr><td>Queue</td><td>SQS</td><td>Pub/Sub</td><td>Service Bus / Queue Storage</td></tr>
<tr><td>Pub/sub fan-out</td><td>SNS, EventBridge</td><td>Pub/Sub</td><td>Event Grid</td></tr>
<tr><td>Event stream (Kafka)</td><td>Kinesis, MSK</td><td>Pub/Sub, Dataflow</td><td>Event Hubs</td></tr>
<tr><td>Search</td><td>OpenSearch Service</td><td>Elastic on GCP / Vertex AI Search</td><td>Azure AI Search</td></tr>
<tr><td>Secrets / keys</td><td>Secrets Manager, KMS</td><td>Secret Manager, Cloud KMS</td><td>Key Vault</td></tr>
<tr><td>Metrics / logs</td><td>CloudWatch, X-Ray</td><td>Cloud Monitoring, Cloud Trace</td><td>Azure Monitor</td></tr></table>
<h3>Regions and availability zones</h3><p>A <b>region</b> (e.g. ap-south-1, Mumbai) contains several <b>availability zones</b>: separate data centres with independent power and networking. Spread servers and DB replicas across at least 2 AZs for high availability; go multi-region only when you need disaster recovery or global latency.</p>
<h3>Managed vs self-hosted</h3><p>Managed services (RDS, ElastiCache) handle backups, patching and failover for you, which is usually the right call in an interview. Self-host (Kafka on EC2) only for special needs or cost at very large scale.</p>`,
real:`A typical startup stack on AWS: Route 53 → CloudFront → ALB → ECS services → RDS Postgres (Multi-AZ) + ElastiCache Redis, with S3 for uploads and SQS for background jobs. That one sentence covers most fresher-level designs.`,
say:["\"On AWS: CloudFront in front, an ALB to ECS services across two AZs, Aurora Postgres with a read replica, ElastiCache for hot reads, and SQS for async jobs.\""],
traps:["Naming services without saying why (\"Lambda because it's cool\"). Tie each to a requirement.","Confusing SQS (a queue: each message goes to one consumer) with SNS (pub/sub: fan-out to many subscribers)."],
src:[["AWS Well-Architected Framework","https://aws.amazon.com/architecture/well-architected/"]],
quiz:[
{q:"An L7 load balancer on AWS is…",o:["NLB","ALB","Route 53","S3"],a:1,why:"Application Load Balancer routes on HTTP paths and headers."},
{q:"Where would you store user-uploaded videos on AWS?",o:["RDS","S3","SQS","ElastiCache"],a:1,why:"S3 is object (blob) storage."},
{q:"Managed Redis on AWS is…",o:["DynamoDB","ElastiCache","Aurora","Kinesis"],a:1,why:"ElastiCache runs Redis or Memcached."},
{q:"SQS vs SNS?",o:["Same service","SQS is a queue (one consumer per message); SNS fans out to many subscribers","SNS stores files","SQS is a database"],a:1,why:"Queue vs pub/sub."},
{q:"For high availability within one region, spread instances across…",o:["Two regions always","At least two availability zones","One big server","Edge locations"],a:1,why:"AZs are independent data centres in a region."},
{q:"A serverless function service on AWS?",o:["EC2","Lambda","EKS","EBS"],a:1,why:"Lambda runs code without managing servers."},
{q:"Why prefer managed databases (RDS/Aurora) in an interview design?",o:["They're free","Backups, patching and failover are handled for you","They have no limits","They avoid SQL"],a:1,why:"Less operational burden; focus on the design."}]});

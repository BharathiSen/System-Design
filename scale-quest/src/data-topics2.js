/* ===== Topics part 2: Data & Storage, Async & Reliability ===== */
T({id:"sql-nosql",w:3,title:"SQL vs NoSQL",mins:14,
tldr:"Default to <b>SQL</b> (Postgres) for relations and transactions. Reach for <b>NoSQL</b> when access is simple key-based lookups at huge scale, or the shape is genuinely flexible.",
notes:`<table><tr><th>Type</th><th>Model</th><th>Examples</th><th>Great for</th></tr>
<tr><td>Relational</td><td>Tables, joins, ACID</td><td>PostgreSQL, MySQL</td><td>Users, orders, payments, anything relational</td></tr>
<tr><td>Key-value</td><td>key → blob</td><td>Redis, DynamoDB</td><td>Sessions, caches, carts, counters</td></tr>
<tr><td>Document</td><td>JSON documents</td><td>MongoDB, Firestore</td><td>Catalogues, profiles with varying fields</td></tr>
<tr><td>Wide-column</td><td>Partition key + clustering columns</td><td>Cassandra, ScyllaDB, HBase</td><td>Massive write-heavy time-ordered data: messages, events, IoT</td></tr>
<tr><td>Graph</td><td>Nodes + edges</td><td>Neo4j</td><td>Friend-of-friend, fraud rings, recommendations</td></tr>
<tr><td>Search</td><td>Inverted index</td><td>Elasticsearch, OpenSearch</td><td>Full-text, fuzzy search, filters</td></tr>
<tr><td>Time-series</td><td>Time-bucketed</td><td>InfluxDB, TimescaleDB</td><td>Metrics, monitoring</td></tr>
<tr><td>Vector</td><td>Embeddings + ANN index</td><td>pgvector, Pinecone, Milvus</td><td>Semantic search, RAG</td></tr></table>
<h3>How to decide out loud</h3><ol><li>Do I need transactions across rows/tables? → SQL.</li><li>Are queries ad-hoc with joins? → SQL.</li><li>Is it one access pattern (get by key / range by partition) at 100k+ writes/s? → wide-column or KV.</li><li>Is the schema truly variable per record? → document (or Postgres JSONB).</li></ol>
<p>"NoSQL scales, SQL doesn't" is outdated: Postgres with read replicas and partitioning handles a lot; NoSQL trades joins and flexible queries for easy horizontal scaling.</p>`,
real:`Discord moved messages from MongoDB to Cassandra and later to ScyllaDB, because chat is write-heavy and read by (channel, time) — a perfect wide-column access pattern.`,
say:["\"Orders and payments need transactions, so Postgres. Chat messages are append-heavy and read by channel + time, so Cassandra keyed by (channel_id, bucket) with message_id clustering.\""],
traps:["Choosing MongoDB \"because it scales\" without naming the access pattern.","Forgetting that Cassandra queries must follow the partition key; you design tables per query."],
src:[["Discord: storing trillions of messages","https://discord.com/blog/how-discord-stores-trillions-of-messages"]],
quiz:[
{q:"A bank ledger with transfers between accounts. Best store?",o:["Cassandra","Redis","PostgreSQL","Elasticsearch"],a:2,why:"Needs multi-row ACID transactions."},
{q:"Billions of chat messages, read as 'latest 50 in channel X'. Good fit?",o:["Neo4j","Wide-column (Cassandra) partitioned by channel","Elasticsearch as primary store","A single MySQL table without partitioning"],a:1,why:"Write-heavy, partition = channel, clustering = time."},
{q:"Find friends-of-friends who like the same pages. Natural model?",o:["Graph DB","Key-value","Time-series","Blob store"],a:0,why:"Multi-hop relationship traversal is what graph DBs do well."}]});

T({id:"acid",w:3,title:"Transactions, ACID and isolation levels",mins:14,
tldr:"<b>ACID</b> = Atomic, Consistent, Isolated, Durable. <b>Isolation levels</b> trade correctness for concurrency; know which anomaly each one prevents.",
notes:`<ul><li><b>Atomicity</b>: all or nothing (transfer debits and credits together).</li><li><b>Consistency</b>: constraints hold before and after (balance ≥ 0, foreign keys).</li><li><b>Isolation</b>: concurrent transactions don't see each other's half-done work.</li><li><b>Durability</b>: once committed, survives a crash (write-ahead log).</li></ul>
<h3>Isolation levels (SQL standard)</h3><table><tr><th>Level</th><th>Dirty read</th><th>Non-repeatable read</th><th>Phantom</th></tr>
<tr><td>Read uncommitted</td><td>possible</td><td>possible</td><td>possible</td></tr>
<tr><td>Read committed (Postgres default)</td><td>no</td><td>possible</td><td>possible</td></tr>
<tr><td>Repeatable read (MySQL InnoDB default)</td><td>no</td><td>no</td><td>possible*</td></tr>
<tr><td>Serializable</td><td>no</td><td>no</td><td>no</td></tr></table>
<p class="small">*Postgres' repeatable read is snapshot isolation and also blocks phantoms, but still allows write skew; only Serializable prevents that.</p>
<h3>Handling concurrent updates</h3><ul><li><b>Pessimistic</b>: <code>SELECT … FOR UPDATE</code> locks the row. Good under high contention (seat booking).</li><li><b>Optimistic</b>: a <code>version</code> column; <code>UPDATE … SET v=v+1 WHERE id=? AND v=?</code>; retry if 0 rows. Good when conflicts are rare.</li><li>Atomic statements: <code>UPDATE stock SET qty = qty - 1 WHERE id=? AND qty &gt; 0</code>.</li></ul>`,
say:["\"Inventory decrement is one conditional UPDATE, so two buyers can't take the last item.\""],
traps:["Read-then-write in app code (read qty, check, write) without a lock or condition: classic race.","Saying Serializable is free. It costs throughput and causes retries."],
quiz:[
{q:"Two users try to book the last seat at the same time. Simplest correct SQL approach?",o:["Read the seat, then update it in app code","UPDATE seats SET user=? WHERE id=? AND user IS NULL and check rows affected","Use Read Uncommitted","Cache the seat in Redis without TTL"],a:1,why:"The condition makes the write atomic; only one update succeeds."},
{q:"Which ACID property is provided by the write-ahead log surviving a crash?",o:["Atomicity only","Consistency","Isolation","Durability"],a:3,why:"Committed data is on disk in the WAL before success is returned."},
{q:"Optimistic locking is best when…",o:["Conflicts are frequent","Conflicts are rare","You need distributed transactions","Reads are rare"],a:1,why:"No lock overhead; occasional retries are cheap."}]});

T({id:"indexing",w:3,title:"Indexes: B-trees and LSM trees",mins:14,
tldr:"An index trades <b>write cost and space</b> for <b>fast reads</b>. B-trees power most SQL indexes; <b>LSM trees</b> power write-heavy stores like Cassandra and RocksDB.",
notes:`<h3>Without vs with an index</h3><p>No index = full table scan, O(n). B-tree index = O(log n) lookup and fast range scans in sorted order.</p>
<h3>Index types</h3><ul><li><b>Composite</b> <code>(user_id, created_at)</code>: follows the <b>leftmost-prefix rule</b>: serves <code>WHERE user_id=?</code> and <code>WHERE user_id=? ORDER BY created_at</code>, but not <code>WHERE created_at=?</code> alone.</li><li><b>Covering</b>: contains every column the query needs → index-only scan.</li><li><b>Partial</b>: <code>WHERE status='pending'</code> only, small and hot.</li><li><b>Hash</b>: equality only. <b>GIN</b>: JSONB / full-text. <b>Geo</b>: GiST/R-tree.</li></ul>
<h3>B-tree vs LSM tree</h3><table><tr><th>B-tree</th><th>LSM tree</th></tr><tr><td>Updates pages in place</td><td>Appends to an in-memory memtable → flushed to sorted SSTables → compacted</td></tr><tr><td>Fast reads, slower random writes</td><td>Very fast writes, reads may check several files (Bloom filters help)</td></tr><tr><td>Postgres, MySQL</td><td>Cassandra, RocksDB, LevelDB, ScyllaDB</td></tr></table>
<h3>Practise</h3><p>Run <code>EXPLAIN ANALYZE</code> before and after adding an index; look for "Seq Scan" turning into "Index Scan".</p>`,
say:["\"I'd add a composite index on (user_id, created_at DESC) so the 'my latest orders' query is an index range scan.\""],
traps:["Indexing every column: each index slows inserts/updates and uses memory.","Composite index column order doesn't matter (it does)."],
quiz:[
{q:"Index on (country, city). Which query can use it efficiently?",o:["WHERE city='Chennai'","WHERE country='IN' AND city='Chennai'","WHERE zip='600001'","ORDER BY city"],a:1,why:"Leftmost-prefix rule: country first."},
{q:"Why are LSM trees good for write-heavy workloads?",o:["They update pages in place","Writes are sequential appends to memory then sorted files","They don't persist data","They have no compaction"],a:1,why:"Sequential writes are fast; compaction happens in the background."},
{q:"Cost of adding more indexes?",o:["Slower reads","Slower writes and more storage","Lost durability","Weaker isolation"],a:1,why:"Every insert/update must also update each index."}]});

T({id:"replication",w:3,title:"Replication",mins:13,
tldr:"Keep copies of data on several nodes for <b>availability</b> and <b>read scale</b>. Leader-follower is the default; async replicas lag, so plan for <b>stale reads</b>.",
notes:`<h3>Topologies</h3><ul><li><b>Single leader</b> (primary/replica): writes to leader, replicated to followers; reads can go to followers. Most SQL setups.</li><li><b>Multi-leader</b>: several leaders (e.g. one per region) accept writes → must resolve conflicts (last-write-wins, CRDTs).</li><li><b>Leaderless</b> (Dynamo style): write to W of N replicas, read from R; quorum W+R&gt;N. Cassandra, DynamoDB.</li></ul>
<h3>Sync vs async</h3><table><tr><th>Synchronous</th><th>Asynchronous</th></tr><tr><td>Leader waits for follower ack → no data loss on failover</td><td>Leader replies immediately → fast, but recent writes may be lost on failover</td></tr><tr><td>Higher write latency; a slow follower blocks writes</td><td>Followers lag (replication lag)</td></tr></table>
<p>Common compromise: <b>semi-synchronous</b> (one sync follower, rest async).</p>
<h3>Replication lag problems and fixes</h3><ul><li><b>Read-your-writes</b>: after a user edits their profile, read their own profile from the leader for a few seconds.</li><li><b>Monotonic reads</b>: pin a user to one replica so time doesn't go backwards.</li><li><b>Failover</b>: detect leader death (heartbeats), promote the most up-to-date follower, fence the old leader to avoid split-brain.</li></ul>`,
diagram:{w:760,h:220,n:[["app",90,110,"App servers","","svc"],["l",320,60,"Primary","writes","db"],["f1",560,40,"Replica A","reads","db"],["f2",560,110,"Replica B","reads","db"],["f3",560,180,"Replica C","other AZ","db"]],e:[["app","l","writes"],["l","f1","WAL stream"],["l","f2"],["l","f3"],["app","f2","reads",1]]},dcap:"Leader-follower: writes go to the primary, reads fan out to replicas that may lag slightly.",
say:["\"Reads go to replicas, but a user's own profile reads hit the primary right after they write, to avoid read-your-write anomalies.\""],
traps:["Replicas don't help write throughput; that needs sharding.","Ignoring split-brain: two nodes both believing they're leader."],
quiz:[
{q:"A user updates their bio and immediately sees the old one. Cause?",o:["Cache stampede","Replication lag on an async replica","Deadlock","Phantom read"],a:1,why:"The read hit a follower that hadn't applied the write yet."},
{q:"Adding read replicas mainly increases…",o:["Write throughput","Read throughput and availability","Storage per row","Strong consistency"],a:1,why:"Writes still all go through the leader."},
{q:"Which replication style needs conflict resolution?",o:["Single-leader sync","Single-leader async","Multi-leader","None"],a:2,why:"Two leaders can accept conflicting writes to the same row."}]});

T({id:"sharding",w:3,title:"Partitioning and sharding",mins:15,
tldr:"<b>Sharding</b> splits data across machines by a <b>shard key</b> so writes and storage scale. Pick the key to spread load evenly and keep common queries on <b>one shard</b>.",
notes:`<h3>Strategies</h3><table><tr><th>Strategy</th><th>How</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Range</td><td>A–F on shard 1, G–M on shard 2… or by date</td><td>Range scans are easy</td><td>Hot spots (everyone writes "today")</td></tr>
<tr><td>Hash</td><td>hash(key) mod N</td><td>Even spread</td><td>Range queries scatter; changing N moves almost everything</td></tr>
<tr><td>Consistent hash</td><td>Keys and nodes on a ring</td><td>Adding a node moves ~1/N of keys</td><td>Needs virtual nodes to balance</td></tr>
<tr><td>Directory</td><td>Lookup table key → shard</td><td>Flexible moves</td><td>Lookup service is a dependency/SPOF</td></tr></table>
<h3>Choosing a shard key</h3><ul><li>High cardinality, evenly used (user_id, tenant_id), not monotonically increasing on a range scheme.</li><li>Matches the main query: chat by <code>channel_id</code>, orders by <code>user_id</code>.</li><li>Hot keys (celebrity, huge tenant): split further (add a suffix: <code>key#0..9</code>) or give them dedicated shards.</li></ul>
<h3>What gets hard</h3><ul><li>Cross-shard joins and transactions (avoid, denormalise, or use sagas).</li><li>Global unique IDs (Snowflake-style IDs instead of auto-increment).</li><li>Resharding: move data while serving traffic (double-write, backfill, cut over).</li></ul>
<p><b>Partitioning</b> often means splitting a table within one DB (Postgres declarative partitioning by month); <b>sharding</b> means across machines.</p>`,
real:`Instagram sharded Postgres into thousands of logical shards mapped onto fewer physical servers, and generated IDs that embed the shard ID so any row's location is known from its ID.`,
say:["\"Shard by user_id so a user's orders live together; analytics that need all users go to a separate warehouse.\""],
traps:["Sharding by timestamp with range partitioning: all writes hit the newest shard.","Proposing sharding at 1,000 QPS. Replicas and caching come first."],
src:[["Instagram: sharding IDs","https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c"]],
quiz:[
{q:"Why is a creation timestamp a poor range-based shard key?",o:["Low cardinality","All new writes land on one shard (hot spot)","Can't be indexed","Timestamps aren't unique"],a:1,why:"Monotonic keys concentrate writes on the latest range."},
{q:"With hash(key) mod N, adding one server causes…",o:["~1/N keys to move","Almost all keys to move","No keys to move","Only hot keys to move"],a:1,why:"The modulus changes for most keys. Consistent hashing fixes this."},
{q:"Main reason to avoid cross-shard transactions?",o:["SQL forbids them","They need slow coordination (2PC) and hurt availability","They use too much disk","They break indexes"],a:1,why:"Coordinating multiple shards is slow and fragile."}]});

T({id:"consistent-hashing",w:3,title:"Consistent hashing",mins:10,
tldr:"Place nodes and keys on a <b>hash ring</b>; each key goes to the next node clockwise. Adding or removing a node moves only about <b>K/N keys</b>. <b>Virtual nodes</b> even out the load.",
notes:`<ol><li>Hash each server (many times, as virtual nodes) to points on a ring 0…2³²−1.</li><li>Hash each key; walk clockwise to the first server point → that server owns it.</li><li>New server: takes over only the keys between it and its predecessor.</li><li>Server dies: its keys shift to the next server; others are untouched.</li></ol>
<h3>Why virtual nodes</h3><p>With few physical nodes, ring gaps are uneven, so one server gets far more keys. Giving each server 100–200 points spreads load and lets bigger machines take more points (weighting).</p>
<h3>Where it's used</h3><p>Distributed caches (client-side memcached sharding), Cassandra and DynamoDB partitioning, load balancers keeping a user on the same backend, CDNs.</p>
<pre><code>import bisect, hashlib
class Ring:
    def __init__(self, nodes, vnodes=100):
        self.ring = sorted((self._h(f"{n}#{i}"), n) for n in nodes for i in range(vnodes))
        self.keys = [h for h, _ in self.ring]
    def _h(self, s): return int(hashlib.md5(s.encode()).hexdigest(), 16)
    def node_for(self, key):
        i = bisect.bisect(self.keys, self._h(key)) % len(self.keys)
        return self.ring[i][1]</code></pre>`,
say:["\"Consistent hashing with virtual nodes, so adding a cache node only remaps about 1/N of keys instead of nearly all of them.\""],
traps:["Forgetting replication on the ring: copies usually go to the next R distinct nodes clockwise."],
src:[["Amazon Dynamo paper","https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf"]],
quiz:[
{q:"Main benefit of consistent hashing over hash mod N?",o:["Faster hashing","Only ~K/N keys move when nodes change","Keys are sorted","No collisions"],a:1,why:"Minimal remapping on membership change."},
{q:"Why use virtual nodes?",o:["Encrypt keys","Spread load evenly and allow weighting","Reduce memory","Avoid replication"],a:1,why:"Many points per server smooth out ring gaps."},
{q:"A key hashes between node A's point and node B's point (clockwise A then B). Who owns it?",o:["A","B","Both","Neither"],a:1,why:"Walk clockwise to the first node: B."}]});

T({id:"caching",w:3,title:"Caching strategies and eviction",mins:15,
tldr:"Cache hot data in memory to cut latency and DB load. Know <b>cache-aside, write-through, write-back, write-around</b>, plus TTLs and <b>LRU</b> eviction.",
notes:`<h3>Where caches live</h3><p>Browser → CDN → API gateway → app in-process (LRU dict) → distributed cache (Redis/Memcached) → DB buffer pool.</p>
<h3>Strategies</h3><table><tr><th>Pattern</th><th>Read</th><th>Write</th><th>Trade-off</th></tr>
<tr><td><b>Cache-aside</b> (lazy)</td><td>App checks cache; on miss reads DB and fills cache</td><td>App writes DB, then deletes the cache key</td><td>Most common; first read is slow; brief staleness possible</td></tr>
<tr><td><b>Read-through</b></td><td>Cache library loads from DB on miss</td><td>—</td><td>Cleaner app code</td></tr>
<tr><td><b>Write-through</b></td><td>Always warm</td><td>Write cache and DB together</td><td>Fresh reads; slower writes; caches unread data</td></tr>
<tr><td><b>Write-back</b> (write-behind)</td><td>—</td><td>Write cache, flush to DB later</td><td>Fast writes; data loss if cache dies</td></tr>
<tr><td><b>Write-around</b></td><td>Fill on read</td><td>Write DB only</td><td>Avoids caching write-once data</td></tr></table>
<h3>Eviction</h3><ul><li><b>LRU</b> (least recently used): default choice.</li><li><b>LFU</b> (least frequently used): keeps long-term popular items.</li><li><b>FIFO</b>, random, and <b>TTL</b> expiry for freshness.</li></ul>
<h3>Why delete instead of update on write?</h3><p>Two concurrent writers can set the cache in the wrong order and leave stale data. Deleting forces the next read to load the current value.</p>
<pre><code>def get_user(uid):
    u = redis.get(f"user:{uid}")
    if u: return json.loads(u)
    u = db.fetch_user(uid)
    redis.set(f"user:{uid}", json.dumps(u), ex=300)   # 5-min TTL as a safety net
    return u</code></pre>`,
diagram:{w:760,h:200,n:[["app",110,100,"App server","","svc"],["c",380,45,"Redis","1. check","cache"],["db",380,160,"Database","2. on miss","db"]],e:[["app","c","get key",0,1],["app","db","read + fill cache",0,1]]},dcap:"Cache-aside: the app talks to both; the cache is only filled on a miss.",
say:["\"Cache-aside with a TTL; on update we write the DB then delete the key.\"","\"At an 80/20 access pattern, caching 20% of the data serves most reads.\""],
traps:["Caching without an invalidation story.","Write-back for money: a cache node crash loses committed payments."],
quiz:[
{q:"In cache-aside, what happens on a cache miss?",o:["Return 404","App reads DB, stores result in cache, returns it","Cache reads DB on its own","Write to DB"],a:1,why:"The app lazily populates the cache."},
{q:"Which strategy risks losing data if the cache crashes?",o:["Cache-aside","Write-through","Write-back","Write-around"],a:2,why:"Writes sit only in the cache until flushed."},
{q:"On an update, why delete the cache key rather than set the new value?",o:["Deletes are faster","Avoids race conditions that leave stale values","Redis can't overwrite","To save memory"],a:1,why:"Concurrent set-after-write can reorder; deletion forces a fresh read."}]});

T({id:"cache-problems",w:3,title:"Cache failure modes",mins:10,
tldr:"Caches fail in specific ways: <b>stampede</b> (many misses at once), <b>hot keys</b>, <b>penetration</b> (misses for keys that don't exist), <b>avalanche</b> (many keys expiring together), and <b>stale data</b>.",
notes:`<table><tr><th>Problem</th><th>What happens</th><th>Fix</th></tr>
<tr><td>Stampede / thundering herd</td><td>Hot key expires; 10k requests hit the DB at once</td><td>Lock or single-flight so one request refills; serve stale while revalidating; early probabilistic refresh</td></tr>
<tr><td>Avalanche</td><td>Many keys share a TTL and expire together, or the cache restarts</td><td>Add random jitter to TTLs; warm the cache; replicas</td></tr>
<tr><td>Penetration</td><td>Requests for non-existent IDs always miss and hit DB</td><td>Cache the "not found" briefly; Bloom filter of valid keys</td></tr>
<tr><td>Hot key</td><td>One key (celebrity post) overloads one Redis shard</td><td>Local in-process cache in front; replicate the key with suffixes (key#1..N)</td></tr>
<tr><td>Stale reads</td><td>DB updated but cache not</td><td>Delete-on-write, short TTLs, CDC-driven invalidation</td></tr></table>`,
real:`Facebook's memcache paper describes "leases" so only one client refills a missing key, which tamed thundering herds on hot keys.`,
say:["\"Add TTL jitter so keys don't expire together, and use a lock so only one request rebuilds a hot key.\""],
traps:["Treating the cache as the source of truth."],
quiz:[
{q:"Thousands of keys all set with TTL = 3600 at deploy time expire together. Fix?",o:["Longer TTL","Random jitter on TTLs","Disable cache","Use LFU"],a:1,why:"Jitter spreads expirations out."},
{q:"Attackers request random non-existent IDs, every one hits the DB. Fix?",o:["Bigger cache","Cache negative results / Bloom filter of valid IDs","Write-back cache","Shorter TTL"],a:1,why:"Stops misses for keys that will never exist."},
{q:"A hot key expires and 10k concurrent requests miss. Best mitigation?",o:["Single-flight lock so one request refills","Add read replicas","Reduce TTL","Use UDP"],a:0,why:"Only one request hits the DB; the rest wait or get the stale value."}]});

T({id:"blob",w:3,title:"Blob storage and large files",mins:12,
tldr:"Store big files in <b>object storage</b> (S3, GCS) and only metadata in the DB. Clients upload and download directly with <b>presigned URLs</b>; large files go in <b>chunks</b>.",
notes:`<h3>Block vs file vs object storage</h3><ul><li><b>Block</b> (EBS): raw disk for a DB or VM.</li><li><b>File</b> (NFS/EFS): shared file system with directories.</li><li><b>Object</b> (S3): key → bytes + metadata, flat namespace, practically unlimited, very durable (S3 is designed for 11 nines durability), cheap, HTTP access.</li></ul>
<h3>Upload flow</h3><ol><li>Client asks API for upload permission → API checks auth, writes a metadata row (status = pending), returns a <b>presigned PUT URL</b>.</li><li>Client uploads directly to S3 (app servers never touch the bytes).</li><li>S3 event / client callback marks the file ready; a worker makes thumbnails or transcodes.</li></ol>
<h3>Large files</h3><ul><li><b>Multipart / chunked upload</b> (e.g. 5–10 MB chunks): resume after failure, upload in parallel.</li><li>Chunk hashes allow <b>deduplication</b> and syncing only changed chunks (Dropbox).</li><li>Serve via CDN with signed URLs for private content.</li></ul>`,
diagram:{w:760,h:230,n:[["c",80,115,"Client","","client"],["api",300,50,"Upload API","auth + presign","svc"],["md",540,50,"Metadata DB","file rows","db"],["s3",300,180,"Object storage","S3 / GCS","db"],["wk",540,180,"Worker","thumbnails","svc"],["cdn",740-80,115,"CDN","downloads","edge"]],e:[["c","api","1. request URL"],["api","md","pending row"],["c","s3","2. PUT bytes"],["s3","wk","3. event"],["wk","md","ready",1],["cdn","s3","origin",1]]},dcap:"Bytes never pass through app servers: presigned URLs send them straight to object storage.",
say:["\"File bytes go straight to S3 with a presigned URL; Postgres only stores metadata and ownership.\""],
traps:["Storing images as BLOBs in Postgres at scale.","Streaming uploads through app servers, which wastes bandwidth and memory."],
src:[["Dropbox: Magic Pocket","https://dropbox.tech/infrastructure/inside-the-magic-pocket"]],
quiz:[
{q:"Why use presigned URLs for uploads?",o:["Encrypt files","Clients upload directly to storage, bypassing app servers","Make files public","Compress files"],a:1,why:"Saves app bandwidth and CPU while keeping access controlled and time-limited."},
{q:"Benefit of chunked uploads for a 4 GB file?",o:["Smaller total size","Resume after failure and upload in parallel","No metadata needed","Avoids CDN"],a:1,why:"Only failed chunks are retried."},
{q:"Where should a file's owner, name and size live?",o:["In the S3 object only","In a metadata DB, with the object key pointing to S3","In Redis only","In the CDN"],a:1,why:"Queryable metadata in a DB; bytes in object storage."}]});

T({id:"special-db",w:3,title:"Search, time-series, geo and vector stores",mins:14,
tldr:"Specialised stores beat a general DB for specific queries: <b>inverted index</b> for text, <b>time-series</b> for metrics, <b>geohash/quadtree</b> for nearby search, <b>ANN indexes</b> for embeddings.",
notes:`<h3>Full-text search (Elasticsearch)</h3><p>An <b>inverted index</b> maps each term → list of documents containing it. Supports relevance ranking (BM25), fuzzy match, facets. Usually a <b>secondary index</b>: Postgres is the source of truth, changes flow to Elasticsearch via CDC or a queue.</p>
<h3>Time-series</h3><p>Append-mostly, queried by time range, often downsampled (1s → 1m → 1h) and expired. TimescaleDB, InfluxDB, Prometheus.</p>
<h3>Geospatial: "drivers near me"</h3><ul><li><b>Geohash</b>: encode lat/long into a string; shared prefix ≈ nearby. Query the cell plus its 8 neighbours.</li><li><b>Quadtree</b>: split a square into 4 recursively until each cell has ≤ K points; adapts to density.</li><li><b>H3</b> (Uber): hexagonal grid; neighbours are equidistant.</li><li>Redis GEO and PostGIS give these out of the box.</li></ul>
<h3>Vector search</h3><p>Store embeddings; find nearest neighbours by cosine similarity. Exact search is O(n); <b>ANN</b> indexes like <b>HNSW</b> (graph) or <b>IVF</b> (clusters) trade a little recall for big speed. pgvector keeps vectors next to your relational data.</p>`,
real:`Uber built and open-sourced H3, a hexagonal grid, for pricing and dispatch because hexagons have uniform neighbour distances.`,
say:["\"Postgres stays the source of truth; Elasticsearch is a derived search index fed by CDC, so it can be rebuilt.\""],
traps:["Using SQL LIKE '%term%' for search at scale (no index use).","Making Elasticsearch the primary database for transactional data."],
src:[["Uber H3","https://www.uber.com/blog/h3/"]],
quiz:[
{q:"Core data structure behind full-text search engines?",o:["B-tree","Inverted index","Bloom filter","Skip list"],a:1,why:"Term → posting list of documents."},
{q:"With geohash, how do you avoid missing points just across a cell border?",o:["Use a bigger precision","Also query the 8 neighbouring cells","Use LIKE","Only query exact matches"],a:1,why:"Nearby points can fall in adjacent cells."},
{q:"HNSW is…",o:["A hashing scheme for passwords","A graph-based approximate nearest-neighbour index","A replication protocol","A compression codec"],a:1,why:"Hierarchical Navigable Small World graphs."}]});

/* ---------------- WORLD 4 ---------------- */
T({id:"queues",w:4,title:"Message queues and event streaming",mins:16,
tldr:"Queues <b>decouple</b> producers from consumers, absorb spikes, and let slow work happen in the background. Know <b>delivery guarantees</b>, <b>ordering</b>, <b>DLQs</b>, and Kafka vs RabbitMQ.",
notes:`<h3>Why a queue</h3><ul><li>Slow work off the request path (emails, video transcoding).</li><li>Absorb bursts: the queue grows, workers drain at their pace.</li><li>Fan-out one event to many consumers (pub/sub).</li><li>Retry failed work without losing it.</li></ul>
<h3>Delivery semantics</h3><table><tr><th>At-most-once</th><th>At-least-once</th><th>Exactly-once</th></tr><tr><td>May lose messages, never duplicates</td><td>Never loses, may duplicate (most common)</td><td>Hard; in practice = at-least-once + idempotent consumers (or Kafka transactions within Kafka)</td></tr></table>
<h3>Kafka vs RabbitMQ vs SQS</h3><table><tr><th></th><th>Kafka</th><th>RabbitMQ</th><th>SQS</th></tr>
<tr><td>Model</td><td>Distributed append-only log; consumers track offsets</td><td>Broker routes messages to queues; deleted on ack</td><td>Managed queue</td></tr>
<tr><td>Replay</td><td>Yes (retention)</td><td>No</td><td>No</td></tr>
<tr><td>Ordering</td><td>Per partition</td><td>Per queue (with one consumer)</td><td>FIFO queues only</td></tr>
<tr><td>Best for</td><td>Event streams, high throughput, many consumer groups</td><td>Task queues, complex routing</td><td>Simple managed jobs</td></tr></table>
<h3>Kafka essentials</h3><ul><li>Topic → partitions. Messages with the same <b>key</b> go to the same partition → ordered.</li><li>In a <b>consumer group</b>, each partition is read by one consumer → parallelism ≤ partitions.</li><li>Replicated across brokers; producers can wait for <code>acks=all</code>.</li></ul>
<h3>Dead-letter queue</h3><p>After N failed attempts, move the message to a DLQ for inspection instead of blocking the queue forever (poison message).</p>`,
diagram:{w:760,h:230,n:[["p1",80,60,"Order service","producer","svc"],["p2",80,170,"Payment service","producer","svc"],["k",320,115,"Kafka topic","orders · 6 partitions","queue"],["c1",560,40,"Email worker","group A","svc"],["c2",560,115,"Analytics","group B","svc"],["c3",560,190,"Inventory","group C","svc"]],e:[["p1","k"],["p2","k"],["k","c1"],["k","c2"],["k","c3"]]},dcap:"One event log, many independent consumer groups each reading at their own pace.",
say:["\"At-least-once delivery, so consumers are idempotent: they dedupe on event ID.\"","\"Key the Kafka messages by order_id so all events for one order stay in order on one partition.\""],
traps:["Promising exactly-once end-to-end without idempotent consumers.","Expecting global ordering across a multi-partition topic."],
quiz:[
{q:"You need all events for the same user processed in order in Kafka. What do you do?",o:["Use one consumer for the whole cluster","Use user_id as the message key","Disable replication","Use a DLQ"],a:1,why:"Same key → same partition → ordered."},
{q:"A topic has 4 partitions and a consumer group has 6 consumers. How many are active?",o:["6","4","2","1"],a:1,why:"Each partition goes to one consumer in a group; 2 sit idle."},
{q:"A message keeps crashing the consumer. Best practice?",o:["Retry forever","After N tries, move it to a dead-letter queue","Delete the topic","Switch to UDP"],a:1,why:"A DLQ isolates poison messages."}]});

T({id:"rate-limit",w:4,title:"Rate limiting algorithms",mins:14,
tldr:"Rate limiting protects services from abuse and overload. Know <b>token bucket</b>, <b>leaky bucket</b>, <b>fixed window</b>, <b>sliding log</b> and <b>sliding window counter</b>, and how to do it across servers with Redis.",
notes:`<table><tr><th>Algorithm</th><th>Idea</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Token bucket</td><td>Bucket holds up to B tokens, refilled at r/s; each request takes one</td><td>Allows short bursts, low memory; used by AWS, Stripe</td><td>Two parameters to tune</td></tr>
<tr><td>Leaky bucket</td><td>Requests enter a FIFO queue drained at a fixed rate</td><td>Smooth output rate</td><td>Bursts wait or drop; old requests can starve new ones</td></tr>
<tr><td>Fixed window</td><td>Counter per minute bucket</td><td>Simplest</td><td>Up to 2× limit around the window boundary</td></tr>
<tr><td>Sliding window log</td><td>Store a timestamp per request</td><td>Exact</td><td>Memory per request</td></tr>
<tr><td>Sliding window counter</td><td>Current count + previous count × overlap fraction</td><td>Close to exact, cheap</td><td>Approximation</td></tr></table>
<h3>Distributed</h3><ul><li>Keep counters in Redis so all API servers share them. Make check-and-increment <b>atomic</b> (Lua script or <code>INCR</code> + <code>EXPIRE</code>).</li><li>Key by user ID, API key or IP; different limits per plan.</li><li>Return <b>429 Too Many Requests</b> with <code>Retry-After</code> and <code>X-RateLimit-*</code> headers.</li><li>Fail open or closed if Redis is down? Usually <b>fail open</b> for user APIs, closed for abuse-sensitive endpoints like login.</li></ul>
<pre><code>import time
class TokenBucket:
    def __init__(self, capacity, rate):
        self.cap, self.rate = capacity, rate
        self.tokens, self.t = capacity, time.monotonic()
    def allow(self):
        now = time.monotonic()
        self.tokens = min(self.cap, self.tokens + (now - self.t) * self.rate)
        self.t = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False</code></pre>`,
say:["\"Token bucket in Redis via a Lua script so the check and decrement are atomic across all gateway nodes.\""],
traps:["Non-atomic GET then SET in Redis: two servers both see 99 and both allow request 100.","Ignoring the fixed-window boundary burst."],
quiz:[
{q:"Which algorithm naturally allows short bursts up to a cap?",o:["Leaky bucket","Token bucket","Fixed window","None"],a:1,why:"Saved-up tokens can be spent in a burst."},
{q:"Fixed window of 100/min. Worst case requests in any 60-second span?",o:["100","150","~200","Unlimited"],a:2,why:"100 at 0:59 and 100 at 1:00 → ~200 in two seconds."},
{q:"HTTP status for a rate-limited request?",o:["403","429","503","400"],a:1,why:"429 Too Many Requests (often with Retry-After)."}]});

T({id:"resilience",w:4,title:"Timeouts, retries, circuit breakers, idempotency",mins:14,
tldr:"Every network call can fail or hang. Use <b>timeouts</b>, <b>retries with exponential backoff + jitter</b>, <b>circuit breakers</b>, <b>bulkheads</b>, and make retried operations <b>idempotent</b>.",
notes:`<ul><li><b>Timeouts</b>: never wait forever; set per call, below the caller's own timeout.</li>
<li><b>Retries</b>: only on transient errors (timeouts, 503), with <b>exponential backoff</b> (100 ms, 200, 400…) and <b>jitter</b> so clients don't retry in sync. Cap attempts.</li>
<li><b>Idempotency</b>: retries are only safe if repeating has no extra effect: idempotency keys, upserts, dedupe tables.</li>
<li><b>Circuit breaker</b>: after many failures, <b>open</b> (fail fast without calling), after a cooldown go <b>half-open</b> (let a few test calls through), <b>close</b> if they succeed.</li>
<li><b>Bulkhead</b>: separate thread/connection pools per dependency so one slow dependency can't eat all threads.</li>
<li><b>Graceful degradation</b>: serve cached or partial results (show feed without recommendations).</li>
<li><b>Load shedding</b> and <b>backpressure</b>: reject early when overloaded instead of collapsing.</li></ul>
<h3>Why exactly-once is hard</h3><p>If a request times out, you can't know whether the server did the work. So you retry (at-least-once) and make the handler idempotent: that gives <b>effectively-once</b>.</p>`,
say:["\"Retries with exponential backoff and jitter, max 3, and only for idempotent operations.\"","\"A circuit breaker around the recommendations service; if it's open we show the feed without recommendations.\""],
traps:["Retrying a non-idempotent POST and double-charging.","Retries at every layer multiply: 3 layers × 3 retries = 27 calls."],
quiz:[
{q:"Why add jitter to backoff?",o:["To make retries faster","To stop many clients retrying at exactly the same moments","To encrypt traffic","To skip timeouts"],a:1,why:"Synchronised retries create new load spikes."},
{q:"A circuit breaker in the OPEN state…",o:["Sends all calls through","Fails fast without calling the dependency","Retries forever","Restarts the service"],a:1,why:"Gives the failing service time to recover."},
{q:"Which makes retries safe for 'create order'?",o:["Shorter timeout","Idempotency key dedupe","More retries","UDP"],a:1,why:"Duplicate requests map to the same result."}]});

T({id:"dist-txn",w:4,title:"Distributed transactions: 2PC, sagas, outbox",mins:15,
tldr:"Across services you can't use one DB transaction. <b>2PC</b> locks everyone until commit; <b>sagas</b> run local steps with <b>compensations</b>; the <b>outbox pattern</b> reliably publishes events with DB changes.",
notes:`<h3>Two-phase commit</h3><p>Coordinator asks all participants to <b>prepare</b>; if all vote yes, it says <b>commit</b>. Strong but blocking: if the coordinator dies after prepare, participants hold locks. Rare across microservices.</p>
<h3>Saga</h3><p>A sequence of local transactions; if step k fails, run compensations for steps k−1…1.</p>
<p>Book trip: reserve flight → reserve hotel → charge card. Card fails → cancel hotel → cancel flight.</p>
<ul><li><b>Choreography</b>: services react to each other's events (simple, harder to follow).</li><li><b>Orchestration</b>: a central orchestrator (e.g. Temporal workflow) tells each step what to do (clearer, easier to monitor).</li></ul>
<h3>The dual-write problem and the outbox</h3><p>"Update DB then publish to Kafka": if the app crashes between the two, they disagree. <b>Outbox</b>: in the same DB transaction, write the business row <i>and</i> an <code>outbox</code> row; a relay (poller or CDC like Debezium) publishes outbox rows to Kafka. At-least-once → consumers dedupe.</p>
<pre><code>BEGIN;
  INSERT INTO orders (...) VALUES (...);
  INSERT INTO outbox (event_id, topic, payload) VALUES (...);
COMMIT;  -- relay later publishes outbox rows and marks them sent</code></pre>`,
diagram:{w:760,h:220,n:[["svc",100,110,"Order service","","svc"],["db",330,110,"Postgres","orders + outbox","db"],["rel",540,110,"Outbox relay","CDC / poller","svc"],["k",700,110,"Kafka","","queue"]],e:[["svc","db","1 transaction"],["db","rel","read new rows"],["rel","k","publish"]],bw:120},dcap:"Outbox: the event is committed atomically with the data, then published by a separate relay.",
say:["\"Payment then inventory then shipping as an orchestrated saga, each with a compensating action.\"","\"Outbox pattern so the order row and the OrderCreated event can never disagree.\""],
traps:["Using 2PC across many microservices: blocking and fragile.","Forgetting compensations can fail too; they need retries and idempotency."],
quiz:[
{q:"Main weakness of two-phase commit?",o:["Not atomic","Blocking: participants hold locks if the coordinator fails","Needs Kafka","Only works with NoSQL"],a:1,why:"Prepared participants can't decide alone."},
{q:"In a saga, if the 3rd step fails you…",o:["Roll back with a DB ROLLBACK across services","Run compensating actions for steps 2 and 1","Ignore it","Retry step 1"],a:1,why:"Each completed local transaction is undone by its compensation."},
{q:"The outbox pattern solves…",o:["Slow queries","The dual-write problem between DB and message broker","Cache stampedes","Hot partitions"],a:1,why:"Event and data commit in one local transaction."}]});

T({id:"observability",w:4,title:"Observability: logs, metrics, traces",mins:12,
tldr:"<b>Metrics</b> tell you something is wrong, <b>traces</b> show where, <b>logs</b> tell you why. Alert on <b>symptoms</b> users feel, against <b>SLOs</b>.",
notes:`<ul><li><b>Logs</b>: structured JSON with request_id, user_id, latency. Aggregate centrally (ELK, Loki).</li><li><b>Metrics</b>: counters, gauges, histograms (Prometheus + Grafana). Cheap to store and alert on.</li><li><b>Traces</b>: one request's path across services as spans (OpenTelemetry, Jaeger). Propagate a trace ID in headers.</li></ul>
<h3>Four golden signals (Google SRE)</h3><p><b>Latency</b>, <b>traffic</b>, <b>errors</b>, <b>saturation</b>. RED for services (Rate, Errors, Duration); USE for resources (Utilisation, Saturation, Errors).</p>
<h3>SLOs and alerting</h3><ul><li>SLO: "99.9% of checkout requests succeed in &lt; 500 ms over 30 days" → error budget of 0.1%.</li><li>Alert on burning the error budget fast, not on CPU at 80%.</li><li>Every alert links a runbook.</li></ul>`,
say:["\"I'd track p99 latency and error rate per endpoint, trace across services with OpenTelemetry, and alert on SLO burn rate.\""],
traps:["Ending a design with no word on monitoring. Interviewers notice.","Logging PII or secrets."],
quiz:[
{q:"Which of these is NOT one of the four golden signals?",o:["Latency","Traffic","Errors","Code coverage"],a:3,why:"Golden signals: latency, traffic, errors, saturation."},
{q:"A request is slow and passes through 6 services. Best tool to find which one?",o:["Logs grep","Distributed tracing","CPU metric","Unit tests"],a:1,why:"Traces show per-service spans for one request."},
{q:"Good alerting practice?",o:["Alert on every CPU spike","Alert on user-facing symptoms against SLOs","Alert only from logs","Never alert at night"],a:1,why:"Symptom-based alerts reduce noise and catch what users feel."}]});

T({id:"architecture",w:4,title:"Architecture styles: monolith to microservices",mins:14,
tldr:"Start with a <b>modular monolith</b>. Split into <b>microservices</b> when teams or scaling needs truly differ. Know <b>event-driven</b>, <b>CQRS</b>, <b>event sourcing</b>, service discovery and the strangler fig.",
notes:`<table><tr><th>Style</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Monolith</td><td>Simple deploys, easy local transactions and debugging</td><td>One big deploy, scales as a unit, team coupling</td></tr>
<tr><td>Microservices</td><td>Independent deploy and scaling, team autonomy, fault isolation</td><td>Network calls, distributed data, ops overhead, harder debugging</td></tr>
<tr><td>Serverless</td><td>No servers, scale to zero, pay per use</td><td>Cold starts, time limits, vendor lock-in</td></tr>
<tr><td>Event-driven</td><td>Loose coupling, easy to add consumers</td><td>Harder to trace, eventual consistency</td></tr></table>
<h3>Patterns to name</h3><ul><li><b>CQRS</b>: separate write model from read models (e.g. writes in Postgres, denormalised read views in Elasticsearch/Redis).</li><li><b>Event sourcing</b>: store the list of events, derive current state by replaying (audit-friendly, e.g. approval audit trails).</li><li><b>Service discovery</b>: services register (Consul, Kubernetes DNS) so callers find healthy instances.</li><li><b>Sidecar / service mesh</b> (Envoy, Istio): retries, mTLS, metrics outside app code.</li><li><b>Strangler fig</b>: migrate a monolith by routing one feature at a time to new services.</li><li><b>Database per service</b>: services own their data; share via APIs or events, not shared tables.</li></ul>`,
say:["\"For a team of five I'd ship a modular monolith with clear module boundaries, and split out the notification service first because its load pattern is different.\""],
traps:["Starting with 15 microservices for an MVP.","Microservices sharing one database (a distributed monolith)."],
quiz:[
{q:"Best reason to split a service out of a monolith?",o:["Microservices are modern","Its scaling needs or owning team differ from the rest","To use more languages","To add network calls"],a:1,why:"Split on real organisational or load boundaries."},
{q:"CQRS means…",o:["One DB for everything","Separate models/stores for commands (writes) and queries (reads)","Circuit breakers","Caching queries"],a:1,why:"Command Query Responsibility Segregation."},
{q:"Strangler fig pattern is used to…",o:["Kill zombie processes","Incrementally migrate a legacy system feature by feature","Rate limit","Shard a database"],a:1,why:"New system gradually 'strangles' the old one."}]});

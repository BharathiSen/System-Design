/* ===== Flashcards, LLD dojo, resources, planner links ===== */
const CARDS=[
["Basics","What's the difference between HLD and LLD?","HLD = components and how they interact (services, DBs, caches, queues). LLD = classes, interfaces, methods and code for one component."],
["Basics","Vertical vs horizontal scaling?","Vertical: bigger machine (simple, has a ceiling, SPOF). Horizontal: more machines behind an LB (needs stateless apps, scales further)."],
["Basics","Why must app servers be stateless to scale out?","So any instance can serve any request; state lives in Redis/DB, letting you add or remove servers freely."],
["Basics","99.9% availability = how much downtime per year?","About 8.76 hours (≈ 43.8 minutes per month)."],
["Basics","Availability of two 99.9% services in series?","≈ 99.8% (multiply: 0.999 × 0.999)."],
["Basics","Latency vs throughput?","Latency = time for one request. Throughput = requests completed per unit time."],
["Basics","Why report p99 instead of average latency?","Averages hide slow tail requests; users and fan-out calls feel the tail."],
["Basics","CAP theorem in one sentence?","During a network partition, a distributed store must choose consistency (reject/wait) or availability (answer possibly stale)."],
["Basics","What does PACELC add to CAP?","Even without a partition (Else), you trade Latency vs Consistency."],
["Basics","Quorum condition for reading the latest write?","W + R > N (write and read sets overlap)."],
["Network","What happens when you type a URL?","DNS lookup → TCP handshake → TLS handshake → HTTP request → LB → app → DB/cache → response → browser renders and fetches assets (often from CDN)."],
["Network","TCP vs UDP?","TCP: connection, ordered, reliable. UDP: connectionless, no guarantees, lower overhead (video, games, DNS, QUIC)."],
["Network","What does HTTP/3 fix over HTTP/2?","Runs on QUIC over UDP so a lost packet doesn't block other streams (no TCP head-of-line blocking); faster handshakes."],
["Network","401 vs 403?","401: not authenticated (who are you?). 403: authenticated but not allowed."],
["Network","DNS resolution order?","Resolver → root → TLD → authoritative name server; answers cached per TTL."],
["Network","Pull vs push CDN?","Pull: edge fetches from origin on a miss. Push: you upload content to the CDN ahead of time."],
["Network","L4 vs L7 load balancer?","L4 routes on IP/port (fast, protocol-agnostic). L7 reads HTTP (paths, headers, cookies) for smart routing."],
["Network","Forward vs reverse proxy?","Forward acts for clients (VPN/corporate proxy). Reverse acts for servers (nginx: TLS, caching, LB)."],
["Network","What does an API gateway do?","Single entry: auth, rate limiting, routing to services, TLS, metrics, request transformation."],
["Network","REST vs gRPC vs GraphQL, when?","REST: public CRUD APIs. gRPC: fast typed internal service calls. GraphQL: many clients needing flexible data shapes."],
["Network","Cursor vs offset pagination?","Cursor ('after id X') is stable under inserts and fast with an index; offset is simple but slow for deep pages and skips/duplicates on change."],
["Network","What is an idempotency key?","A client-generated unique key sent with a POST; the server stores the result and returns it for retries, preventing duplicates."],
["Network","SSE vs WebSockets?","SSE: one-way server→client over HTTP (notifications, LLM streaming). WebSockets: full duplex (chat, games)."],
["Network","Sessions vs JWT?","Sessions: server-side state, easy revoke. JWT: stateless signed token, verify anywhere, hard to revoke → short expiry + refresh tokens."],
["Network","OAuth2 vs OIDC?","OAuth2 delegates authorization (access tokens). OIDC adds authentication (ID token) on top: 'Sign in with Google'."],
["Data","When pick SQL over NoSQL?","Relations, joins, multi-row transactions, ad-hoc queries, strong consistency."],
["Data","When pick a wide-column store like Cassandra?","Massive write-heavy data read by a known partition key and range (messages, events, time-series)."],
["Data","ACID?","Atomicity (all or nothing), Consistency (constraints hold), Isolation (no interference), Durability (survives crashes)."],
["Data","Postgres default isolation level?","Read committed."],
["Data","Optimistic vs pessimistic locking?","Optimistic: version check on write, retry on conflict (rare conflicts). Pessimistic: SELECT … FOR UPDATE lock (high contention)."],
["Data","Leftmost-prefix rule?","A composite index (a, b) helps queries on a, or a+b, but not b alone."],
["Data","B-tree vs LSM tree?","B-tree: in-place pages, fast reads (Postgres/MySQL). LSM: append + compaction, very fast writes (Cassandra/RocksDB)."],
["Data","What does replication give you?","Availability and read scaling (not write scaling)."],
["Data","What is replication lag and a fix for read-your-writes?","Async followers trail the leader; route a user's reads to the leader for a short time after they write."],
["Data","Sharding vs replication?","Sharding splits data across nodes (scales writes/storage). Replication copies data (availability/reads)."],
["Data","What makes a good shard key?","High cardinality, even load, matches the main query, not monotonically increasing for range sharding."],
["Data","Why consistent hashing?","Adding/removing a node moves only ~K/N keys instead of almost all (mod N)."],
["Data","Why virtual nodes?","Even out load on the ring and allow weighting bigger machines."],
["Data","Cache-aside flow?","Read: check cache → miss → read DB → fill cache. Write: update DB → delete cache key."],
["Data","Write-through vs write-back?","Through: write cache + DB together (fresh, slower writes). Back: write cache, flush later (fast, risk of loss)."],
["Data","Cache stampede fix?","Single-flight lock / lease so one request refills, serve stale while revalidating, TTL jitter."],
["Data","Cache penetration fix?","Cache negative results briefly or use a Bloom filter of valid keys."],
["Data","Why presigned URLs?","Clients upload/download directly to object storage with time-limited permission, bypassing app servers."],
["Data","Inverted index?","Map of term → documents containing it; core of full-text search."],
["Data","Geohash in one line?","Encodes lat/long to a string where a shared prefix means nearby; query a cell + 8 neighbours."],
["Async","Why use a message queue?","Decouple services, absorb spikes, do slow work async, retry safely, fan out events."],
["Async","At-least-once vs exactly-once?","At-least-once may duplicate (common). Exactly-once in practice = at-least-once + idempotent consumers."],
["Async","How does Kafka keep order?","Per partition. Same message key → same partition → ordered."],
["Async","Kafka consumer group rule?","Each partition is consumed by exactly one consumer in the group; parallelism ≤ partitions."],
["Async","Dead-letter queue?","Where messages go after N failed attempts, so poison messages don't block the queue."],
["Async","Token bucket in one line?","Bucket of up to B tokens refilled at r/s; each request spends one; allows bursts up to B."],
["Async","Fixed window rate limit flaw?","Up to 2× the limit can pass around the window boundary."],
["Async","Exponential backoff with jitter?","Retry delays grow (100, 200, 400 ms…) plus randomness so clients don't retry in sync."],
["Async","Circuit breaker states?","Closed (normal) → Open (fail fast) → Half-open (trial calls) → Closed if healthy."],
["Async","Saga pattern?","Sequence of local transactions with compensating actions to undo earlier steps on failure."],
["Async","Outbox pattern?","Write the business row and an outbox event in one DB transaction; a relay publishes outbox rows to the broker."],
["Async","Four golden signals?","Latency, traffic, errors, saturation."],
["Async","Logs vs metrics vs traces?","Metrics: something's wrong. Traces: where. Logs: why."],
["Async","Monolith or microservices for a new product?","Modular monolith first; split services when teams or scaling needs differ."],
["Dist","Raft cluster of 5 tolerates how many failures?","2 (majority of 3 needed)."],
["Dist","Why fencing tokens with locks?","A stale lock holder (paused) can't overwrite newer work: storage rejects older tokens."],
["Dist","Snowflake ID layout?","1 sign bit + 41-bit timestamp + 10-bit machine ID + 12-bit sequence."],
["Dist","Bloom filter guarantees?","No false negatives; false positives possible."],
["Dist","HyperLogLog is for…?","Approximate distinct counts in tiny memory (~0.81% error in 12 KB in Redis)."],
["Dist","Lamport vs vector clocks?","Lamport: total order consistent with causality. Vector: can also detect concurrent updates."],
["Dist","Batch vs stream?","Batch: bounded data, scheduled, high latency. Stream: continuous events, seconds latency, windows."],
["Craft","The 7 delivery steps?","Requirements → estimates → core entities → API → high-level design → deep dives → wrap-up."],
["Craft","1M requests/day ≈ how many per second?","About 12/s (÷ 86,400)."],
["Craft","Fan-out on write vs read?","Write: push post IDs to followers' timelines (fast reads). Read: merge at read time (needed for celebrities). Use hybrid."],
["Craft","How to state a trade-off?","'X vs Y; given requirement Z, I pick X; if Z changed, I'd revisit.'"],
["LLD","SOLID?","Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion."],
["LLD","Strategy pattern?","Swap interchangeable algorithms behind one interface at runtime (fee rules, routing)."],
["LLD","State pattern?","Object changes behaviour with its internal state; each state is a class with its transitions (vending machine, approvals)."],
["LLD","Observer pattern?","Subscribers are notified when a subject changes (notifications, event listeners)."],
["LLD","LRU cache in O(1)?","Hash map + doubly linked list (Python: OrderedDict with move_to_end and popitem(last=False))."],
["LLD","Composition vs inheritance?","Prefer has-a composition for reuse; use is-a inheritance only for true subtypes."],
["AI","1 token ≈ ?","About 4 English characters or 0.75 words."],
["AI","RAG pipeline?","Ingest → chunk → embed → index; query → retrieve (hybrid) → rerank → prompt with context → generate with citations."],
["AI","RAG vs fine-tuning?","RAG: fresh/private knowledge with citations. Fine-tuning: style, format, narrow task behaviour."],
["AI","Where to enforce document permissions in RAG?","At retrieval time, filtering by the user's ACL, before the LLM sees anything."],
["AI","Why hybrid search?","Vectors capture meaning; BM25 catches exact terms (IDs, names, codes)."],
["AI","Workflow vs agent?","Fixed workflow when steps are known (cheaper, testable). Agent only when steps vary a lot."],
["AI","What is an eval golden set?","A fixed set of real inputs with expected outputs/rubrics used to regression-test prompts and models."],
["AI","What is prompt injection?","Untrusted content (docs, emails, web pages) trying to give the model instructions; treat it as data."],
["AI","KV cache?","Stored attention keys/values per token of active sequences; grows with context × concurrency and limits GPU capacity."],
["AI","What does an LLM gateway do?","Central auth, routing, fallbacks, rate limits, budgets, logging and cost attribution for model calls."]
].map((c,i)=>({id:"c"+i,cat:c[0],q:c[1],a:c[2]}));

const LLD={
solid:`<div class="grid g2">
<div class="card"><h3>S · Single responsibility</h3><p class="small">One reason to change per class.</p><pre><code>class Invoice:            # computes
    def total(self): ...
class InvoicePrinter:     # presents
    def print(self, inv): ...
class InvoiceRepo:        # persists
    def save(self, inv): ...</code></pre></div>
<div class="card"><h3>O · Open/closed</h3><p class="small">Extend with new classes; don't edit working code.</p><pre><code>class Discount(ABC):
    @abstractmethod
    def apply(self, amt): ...
class Festive(Discount):
    def apply(self, amt): return amt * 0.9
# new discount = new class, Checkout unchanged</code></pre></div>
<div class="card"><h3>L · Liskov substitution</h3><p class="small">A subclass must work wherever its parent does.</p><pre><code>class Bird: ...
class FlyingBird(Bird):
    def fly(self): ...
class Sparrow(FlyingBird): ...
class Penguin(Bird): ...   # no fly() to break</code></pre></div>
<div class="card"><h3>I · Interface segregation</h3><p class="small">Small, focused interfaces.</p><pre><code>class Printer(Protocol):
    def print(self, doc): ...
class Scanner(Protocol):
    def scan(self) -> bytes: ...
class AllInOne:  # implements both; a basic printer only one</code></pre></div>
<div class="card"><h3>D · Dependency inversion</h3><p class="small">Depend on abstractions; inject them.</p><pre><code>class OrderRepo(ABC):
    @abstractmethod
    def save(self, o): ...
class OrderService:
    def __init__(self, repo: OrderRepo):
        self.repo = repo   # Postgres or in-memory in tests</code></pre></div>
<div class="card"><h3>Also say out loud</h3><ul class="small"><li><b>Encapsulation</b>: hide state, expose behaviour.</li><li><b>Composition over inheritance</b>.</li><li><b>DRY, KISS, YAGNI</b>.</li><li>Code smells: God class, long if/elif chains on type, feature envy, primitive obsession.</li></ul></div></div>`,
approach:`<div class="card notes"><h3>The 45-minute LLD playbook</h3><ol><li><b>Clarify (5 min)</b>: list must-haves and out-of-scope items.</li><li><b>Entities (5 min)</b>: nouns → classes; verbs → methods; enums for types and states.</li><li><b>Relationships</b>: composition (has-a) vs inheritance (is-a); draw a tiny class diagram on the whiteboard.</li><li><b>Interfaces</b>: where will behaviour vary? Put a Strategy/State/Observer there.</li><li><b>Code (20 min)</b>: core classes first, then a <code>main()</code> demo. Clean names, small methods, type hints.</li><li><b>Concurrency</b>: guard shared mutable state; make check-then-act atomic.</li><li><b>Extensions (5 min)</b>: show that a new requirement touches one or two classes.</li></ol>
<h3>Python toolkit</h3><ul><li><code>@dataclass</code> for entities, <code>Enum</code> for types/states, <code>abc.ABC</code>/<code>Protocol</code> for interfaces.</li><li><code>threading.Lock</code> / <code>RLock</code>; <code>queue.Queue</code> for producer-consumer.</li><li><code>collections.OrderedDict</code>, <code>heapq</code>, <code>defaultdict</code>.</li></ul></div>`,
patterns:[
["Singleton","Creational","Exactly one instance","Logger, config (in Python a module often suffices)",1],
["Factory method","Creational","Create the right subclass without the caller knowing which","VehicleFactory, NotificationFactory",1],
["Abstract factory","Creational","Families of related objects","UI kits per theme",0],
["Builder","Creational","Construct complex objects step by step","Order/HTTP request with many optional fields",1],
["Prototype","Creational","Clone existing objects","Copying a configured template",0],
["Adapter","Structural","Make an incompatible interface fit","Wrap a third-party payment SDK",1],
["Decorator","Structural","Add behaviour by wrapping","Coffee + milk + sugar pricing; caching wrapper",1],
["Facade","Structural","Simple front for a complex subsystem","BookingFacade over seat, payment, notify",1],
["Proxy","Structural","Stand-in controlling access","Lazy loading, access control, caching proxy",0],
["Composite","Structural","Tree of objects treated uniformly","File system folders/files; org charts",0],
["Bridge","Structural","Separate abstraction from implementation","Shapes × renderers",0],
["Flyweight","Structural","Share common state among many objects","Characters in a text editor; chess pieces",0],
["Strategy","Behavioral","Interchangeable algorithms","Fee rules, elevator scheduling, sorting",1],
["Observer","Behavioral","Notify subscribers of changes","Notifications, stock tickers, event buses",1],
["State","Behavioral","Behaviour depends on state","Vending machine, order/approval lifecycle",1],
["Command","Behavioral","Requests as objects (undo, queue)","Editor undo, elevator requests, job queues",1],
["Chain of responsibility","Behavioral","Pass request along handlers","ATM note dispensing, approval levels, middleware",1],
["Template method","Behavioral","Fixed skeleton, overridable steps","Report generation, game turns",0],
["Iterator","Behavioral","Traverse without exposing internals","Custom collections (Python generators)",0],
["Mediator","Behavioral","Central object coordinates peers","Chat room, air-traffic control",0],
["Memento","Behavioral","Snapshot and restore state","Undo in editors",0],
["Visitor","Behavioral","Add operations to a class hierarchy","Tax/export over different item types",0]
],
patternCode:`<div class="sect"><h2>Core patterns in Python</h2></div><div class="grid g2">
<div class="card"><h3>Strategy</h3><pre><code>class FeeStrategy(ABC):
    @abstractmethod
    def fee(self, hours: float) -> int: ...

class Hourly(FeeStrategy):
    def __init__(self, rate): self.rate = rate
    def fee(self, hours): return math.ceil(hours) * self.rate

class Flat(FeeStrategy):
    def fee(self, hours): return 100</code></pre></div>
<div class="card"><h3>Observer</h3><pre><code>class EventBus:
    def __init__(self): self.subs = defaultdict(list)
    def subscribe(self, topic, fn): self.subs[topic].append(fn)
    def publish(self, topic, data):
        for fn in self.subs[topic]:
            fn(data)

bus = EventBus()
bus.subscribe("approved", lambda r: print("email", r))
bus.publish("approved", {"id": 7})</code></pre></div>
<div class="card"><h3>Factory</h3><pre><code>class VehicleFactory:
    _types = {"bike": Bike, "car": Car, "truck": Truck}
    @classmethod
    def create(cls, kind, plate):
        try:
            return cls._types[kind](plate)
        except KeyError:
            raise ValueError(f"unknown vehicle {kind}")</code></pre></div>
<div class="card"><h3>Decorator</h3><pre><code>class Coffee:
    def cost(self): return 100
class Milk:
    def __init__(self, inner): self.inner = inner
    def cost(self): return self.inner.cost() + 20
class Sugar:
    def __init__(self, inner): self.inner = inner
    def cost(self): return self.inner.cost() + 5

Sugar(Milk(Coffee())).cost()   # 125</code></pre></div>
<div class="card"><h3>Chain of responsibility (ATM)</h3><pre><code>class NoteHandler:
    def __init__(self, note, nxt=None):
        self.note, self.nxt = note, nxt
    def dispense(self, amt, out):
        n, amt = divmod(amt, self.note)
        if n: out[self.note] = n
        if amt and self.nxt: return self.nxt.dispense(amt, out)
        if amt: raise ValueError("cannot dispense")
        return out

atm = NoteHandler(2000, NoteHandler(500, NoteHandler(100)))
atm.dispense(3700, {})   # {2000: 1, 500: 3, 100: 2}</code></pre></div>
<div class="card"><h3>Singleton (thread-safe)</h3><pre><code>class Config:
    _inst, _lock = None, threading.Lock()
    def __new__(cls):
        with cls._lock:
            if cls._inst is None:
                cls._inst = super().__new__(cls)
        return cls._inst</code></pre></div></div>`,
worked:[
{t:"Parking lot",d:"Easy",body:`<p><b>Entities</b>: ParkingLot → Floor → Spot; Vehicle (Bike/Car/Truck); Ticket; FeeStrategy. <b>Pattern</b>: Strategy for fees, Factory for vehicles. <b>Concurrency</b>: a lock around find-and-assign.</p><pre><code>from dataclasses import dataclass, field
from enum import Enum
import itertools, math, threading, time

class Size(Enum):
    BIKE = 1; CAR = 2; TRUCK = 3

@dataclass
class Vehicle:
    plate: str
    size: Size

@dataclass
class Spot:
    id: str
    size: Size
    vehicle: Vehicle | None = None
    def fits(self, v): return self.vehicle is None and v.size == self.size

@dataclass
class Ticket:
    id: int
    plate: str
    spot: Spot
    entry: float = field(default_factory=time.time)

class ParkingLot:
    def __init__(self, floors: list[list[Spot]], fee: "FeeStrategy"):
        self.floors, self.fee = floors, fee
        self.tickets: dict[int, Ticket] = {}
        self._ids = itertools.count(1)
        self._lock = threading.Lock()

    def park(self, v: Vehicle) -> Ticket:
        with self._lock:                         # atomic find + assign
            for floor in self.floors:
                for spot in floor:
                    if spot.fits(v):
                        spot.vehicle = v
                        t = Ticket(next(self._ids), v.plate, spot)
                        self.tickets[t.id] = t
                        return t
        raise RuntimeError("lot full")

    def unpark(self, ticket_id: int) -> int:
        with self._lock:
            t = self.tickets.pop(ticket_id)
            t.spot.vehicle = None
        hours = (time.time() - t.entry) / 3600
        return self.fee.fee(hours)</code></pre><p class="small muted">Upgrade: keep a free-spot set per (floor, size) to make park() O(1) instead of scanning.</p>`},
{t:"LRU cache",d:"Medium",body:`<p>O(1) get/put with a hash map + doubly linked list. In Python, <code>OrderedDict</code> gives you both. Mention thread safety for shared use.</p><pre><code>from collections import OrderedDict
import threading

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.data: OrderedDict = OrderedDict()
        self.lock = threading.Lock()

    def get(self, key):
        with self.lock:
            if key not in self.data:
                return None
            self.data.move_to_end(key)        # mark most recently used
            return self.data[key]

    def put(self, key, value):
        with self.lock:
            if key in self.data:
                self.data.move_to_end(key)
            self.data[key] = value
            if len(self.data) > self.cap:
                self.data.popitem(last=False)  # evict least recently used</code></pre><p class="small muted">Interviewers may ask you to build the linked list yourself: nodes with prev/next, sentinel head and tail, map key → node.</p>`},
{t:"Vending machine (State pattern)",d:"Medium",body:`<pre><code>class State(ABC):
    def insert(self, m, amt): raise ValueError("not now")
    def select(self, m, item): raise ValueError("not now")

class Idle(State):
    def insert(self, m, amt):
        m.balance += amt; m.state = HasMoney()

class HasMoney(State):
    def insert(self, m, amt): m.balance += amt
    def select(self, m, item):
        price = m.prices[item]
        if m.stock[item] == 0: raise ValueError("sold out")
        if m.balance < price: raise ValueError("insert more")
        m.stock[item] -= 1
        change, m.balance = m.balance - price, 0
        m.state = Idle()
        return item, change

class VendingMachine:
    def __init__(self, prices, stock):
        self.prices, self.stock = prices, stock
        self.balance, self.state = 0, Idle()
    def insert(self, amt): self.state.insert(self, amt)
    def select(self, item): return self.state.select(self, item)</code></pre>`},
{t:"Elevator system",d:"Medium",body:`<p><b>Entities</b>: ElevatorSystem, Elevator(id, current_floor, direction, stops), Request(floor, direction), Dispatcher (Strategy). <b>Scheduling</b>: SCAN/LOOK: keep moving in one direction serving stops, then reverse. <b>Dispatch strategy</b>: assign a hall call to the nearest elevator already moving toward that floor in the same direction, else the nearest idle one.</p><pre><code>class Direction(Enum): UP = 1; DOWN = -1; IDLE = 0

class Elevator:
    def __init__(self, eid):
        self.id, self.floor, self.dir = eid, 0, Direction.IDLE
        self.up, self.down = set(), set()      # pending stops
    def add_stop(self, f):
        (self.up if f > self.floor else self.down).add(f)
    def step(self):
        if self.dir != Direction.DOWN and self.up:
            self.dir = Direction.UP; self.floor += 1
            self.up.discard(self.floor)
        elif self.down:
            self.dir = Direction.DOWN; self.floor -= 1
            self.down.discard(self.floor)
        else:
            self.dir = Direction.IDLE

class NearestCarDispatcher:
    def pick(self, elevators, floor):
        return min(elevators, key=lambda e: abs(e.floor - floor))</code></pre>`},
{t:"Splitwise",d:"Hard",body:`<p><b>Entities</b>: User, Group, Expense(paid_by, amount, splits), Split (Equal/Exact/Percent via Strategy), BalanceSheet. Store <b>net balances</b> per pair; simplify debts with a greedy match of biggest creditor vs biggest debtor (two heaps).</p><pre><code>from collections import defaultdict
import heapq

class Ledger:
    def __init__(self): self.net = defaultdict(float)   # + is owed money
    def add_expense(self, payer, amount, shares: dict[str, float]):
        assert abs(sum(shares.values()) - amount) < 1e-6
        for user, share in shares.items():
            self.net[user] -= share
        self.net[payer] += amount

    def settle(self):
        cred = [(-v, u) for u, v in self.net.items() if v > 1e-9]
        debt = [(v, u) for u, v in self.net.items() if v < -1e-9]
        heapq.heapify(cred); heapq.heapify(debt)
        out = []
        while cred and debt:
            c, cu = heapq.heappop(cred); d, du = heapq.heappop(debt)
            amt = min(-c, -d)
            out.append((du, cu, round(amt, 2)))
            if -c - amt > 1e-9: heapq.heappush(cred, (c + amt, cu))
            if -d - amt > 1e-9: heapq.heappush(debt, (d + amt, du))
        return out   # list of (from, to, amount)</code></pre><p class="small muted">Use integer paise in production, not floats.</p>`},
{t:"Movie ticket booking (concurrency)",d:"Hard",body:`<p><b>Entities</b>: Movie, Theatre, Screen, Show, Seat, Booking, SeatLock. <b>Key problem</b>: two users selecting the same seat. Hold seats with an expiry under a lock, confirm on payment.</p><pre><code>class SeatLockManager:
    def __init__(self, ttl=600):
        self.ttl, self.locks, self.mu = ttl, {}, threading.Lock()   # (show, seat) -> (user, expiry)

    def lock(self, show, seats, user):
        now = time.time()
        with self.mu:
            for s in seats:
                held = self.locks.get((show, s))
                if held and held[1] > now and held[0] != user:
                    return False                          # someone else holds it
            for s in seats:
                self.locks[(show, s)] = (user, now + self.ttl)
            return True

    def confirm(self, show, seats, user, booked: set):
        with self.mu:
            now = time.time()
            if any(self.locks.get((show, s), (None, 0))[0] != user
                   or self.locks[(show, s)][1] < now for s in seats):
                raise ValueError("hold expired")
            for s in seats:
                booked.add((show, s)); del self.locks[(show, s)]</code></pre><p class="small muted">Also check <code>booked</code> inside lock(). In a real system this maps to a DB conditional update or Redis SET NX with TTL.</p>`}
],
ladder:[
["Parking Lot","Easy","Spots, tickets, fee strategy, locking"],["Stack Overflow","Easy","Questions, answers, votes, reputation"],["Vending Machine","Easy","State pattern"],["Logging Framework","Easy","Levels, appenders, chain of responsibility"],["Traffic Signal Control","Easy","State + timers"],["Coffee Vending Machine","Easy","Decorator for add-ons"],["Task Management System","Easy","Tasks, assignees, status, observers"],
["ATM","Medium","State + chain of responsibility for notes"],["LinkedIn","Medium","Profiles, connections, feed"],["LRU Cache","Medium","HashMap + doubly linked list"],["Tic Tac Toe","Medium","Board, players, win check in O(1)"],["Pub Sub System","Medium","Observer, topics, subscribers"],["Elevator System","Medium","SCAN scheduling, dispatcher strategy"],["Car Rental System","Medium","Inventory, reservations, pricing"],["Online Auction","Medium","Bids, timers, observer notifications"],["Hotel Management","Medium","Rooms, bookings, payments"],["Digital Wallet","Medium","Accounts, transfers, idempotency"],["Airline Management","Medium","Flights, seats, bookings"],["Library Management","Medium","Books, copies, loans, fines"],["Social Network (Facebook)","Medium","Users, posts, friends, feed"],["Restaurant Management","Medium","Orders, tables, kitchen queue"],["Concert Ticket Booking","Medium","Seat locks with TTL"],
["CricInfo","Hard","Matches, innings, live score observers"],["Splitwise","Hard","Split strategies, debt simplification"],["Chess","Hard","Pieces with move strategies, game state"],["Snake and Ladder","Hard","Board, dice, players, turns"],["Ride Sharing (Uber)","Hard","Matching strategy, trip state"],["Course Registration","Hard","Capacity, waitlists, concurrency"],["Movie Ticket Booking","Hard","Shows, seat holds, payments"],["Online Shopping (Amazon)","Hard","Cart, orders, payments, inventory"],["Stock Brokerage","Hard","Order book, matching engine"],["Music Streaming (Spotify)","Hard","Playlists, player state, recommendations"],["Food Delivery (Swiggy)","Hard","Restaurants, orders, delivery assignment"],
["Thread-safe cache with TTL","Concurrency","Locks + expiry"],["Thread-safe blocking queue","Concurrency","Condition variables"],["Concurrent HashMap","Concurrency","Lock striping"],["Print FooBar alternately","Concurrency","Semaphores"],["Fizz Buzz multithreaded","Concurrency","Coordination between 4 threads"]
]};

const RESOURCES=[
{g:"Your study spine",items:[
["GfG: Getting started with system design","https://www.geeksforgeeks.org/system-design/getting-started-with-system-design","The base of Phase 1."],
["Hello Interview: System Design in a Hurry","https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction","Delivery framework, core concepts, key technologies, problem breakdowns."],
["AlgoMaster: System Design","https://algomaster.io/learn/system-design/what-is-system-design","Structured fundamentals: networking, APIs, caching, DBs, distributed systems."],
["awesome-low-level-design","https://github.com/ashishps1/awesome-low-level-design","LLD problems by difficulty and design patterns."],
["System design notes (Alex Xu chapters)","https://github.com/liquidslr/system-design-notes","Chapter notes: rate limiter, KV store, chat, YouTube, payments and more."],
["Mastering System Design (Udemy)","https://www.udemy.com/course/mastering-system-design-from-basics-to-cracking-interviews/","Optional paid second explanation."]]},
{g:"Reference",items:[
["System Design Primer","https://github.com/donnemartin/system-design-primer","Classic free reference with Anki cards."],
["ByteByteGo guides","https://bytebytego.com/guides/","Visual one-page explanations."],
["Latency numbers every programmer should know","https://gist.github.com/jboner/2841832","The numbers behind napkin math."],
["Designing Data-Intensive Applications","https://dataintensive.net/","The deep book on replication, partitioning, consistency."],
["Raft visualisation","https://raft.github.io/","See leader election and log replication animate."],
["Excalidraw","https://excalidraw.com/","Full Excalidraw for big boards (the Whiteboard here embeds the same editor)."]]},
{g:"Real-world engineering reads",items:[
["Discord: storing trillions of messages","https://discord.com/blog/how-discord-stores-trillions-of-messages","Cassandra to ScyllaDB for chat storage."],
["Stripe: designing robust APIs with idempotency","https://stripe.com/blog/idempotency","Idempotency keys, retries, exponential backoff."],
["Instagram: sharding and IDs","https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c","Logical shards and time-sortable IDs in Postgres."],
["Twitter: announcing Snowflake","https://blog.x.com/engineering/en_us/a/2010/announcing-snowflake","The original distributed ID generator."],
["Dropbox: inside Magic Pocket","https://dropbox.tech/infrastructure/inside-the-magic-pocket","Exabyte-scale block storage."],
["Uber: H3 hexagonal index","https://www.uber.com/blog/h3/","Geospatial indexing for dispatch and pricing."],
["Figma: how multiplayer works","https://www.figma.com/blog/how-figmas-multiplayer-technology-works/","Real-time collaboration design."],
["Slack: scaling the job queue","https://slack.engineering/scaling-slacks-job-queue/","Putting Kafka in front of the existing Redis job queue."],
["Netflix Open Connect","https://openconnect.netflix.com/","Netflix's own CDN inside ISPs."],
["Amazon Dynamo paper","https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf","Consistent hashing, quorums, vector clocks."]]},
{g:"AI system design",items:[
["Chip Huyen: building a GenAI platform","https://huyenchip.com/2024/07/25/genai-platform.html","The full LLM platform picture."],
["Anthropic: building effective agents","https://www.anthropic.com/engineering/building-effective-agents","Workflows vs agents, the core patterns."],
["Anthropic: contextual retrieval","https://www.anthropic.com/news/contextual-retrieval","Better RAG with contextual chunks, BM25 and reranking."],
["Model Context Protocol","https://modelcontextprotocol.io/introduction","How tools and data are exposed to models."],
["DeepLearning.AI short courses","https://www.deeplearning.ai/courses","Free RAG, agents and evals courses."],
["Claude cookbooks","https://github.com/anthropics/claude-cookbooks","Practical recipes for RAG, tools and evals."]]}
];

/* Planner day → lesson in this site */
const PLAN_LINKS=(function(){
  const rules=[[/internet works|HTTP in depth/,"topic-internet"],[/DNS and CDN/,"topic-dns-cdn"],[/^API styles/,"topic-api-styles"],[/API design/,"topic-api-design"],[/Proxies|Load balancers/,"topic-proxies-lb"],[/Scaling out/,"topic-scalability"],[/Caching patterns|scale lab/,"topic-caching"],[/Caching problems/,"topic-cache-problems"],[/Consistent hashing/,"topic-consistent-hashing"],[/Relational basics/,"topic-acid"],[/^Indexes/,"topic-indexing"],[/SQL vs NoSQL|Postgres deep/,"topic-sql-nosql"],[/^Replication/,"topic-replication"],[/Partitioning/,"topic-sharding"],[/CAP/,"topic-cap"],[/Queues|Background jobs/,"topic-queues"],[/^Rate limiting/,"topic-rate-limit"],[/Idempotency and retries/,"topic-resilience"],[/^Auth/,"topic-auth"],[/^Observability/,"topic-observability"],[/checkpoint/,"quiz"],[/The framework/,"topic-framework"],[/Estimation/,"gym"],[/URL shortener/,"problem-url-shortener"],[/Rate limiter/,"problem-rate-limiter"],[/Notification/,"problem-notification"],[/Real-time patterns/,"topic-realtime"],[/WhatsApp|Real-world read/,"problem-chat"],[/News feed/,"problem-news-feed"],[/Dropbox/,"problem-dropbox"],[/autocomplete/,"problem-autocomplete"],[/mock|Mock/,"mock"],[/Job scheduler/,"problem-job-scheduler"],[/Payment/,"problem-payment"],[/Ticketmaster/,"problem-ticketmaster"],[/OOP \+ SOLID/,"topic-oop-solid"],[/Patterns that/,"topic-patterns"],[/Parking lot|Approval state|LRU cache|Two timed LLD/,"lld"],[/LLM app anatomy|Tokens, sampling/,"topic-llm-apps"],[/RAG|Chunking|Hybrid search/,"topic-rag"],[/Agents|Agent design|Context engineering|Evaluation|evals|Guardrails/,"topic-agents"],[/Latency and cost|Serving|Fine-tuning|Enterprise/,"topic-llm-serving"],[/LLM gateway/,"problem-llm-gateway"],[/AI designs/,"problem-rag-qa"],[/Workflow engine|Capstone 1|workflow platforms/,"problem-workflow-engine"],[/Capstone 2/,"problem-rag-qa"],[/Write-up \+ diagram|Resume project/,"board"]];
  const out={};WEEKS.forEach((w,wi)=>w.days.forEach((d,j)=>{for(const [re,r] of rules){if(re.test(d.t)){out[wi*7+j]=r;break;}}}));return out;
})();

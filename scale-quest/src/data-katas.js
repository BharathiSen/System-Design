/* ===== Runnable LLD katas (Python, tested in the browser) ===== */
const KATAS=[
{id:"lru",title:"LRU cache",diff:"Easy",pattern:"Hash map + ordered dict",
spec:`Build <code>LRUCache(capacity)</code> with <code>get(key)</code> and <code>put(key, value)</code>, both O(1).
<ul><li><code>get</code> returns the value, or <code>-1</code> if missing, and marks the key as recently used.</li><li><code>put</code> inserts or updates. When over capacity, evict the <b>least recently used</b> key.</li></ul>`,
starter:`class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        # TODO: choose a structure that keeps usage order

    def get(self, key):
        # TODO
        return -1

    def put(self, key, value) -> None:
        # TODO
        pass
`,
tests:`def test_basic():
    c = LRUCache(2)
    c.put(1, "a"); c.put(2, "b")
    assert c.get(1) == "a", "get(1) should return 'a'"
def test_evicts_least_recent():
    c = LRUCache(2)
    c.put(1, "a"); c.put(2, "b"); c.get(1); c.put(3, "c")
    assert c.get(2) == -1, "2 was least recently used and should be evicted"
    assert c.get(1) == "a" and c.get(3) == "c"
def test_update_moves_to_front():
    c = LRUCache(2)
    c.put(1, "a"); c.put(2, "b"); c.put(1, "A"); c.put(3, "c")
    assert c.get(1) == "A", "updating a key should refresh it"
    assert c.get(2) == -1
def test_missing():
    assert LRUCache(1).get(42) == -1
def test_capacity_one():
    c = LRUCache(1); c.put(1, 1); c.put(2, 2)
    assert c.get(1) == -1 and c.get(2) == 2
`,
hints:["Python's collections.OrderedDict has move_to_end(key) and popitem(last=False).","On get: if present, move_to_end and return. On put: set, move_to_end, then pop the oldest while len > capacity."],
solution:`from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)          # now most recent
        return self.data[key]

    def put(self, key, value) -> None:
        self.data[key] = value
        self.data.move_to_end(key)
        while len(self.data) > self.capacity:
            self.data.popitem(last=False)   # drop least recent
`},
{id:"bucket",title:"Token bucket rate limiter",diff:"Easy",pattern:"Injected clock (testable time)",
spec:`Build <code>TokenBucket(capacity, refill_per_sec, clock)</code> with <code>allow() -> bool</code>.
<ul><li>The bucket starts full. Each allowed request uses 1 token.</li><li>Tokens refill continuously at <code>refill_per_sec</code>, never above <code>capacity</code>.</li><li><code>clock()</code> returns the current time in seconds. It's passed in so tests can control time.</li></ul>`,
starter:`class TokenBucket:
    def __init__(self, capacity, refill_per_sec, clock):
        self.capacity = capacity
        self.rate = refill_per_sec
        self.clock = clock
        # TODO

    def allow(self) -> bool:
        # TODO: refill based on elapsed time, then try to take a token
        return True
`,
tests:`class FakeClock:
    def __init__(self): self.t = 0.0
    def __call__(self): return self.t
def test_burst_up_to_capacity():
    clk = FakeClock(); b = TokenBucket(3, 1, clk)
    assert [b.allow() for _ in range(4)] == [True, True, True, False], "3 allowed, 4th rejected"
def test_refills_over_time():
    clk = FakeClock(); b = TokenBucket(2, 1, clk)
    b.allow(); b.allow()
    assert b.allow() is False
    clk.t = 1.0
    assert b.allow() is True, "after 1 s one token should be back"
    assert b.allow() is False
def test_never_exceeds_capacity():
    clk = FakeClock(); b = TokenBucket(2, 10, clk)
    clk.t = 100.0
    assert [b.allow() for _ in range(3)] == [True, True, False], "bucket must cap at capacity"
def test_fractional_refill():
    clk = FakeClock(); b = TokenBucket(1, 2, clk)
    b.allow(); clk.t = 0.25
    assert b.allow() is False, "only half a token after 0.25 s at 2/s"
    clk.t = 0.5
    assert b.allow() is True
`,
hints:["Store tokens (a float) and the last refill time.","tokens = min(capacity, tokens + (now - last) * rate); last = now. Then allow if tokens >= 1 and subtract 1."],
solution:`class TokenBucket:
    def __init__(self, capacity, refill_per_sec, clock):
        self.capacity = capacity
        self.rate = refill_per_sec
        self.clock = clock
        self.tokens = float(capacity)
        self.last = clock()

    def allow(self) -> bool:
        now = self.clock()
        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)
        self.last = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False
`},
{id:"parking",title:"Parking lot",diff:"Medium",pattern:"Entities + allocation strategy",
spec:`Build <code>ParkingLot(spots)</code> where <code>spots</code> is like <code>{"small": 1, "medium": 2, "large": 1}</code>.
<ul><li><code>park(vehicle_id, size)</code> returns a spot id such as <code>"medium-1"</code>, or <code>None</code> if full. A vehicle may use its own size or any <b>bigger</b> spot, choosing the smallest that fits (small &lt; medium &lt; large).</li><li>The same vehicle can't park twice (return <code>None</code>).</li><li><code>leave(vehicle_id)</code> frees the spot and returns <code>True</code>, or <code>False</code> if unknown.</li><li><code>available(size)</code> returns free spots of exactly that size.</li></ul>`,
starter:`SIZES = ["small", "medium", "large"]

class ParkingLot:
    def __init__(self, spots: dict):
        # TODO: create spot ids like "small-1", "medium-1", "medium-2"
        pass

    def park(self, vehicle_id: str, size: str):
        # TODO
        return None

    def leave(self, vehicle_id: str) -> bool:
        # TODO
        return False

    def available(self, size: str) -> int:
        # TODO
        return 0
`,
tests:`def test_exact_fit():
    lot = ParkingLot({"small": 1, "medium": 1, "large": 1})
    assert lot.park("car1", "medium") == "medium-1"
def test_uses_bigger_when_full():
    lot = ParkingLot({"small": 1, "medium": 1, "large": 1})
    lot.park("b1", "small")
    assert lot.park("b2", "small") == "medium-1", "small is full, so use the next size up"
def test_full_returns_none():
    lot = ParkingLot({"small": 0, "medium": 0, "large": 1})
    assert lot.park("t1", "large") == "large-1"
    assert lot.park("t2", "large") is None
def test_no_double_park():
    lot = ParkingLot({"small": 2, "medium": 0, "large": 0})
    lot.park("x", "small")
    assert lot.park("x", "small") is None, "the same vehicle can't take two spots"
def test_leave_frees_spot():
    lot = ParkingLot({"small": 1, "medium": 0, "large": 0})
    lot.park("a", "small")
    assert lot.available("small") == 0
    assert lot.leave("a") is True and lot.available("small") == 1
    assert lot.leave("ghost") is False
def test_large_cannot_use_small():
    lot = ParkingLot({"small": 3, "medium": 0, "large": 0})
    assert lot.park("bus", "large") is None
`,
hints:["Keep a dict spot_id -> vehicle_id or None, and a dict vehicle_id -> spot_id.","For park: loop over SIZES starting at SIZES.index(size); take the first free spot."],
solution:`SIZES = ["small", "medium", "large"]

class ParkingLot:
    def __init__(self, spots: dict):
        self.spots = {}                      # spot_id -> vehicle_id or None
        for size in SIZES:
            for i in range(1, spots.get(size, 0) + 1):
                self.spots[f"{size}-{i}"] = None
        self.where = {}                      # vehicle_id -> spot_id

    def park(self, vehicle_id: str, size: str):
        if vehicle_id in self.where:
            return None
        for s in SIZES[SIZES.index(size):]:
            for spot, v in self.spots.items():
                if spot.startswith(s + "-") and v is None:
                    self.spots[spot] = vehicle_id
                    self.where[vehicle_id] = spot
                    return spot
        return None

    def leave(self, vehicle_id: str) -> bool:
        spot = self.where.pop(vehicle_id, None)
        if spot is None:
            return False
        self.spots[spot] = None
        return True

    def available(self, size: str) -> int:
        return sum(1 for s, v in self.spots.items() if s.startswith(size + "-") and v is None)
`},
{id:"vending",title:"Vending machine (State pattern)",diff:"Medium",pattern:"State",
spec:`Build <code>VendingMachine(items)</code> where <code>items</code> maps a code to <code>(price, count)</code>, e.g. <code>{"A1": (20, 2)}</code>. Amounts are whole rupees.
<ul><li><code>insert(amount)</code> adds money to the current balance.</li><li><code>select(code)</code> dispenses and returns the change. Raise <code>ValueError</code> with the message <code>"insert money first"</code> (balance 0), <code>"unknown item"</code>, <code>"sold out"</code>, or <code>"insufficient funds"</code> (balance kept).</li><li><code>cancel()</code> returns the balance and resets to 0.</li><li><code>state</code> is <code>"idle"</code> with no money and <code>"has_money"</code> otherwise.</li></ul>`,
starter:`class VendingMachine:
    def __init__(self, items: dict):
        self.items = dict(items)
        self.balance = 0

    @property
    def state(self) -> str:
        # TODO
        return "idle"

    def insert(self, amount: int) -> None:
        # TODO
        pass

    def select(self, code: str) -> int:
        # TODO: validate, dispense, return change
        return 0

    def cancel(self) -> int:
        # TODO
        return 0
`,
tests:`def _raises(fn, msg):
    try:
        fn()
    except ValueError as e:
        assert str(e) == msg, f"expected '{msg}', got '{e}'"
        return
    assert False, f"expected ValueError('{msg}')"
def test_happy_path():
    m = VendingMachine({"A1": (20, 1)})
    assert m.state == "idle"
    m.insert(50)
    assert m.state == "has_money"
    assert m.select("A1") == 30 and m.state == "idle"
def test_errors():
    m = VendingMachine({"A1": (20, 1), "B1": (10, 0)})
    _raises(lambda: m.select("A1"), "insert money first")
    m.insert(10)
    _raises(lambda: m.select("ZZ"), "unknown item")
    _raises(lambda: m.select("B1"), "sold out")
    _raises(lambda: m.select("A1"), "insufficient funds")
    assert m.balance == 10, "balance must be kept after a failed select"
def test_stock_decrements():
    m = VendingMachine({"A1": (5, 1)})
    m.insert(5); m.select("A1"); m.insert(5)
    _raises(lambda: m.select("A1"), "sold out")
def test_cancel_refunds():
    m = VendingMachine({"A1": (20, 1)})
    m.insert(10); m.insert(5)
    assert m.cancel() == 15 and m.balance == 0 and m.state == "idle"
`,
hints:["state can simply be derived: 'has_money' if balance > 0 else 'idle'.","Check the errors in order: no money, unknown, sold out, not enough. Only then subtract stock and compute change = balance - price; reset balance to 0."],
solution:`class VendingMachine:
    def __init__(self, items: dict):
        self.items = dict(items)
        self.balance = 0

    @property
    def state(self) -> str:
        return "has_money" if self.balance > 0 else "idle"

    def insert(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.balance += amount

    def select(self, code: str) -> int:
        if self.balance == 0:
            raise ValueError("insert money first")
        if code not in self.items:
            raise ValueError("unknown item")
        price, count = self.items[code]
        if count == 0:
            raise ValueError("sold out")
        if self.balance < price:
            raise ValueError("insufficient funds")
        self.items[code] = (price, count - 1)
        change, self.balance = self.balance - price, 0
        return change

    def cancel(self) -> int:
        refund, self.balance = self.balance, 0
        return refund
`},
{id:"splitwise",title:"Splitwise balances",diff:"Medium",pattern:"Ledger + greedy settlement",
spec:`Build <code>Splitwise()</code>:
<ul><li><code>add_expense(paid_by, amount, among)</code> splits <code>amount</code> equally among the people in <code>among</code> (the payer may or may not be included).</li><li><code>balances()</code> returns a dict person → net amount, rounded to 2 decimals: positive means they are owed money, negative means they owe. Everyone mentioned appears.</li><li><code>settle()</code> returns a list of <code>(from, to, amount)</code> payments that clear all debts, using at most <i>n − 1</i> payments.</li></ul>`,
starter:`class Splitwise:
    def __init__(self):
        self.net = {}

    def add_expense(self, paid_by: str, amount: float, among: list) -> None:
        # TODO
        pass

    def balances(self) -> dict:
        # TODO
        return {}

    def settle(self) -> list:
        # TODO: greedy: biggest debtor pays biggest creditor
        return []
`,
tests:`def test_simple_split():
    s = Splitwise(); s.add_expense("A", 300, ["A", "B", "C"])
    assert s.balances() == {"A": 200.0, "B": -100.0, "C": -100.0}
def test_payer_not_included():
    s = Splitwise(); s.add_expense("A", 100, ["B", "C"])
    assert s.balances() == {"A": 100.0, "B": -50.0, "C": -50.0}
def test_balances_sum_to_zero():
    s = Splitwise(); s.add_expense("A", 90, ["A", "B", "C"]); s.add_expense("B", 60, ["A", "B"])
    b = s.balances()
    assert len(b) == 3, "everyone mentioned should appear"
    assert abs(sum(b.values())) < 0.01
def _apply(bal, pays):
    b = dict(bal)
    for f, t, amt in pays:
        assert amt > 0, "payments must be positive"
        b[f] += amt; b[t] -= amt
    return b
def test_settle_clears_everything():
    s = Splitwise(); s.add_expense("A", 300, ["A", "B", "C"]); s.add_expense("B", 90, ["A", "B", "C"])
    pays = s.settle()
    assert pays, "there are debts, so settle() must return payments"
    after = _apply(s.balances(), pays)
    assert all(abs(v) < 0.01 for v in after.values()), f"left over: {after}"
    assert len(pays) <= 2, "3 people need at most 2 payments"
`,
hints:["Each expense: share = amount / len(among); net[paid_by] += amount; net[p] -= share for p in among.","settle: repeatedly take the most negative (debtor) and most positive (creditor), pay min(-debt, credit), until all are ~0."],
solution:`class Splitwise:
    def __init__(self):
        self.net = {}

    def add_expense(self, paid_by: str, amount: float, among: list) -> None:
        share = amount / len(among)
        self.net[paid_by] = self.net.get(paid_by, 0) + amount
        for p in among:
            self.net[p] = self.net.get(p, 0) - share

    def balances(self) -> dict:
        return {p: round(v, 2) for p, v in self.net.items()}

    def settle(self) -> list:
        bal = {p: round(v, 2) for p, v in self.net.items()}
        pays = []
        while True:
            debtor = min(bal, key=bal.get)
            creditor = max(bal, key=bal.get)
            if bal[creditor] < 0.01:
                return pays
            amt = round(min(-bal[debtor], bal[creditor]), 2)
            if amt <= 0:
                return pays
            pays.append((debtor, creditor, amt))
            bal[debtor] += amt
            bal[creditor] -= amt
`},
{id:"eventbus",title:"Event bus (Observer pattern)",diff:"Medium",pattern:"Observer",
spec:`Build <code>EventBus()</code> for notifications between parts of an app:
<ul><li><code>subscribe(topic, handler)</code> registers a function and returns an unsubscribe function.</li><li><code>publish(topic, payload)</code> calls every handler for that topic, in subscription order, and returns how many handlers ran <b>successfully</b>.</li><li>If one handler raises an exception, the others must still run (log it in <code>self.errors</code> as a list of <code>(topic, error message)</code>).</li><li>Subscribing the same handler twice to a topic must not call it twice.</li></ul>`,
starter:`class EventBus:
    def __init__(self):
        self.errors = []
        # TODO

    def subscribe(self, topic: str, handler):
        # TODO: return a function that unsubscribes
        return lambda: None

    def publish(self, topic: str, payload) -> int:
        # TODO
        return 0
`,
tests:`def test_delivers_in_order():
    bus, seen = EventBus(), []
    bus.subscribe("order", lambda p: seen.append(("a", p)))
    bus.subscribe("order", lambda p: seen.append(("b", p)))
    assert bus.publish("order", 7) == 2 and seen == [("a", 7), ("b", 7)]
def test_other_topics_untouched():
    bus, seen = EventBus(), []
    bus.subscribe("x", seen.append)
    assert bus.publish("y", 1) == 0 and seen == []
def test_failing_handler_isolated():
    bus, seen = EventBus(), []
    def bad(p): raise RuntimeError("boom")
    bus.subscribe("t", bad); bus.subscribe("t", seen.append)
    assert bus.publish("t", 1) == 1 and seen == [1]
    assert bus.errors == [("t", "boom")]
def test_unsubscribe():
    bus, seen = EventBus(), []
    off = bus.subscribe("t", seen.append); off()
    assert bus.publish("t", 1) == 0 and seen == []
def test_no_duplicate_subscription():
    bus, seen = EventBus(), []
    bus.subscribe("t", seen.append); bus.subscribe("t", seen.append)
    bus.publish("t", 1)
    assert seen == [1]
`,
hints:["Keep a dict topic -> list of handlers; skip adding a handler that's already in the list.","In publish, wrap each call in try/except Exception as e, append (topic, str(e)) to errors, and count successes."],
solution:`class EventBus:
    def __init__(self):
        self.errors = []
        self.subs = {}

    def subscribe(self, topic: str, handler):
        handlers = self.subs.setdefault(topic, [])
        if handler not in handlers:
            handlers.append(handler)
        def unsubscribe():
            if handler in handlers:
                handlers.remove(handler)
        return unsubscribe

    def publish(self, topic: str, payload) -> int:
        ok = 0
        for h in list(self.subs.get(topic, [])):
            try:
                h(payload)
                ok += 1
            except Exception as e:
                self.errors.append((topic, str(e)))
        return ok
`}
];

/* ===== Schema design exercises + runnable SQL practice ===== */
const SCHEMAS=[
{id:"library",title:"Library management",diff:"Easy",
prompt:"Design the tables for a college library. Members borrow books, return them late sometimes, and pay fines. The library owns several copies of popular books.",
reqs:["Search books by title, author or ISBN","A book can have many physical copies","Track who has which copy and when it's due","Find a member's current loans and overdue ones","Record fines"],
hints:["Is a \"book\" the same thing as the physical copy on the shelf?","A loan connects a member to a copy for a period of time. What columns does it need to tell 'active' from 'returned'?","Which query will run all day at the counter? Index for that."],
answer:`<pre><code>CREATE TABLE members (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  joined_on   DATE NOT NULL DEFAULT CURRENT_DATE
);
CREATE TABLE books (            -- the title (one row per ISBN)
  id      BIGSERIAL PRIMARY KEY,
  isbn    TEXT UNIQUE NOT NULL,
  title   TEXT NOT NULL,
  author  TEXT NOT NULL
);
CREATE TABLE book_copies (      -- the physical item on the shelf
  id       BIGSERIAL PRIMARY KEY,
  book_id  BIGINT NOT NULL REFERENCES books(id),
  barcode  TEXT UNIQUE NOT NULL,
  status   TEXT NOT NULL DEFAULT 'available'  -- available | on_loan | lost
);
CREATE TABLE loans (
  id           BIGSERIAL PRIMARY KEY,
  copy_id      BIGINT NOT NULL REFERENCES book_copies(id),
  member_id    BIGINT NOT NULL REFERENCES members(id),
  borrowed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_on       DATE NOT NULL,
  returned_at  TIMESTAMPTZ            -- NULL while the book is out
);
CREATE TABLE fines (
  id        BIGSERIAL PRIMARY KEY,
  loan_id   BIGINT NOT NULL REFERENCES loans(id),
  amount    NUMERIC(8,2) NOT NULL CHECK (amount &gt; 0),
  paid_at   TIMESTAMPTZ
);
CREATE INDEX ON loans (member_id) WHERE returned_at IS NULL;   -- "my current loans"
CREATE UNIQUE INDEX ON loans (copy_id) WHERE returned_at IS NULL; -- a copy can't be lent twice
CREATE INDEX ON books (title);</code></pre>`,
why:["<b>Book vs copy</b> is the key insight: title data lives once in <code>books</code>; each shelf item is a <code>book_copies</code> row.","<code>returned_at IS NULL</code> means \"still out\", so you never delete loans and keep full history.","The <b>partial unique index</b> makes the database itself refuse to lend the same copy twice, even if two librarians click at once.","Fines hang off a loan, so you always know which late return caused them. Money uses <code>NUMERIC</code>, never <code>FLOAT</code>."],
check:["Separate tables for the book title and the physical copy","A loans table with due date and a nullable returned date","Foreign keys from loans to member and copy","An index for a member's active loans","Money stored as NUMERIC / integer paise, not float"]},

{id:"instagram",title:"Instagram-style photo app",diff:"Medium",
prompt:"Design the core tables for a photo-sharing app: users post photos with captions, follow each other, like and comment on posts. The home feed shows recent posts from people you follow.",
reqs:["Users can follow and unfollow others","Posts with an image and caption","Likes (one per user per post) and comments","Show like and comment counts fast","A user's profile grid, newest first"],
hints:["A follow is a relationship between two users. What's its primary key?","How do you stop the same user liking a post twice, without extra code?","Counting likes on every page view is slow. What could you store instead?"],
answer:`<pre><code>CREATE TABLE users (
  id          BIGINT PRIMARY KEY,          -- Snowflake-style ID
  username    TEXT UNIQUE NOT NULL,
  bio         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE follows (
  follower_id  BIGINT NOT NULL REFERENCES users(id),
  followee_id  BIGINT NOT NULL REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id)   -- no duplicate follows
);
CREATE INDEX ON follows (followee_id);      -- "who follows me?"
CREATE TABLE posts (
  id             BIGINT PRIMARY KEY,
  user_id        BIGINT NOT NULL REFERENCES users(id),
  image_key      TEXT NOT NULL,             -- object-storage key, not the image
  caption        TEXT,
  like_count     INT NOT NULL DEFAULT 0,    -- denormalised counter
  comment_count  INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON posts (user_id, created_at DESC);   -- profile grid
CREATE TABLE likes (
  user_id     BIGINT NOT NULL REFERENCES users(id),
  post_id     BIGINT NOT NULL REFERENCES posts(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)            -- one like per user per post
);
CREATE TABLE comments (
  id          BIGINT PRIMARY KEY,
  post_id     BIGINT NOT NULL REFERENCES posts(id),
  user_id     BIGINT NOT NULL REFERENCES users(id),
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON comments (post_id, created_at);</code></pre>`,
why:["<b>Composite primary keys</b> on <code>follows</code> and <code>likes</code> make duplicates impossible.","The image itself lives in object storage (S3); the row stores only its key.","<code>like_count</code> is <b>denormalised</b>: update it in the same transaction as the like insert (or asynchronously), so reading a post never runs <code>COUNT(*)</code>.","The index <code>(user_id, created_at DESC)</code> serves the profile grid directly. The home feed itself is usually a precomputed list in Redis (see the News feed problem), not a giant SQL join."],
check:["follows table with a composite primary key","likes with a composite key (or unique constraint) on post + user","Images stored as an object-storage key, not a blob in the DB","Some answer for fast counts (denormalised counter or cache)","Index on posts by user and time"]},

{id:"chat",title:"WhatsApp-style chat",diff:"Medium",
prompt:"Design tables for one-to-one and group chats. Messages must come back in order, and each person should see which messages are unread.",
reqs:["1:1 and group conversations","Members can join and leave groups","Load the latest 50 messages, then scroll up","Unread count per conversation per user","Delivered / read ticks"],
hints:["Can a 1:1 chat just be a conversation with two members?","Storing a 'read' flag per message per member explodes in big groups. What single value per member could replace it?","Which column pair do you page on?"],
answer:`<pre><code>CREATE TABLE conversations (
  id          BIGINT PRIMARY KEY,
  kind        TEXT NOT NULL CHECK (kind IN ('direct','group')),
  title       TEXT,                         -- NULL for direct chats
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE conversation_members (
  conversation_id       BIGINT NOT NULL REFERENCES conversations(id),
  user_id               BIGINT NOT NULL REFERENCES users(id),
  joined_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at               TIMESTAMPTZ,
  last_read_message_id  BIGINT,             -- read pointer
  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX ON conversation_members (user_id);   -- "my chats"
CREATE TABLE messages (
  conversation_id  BIGINT NOT NULL REFERENCES conversations(id),
  id               BIGINT NOT NULL,         -- time-sortable (Snowflake)
  sender_id        BIGINT NOT NULL REFERENCES users(id),
  body             TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, id)
);
-- newest 50:  WHERE conversation_id = $1 ORDER BY id DESC LIMIT 50
-- scroll up:  ... AND id &lt; $last_seen_id ORDER BY id DESC LIMIT 50</code></pre>`,
why:["A 1:1 chat is just a <code>direct</code> conversation with two members, so one model covers both.","<b>Read pointer</b>: <code>last_read_message_id</code> per member. Unread count = messages with a higher ID. No per-message read rows, so big groups stay cheap.","Primary key <code>(conversation_id, id)</code> keeps a chat's messages together and makes cursor pagination fast. This is the same reason Discord partitions messages by channel.","At WhatsApp scale, <code>messages</code> moves to a wide-column store (Cassandra) partitioned by conversation, but the shape stays the same."],
check:["Conversations and members as separate tables","Direct and group chats handled by one model","A per-member read pointer (not a row per message per reader)","Messages keyed by conversation + a sortable ID","Cursor (keyset) pagination, not OFFSET"]},

{id:"food-delivery",title:"Food delivery (Swiggy/Zomato)",diff:"Medium",
prompt:"Design the tables behind ordering food: restaurants with menus, customers with saved addresses, orders with items, and delivery partners.",
reqs:["Restaurants, menus with prices that change over time","Customers with several saved addresses","An order has many items and moves through statuses","Assign a delivery partner to an order","Past orders must show the price actually paid"],
hints:["If a dish's price changes tomorrow, what should yesterday's order show?","Should the order point to the customer's address row, or copy it?","Where does the live GPS location of a rider belong: here, or somewhere else?"],
answer:`<pre><code>CREATE TABLE restaurants (
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL,
  lat NUMERIC(9,6), lng NUMERIC(9,6), is_open BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE menu_items (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id),
  name TEXT NOT NULL, price_paise INT NOT NULL CHECK (price_paise &gt; 0),
  is_veg BOOLEAN NOT NULL, is_available BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE customers (id BIGSERIAL PRIMARY KEY, name TEXT, phone TEXT UNIQUE NOT NULL);
CREATE TABLE addresses (
  id BIGSERIAL PRIMARY KEY, customer_id BIGINT NOT NULL REFERENCES customers(id),
  label TEXT, line1 TEXT NOT NULL, lat NUMERIC(9,6), lng NUMERIC(9,6)
);
CREATE TABLE delivery_partners (id BIGSERIAL PRIMARY KEY, name TEXT, phone TEXT UNIQUE, vehicle TEXT);
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id),
  delivery_partner_id BIGINT REFERENCES delivery_partners(id),  -- NULL until assigned
  status TEXT NOT NULL,     -- placed | accepted | picked_up | delivered | cancelled
  delivery_address JSONB NOT NULL,     -- snapshot, not a pointer
  total_paise INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE order_items (
  order_id BIGINT NOT NULL REFERENCES orders(id),
  menu_item_id BIGINT NOT NULL REFERENCES menu_items(id),
  qty INT NOT NULL CHECK (qty &gt; 0),
  unit_price_paise INT NOT NULL,      -- price at the time of ordering
  PRIMARY KEY (order_id, menu_item_id)
);
CREATE INDEX ON orders (customer_id, created_at DESC);
CREATE INDEX ON orders (restaurant_id, status);</code></pre>`,
why:["<b>Snapshot what was true at order time</b>: <code>unit_price_paise</code> and <code>delivery_address</code> are copied into the order, so editing a menu or an address never rewrites history.","Money in integer <b>paise</b> avoids rounding errors.","The rider's live location changes every few seconds. It belongs in Redis (GEO) or a location service, not in an <code>UPDATE</code> on this table.","Index <code>(restaurant_id, status)</code> powers the restaurant's \"new orders\" screen."],
check:["order_items stores the price at the time of order","Delivery address copied into the order (or an immutable address row)","Order status column with clear states","Delivery partner as a nullable foreign key","Live rider location kept out of the main SQL tables"]},

{id:"booking",title:"Movie seat booking",diff:"Hard",
prompt:"Design the tables for booking cinema seats. Thousands of people try to grab seats for a popular show at the same second. A seat is held for 10 minutes while the user pays, and must never be sold twice.",
reqs:["Theatres, screens, a fixed seat layout per screen","Shows (a movie on a screen at a time)","Hold seats for 10 minutes during payment","Never double-sell a seat","Release holds automatically when they expire"],
hints:["Seat layout belongs to the screen, but availability belongs to the show. Which table joins them?","How can one UPDATE statement both check and claim a seat atomically?","What happens to a hold if the user just closes the tab?"],
answer:`<pre><code>CREATE TABLE screens (id BIGSERIAL PRIMARY KEY, theatre_id BIGINT NOT NULL, name TEXT);
CREATE TABLE seats (
  id BIGSERIAL PRIMARY KEY, screen_id BIGINT NOT NULL REFERENCES screens(id),
  row_label TEXT NOT NULL, number INT NOT NULL, tier TEXT NOT NULL,
  UNIQUE (screen_id, row_label, number)
);
CREATE TABLE shows (
  id BIGSERIAL PRIMARY KEY, screen_id BIGINT NOT NULL REFERENCES screens(id),
  movie_id BIGINT NOT NULL, starts_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE show_seats (            -- one row per seat per show
  show_id     BIGINT NOT NULL REFERENCES shows(id),
  seat_id     BIGINT NOT NULL REFERENCES seats(id),
  status      TEXT NOT NULL DEFAULT 'free',   -- free | held | booked
  held_by     BIGINT,                          -- user id
  hold_expires_at TIMESTAMPTZ,
  booking_id  BIGINT,
  price_paise INT NOT NULL,
  PRIMARY KEY (show_id, seat_id)
);
CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL, show_id BIGINT NOT NULL,
  status TEXT NOT NULL,        -- pending | confirmed | cancelled
  idempotency_key TEXT UNIQUE NOT NULL, total_paise INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Claim a seat atomically (0 rows updated = someone else got it):
UPDATE show_seats
   SET status='held', held_by=$user, hold_expires_at=now() + interval '10 minutes'
 WHERE show_id=$show AND seat_id=$seat
   AND (status='free' OR (status='held' AND hold_expires_at &lt; now()));</code></pre>`,
why:["<code>show_seats</code> is the heart: the layout comes from <code>seats</code>, availability is per show.","The <b>conditional UPDATE</b> is checked and applied in one atomic step, so two people can't both win. No separate SELECT-then-UPDATE race.","Expired holds count as free inside the WHERE clause, so a closed tab needs no cleanup job for correctness (a sweeper can still tidy up).","<code>idempotency_key</code> on bookings stops a double charge when the payment callback retries."],
check:["A per-show seat table (show_seats), separate from the screen layout","Status with held / booked and a hold expiry time","An atomic conditional update or row lock to claim seats","Idempotency key on bookings or payments","Expired holds treated as free"]},

{id:"ledger",title:"Wallet and payments ledger",diff:"Hard",
prompt:"Design the tables for a wallet app (like Paytm wallet): users top up, pay merchants and get refunds. Balances must always be correct and fully auditable.",
reqs:["Each user and merchant has a balance","Top-ups, payments, refunds","Never lose or create money","A full history that auditors can replay","Retries must not double-charge"],
hints:["Is a balance column the source of truth, or is it derived from something?","In double-entry bookkeeping, what must every transaction add up to?","Where does a client's retry get recognised as a duplicate?"],
answer:`<pre><code>CREATE TABLE accounts (
  id BIGSERIAL PRIMARY KEY,
  owner_type TEXT NOT NULL,     -- user | merchant | system (bank, fees)
  owner_id BIGINT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  balance_paise BIGINT NOT NULL DEFAULT 0,   -- cached, derived from entries
  UNIQUE (owner_type, owner_id, currency)
);
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT NOT NULL,             -- topup | payment | refund
  idempotency_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE ledger_entries (     -- append-only, never UPDATE or DELETE
  id BIGSERIAL PRIMARY KEY,
  transaction_id BIGINT NOT NULL REFERENCES transactions(id),
  account_id BIGINT NOT NULL REFERENCES accounts(id),
  amount_paise BIGINT NOT NULL    -- +credit / -debit
);
CREATE INDEX ON ledger_entries (account_id, id);
-- Rule: for every transaction, SUM(amount_paise) = 0.
-- Payment of ₹250: user account -25000, merchant account +25000,
-- written in ONE database transaction together with both balance updates.</code></pre>`,
why:["<b>Double-entry</b>: money only moves between accounts, so every transaction's entries sum to zero. That makes lost or invented money detectable.","<code>ledger_entries</code> is <b>append-only</b>: a refund is a new transaction, never an edit. Auditors can replay history to rebuild any balance.","<code>balance_paise</code> is a cache for fast reads, updated in the same DB transaction as the entries (with a row lock or a <code>CHECK (balance_paise &gt;= 0)</code> to stop overdrafts).","<code>idempotency_key UNIQUE</code> turns a client retry into a harmless duplicate-key error."],
check:["Double-entry entries (each transaction sums to zero)","Append-only history; refunds are new rows","Unique idempotency key","Integer money in the smallest unit","Balance updated in the same DB transaction as the entries"]},

{id:"ecommerce",title:"E-commerce catalogue and inventory",diff:"Medium",
prompt:"Design tables for an online store like Flipkart: products come in variants (size, colour), stock is held in several warehouses, and checkout must not oversell.",
reqs:["Products with variants (SKUs)","Stock per warehouse","Carts that persist across devices","Orders with items and a status","Reserve stock at checkout so it can't be oversold"],
hints:["What do you actually put in a cart and sell: the product or the SKU?","Where is stock counted, and how do you stop it going below zero?","How do you hold stock for 15 minutes during payment without selling it?"],
answer:`<pre><code>CREATE TABLE products (id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, brand TEXT, category_id BIGINT);
CREATE TABLE skus (
  id BIGSERIAL PRIMARY KEY, product_id BIGINT NOT NULL REFERENCES products(id),
  code TEXT UNIQUE NOT NULL, attributes JSONB NOT NULL,  -- {"size":"M","colour":"blue"}
  price_paise INT NOT NULL
);
CREATE TABLE inventory (
  sku_id BIGINT NOT NULL REFERENCES skus(id),
  warehouse_id BIGINT NOT NULL,
  on_hand INT NOT NULL CHECK (on_hand &gt;= 0),
  reserved INT NOT NULL DEFAULT 0 CHECK (reserved &gt;= 0 AND reserved &lt;= on_hand),
  PRIMARY KEY (sku_id, warehouse_id)
);
CREATE TABLE cart_items (
  user_id BIGINT NOT NULL, sku_id BIGINT NOT NULL REFERENCES skus(id),
  qty INT NOT NULL CHECK (qty &gt; 0), PRIMARY KEY (user_id, sku_id)
);
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL,
  status TEXT NOT NULL,      -- pending_payment | paid | shipped | cancelled
  reserved_until TIMESTAMPTZ, total_paise INT NOT NULL
);
CREATE TABLE order_items (
  order_id BIGINT REFERENCES orders(id), sku_id BIGINT REFERENCES skus(id),
  warehouse_id BIGINT NOT NULL, qty INT NOT NULL, unit_price_paise INT NOT NULL,
  PRIMARY KEY (order_id, sku_id)
);
-- Reserve at checkout (fails if not enough free stock):
UPDATE inventory SET reserved = reserved + $qty
 WHERE sku_id=$sku AND warehouse_id=$wh AND on_hand - reserved &gt;= $qty;</code></pre>`,
why:["You sell <b>SKUs</b>, not products: \"blue T-shirt, size M\" is the thing with a price and stock.","<b>CHECK constraints</b> make the database refuse negative stock even if the app has a bug.","Checkout <b>reserves</b> stock with a conditional update; payment success turns the reservation into a real decrement, and a timeout job releases expired reservations.","Order items copy the unit price, like any order snapshot."],
check:["Products and SKUs (variants) as separate tables","Inventory keyed by SKU and warehouse","A reservation step or conditional update that can't oversell","CHECK constraint or equivalent guarding stock ≥ 0","Order items with a price snapshot"]},

{id:"ride",title:"Ride hailing trips (Uber/Ola)",diff:"Medium",
prompt:"Design the tables for trips in a ride-hailing app: riders request trips, a driver accepts, the trip moves through states, and both sides rate each other.",
reqs:["Riders, drivers and their vehicles","A trip moves request → accepted → started → completed (or cancelled)","Fare and payment per trip","Ratings both ways","Find a driver's active trip instantly"],
hints:["Should the trip's state history be kept, or just the current state?","Can a driver be on two active trips? How could the DB enforce that?","Which data changes every 4 seconds and shouldn't be in this database?"],
answer:`<pre><code>CREATE TABLE riders  (id BIGSERIAL PRIMARY KEY, name TEXT, phone TEXT UNIQUE NOT NULL);
CREATE TABLE drivers (id BIGSERIAL PRIMARY KEY, name TEXT, phone TEXT UNIQUE NOT NULL, rating NUMERIC(3,2));
CREATE TABLE vehicles (id BIGSERIAL PRIMARY KEY, driver_id BIGINT NOT NULL REFERENCES drivers(id),
                       plate TEXT UNIQUE NOT NULL, kind TEXT NOT NULL);   -- auto | mini | sedan
CREATE TABLE trips (
  id BIGSERIAL PRIMARY KEY,
  rider_id BIGINT NOT NULL REFERENCES riders(id),
  driver_id BIGINT REFERENCES drivers(id),          -- NULL until accepted
  status TEXT NOT NULL,   -- requested | accepted | started | completed | cancelled
  pickup JSONB NOT NULL, dropoff JSONB NOT NULL,
  fare_paise INT, requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
-- one active trip per driver, enforced by the DB:
CREATE UNIQUE INDEX one_active_trip ON trips (driver_id)
  WHERE status IN ('accepted','started');
CREATE TABLE trip_events (     -- audit trail of every state change
  trip_id BIGINT NOT NULL REFERENCES trips(id), status TEXT NOT NULL,
  at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE ratings (
  trip_id BIGINT NOT NULL REFERENCES trips(id), by_role TEXT NOT NULL,  -- rider | driver
  stars SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5), comment TEXT,
  PRIMARY KEY (trip_id, by_role)
);</code></pre>`,
why:["Current state lives on <code>trips</code>; <b>history</b> lives in <code>trip_events</code>, which helps with disputes and analytics.","The <b>partial unique index</b> makes \"a driver can only be on one active trip\" a database rule, not just app logic.","Live driver locations (every ~4 s) go to Redis GEO or an in-memory geo index, never to this table.","Ratings keyed by <code>(trip_id, by_role)</code> allow exactly one rating each way."],
check:["Trip status column with clear states","Driver nullable until accepted","DB-enforced 'one active trip per driver' (partial unique index or equivalent)","Separate history/audit of status changes","Live locations kept out of the main SQL tables"]}
];

/* ---------- SQL practice: a small food-delivery database (SQLite in the browser) ---------- */
const SQL_SEED=`
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, city TEXT, joined_on TEXT);
CREATE TABLE restaurants (id INTEGER PRIMARY KEY, name TEXT, city TEXT, cuisine TEXT, rating REAL);
CREATE TABLE menu_items (id INTEGER PRIMARY KEY, restaurant_id INTEGER, name TEXT, price INTEGER, is_veg INTEGER);
CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, restaurant_id INTEGER, status TEXT, amount INTEGER, created_at TEXT);
CREATE TABLE order_items (order_id INTEGER, menu_item_id INTEGER, qty INTEGER);
INSERT INTO users VALUES
 (1,'Asha','Chennai','2026-01-04'),(2,'Ravi','Bengaluru','2026-02-11'),(3,'Meena','Chennai','2026-02-20'),
 (4,'Karthik','Hyderabad','2026-03-02'),(5,'Divya','Bengaluru','2026-03-15'),(6,'Arjun','Chennai','2026-04-01'),
 (7,'Sneha','Hyderabad','2026-04-18'),(8,'Vikram','Chennai','2026-05-09');
INSERT INTO restaurants VALUES
 (1,'Saravana Bhavan','Chennai','South Indian',4.5),(2,'Biryani Junction','Hyderabad','Biryani',4.2),
 (3,'Pizza Corner','Bengaluru','Italian',3.9),(4,'Anjappar','Chennai','Chettinad',4.1),
 (5,'Green Bowl','Bengaluru','Healthy',4.4),(6,'Dosa Plaza','Chennai','South Indian',3.8);
INSERT INTO menu_items VALUES
 (1,1,'Masala Dosa',120,1),(2,1,'Mini Tiffin',180,1),(3,1,'Filter Coffee',60,1),
 (4,2,'Chicken Biryani',280,0),(5,2,'Veg Biryani',220,1),(6,2,'Mutton Biryani',360,0),
 (7,3,'Margherita',250,1),(8,3,'Pepperoni',350,0),(9,3,'Garlic Bread',150,1),
 (10,4,'Chettinad Chicken',320,0),(11,4,'Parotta',50,1),(12,5,'Quinoa Salad',260,1),
 (13,5,'Paneer Wrap',190,1),(14,6,'Paper Dosa',140,1),(15,6,'Rava Dosa',130,1);
INSERT INTO orders (id,user_id,restaurant_id,status,created_at) VALUES
 (1,1,1,'delivered','2026-11-01 08:10'),(2,1,4,'delivered','2026-11-01 20:05'),(3,2,3,'delivered','2026-11-02 13:30'),
 (4,3,1,'cancelled','2026-11-02 09:00'),(5,4,2,'delivered','2026-11-03 21:15'),(6,1,1,'delivered','2026-11-03 08:20'),
 (7,5,5,'delivered','2026-11-03 13:00'),(8,2,3,'cancelled','2026-11-04 19:45'),(9,6,6,'delivered','2026-11-04 08:30'),
 (10,4,2,'delivered','2026-11-04 20:40'),(11,3,4,'delivered','2026-11-05 21:00'),(12,5,5,'delivered','2026-11-05 12:50'),
 (13,1,6,'placed','2026-11-06 08:05'),(14,7,2,'delivered','2026-11-06 22:10'),(15,2,5,'delivered','2026-11-06 13:20'),
 (16,4,2,'delivered','2026-11-07 20:30'),(17,6,1,'delivered','2026-11-07 09:10'),(18,5,3,'placed','2026-11-07 19:00');
INSERT INTO order_items VALUES
 (1,1,2),(1,3,2),(2,10,1),(2,11,3),(3,7,1),(3,9,1),(4,2,1),(5,4,2),(6,1,1),(6,3,1),
 (7,12,1),(7,13,1),(8,8,1),(9,14,2),(10,6,1),(10,5,1),(11,10,2),(11,11,2),(12,13,2),(13,15,1),
 (14,4,1),(15,12,2),(16,4,1),(16,6,1),(17,2,2),(17,3,2),(18,7,2);
UPDATE orders SET amount = (SELECT SUM(oi.qty*m.price) FROM order_items oi JOIN menu_items m ON m.id=oi.menu_item_id WHERE oi.order_id=orders.id);
`;
const SQL_SETS=[
 {id:"A",title:"Basics: SELECT, WHERE, JOIN",qs:[
  {id:"A1",q:"List the names of restaurants in <b>Chennai</b>, alphabetically.",sol:"SELECT name FROM restaurants WHERE city = 'Chennai' ORDER BY name;",ordered:true,hint:"Filter with WHERE, sort with ORDER BY."},
  {id:"A2",q:"Show the <b>name and price</b> of veg menu items (<code>is_veg = 1</code>) priced under ₹200, cheapest first.",sol:"SELECT name, price FROM menu_items WHERE is_veg = 1 AND price < 200 ORDER BY price, name;",ordered:true,hint:"Two conditions joined with AND."},
  {id:"A3",q:"For every <b>delivered</b> order, show the order id, the customer's name and the restaurant's name.",sol:"SELECT o.id, u.name, r.name FROM orders o JOIN users u ON u.id = o.user_id JOIN restaurants r ON r.id = o.restaurant_id WHERE o.status = 'delivered' ORDER BY o.id;",hint:"Two JOINs: orders → users and orders → restaurants."},
  {id:"A4",q:"Which users have <b>never placed an order</b>? Show their names.",sol:"SELECT u.name FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE o.id IS NULL ORDER BY u.name;",hint:"LEFT JOIN keeps users with no match; the order columns are then NULL."}]},
 {id:"B",title:"Aggregates: GROUP BY, HAVING",qs:[
  {id:"B1",q:"How many orders are there in each <b>status</b>? Show status and count.",sol:"SELECT status, COUNT(*) FROM orders GROUP BY status;",hint:"GROUP BY status, then COUNT(*)."},
  {id:"B2",q:"Total <b>delivered</b> revenue (<code>amount</code>) per restaurant name, highest first.",sol:"SELECT r.name, SUM(o.amount) AS revenue FROM orders o JOIN restaurants r ON r.id = o.restaurant_id WHERE o.status = 'delivered' GROUP BY r.id ORDER BY revenue DESC, r.name;",ordered:true,hint:"Filter delivered with WHERE before grouping; SUM the amount."},
  {id:"B3",q:"Which customers placed <b>3 or more orders</b> (any status)? Show name and order count.",sol:"SELECT u.name, COUNT(*) FROM orders o JOIN users u ON u.id = o.user_id GROUP BY u.id HAVING COUNT(*) >= 3;",hint:"Conditions on groups go in HAVING, not WHERE."},
  {id:"B4",q:"Average <b>delivered</b> order amount per <b>restaurant city</b>, rounded to 2 decimals.",sol:"SELECT r.city, ROUND(AVG(o.amount), 2) FROM orders o JOIN restaurants r ON r.id = o.restaurant_id WHERE o.status = 'delivered' GROUP BY r.city;",hint:"AVG() then ROUND(x, 2)."}]},
 {id:"C",title:"Window functions and subqueries",qs:[
  {id:"C1",q:"Restaurants rated <b>above the average rating</b> of all restaurants. Show name and rating.",sol:"SELECT name, rating FROM restaurants WHERE rating > (SELECT AVG(rating) FROM restaurants);",hint:"A subquery in the WHERE clause computes the average."},
  {id:"C2",q:"Number each user's orders in time order: show user name, order id and <code>nth</code> (1 = their first order).",sol:"SELECT u.name, o.id, ROW_NUMBER() OVER (PARTITION BY o.user_id ORDER BY o.created_at) AS nth FROM orders o JOIN users u ON u.id = o.user_id;",hint:"ROW_NUMBER() OVER (PARTITION BY user ORDER BY time)."},
  {id:"C3",q:"For each day, show the date, that day's <b>delivered</b> revenue, and a <b>running total</b> up to that day, in date order.",sol:"SELECT day, revenue, SUM(revenue) OVER (ORDER BY day) AS running FROM (SELECT DATE(created_at) AS day, SUM(amount) AS revenue FROM orders WHERE status = 'delivered' GROUP BY DATE(created_at)) ORDER BY day;",ordered:true,hint:"Group by DATE(created_at) in a subquery, then SUM(...) OVER (ORDER BY day)."},
  {id:"C4",q:"The <b>best-selling item by quantity</b> at each restaurant (keep ties). Show restaurant name, item name and total quantity.",sol:"WITH s AS (SELECT m.restaurant_id, m.name, SUM(oi.qty) AS q FROM order_items oi JOIN menu_items m ON m.id = oi.menu_item_id GROUP BY m.id), r AS (SELECT *, RANK() OVER (PARTITION BY restaurant_id ORDER BY q DESC) AS rk FROM s) SELECT rs.name, r.name, r.q FROM r JOIN restaurants rs ON rs.id = r.restaurant_id WHERE rk = 1;",hint:"Sum quantities per item, then RANK() OVER (PARTITION BY restaurant ORDER BY qty DESC) and keep rank 1."}]}
];

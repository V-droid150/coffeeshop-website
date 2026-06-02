-- ═══════════════════════════════════════════════════════════════
--  Kopi Nusantara — Skema Supabase (orders + order_items)
--  Cara pakai: buka Supabase → SQL Editor → tempel semua → Run.
-- ═══════════════════════════════════════════════════════════════

create table if not exists orders (
  id                bigint generated always as identity primary key,
  customer_name     text    not null,
  customer_phone    text    not null,
  customer_email    text,
  fulfillment_type  text    not null check (fulfillment_type in ('delivery','pickup')),
  delivery_address  text,
  payment_method    text    not null check (payment_method in ('online','cod')),
  notes             text,
  subtotal          integer not null,
  delivery_fee      integer not null default 0,
  total_amount      integer not null,
  status            text    not null default 'pending'
                            check (status in ('pending','preparing','ready','delivering','completed','cancelled')),
  payment_status    text    not null default 'unpaid'
                            check (payment_status in ('unpaid','pending','paid','failed','expired')),
  midtrans_order_id text    unique,
  created_at        timestamptz default now()
);

create table if not exists order_items (
  id             bigint generated always as identity primary key,
  order_id       bigint references orders(id) on delete cascade,
  product_id     integer,
  product_name   text    not null,
  quantity       integer not null,
  price_at_order integer not null
);

create index if not exists idx_orders_midtrans on orders(midtrans_order_id);
create index if not exists idx_orders_created   on orders(created_at desc);
create index if not exists idx_order_items_order on order_items(order_id);

-- Catatan: tabel diakses dari server memakai Service Role Key (bypass RLS),
-- jadi RLS tidak perlu diaktifkan. Jangan ekspos Service Role Key ke browser.

-- Bootstrap à exécuter dans un projet AOD dédié, après revue.
-- Les fonctions d’écriture de commande sont réservées au service serveur.
create table public.products (
 id text primary key, name text not null, category text not null,
 price bigint not null check(price >= 0), image text not null,
 images text[] not null default '{}', description text not null default '',
 material text not null default '', sizes text[] not null, colors text[] not null,
 stock integer not null default 0 check(stock >= 0),
 featured boolean not null default false, published boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.orders (
 id uuid primary key default gen_random_uuid(), idempotency_key uuid unique not null,
 reference text unique not null default ('AOD-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
 created_at timestamptz not null default now(), customer_name text not null,
 phone text not null, city text not null default '', neighborhood text not null default '',
 landmark text not null default '', delivery text not null check(delivery in ('pickup','delivery')),
 notes text not null default '', total bigint not null check(total >= 0),
 items jsonb not null, status text not null default 'pending' check(status in ('pending','confirmed','preparing','shipping','delivered','cancelled')),
 payment_status text not null default 'unpaid' check(payment_status in ('unpaid','review','paid','refunded')),
 delivery_fee bigint check(delivery_fee >= 0), delivery_agreed boolean not null default false,
 reserved boolean not null default false, user_id uuid references auth.users(id)
);
create table public.inventory_movements (
 id bigint generated always as identity primary key, product_id text not null references public.products(id),
 order_id uuid references public.orders(id), quantity integer not null,
 reason text not null, created_at timestamptz not null default now()
);
create index orders_status_idx on public.orders(status,created_at desc);
create index products_category_idx on public.products(category) where published;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.inventory_movements enable row level security;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select on public.orders, public.inventory_movements to authenticated;
create policy catalog_read on public.products for select to anon,authenticated using(published or ((select auth.jwt())->'app_metadata'->>'role')='admin');
create policy admin_products_insert on public.products for insert to authenticated with check(((select auth.jwt())->'app_metadata'->>'role')='admin');
create policy admin_products_update on public.products for update to authenticated using(((select auth.jwt())->'app_metadata'->>'role')='admin') with check(((select auth.jwt())->'app_metadata'->>'role')='admin');
create policy admin_products_delete on public.products for delete to authenticated using(((select auth.jwt())->'app_metadata'->>'role')='admin');
create policy orders_read on public.orders for select to authenticated using(user_id=(select auth.uid()) or ((select auth.jwt())->'app_metadata'->>'role')='admin');
create policy movements_read on public.inventory_movements for select to authenticated using(((select auth.jwt())->'app_metadata'->>'role')='admin');

-- Invoker, exécution seulement via Edge Function et clé serveur.
create function public.aod_create_order(payload jsonb) returns jsonb
language plpgsql security invoker set search_path = public as $$
declare
 entry jsonb; p public.products; snapshot jsonb := '[]'; amount bigint := 0;
 quantity integer; o public.orders; customer jsonb := payload->'customer';
 request_id uuid := (payload->>'idempotency_key')::uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended(request_id::text,0));
 select * into o from public.orders where idempotency_key=request_id;
 if found then return jsonb_build_object('reference',o.reference); end if;
 if length(trim(customer->>'name')) not between 2 and 100 or customer->>'phone' !~ '^\+224[0-9]{9}$' then raise exception 'Coordonnées invalides'; end if;
 if customer->>'delivery' not in ('pickup','delivery') then raise exception 'Réception invalide'; end if;
 if customer->>'delivery'='delivery' and (length(trim(customer->>'city'))=0 or length(trim(customer->>'neighborhood'))=0 or length(trim(customer->>'landmark'))=0) then raise exception 'Adresse incomplète'; end if;
 if jsonb_typeof(payload->'items') <> 'array' or jsonb_array_length(payload->'items') not between 1 and 50 then raise exception 'Panier invalide'; end if;
 for entry in select value from jsonb_array_elements(payload->'items') loop
  select * into p from public.products where id=entry->>'productId' and published;
  if not found then raise exception 'Article indisponible'; end if;
  quantity := (entry->>'quantity')::integer;
  if quantity not between 1 and 99 or not (entry->>'size'=any(p.sizes)) or not(entry->>'color'=any(p.colors)) then raise exception 'Option invalide'; end if;
  if (select sum((value->>'quantity')::integer) from jsonb_array_elements(payload->'items') where value->>'productId'=p.id)>p.stock then raise exception 'Stock insuffisant pour %',p.name; end if;
  amount := amount + p.price*quantity;
  snapshot := snapshot || jsonb_build_array(jsonb_build_object('productId',p.id,'name',p.name,'size',entry->>'size','color',entry->>'color','quantity',quantity,'price',p.price));
 end loop;
 insert into public.orders(idempotency_key,customer_name,phone,city,neighborhood,landmark,delivery,notes,total,items)
 values(request_id,trim(customer->>'name'),customer->>'phone',coalesce(customer->>'city',''),coalesce(customer->>'neighborhood',''),coalesce(customer->>'landmark',''),customer->>'delivery',coalesce(customer->>'notes',''),amount,snapshot) returning * into o;
 return jsonb_build_object('reference',o.reference);
end $$;
revoke all on function public.aod_create_order(jsonb) from public,anon,authenticated;
grant execute on function public.aod_create_order(jsonb) to service_role;

create function public.aod_update_order(order_id uuid, next_status text) returns void
language plpgsql security invoker set search_path=public as $$
declare o public.orders; line record; current_stock integer;
begin
 select * into o from public.orders where id=order_id for update;
 if not found then raise exception 'Commande introuvable'; end if;
 if o.status=next_status then return; end if;
 if not ((o.status='pending' and next_status in ('confirmed','cancelled')) or (o.status='confirmed' and next_status in ('preparing','cancelled')) or (o.status='preparing' and next_status in ('shipping','delivered','cancelled')) or (o.status='shipping' and next_status in ('delivered','cancelled'))) then raise exception 'Transition non autorisée'; end if;
 if next_status='confirmed' and o.delivery='delivery' and not o.delivery_agreed then raise exception 'Accord client sur la livraison requis'; end if;
 if next_status='confirmed' then
  for line in select value->>'productId' id, sum((value->>'quantity')::integer)::integer qty from jsonb_array_elements(o.items) group by value->>'productId' order by value->>'productId' loop
   select stock into current_stock from public.products where id=line.id for update;
   if not found or current_stock<line.qty then raise exception 'Stock insuffisant'; end if;
   update public.products set stock=stock-line.qty where id=line.id;
   insert into public.inventory_movements(product_id,order_id,quantity,reason) values(line.id,o.id,-line.qty,'confirmation');
  end loop;
  update public.orders set reserved=true where id=o.id;
 elsif next_status='cancelled' and o.reserved then
  for line in select value->>'productId' id,sum((value->>'quantity')::integer)::integer qty from jsonb_array_elements(o.items) group by value->>'productId' order by value->>'productId' loop
   update public.products set stock=stock+line.qty where id=line.id;
   insert into public.inventory_movements(product_id,order_id,quantity,reason) values(line.id,o.id,line.qty,'annulation');
  end loop;
  update public.orders set reserved=false where id=o.id;
 end if;
 update public.orders set status=next_status where id=o.id;
end $$;
revoke all on function public.aod_update_order(uuid,text) from public,anon,authenticated;
grant execute on function public.aod_update_order(uuid,text) to service_role;

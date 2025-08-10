-- Initial Supabase schema for Gaish Elmafdein
-- Books table
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  lang text check (lang in ('ar','en')) default 'ar',
  pages int,
  source text,
  download_url text,
  created_at timestamptz default now()
);

-- Embeddings table (for RAG)
create table if not exists public.book_chunks (
  id bigserial primary key,
  book_id uuid references public.books(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding vector(1536), -- adjust dimension per model
  lang text default 'ar',
  source_title text,
  locator text,
  url text,
  content_tsv tsvector,
  created_at timestamptz default now()
);
create index if not exists book_chunks_book_id_idx on public.book_chunks(book_id);
create index if not exists book_chunks_embedding_idx on public.book_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists book_chunks_tsv_idx on public.book_chunks using gin (content_tsv);

-- Trigger to keep tsvector updated (Arabic + English simple fallback)
create or replace function public.book_chunks_tsv_trigger() returns trigger as $$
begin
  new.content_tsv :=
    setweight(to_tsvector('simple', coalesce(new.content,'')), 'A');
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_book_chunks_tsv on public.book_chunks;
create trigger trg_book_chunks_tsv before insert or update on public.book_chunks
for each row execute function public.book_chunks_tsv_trigger();

-- Hybrid match RPC
create or replace function public.match_book_chunks(
  query_embedding vector(1536),
  match_count int default 6,
  query_text text default ''
) returns table(
  id bigint,
  content text,
  similarity float4,
  text_rank float4,
  hybrid_score float4,
  source_title text,
  lang text,
  locator text,
  url text
) language sql stable as $$
  with vec as (
    select bc.id, bc.content, 1 - (bc.embedding <=> query_embedding) as sim,
           bc.source_title, bc.lang, bc.locator, bc.url
    from public.book_chunks bc
    where bc.embedding is not null
    order by bc.embedding <=> query_embedding
    limit match_count * 4
  ), txt as (
    select id, ts_rank_cd(content_tsv, plainto_tsquery('simple', query_text)) as tr
    from public.book_chunks
    where query_text <> ''
    order by tr desc
    limit match_count * 4
  ), joined as (
    select v.id, v.content, v.sim, coalesce(t.tr, 0) as tr,
           v.source_title, v.lang, v.locator, v.url
    from vec v
    left join txt t on t.id = v.id
  )
  select id, content,
         sim as similarity,
         tr as text_rank,
         (sim * 0.7 + tr * 0.3) as hybrid_score,
         source_title, lang, locator, url
  from joined
  order by hybrid_score desc
  limit match_count;
$$;

-- Users XP
create table if not exists public.user_xp (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp int not null default 0,
  updated_at timestamptz default now()
);

-- Simple function to add xp
create or replace function public.add_xp(p_user uuid, p_amount int) returns void as $$
begin
  insert into public.user_xp(user_id, xp) values (p_user, p_amount)
  on conflict (user_id) do update set xp = user_xp.xp + excluded.xp, updated_at = now();
end;
$$ language plpgsql security definer;

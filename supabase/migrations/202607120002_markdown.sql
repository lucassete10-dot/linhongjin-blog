alter table public.contents
add column if not exists markdown text;

update public.contents
set markdown = array_to_string(body, E'\n\n')
where coalesce(markdown, '') = '';

alter table public.contents
alter column markdown set default '';

alter table public.contents
alter column markdown set not null;

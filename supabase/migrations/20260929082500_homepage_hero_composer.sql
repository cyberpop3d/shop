alter table public.site_media_slots
  add column if not exists content_json jsonb not null default '{}'::jsonb;

insert into public.site_media_slots
  (slot_key,label,page_name,description,recommended_width,recommended_height)
values
  ('home_preview_1','Hero Preview 1','Homepage Hero','Large preview at the top-right of the homepage hero.',1200,820),
  ('home_preview_2','Hero Preview 2','Homepage Hero','Small preview at the bottom-left of the homepage hero.',800,800),
  ('home_preview_3','Hero Preview 3','Homepage Hero','Small preview at the bottom-center of the homepage hero.',800,800),
  ('home_preview_4','Hero Preview 4','Homepage Hero','Small preview at the bottom-right of the homepage hero.',800,800)
on conflict (slot_key) do update set
  label=excluded.label,
  page_name=excluded.page_name,
  description=excluded.description,
  recommended_width=excluded.recommended_width,
  recommended_height=excluded.recommended_height;

update public.site_media_slots
set page_name='Homepage Hero',
    label='Hero Main Artwork',
    content_json=case when content_json='{}'::jsonb then jsonb_build_object(
      'title_line_1','CYBERPOP','title_line_2','COLLECTIONS',
      'primary_label','Purchase Collection','primary_href','/access',
      'secondary_label','Explore Collections','secondary_href','/collections',
      'feature_label','September 2026','feature_href','/collection?slug=2026-09',
      'preview_1_label','August 2026','preview_1_href','/collection?slug=2026-08',
      'preview_2_label','July 2026','preview_2_href','/collection?slug=2026-07',
      'preview_3_label','June 2026','preview_3_href','/collection?slug=2026-06',
      'preview_4_label','May 2026','preview_4_href','/collection?slug=2026-05'
    ) else content_json end
where slot_key='home_hero';

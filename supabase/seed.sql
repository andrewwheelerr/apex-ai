-- Apex AI — Seed Data (Premier Honda demo)
-- Run AFTER schema.sql

-- Dealership
insert into dealerships (id, name, crm_type, timezone) values
  ('00000000-0000-0000-0000-000000000001', 'Premier Honda', 'vinsolutions', 'America/Los_Angeles');

-- Leads (lightweight — just what the agent needs)
insert into leads (id, dealership_id, name, phone, vehicle_interest, source_channel, crm_contact_id) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Marcus T.',   '+15555550101', '2024 Accord Sport',      'website_chat', 'vs-lead-1001'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Priya S.',    '+15555550102', '2025 CR-V Hybrid',        'sms',          'vs-lead-1002'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'James W.',    '+15555550103', '2023 Pilot TrailSport',   'facebook',     'vs-lead-1003'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Dana L.',     '+15555550104', '2024 Ridgeline AWD',      'website_chat', 'vs-lead-1004'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Brendan H.',  '+15555550105', '2024 Civic Type R',       'sms',          'vs-lead-1005'),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Tanya M.',    '+15555550106', '2024 Passport Elite',     'website_chat', 'vs-lead-1006'),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Raj P.',      '+15555550107', '2025 Odyssey EX-L',       'facebook',     'vs-lead-1007'),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Sarah K.',    '+15555550108', '2024 HR-V Sport',         'sms',          'vs-lead-1008'),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Elijah F.',   '+15555550109', '2023 Accord Hybrid',      'website_chat', 'vs-lead-1009'),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Monique D.',  '+15555550110', '2024 Prologue AWD',       'facebook',     'vs-lead-1010');

-- Conversations
insert into conversations (id, dealership_id, lead_id, status, channel, last_message_at, last_message_preview, created_at, updated_at) values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'booked',     'website_chat', now() - interval '4 minutes',   'Sounds good — I can do Tuesday at 11am.',              now() - interval '2 hours',  now() - interval '4 minutes'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'active',     'sms',          now() - interval '11 minutes',  'What financing options do you have for that trim?',    now() - interval '30 minutes', now() - interval '11 minutes'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'handed_off', 'facebook',     now() - interval '28 minutes',  'I need to speak with someone about the trade value.',  now() - interval '3 hours',  now() - interval '28 minutes'),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'booked',     'website_chat', now() - interval '1 hour',      'Thanks, see you Saturday morning!',                    now() - interval '4 hours',  now() - interval '1 hour'),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'closed',     'sms',          now() - interval '2 hours',     'Is the Type R still in stock?',                        now() - interval '5 hours',  now() - interval '2 hours'),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'active',     'website_chat', now() - interval '3 hours',     'Do you have it in Sonic Gray Pearl?',                  now() - interval '6 hours',  now() - interval '3 hours'),
  ('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'handed_off', 'facebook',     now() - interval '4 hours',     'How long does financing approval usually take?',       now() - interval '7 hours',  now() - interval '4 hours'),
  ('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'booked',     'sms',          now() - interval '5 hours',     'Okay, I will stop by after work on Friday.',           now() - interval '8 hours',  now() - interval '5 hours'),
  ('20000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 'closed',     'website_chat', now() - interval '6 hours',     'Can you match the price from the other dealer?',       now() - interval '9 hours',  now() - interval '6 hours'),
  ('20000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', 'active',     'facebook',     now() - interval '7 hours',     'I had no idea Honda made an EV — tell me more.',       now() - interval '10 hours', now() - interval '7 hours');

-- Agent events (the audit trail that powers KPI cards)
insert into agent_events (conversation_id, dealership_id, event_type, metadata, created_at) values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'conversation_started', null,                                         now() - interval '2 hours'),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'appointment_booked',   '{"time":"Tuesday 11am","type":"test_drive"}', now() - interval '4 minutes'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'conversation_started', null,                                         now() - interval '30 minutes'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'conversation_started', null,                                         now() - interval '3 hours'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'handed_off',           '{"rep":"Carlos M.","reason":"trade_value"}',  now() - interval '28 minutes'),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'conversation_started', null,                                         now() - interval '4 hours'),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'appointment_booked',   '{"time":"Saturday 9am","type":"test_drive"}', now() - interval '1 hour'),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'conversation_started', null,                                         now() - interval '5 hours'),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'closed',               '{"reason":"no_response"}',                   now() - interval '2 hours'),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'conversation_started', null,                                         now() - interval '6 hours'),
  ('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'conversation_started', null,                                         now() - interval '7 hours'),
  ('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'handed_off',           '{"rep":"Lisa T.","reason":"financing"}',      now() - interval '4 hours'),
  ('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'conversation_started', null,                                         now() - interval '8 hours'),
  ('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'appointment_booked',   '{"time":"Friday 5pm","type":"visit"}',        now() - interval '5 hours'),
  ('20000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'conversation_started', null,                                         now() - interval '9 hours'),
  ('20000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'closed',               '{"reason":"price_mismatch"}',                now() - interval '6 hours'),
  ('20000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'conversation_started', null,                                         now() - interval '10 hours');

-- Sample messages for conversation 1 (Marcus T.)
insert into messages (conversation_id, role, content, created_at) values
  ('20000000-0000-0000-0000-000000000001', 'user',  'Hi, I saw the 2024 Accord Sport on your site. Is it still available?',                     now() - interval '2 hours'),
  ('20000000-0000-0000-0000-000000000001', 'agent', 'Hi Marcus! Yes, the 2024 Accord Sport is available. It''s a great pick — sport trim gets you 18" wheels, larger touchscreen, and the 1.5T engine. Would you like to come see it?', now() - interval '115 minutes'),
  ('20000000-0000-0000-0000-000000000001', 'user',  'Yeah I''d love to. What times work this week?',                                             now() - interval '110 minutes'),
  ('20000000-0000-0000-0000-000000000001', 'agent', 'We have openings Tuesday at 11am or 2pm, Wednesday afternoon, or Saturday morning. Any of those work for you?', now() - interval '109 minutes'),
  ('20000000-0000-0000-0000-000000000001', 'user',  'Sounds good — I can do Tuesday at 11am.',                                                   now() - interval '4 minutes');

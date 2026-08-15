-- voicematch → FanTrack 동기화 (자동 생성: scripts/fantrack-sync-voicematch.js)
-- 대상 16팀. 프로필만 생성하고 출연정보는 넣지 않는다.
INSERT OR IGNORE INTO celebrities
  (id, name_ko, name_en, name_tw, group_name, kind, sort_order, created_at, updated_at) VALUES
  ('seo_yerin','서예린','Seo Yerin',NULL,NULL,'person',NULL,unixepoch()*1000,unixepoch()*1000),
  ('byul','별','Byul',NULL,NULL,'person',NULL,unixepoch()*1000,unixepoch()*1000),
  ('dk_svt','이석민','DK','碩珉',NULL,'person',NULL,unixepoch()*1000,unixepoch()*1000),
  ('jeonghan_svt','윤정한','Jeonghan','淨漢',NULL,'person',NULL,unixepoch()*1000,unixepoch()*1000),
  ('joshua_svt','JOSHUA','Joshua','知秀',NULL,'person',NULL,unixepoch()*1000,unixepoch()*1000),
  ('yeonjun','연준','Yeonjun','然竣',NULL,'person',NULL,unixepoch()*1000,unixepoch()*1000),
  ('bamby','밤비','Bamby',NULL,NULL,'person',NULL,unixepoch()*1000,unixepoch()*1000),
  ('minnie','민니','Minnie',NULL,NULL,'person',NULL,unixepoch()*1000,unixepoch()*1000),
  ('rami','라미','Rami',NULL,NULL,'person',NULL,unixepoch()*1000,unixepoch()*1000),
  ('chaeyoung','채영','Chaeyoung',NULL,NULL,'person',NULL,unixepoch()*1000,unixepoch()*1000),
  ('dokyungsoo','디오','D.O.','都暻秀',NULL,'person',NULL,unixepoch()*1000,unixepoch()*1000),
  ('plave','플레이브','PLAVE','PLAVE',NULL,'group',NULL,unixepoch()*1000,unixepoch()*1000),
  ('the_rose','더로즈','The Rose','The Rose',NULL,'group',NULL,unixepoch()*1000,unixepoch()*1000),
  ('wave_to_earth','웨이브','wave to earth',NULL,NULL,'group',NULL,unixepoch()*1000,unixepoch()*1000),
  ('winter','윈터','Winter',NULL,NULL,'person',NULL,unixepoch()*1000,unixepoch()*1000),
  ('yuqi','우기','Yuqi','宋雨琦',NULL,'person',NULL,unixepoch()*1000,unixepoch()*1000);

-- 동물상용으로 넣은 41명에 영문·번체 표기 채우기.
-- 팬트랙 본체 304명은 en/tw가 100% 있는데 이 41행만 비어 있어서, 영어/일본어/번체 화면에서
-- 연예인 이름만 한글로 나갔다. 로마자는 널리 쓰이는 활동명 표기, 한자는 확립된 배우명만 넣고
-- 불확실한 아이돌 한자는 비워둔다(비면 클라이언트가 영문으로 폴백한다 — 한글로 떨어지지 않는다).
UPDATE celebrities SET name_en='T.O.P',        name_tw='T.O.P'    WHERE id='bigbang_top';
UPDATE celebrities SET name_en='Tsuki'                            WHERE id='billlie_tsuki';
UPDATE celebrities SET name_en='Park Bo-eun'                      WHERE id='classy_boeun';
UPDATE celebrities SET name_en='Jung Yong-hwa', name_tw='鄭容和'   WHERE id='cnblue_jungyonghwa';
UPDATE celebrities SET name_en='Gang Dong-won', name_tw='姜棟元'   WHERE id='gang_dongwon';
UPDATE celebrities SET name_en='Gong Yoo',      name_tw='孔劉'     WHERE id='gong_yoo';
UPDATE celebrities SET name_en='Hwiseo'                           WHERE id='highkey_hwiseo';
UPDATE celebrities SET name_en='Yel'                              WHERE id='highkey_yel';
UPDATE celebrities SET name_en='Juni'                             WHERE id='icharlin_juni';
UPDATE celebrities SET name_en='Minju'                            WHERE id='illit_minju';
UPDATE celebrities SET name_en='Wonhee'                           WHERE id='illit_wonhee';
UPDATE celebrities SET name_en='Yunah'                            WHERE id='illit_yunah';
UPDATE celebrities SET name_en='An Yu-jin'                        WHERE id='ive_anyujin';
UPDATE celebrities SET name_en='Gaeul'                            WHERE id='ive_gaeul';
UPDATE celebrities SET name_en='Leeseo'                           WHERE id='ive_leeseo';
UPDATE celebrities SET name_en='Liz'                              WHERE id='ive_liz';
UPDATE celebrities SET name_en='Jang Won-young'                   WHERE id='ive_wonyoung';
UPDATE celebrities SET name_en='Jung Hae-in',   name_tw='丁海寅'   WHERE id='jung_haein';
UPDATE celebrities SET name_en='Kang Daniel'                      WHERE id='kang_daniel';
UPDATE celebrities SET name_en='Kim Woo-bin',   name_tw='金宇彬'   WHERE id='kim_woobin';
UPDATE celebrities SET name_en='Haneul'                           WHERE id='kissoflife_haneul';
UPDATE celebrities SET name_en='Julie'                            WHERE id='kissoflife_julie';
UPDATE celebrities SET name_en='Lee Joon-gi',   name_tw='李準基'   WHERE id='lee_joongi';
UPDATE celebrities SET name_en='Lee Min-ho',    name_tw='李敏鎬'   WHERE id='lee_minho';
UPDATE celebrities SET name_en='Kim Chae-won'                     WHERE id='lesserafim_chaewon';
UPDATE celebrities SET name_en='Yujeong'                          WHERE id='lightsum_yujeong';
UPDATE celebrities SET name_en='Nam Joo-hyuk',  name_tw='南柱赫'   WHERE id='nam_joohyuk';
UPDATE celebrities SET name_en='Danielle'                         WHERE id='newjeans_danielle';
UPDATE celebrities SET name_en='Haerin'                           WHERE id='newjeans_haerin';
UPDATE celebrities SET name_en='Hyein'                            WHERE id='newjeans_hyein';
UPDATE celebrities SET name_en='Minji'                            WHERE id='newjeans_minji';
UPDATE celebrities SET name_en='Jiwoo'                            WHERE id='nmixx_jiwoo';
UPDATE celebrities SET name_en='Park Bo-gum',   name_tw='朴寶劍'   WHERE id='park_bogum';
UPDATE celebrities SET name_en='Park Hae-jin',  name_tw='朴海鎮'   WHERE id='park_haejin';
UPDATE celebrities SET name_en='Chodan'                           WHERE id='qwer_chodan';
UPDATE celebrities SET name_en='So Ji-sub',     name_tw='蘇志燮'   WHERE id='so_jisub';
UPDATE celebrities SET name_en='Song Joong-ki', name_tw='宋仲基'   WHERE id='song_joongki';
UPDATE celebrities SET name_en='Jiwoo'                            WHERE id='tripleS_jiwoo';
UPDATE celebrities SET name_en='Xinyu'                            WHERE id='tripleS_xinyu';
UPDATE celebrities SET name_en='Kang Seung-yoon', name_tw='姜昇潤' WHERE id='winner_kangseungyoon';
UPDATE celebrities SET name_en='Won Bin',       name_tw='元斌'     WHERE id='won_bin';

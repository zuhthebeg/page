#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""page.cocy.io/tzuyang-tokyo — ko/en/ja 3개 언어판 생성기.

데이터는 한 곳(PLACES)에만 두고 언어별 문자열만 갈아끼운다.
실행: python3 scripts/build-tzuyang.py  (repo 루트에서)
"""
import json
import os

BASE = "https://page.cocy.io/tzuyang-tokyo/"
DATE = "2026-07-26"
OUT = {
    "ko": "public/tzuyang-tokyo/index.html",
    "en": "public/tzuyang-tokyo/en/index.html",
    "ja": "public/tzuyang-tokyo/ja/index.html",
}
HREF = {"ko": BASE, "en": BASE + "en/", "ja": BASE + "ja/"}
VENDOR = {"ko": "vendor", "en": "../vendor", "ja": "../vendor"}

# ── 가게 데이터 (ENA 공식 「도쿄 맛집리스트 1~3탄」 기준) ────────────────────
PLACES = [
 dict(l=1, no=1, ja="イマカツ 六本木本店", lat=35.664528, lon=139.731506,
      addr="東京都港区六本木4-12-5 フェニキア ルクソス 1F",
      url="https://r.gnavi.co.jp/rgtmjm950000/", menu_ja="ささみかつ",
      ko="이마카츠 롯폰기", ko_menu="닭안심 카츠", ko_area="롯폰기 · 미나토구", ko_note="",
      en="Imakatsu Roppongi", en_menu="Chicken tender katsu", en_area="Roppongi, Minato", en_note="",
      jp="イマカツ 六本木本店", jp_menu="ささみかつ", jp_area="六本木・港区", jp_note=""),
 dict(l=1, no=2, ja="ラ ブティック ドゥ ジョエル・ロブション 六本木ヒルズ店",
      lat=35.660206, lon=139.729202,
      addr="東京都港区六本木6-10-1 六本木ヒルズ ヒルサイド 2F",
      url="https://tabelog.com/tokyo/A1307/A130701/13020237/", menu_ja="ローズクロワッサン",
      ko="조엘 로부숑 롯폰기힐즈", ko_menu="장미향 크루아상", ko_area="롯폰기힐즈 · 미나토구", ko_note="",
      en="La Boutique de Joël Robuchon, Roppongi Hills", en_menu="Rose croissant",
      en_area="Roppongi Hills, Minato", en_note="",
      jp="ラ ブティック ドゥ ジョエル・ロブション 六本木ヒルズ店", jp_menu="ローズクロワッサン",
      jp_area="六本木ヒルズ・港区", jp_note=""),
 dict(l=1, no=3, ja="赤身専門 にくがとう 六本木ヒルズ店", lat=35.660206, lon=139.729202,
      addr="東京都港区六本木6-10-1 六本木ヒルズ ウェストウォーク 5F",
      url="https://www.roppongihills.com/gourmet_shops/0299.html", menu_ja="赤身焼肉",
      ko="니쿠가토 롯폰기힐즈점", ko_menu="야키니쿠 (와규 붉은살)", ko_area="롯폰기힐즈 · 미나토구", ko_note="",
      en="Nikugatou Roppongi Hills", en_menu="Yakiniku (lean wagyu)",
      en_area="Roppongi Hills, Minato", en_note="",
      jp="赤身専門 にくがとう 六本木ヒルズ店", jp_menu="赤身焼肉", jp_area="六本木ヒルズ・港区", jp_note=""),
 dict(l=1, no=4, ja="マロリーポークステーキ 中目黒店", lat=35.642349, lon=139.696548,
      addr="東京都目黒区上目黒3-5-20", url="https://mallorypork.com/nakameguro/",
      menu_ja="ポークステーキ",
      ko="마로리 포크스테이크 나카메구로점", ko_menu="돼지 스테이크 (270g~2kg)",
      ko_area="나카메구로 · 메구로구", ko_note="런치 ¥1,000~ / 디너 ¥1,500~",
      en="Mallory Pork Steak Nakameguro", en_menu="Pork steak (270g–2kg)",
      en_area="Nakameguro, Meguro", en_note="Lunch from ¥1,000 / dinner from ¥1,500",
      jp="マロリーポークステーキ 中目黒店", jp_menu="ポークステーキ（270g〜2kg）",
      jp_area="中目黒・目黒区", jp_note="ランチ ¥1,000〜 / ディナー ¥1,500〜"),
 dict(l=1, no=5, ja="原宿 鳥久", lat=35.671791, lon=139.708618,
      addr="東京都渋谷区神宮前3-27-17 T.S TOW BLDG 1F",
      url="https://tabelog.com/tokyo/A1306/A130601/13004738/", menu_ja="焼鳥おまかせコース",
      ko="토리히사", ko_menu="닭 오마카세 (야키토리 코스)", ko_area="하라주쿠 · 시부야구",
      ko_note="디너 약 ¥12,000",
      en="Harajuku Torihisa", en_menu="Yakitori omakase course", en_area="Harajuku, Shibuya",
      en_note="Dinner around ¥12,000",
      jp="原宿 鳥久", jp_menu="焼鳥おまかせコース", jp_area="原宿・渋谷区", jp_note="ディナー約 ¥12,000"),

 dict(l=2, no=1, ja="くいしんぼう がぶ", lat=35.620518, lon=139.702911,
      addr="東京都品川区小山3-2-3",
      url="https://retty.me/area/PRE13/ARE13/SUB705/100001692822/", menu_ja="がぶ丼",
      ko="가부", ko_menu="로스트비프 덮밥", ko_area="무사시코야마 · 시나가와구",
      ko_note="180g ¥1,600 / 270g ¥2,300 / 453g ¥3,850",
      en="Kuishinbou Gabu", en_menu="Roast beef rice bowl", en_area="Musashi-Koyama, Shinagawa",
      en_note="180g ¥1,600 / 270g ¥2,300 / 453g ¥3,850",
      jp="くいしんぼう がぶ", jp_menu="がぶ丼（ローストビーフ丼）", jp_area="武蔵小山・品川区",
      jp_note="180g ¥1,600 / 270g ¥2,300 / 453g ¥3,850"),
 dict(l=2, no=2, ja="松阪牛炭火焼肉 東海亭", lat=35.6608514, lon=139.7232977,
      addr="東京都港区西麻布1-13-16", url="http://www.toukaitei.jp/", menu_ja="松阪牛A5炭火焼肉",
      ko="토카이테이", ko_menu="마츠자카규 A5 숯불 야키니쿠", ko_area="니시아자부 · 미나토구",
      ko_note="추천 코스 11품 ¥8,800",
      en="Toukaitei", en_menu="A5 Matsusaka beef charcoal yakiniku", en_area="Nishi-Azabu, Minato",
      en_note="11-course set ¥8,800",
      jp="松阪牛炭火焼肉 東海亭", jp_menu="松阪牛A5炭火焼肉", jp_area="西麻布・港区",
      jp_note="おすすめコース11品 ¥8,800"),
 dict(l=2, no=3, ja="唐揚げ 一筋", lat=35.6762653, lon=139.7360961,
      addr="東京都港区赤坂3-20-9 岩澤ビル 2F", url="https://www.hotpepper.jp/strJ001154782/",
      menu_ja="唐揚げ丼 / 食べ放題",
      ko="카라아게 히토스지", ko_menu="가라아게 덮밥 · 가라아게 뷔페", ko_area="아카사카 · 미나토구",
      ko_note="런치 ~¥999 / 뷔페 ¥3,000",
      en="Karaage Hitosuji", en_menu="Karaage rice bowl · all-you-can-eat karaage",
      en_area="Akasaka, Minato", en_note="Lunch under ¥999 / buffet ¥3,000",
      jp="唐揚げ 一筋", jp_menu="唐揚げ丼・食べ放題", jp_area="赤坂・港区",
      jp_note="ランチ 〜¥999 / 食べ放題 ¥3,000"),
 dict(l=2, no=4, ja="赤坂ふきぬき 本店", lat=35.67331, lon=139.738348,
      addr="東京都港区赤坂3-6-11", url="https://www.fukinuki.jp/",
      menu_ja="関東風ひつまぶし / 大うな丼 / 骨せんべい / う巻き",
      ko="아카사카 후키누키", ko_menu="관동풍 히츠마부시 · 특대 장어덮밥 · 장어뼈튀김 · 장어계란말이",
      ko_area="아카사카 · 미나토구", ko_note="1923년 창업 노포",
      en="Akasaka Fukinuki", en_menu="Kanto-style hitsumabushi · jumbo eel bowl · eel bone crackers · eel omelette",
      en_area="Akasaka, Minato", en_note="Founded 1923",
      jp="赤坂ふきぬき 本店", jp_menu="関東風ひつまぶし・大うな丼・骨せんべい・う巻き",
      jp_area="赤坂・港区", jp_note="1923年（大正12年）創業"),
 dict(l=2, no=5, ja="支那そば やぐら亭", lat=35.683567, lon=139.682114,
      addr="東京都渋谷区本町2-32-2", url="https://ramendb.supleks.jp/s/5472.html",
      menu_ja="宇宙一辛い味噌らーめん ほたる",
      ko="야구라테이", ko_menu="우주에서 제일 매운 미소라멘 「호타루」", ko_area="하츠다이 · 시부야구",
      ko_note="호타루 1단계 약 ¥1,080",
      en="Shina Soba Yagura-tei", en_menu="“Hotaru” — the spiciest miso ramen in the universe",
      en_area="Hatsudai, Shibuya", en_note="Level 1 around ¥1,080",
      jp="支那そば やぐら亭", jp_menu="宇宙一辛い味噌らーめん「ほたる」", jp_area="初台・渋谷区",
      jp_note="ほたる1辛 約 ¥1,080"),

 dict(l=3, no=1, ja="鉄板中華 青山シャンウェイ 本店", lat=35.681152, lon=139.703934,
      addr="東京都渋谷区千駄ヶ谷4-29-12 北参道ダイヤモンドパレス 1F",
      url="http://shanway.jp/", menu_ja="柔らか蒸し鶏のねぎ醤油 / 毛沢東スペアリブ / 黒炒飯",
      ko="샹웨이", ko_menu="파간장 찜닭 · 마오쩌둥 스페어립 · 흑볶음밥", ko_area="기타산도 · 시부야구",
      ko_note="「고독한 미식가」 촬영지",
      en="Aoyama Shanway", en_menu="Steamed chicken in scallion soy · Mao spare ribs · black fried rice",
      en_area="Kita-Sando, Shibuya", en_note="Featured in Kodoku no Gurume",
      jp="鉄板中華 青山シャンウェイ 本店", jp_menu="柔らか蒸し鶏のねぎ醤油・毛沢東スペアリブ・黒炒飯",
      jp_area="北参道・渋谷区", jp_note="『孤独のグルメ』season4 第9話 登場店"),
 dict(l=3, no=2, ja="辛ちゃん 1号店", lat=35.698269, lon=139.705948,
      addr="東京都新宿区大久保1-1-9 新宿フラワーハイホーム 1F 107",
      url="https://www.wowsokb.jp/sinchang/", menu_ja="豚焼き肉 / カンジャンセウ / キムチチゲ",
      ko="신짱 1호점", ko_menu="돼지구이 · 간장새우 · 김치찌개", ko_area="신오쿠보 · 신주쿠구",
      ko_note="간장새우 ¥2,500",
      en="Shinchan 1st Store", en_menu="Grilled pork · soy-marinated shrimp · kimchi jjigae",
      en_area="Shin-Okubo, Shinjuku", en_note="Korean restaurant · shrimp ¥2,500",
      jp="辛ちゃん 1号店", jp_menu="豚焼き肉・カンジャンセウ・キムチチゲ", jp_area="新大久保・新宿区",
      jp_note="カンジャンセウ ¥2,500"),
 dict(l=3, no=3, ja="ミート矢澤 五反田", lat=35.6260151, lon=139.7206051,
      addr="東京都品川区西五反田2-15-13 ニューハイツ西五反田 1F",
      url="https://maps.app.goo.gl/kc93D8j6SitGErm97",
      menu_ja="ハンバーグ / シャトーブリアンステーキ",
      ko="미트 야자와 고탄다", ko_menu="함박스테이크 · 샤토브리앙 스테이크", ko_area="고탄다 · 시나가와구",
      ko_note="도쿄 식비 1위 기록",
      en="Meat Yazawa Gotanda", en_menu="Hamburg steak · chateaubriand steak",
      en_area="Gotanda, Shinagawa", en_note="Highest single-meal bill of the Tokyo trip",
      jp="ミート矢澤 五反田", jp_menu="ハンバーグ・シャトーブリアンステーキ", jp_area="五反田・品川区",
      jp_note="番組内 東京最高額の食事"),
 dict(l=3, no=4, ja="スシロー 五反田店", lat=35.625572, lon=139.722275,
      addr="東京都品川区西五反田1-3-8 五反田Placeビル B1",
      url="https://www.akindo-sushiro.co.jp/", menu_ja="回転寿司 / うどん / プリン",
      ko="스시로 고탄다점", ko_menu="회전초밥 · 우동 · 푸딩", ko_area="고탄다 · 시나가와구",
      ko_note="127접시 기록",
      en="Sushiro Gotanda", en_menu="Conveyor-belt sushi · udon · pudding",
      en_area="Gotanda, Shinagawa", en_note="127 plates in one sitting",
      jp="スシロー 五反田店", jp_menu="回転寿司・うどん・プリン", jp_area="五反田・品川区",
      jp_note="127皿完食"),
]

SRC = {
    "l1": "https://www.facebook.com/channel.ena/posts/1614396747354408",
    "l2": "https://www.facebook.com/channel.ena/posts/1618332886960794",
    "l3": "https://www.facebook.com/channel.ena/posts/1625172059610210",
    "ena": "https://ktena.co.kr/bbs/board.php?bo_table=variety&amp;wr_id=143",
    "nf": "https://www.netflix.com/kr/title/82929668",
}

# ── 언어별 문자열 ──────────────────────────────────────────────────────────
T = {
"ko": dict(
 lang="ko", title="쯔양몇끼 도쿄편 맛집 14곳 — 위치·메뉴 지도 정리 · page.cocy.io",
 desc="ENA·넷플릭스 예능 「쯔양몇끼」 일본 도쿄편에 나온 맛집 14곳을 상호·주소·대표메뉴와 함께 지도에 정리했습니다. ENA 공식 맛집리스트 1~3탄 전체.",
 ogt="쯔양몇끼 도쿄편 맛집 14곳 — 지도로 정리",
 ogd="ENA 공식 맛집리스트 1~3탄 전체를 상호·일본어 주소·대표메뉴·좌표까지 지도에 찍어 정리했습니다.",
 kicker="FOOD MAP · 쯔양몇끼 도쿄편", h1="쯔양몇끼 도쿄 맛집 14곳",
 lead='ENA 예능 <b>「쯔양몇끼」</b> 일본 도쿄편에 나온 가게들을 상호·일본어 주소·대표메뉴·좌표까지 정리하고 지도에 찍었습니다. 방송에서는 간판을 가렸지만, <b>ENA 공식 채널이 방송 후 「도쿄 맛집리스트 1~3탄」으로 상호와 주소를 직접 공개</b>했습니다. 그 리스트 전체(14곳)를 그대로 옮기고 좌표만 따로 확인했습니다.',
 m1="정리", m1v="page.cocy.io · " + DATE, m2="출처", m2v="ENA 공식 맛집리스트 1~3탄",
 m3="가게", m3v="14곳 · 전부 도쿄",
 warn='<b>왜 검색해도 안 나왔나</b> — 방송이 상호를 가려서, 검색 상위에 뜨는 상당수 블로그가 <b>실존하지만 무관한 도쿄 가게</b>를 주소·지도까지 붙여 단정하고 있습니다. 이 페이지는 그런 2차 추정 대신 ENA가 직접 게시한 리스트만 사용했습니다.',
 s1="지도", s2="가게 목록", s3="방송에서 나온 기록", s4="가기 전에", s5="출처",
 fall="전체 14곳", f1="1탄 · 추성훈 편", f2="2탄 · 김재중 편", f3="3탄 · 마지막 날",
 maphint="핀을 누르면 가게 정보가 뜹니다. 아래 목록의 카드를 누르면 지도가 그 가게로 이동합니다.",
 lb_addr="주소", lb_area="위치", lb_note="비고",
 a_focus="지도에서 보기", a_copy="주소 복사", a_gmap="구글맵 ↗", a_site="가게 정보 ↗",
 copied="주소를 복사했습니다", copyfail="복사에 실패했습니다",
 eps=["<b>회전초밥 127접시</b> — 스시로 고탄다점에서 초밥 127접시 + 우동 + 푸딩 디저트",
      "<b>야키니쿠 한 끼 80만원</b> — 샤토브리앙 150g만 13만원, 하이엔드 야키니쿠 한 끼 식비 80만원",
      "<b>돼지 스테이크 3kg</b> — 마로리 포크스테이크. 다만 현행 공개 메뉴의 최대 사이즈는 2kg(오림포스)이라, 방송 특별 주문이거나 표기 차이로 보입니다",
      "<b>0.5단계도 엽떡보다 맵다</b> — 야구라테이의 「우주에서 제일 매운 미소라멘 호타루」. 면에 하바네로를 반죽해 넣습니다",
      "<b>도쿄 식비 1위</b> — 미트 야자와 고탄다. 추성훈이 15년 이상 다닌 단골집",
      "<b>「고독한 미식가」 촬영지</b> — 샹웨이는 시즌4 9화에 나온 그 집입니다(2021년 진구마에 → 기타산도로 이전)"],
 caveat='방송 노출 직후라 <b>대기가 길어질 수 있습니다.</b> 후키누키·토카이테이·토리히사처럼 예약제이거나 코스 위주인 곳은 방문 전에 예약 여부를 확인하세요. 영업시간·정기휴무·가격은 바뀔 수 있어 각 가게의 공식 링크를 한 번 더 확인하는 걸 권합니다.',
 notes=["<b>좌표 출처</b> — 점포 좌표(OSM POI) 4곳, 나머지 10곳은 일본 국토지리원(GSI) 주소검색 API의 번지 좌표입니다.",
        "<b>같은 좌표 2곳</b> — 조엘 로부숑과 니쿠가토는 둘 다 롯폰기힐즈 안(六本木6-10-1)이라 좌표가 같습니다. 층이 다릅니다.",
        "<b>주소 정정</b> — ENA는 신짱 주소를 '신주쿠 플라워빌딩'으로 적었지만 실제 건물명은 <b>新宿フラワーハイホーム</b> 1F 107호입니다.",
        "<b>회차 매핑</b> — 1탄=추성훈 편, 2탄=김재중 편, 3탄=도쿄 마지막 날 순서로 게시됐습니다. 방송 회차와의 대응은 게시 순서·보도자료 기준 추정입니다."],
 srcs=[f'<a href="{SRC["l1"]}" target="_blank" rel="noopener">ENA 공식 — 도쿄 맛집리스트 1탄 (추성훈 편)</a>',
       f'<a href="{SRC["l2"]}" target="_blank" rel="noopener">ENA 공식 — 도쿄 맛집리스트 2탄 (김재중 편)</a>',
       f'<a href="{SRC["l3"]}" target="_blank" rel="noopener">ENA 공식 — 도쿄 맛집리스트 3탄</a>',
       f'<a href="{SRC["ena"]}" target="_blank" rel="noopener">ENA 「쯔양몇끼」 프로그램 페이지</a> · <a href="{SRC["nf"]}" target="_blank" rel="noopener">넷플릭스</a>',
       '좌표: <a href="https://msearch.gsi.go.jp/" target="_blank" rel="noopener">국토지리원 주소검색</a> · <a href="https://nominatim.openstreetmap.org/" target="_blank" rel="noopener">OSM Nominatim</a> · 지도 타일 © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> 기여자'],
),
"en": dict(
 lang="en", title="Tzuyang Tokyo Food Map — All 14 Restaurants from the Netflix Show · page.cocy.io",
 desc="Every restaurant visited in the Tokyo episodes of the Korean show “Tzuyang, How Many Meals?” (ENA / Netflix), with real names, Japanese addresses, signature dishes and an interactive map. Based on ENA's own official lists.",
 ogt="Tzuyang Tokyo Food Map — all 14 restaurants",
 ogd="Real names, Japanese addresses, signature dishes and coordinates for every stop of the Tokyo trip.",
 kicker="FOOD MAP · TZUYANG IN TOKYO", h1="Tzuyang's Tokyo: All 14 Restaurants",
 lead='Every restaurant from the Tokyo episodes of the Korean variety show <b>“Tzuyang, How Many Meals?”</b> (ENA / Netflix), with real names, Japanese addresses, signature dishes and coordinates — plotted on a map. The show blurred the signboards, but <b>ENA later published the names and addresses itself</b> in three official “Tokyo restaurant list” posts. This page reproduces those lists and adds verified coordinates.',
 m1="Compiled", m1v="page.cocy.io · " + DATE, m2="Source", m2v="ENA official lists 1–3",
 m3="Places", m3v="14 · all in Tokyo",
 warn='<b>Why search results were useless</b> — because the show hid the signboards, many blogs ranking on top simply <b>picked real but unrelated Tokyo restaurants</b> and presented them with addresses and maps as fact. This page uses only the lists ENA published directly.',
 s1="Map", s2="The restaurants", s3="Records from the show", s4="Before you go", s5="Sources",
 fall="All 14", f1="List 1 · with Choo Sung-hoon", f2="List 2 · with Kim Jaejoong", f3="List 3 · final day",
 maphint="Tap a pin for details. Tapping a card below moves the map to that restaurant.",
 lb_addr="Address", lb_area="Area", lb_note="Note",
 a_focus="Show on map", a_copy="Copy address", a_gmap="Google Maps ↗", a_site="Restaurant info ↗",
 copied="Address copied", copyfail="Copy failed",
 eps=["<b>127 plates of sushi</b> — at Sushiro Gotanda, plus udon and pudding",
      "<b>A ¥90,000 yakiniku meal</b> — 150g of chateaubriand alone ran about ¥14,000",
      "<b>A 3kg pork steak</b> — at Mallory Pork Steak. Note the largest size on the current public menu is 2kg (“Olympus”), so this was likely a special order",
      "<b>Even level 0.5 is brutal</b> — Yagura-tei's “spiciest miso ramen in the universe” kneads habanero into the noodles themselves",
      "<b>The single most expensive meal</b> — Meat Yazawa Gotanda, a place Choo Sung-hoon has been going to for over 15 years",
      "<b>A Kodoku no Gurume location</b> — Shanway appeared in season 4, episode 9 (moved from Jingumae to Kita-Sando in 2021)"],
 caveat='Expect <b>longer queues</b> right after the broadcast. Places like Fukinuki, Toukaitei and Torihisa are reservation-based or course-only — check before you go. Hours, closing days and prices change; verify on each restaurant\'s own page.',
 notes=["<b>Coordinates</b> — 4 are exact storefront POIs from OpenStreetMap; the other 10 come from the Geospatial Information Authority of Japan (GSI) address lookup, accurate to the building block.",
        "<b>Two identical coordinates</b> — Joël Robuchon and Nikugatou are both inside Roppongi Hills (6-10-1 Roppongi), on different floors.",
        "<b>Address correction</b> — ENA wrote “Shinjuku Flower Building” for Shinchan; the actual building is <b>Shinjuku Flower High Home</b>, 1F #107.",
        "<b>Episode mapping</b> — the three lists were posted in the order: Choo Sung-hoon leg, Kim Jaejoong leg, final day. Mapping them to broadcast episode numbers is inferred from posting order and press releases."],
 srcs=[f'<a href="{SRC["l1"]}" target="_blank" rel="noopener">ENA official — Tokyo restaurant list 1</a>',
       f'<a href="{SRC["l2"]}" target="_blank" rel="noopener">ENA official — Tokyo restaurant list 2</a>',
       f'<a href="{SRC["l3"]}" target="_blank" rel="noopener">ENA official — Tokyo restaurant list 3</a>',
       f'<a href="{SRC["ena"]}" target="_blank" rel="noopener">ENA programme page</a> · <a href="{SRC["nf"]}" target="_blank" rel="noopener">Netflix</a>',
       'Coordinates: <a href="https://msearch.gsi.go.jp/" target="_blank" rel="noopener">GSI address search</a> · <a href="https://nominatim.openstreetmap.org/" target="_blank" rel="noopener">OSM Nominatim</a> · map tiles © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'],
),
"ja": dict(
 lang="ja", title="韓国番組『チュヤン何食』東京編に出た14店 — 地図・メニューまとめ · page.cocy.io",
 desc="ENA・Netflixの韓国バラエティ『チュヤン何食（쯔양몇끼）』東京編に登場した14店を、店名・住所・看板メニュー・座標つきで地図にまとめました。ENA公式「東京グルメリスト1〜3弾」全掲載店。",
 ogt="『チュヤン何食』東京編に出た14店 — 地図まとめ",
 ogd="ENA公式リスト1〜3弾の全14店を、店名・住所・看板メニュー・座標つきで地図に。",
 kicker="FOOD MAP · チュヤン何食 東京編", h1="『チュヤン何食』東京編の14店",
 lead='ENAのバラエティ<b>『チュヤン何食』（쯔양몇끼）</b>東京編に登場した店を、店名・住所・看板メニュー・座標までまとめて地図に落としました。番組では看板を隠していましたが、<b>ENA公式が放送後に「東京グルメリスト1〜3弾」として店名と住所を自ら公開</b>しています。そのリスト全14店をそのまま採録し、座標だけ別途確認しました。',
 m1="作成", m1v="page.cocy.io · " + DATE, m2="出典", m2v="ENA公式グルメリスト1〜3弾",
 m3="店舗", m3v="14店 · すべて東京",
 warn='<b>なぜ検索しても出てこなかったのか</b> — 番組が店名を伏せたため、検索上位のブログの多くが<b>実在するが無関係な東京の店</b>を住所や地図つきで断定的に紹介しています。このページはそうした二次推測を使わず、ENAが直接公開したリストのみを典拠にしています。',
 s1="地図", s2="店舗一覧", s3="番組内の記録", s4="訪れる前に", s5="出典",
 fall="全14店", f1="1弾 · 秋山成勲 回", f2="2弾 · ジェジュン 回", f3="3弾 · 最終日",
 maphint="ピンをタップすると店舗情報が出ます。下の一覧をタップすると地図がその店に移動します。",
 lb_addr="住所", lb_area="エリア", lb_note="備考",
 a_focus="地図で見る", a_copy="住所をコピー", a_gmap="Googleマップ ↗", a_site="店舗情報 ↗",
 copied="住所をコピーしました", copyfail="コピーに失敗しました",
 eps=["<b>回転寿司127皿</b> — スシロー五反田店で寿司127皿＋うどん＋プリン",
      "<b>焼肉一食で約9万円</b> — シャトーブリアン150gだけで約1万4千円",
      "<b>ポークステーキ3kg</b> — マロリーポークステーキ。ただし現行の公開メニューの最大は2kg（オリンポス）のため、特別オーダーか表記の差と思われます",
      "<b>0.5辛でも激辛</b> — やぐら亭の「宇宙一辛い味噌らーめん ほたる」。麺自体にハバネロを練り込んでいます",
      "<b>東京での最高額</b> — ミート矢澤 五反田。秋山成勲が15年以上通う常連店",
      "<b>『孤独のグルメ』登場店</b> — 青山シャンウェイはseason4第9話の店（2021年に神宮前から北参道へ移転）"],
 caveat='放送直後のため<b>待ち時間が長くなる可能性</b>があります。ふきぬき・東海亭・鳥久のように予約制やコース中心の店は、事前に予約の要否を確認してください。営業時間・定休日・価格は変わることがあるため、各店の公式情報で再確認をおすすめします。',
 notes=["<b>座標の出典</b> — 4店はOSMの店舗POI、残り10店は国土地理院（GSI）住所検索APIの街区座標です。",
        "<b>座標が同一の2店</b> — ジョエル・ロブションとにくがとうはどちらも六本木ヒルズ（六本木6-10-1）内で、フロアが異なります。",
        "<b>住所の訂正</b> — ENAは辛ちゃんの住所を「新宿フラワービル」と記載していますが、実際の建物名は<b>新宿フラワーハイホーム</b>（1F 107号）です。",
        "<b>放送回との対応</b> — 3つのリストは秋山成勲回・ジェジュン回・東京最終日の順に投稿されました。放送回数との対応は投稿順とプレスリリースからの推定です。"],
 srcs=[f'<a href="{SRC["l1"]}" target="_blank" rel="noopener">ENA公式 — 東京グルメリスト1弾</a>',
       f'<a href="{SRC["l2"]}" target="_blank" rel="noopener">ENA公式 — 東京グルメリスト2弾</a>',
       f'<a href="{SRC["l3"]}" target="_blank" rel="noopener">ENA公式 — 東京グルメリスト3弾</a>',
       f'<a href="{SRC["ena"]}" target="_blank" rel="noopener">ENA 番組ページ</a> · <a href="{SRC["nf"]}" target="_blank" rel="noopener">Netflix</a>',
       '座標: <a href="https://msearch.gsi.go.jp/" target="_blank" rel="noopener">国土地理院 住所検索</a> · <a href="https://nominatim.openstreetmap.org/" target="_blank" rel="noopener">OSM Nominatim</a> · 地図タイル © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'],
),
}

SWITCH = [("ko", "한국어"), ("en", "English"), ("ja", "日本語")]


def places_for(lang):
    key = {"ko": "ko", "en": "en", "ja": "jp"}[lang]
    out = []
    for p in PLACES:
        out.append(dict(l=p["l"], no=p["no"], name=p[key], ja=p["ja"],
                        menu=p[f"{key}_menu"], menuJa=p["menu_ja"], addr=p["addr"],
                        area=p[f"{key}_area"], note=p[f"{key}_note"],
                        lat=p["lat"], lon=p["lon"], url=p["url"]))
    return out


def jsonld(lang, t):
    key = {"ko": "ko", "en": "en", "ja": "jp"}[lang]
    items = []
    for i, p in enumerate(PLACES, 1):
        items.append({
            "@type": "ListItem", "position": i,
            "item": {
                "@type": "Restaurant",
                "name": p["ja"],
                "alternateName": p[key],
                "address": {"@type": "PostalAddress", "streetAddress": p["addr"],
                            "addressLocality": "Tokyo", "addressCountry": "JP"},
                "geo": {"@type": "GeoCoordinates", "latitude": p["lat"], "longitude": p["lon"]},
                "servesCuisine": p["menu_ja"],
                "url": p["url"],
            },
        })
    article = {
        "@context": "https://schema.org", "@type": "Article",
        "headline": t["ogt"], "description": t["desc"], "url": HREF[lang],
        "mainEntityOfPage": {"@type": "WebPage", "@id": HREF[lang]},
        "datePublished": DATE, "dateModified": DATE, "inLanguage": lang,
        "image": BASE + "og.jpg",
        "author": {"@type": "Person", "name": "cocy", "url": "https://page.cocy.io/cocy"},
        "publisher": {"@type": "Organization", "name": "cocy.io", "url": "https://cocy.io"},
        "isAccessibleForFree": True,
        "about": {"@type": "TVSeries", "name": "쯔양몇끼",
                  "alternateName": ["Tzuyang, How Many Meals?", "チュヤン何食"]},
    }
    lst = {"@context": "https://schema.org", "@type": "ItemList",
           "name": t["ogt"], "numberOfItems": len(items), "itemListElement": items}
    return json.dumps(article, ensure_ascii=False), json.dumps(lst, ensure_ascii=False)


CSS = open(os.path.join(os.path.dirname(__file__), "tzuyang.css"), encoding="utf-8").read()


def build(lang):
    t = T[lang]
    v = VENDOR[lang]
    art, lst = jsonld(lang, t)
    alts = "\n".join(
        f'<link rel="alternate" hreflang="{k}" href="{HREF[k]}" />' for k in ("ko", "en", "ja")
    ) + f'\n<link rel="alternate" hreflang="x-default" href="{HREF["en"]}" />'
    sw = "".join(
        f'<a class="lang{" on" if k == lang else ""}" href="{HREF[k]}" hreflang="{k}">{label}</a>'
        for k, label in SWITCH
    )
    eps = "\n".join(f"      <li>{x}</li>" for x in t["eps"])
    notes = "\n".join(f"      <li>{x}</li>" for x in t["notes"])
    srcs = "\n".join(f"      <li>{x}</li>" for x in t["srcs"])
    data = json.dumps(places_for(lang), ensure_ascii=False)
    labels = json.dumps({1: t["f1"], 2: t["f2"], 3: t["f3"]}, ensure_ascii=False)
    ui = json.dumps({k: t[k] for k in
                     ("lb_addr", "lb_area", "lb_note", "a_focus", "a_copy", "a_gmap",
                      "a_site", "copied", "copyfail")}, ensure_ascii=False)

    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{t["title"]}</title>
<meta name="description" content="{t["desc"]}" />
<link rel="canonical" href="{HREF[lang]}" />
{alts}
<meta property="og:type" content="article" />
<meta property="og:locale" content="{ {'ko':'ko_KR','en':'en_US','ja':'ja_JP'}[lang] }" />
<meta property="og:title" content="{t["ogt"]}" />
<meta property="og:description" content="{t["ogd"]}" />
<meta property="og:url" content="{HREF[lang]}" />
<meta property="og:image" content="{BASE}og.jpg" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{t["ogt"]}" />
<meta name="twitter:description" content="{t["ogd"]}" />
<meta name="twitter:image" content="{BASE}og.jpg" />
<meta property="article:published_time" content="{DATE}" />
<meta property="article:modified_time" content="{DATE}" />
<meta name="author" content="cocy" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Noto+Sans+KR:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="{v}/leaflet.css" />
<style>
{CSS}</style>
<script type="application/ld+json">{art}</script>
<script type="application/ld+json">{lst}</script>
</head>
<body>
<article class="doc">
  <nav class="langbar">{sw}</nav>

  <section data-block="hero">
    <div class="kicker">{t["kicker"]}</div>
    <h1>{t["h1"]}</h1>
    <p class="lead">{t["lead"]}</p>
    <div class="meta">
      <span><b>{t["m1"]}</b> {t["m1v"]}</span>
      <span><b>{t["m2"]}</b> {t["m2v"]}</span>
      <span><b>{t["m3"]}</b> {t["m3v"]}</span>
    </div>
    <div class="callout">{t["warn"]}</div>
  </section>

  <section data-block="map">
    <h2><span class="n">01</span> {t["s1"]}</h2>
    <div class="filters" id="filters">
      <button class="fbtn on" data-k="all">{t["fall"]}</button>
      <button class="fbtn" data-k="1"><i class="dot"></i>{t["f1"]}</button>
      <button class="fbtn" data-k="2"><i class="dot"></i>{t["f2"]}</button>
      <button class="fbtn" data-k="3"><i class="dot"></i>{t["f3"]}</button>
    </div>
    <div id="map"></div>
    <p class="note" style="margin-top:.6rem">{t["maphint"]}</p>
  </section>

  <section data-block="list">
    <h2><span class="n">02</span> {t["s2"]}</h2>
    <div class="cards" id="cards"></div>
  </section>

  <section data-block="episodes">
    <h2><span class="n">03</span> {t["s3"]}</h2>
    <ul class="srcs">
{eps}
    </ul>
  </section>

  <section data-block="caveat">
    <h2><span class="n">04</span> {t["s4"]}</h2>
    <div class="callout warn">{t["caveat"]}</div>
    <ul class="srcs">
{notes}
    </ul>
  </section>

  <section data-block="sources">
    <h2><span class="n">05</span> {t["s5"]}</h2>
    <ul class="srcs">
{srcs}
    </ul>
  </section>

  <div class="foot">
    <span>page.cocy.io / tzuyang-tokyo</span>
    <span>{DATE}</span>
  </div>
</article>
<div class="toast" id="toast"></div>

<script src="{v}/leaflet.js"></script>
<script>
const PLACES={data};
const LABEL={labels};
const UI={ui};

const map=L.map('map',{{scrollWheelZoom:false}}).setView([35.664,139.715],12);
L.tileLayer('https://tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png',{{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}}).addTo(map);

const gmapUrl=p=>`https://www.google.com/maps/search/?api=1&query=${{encodeURIComponent(p.ja+' '+p.addr)}}`;
const markers=[];
PLACES.forEach((p,i)=>{{
  const icon=L.divIcon({{html:`<div class="pin l${{p.l}}"><span>${{p.no}}</span></div>`,className:'',iconSize:[28,28],iconAnchor:[14,26],popupAnchor:[0,-24]}});
  const m=L.marker([p.lat,p.lon],{{icon}}).addTo(map).bindPopup(
    `<div class="pop"><b class="pn">${{p.name}}</b><span class="pj">${{p.ja}}</span><span class="pm">${{p.menu}}</span><a href="${{gmapUrl(p)}}" target="_blank" rel="noopener">${{UI.a_gmap}}</a></div>`);
  m._li=p.l; markers.push(m);
  m.on('click',()=>{{const c=document.getElementById('c'+i); if(c) c.scrollIntoView({{behavior:'smooth',block:'center'}});}});
}});
map.fitBounds(L.featureGroup(markers).getBounds().pad(0.12));

document.getElementById('cards').innerHTML=PLACES.map((p,i)=>`<div class="card l${{p.l}}" id="c${{i}}" data-i="${{i}}">
  <div class="idx">${{p.no}}</div>
  <div class="top"><span class="nm">${{p.name}}</span><span class="ja">${{p.ja}}</span><span class="ep">${{LABEL[p.l]}}</span></div>
  <div class="menu">${{p.menu}} <span class="ja2">${{p.menuJa}}</span></div>
  <div class="info">
    <div><span class="lb">${{UI.lb_addr}}</span>${{p.addr}}</div>
    <div><span class="lb">${{UI.lb_area}}</span>${{p.area}}${{p.note?` <span class="lb" style="margin-left:.6rem">${{UI.lb_note}}</span>${{p.note}}`:''}}</div>
    <div class="acts">
      <button data-act="focus">${{UI.a_focus}}</button>
      <button data-act="copy" data-v="${{p.addr}}">${{UI.a_copy}}</button>
      <a href="${{gmapUrl(p)}}" target="_blank" rel="noopener">${{UI.a_gmap}}</a>
      ${{p.url?`<a href="${{p.url}}" target="_blank" rel="noopener">${{UI.a_site}}</a>`:''}}
    </div>
  </div>
</div>`).join('');

const toast=document.getElementById('toast');let tt;
const say=m=>{{toast.textContent=m;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('on'),1800);}};

document.getElementById('cards').addEventListener('click',e=>{{
  const b=e.target.closest('button'); if(!b) return;
  const i=+b.closest('.card').dataset.i;
  if(b.dataset.act==='focus'){{
    document.getElementById('map').scrollIntoView({{behavior:'smooth',block:'center'}});
    map.setView([PLACES[i].lat,PLACES[i].lon],17,{{animate:true}});
    markers[i].openPopup();
  }} else {{
    navigator.clipboard.writeText(b.dataset.v).then(()=>say(UI.copied)).catch(()=>say(UI.copyfail));
  }}
}});

document.getElementById('filters').addEventListener('click',e=>{{
  const b=e.target.closest('.fbtn'); if(!b) return;
  document.querySelectorAll('.fbtn').forEach(x=>x.classList.toggle('on',x===b));
  const k=b.dataset.k, shown=[];
  markers.forEach((m,i)=>{{
    const on = k==='all' || String(m._li)===k;
    const el=m.getElement(); if(el) el.querySelector('.pin').classList.toggle('dim',!on);
    document.getElementById('c'+i).classList.toggle('hide',!on);
    if(on) shown.push(m);
  }});
  if(shown.length) map.fitBounds(L.featureGroup(shown).getBounds().pad(0.15));
}});
</script>
</body>
</html>
"""


if __name__ == "__main__":
    for lang, path in OUT.items():
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(build(lang))
        print("wrote", path)

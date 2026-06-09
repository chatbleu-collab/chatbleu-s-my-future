/* ===== 나의미래는? ===== */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

const STORE = {
  isPremium() { return localStorage.getItem('premium') === '1'; },
  setPremium(v) { localStorage.setItem('premium', v ? '1' : '0'); applyPremium(); updateSideStatus(); updateAIStatus(); },
  todayKey() { const d = new Date(); return `ai-${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; },
  aiUsedToday() { return localStorage.getItem(this.todayKey()) === '1'; },
  markAiUsed() { localStorage.setItem(this.todayKey(), '1'); }
};
function applyPremium() { document.body.classList.toggle('premium', STORE.isPremium()); }

// 화면 전환
function go(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const t = document.getElementById(screenId);
  if (t) { t.classList.add('active'); window.scrollTo({ top: 0 }); }
  closeSideMenu();
  if (screenId === 'screenAI') updateAIStatus();
}
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => go('screenHome')));

// 사이드 메뉴
const sideMenu = document.getElementById('sideMenu');
function openSideMenu() { sideMenu.hidden = false; updateSideStatus(); }
function closeSideMenu() { sideMenu.hidden = true; }
document.getElementById('btnMenu').addEventListener('click', openSideMenu);
document.querySelectorAll('[data-close-menu]').forEach(el => el.addEventListener('click', closeSideMenu));
document.getElementById('sideOpenPremium').addEventListener('click', () => { closeSideMenu(); modal.hidden = false; });
document.getElementById('sideResetPremium').addEventListener('click', () => {
  STORE.setPremium(false); toast('프리미엄 해제됨 (데모)');
});
function updateSideStatus() {
  document.getElementById('sideStatus').textContent = STORE.isPremium() ? '✦ 프리미엄 이용 중' : '무료 이용 중';
}

// 토스트
function toast(msg, ms=2000) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.hidden = true, ms);
}

// 모달
const modal = document.getElementById('modalPremium');
document.getElementById('btnPremium').addEventListener('click', () => modal.hidden = false);
document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', () => modal.hidden = true));
document.getElementById('btnSubscribe').addEventListener('click', () => {
  // TODO: 실제 결제는 토스페이먼츠 등 연동 필요
  STORE.setPremium(true);
  modal.hidden = true;
  toast('✦ 프리미엄 활성화!');
});

// ===== 데이터 =====
const ZODIAC_FORTUNES = {
  '쥐': { total: '예리한 직감이 빛나는 날. 작은 변화가 큰 기회로.', love: '말 한마디에 마음이 흔들려요.', money: '소액 지출 누적 주의.', health: '눈 피로 주의.', color: '파랑', num: 3 },
  '소': { total: '꾸준함이 보상받는 하루.', love: '오래 알던 사람과 가까워져요.', money: '안정적인 수입.', health: '허리 스트레칭.', color: '갈색', num: 8 },
  '호랑이': { total: '용기가 필요한 순간.', love: '먼저 다가가는 사람이 답을 얻어요.', money: '분산 투자가 안전.', health: '아침 운동 좋아요.', color: '주황', num: 1 },
  '토끼': { total: '주변 도움이 따라오는 날.', love: '귀여운 오해가 친밀감으로.', money: '뜻밖의 작은 수입.', health: '비타민 챙기세요.', color: '분홍', num: 7 },
  '용': { total: '큰 그림이 보이는 하루.', love: '카리스마가 매력으로.', money: '큰 거래에 우위.', health: '두통 주의.', color: '금색', num: 5 },
  '뱀': { total: '신중함이 빛나는 날.', love: '비밀스러운 마음을 살피세요.', money: '서명할 일 두 번 확인.', health: '소화 부진.', color: '검정', num: 9 },
  '말': { total: '활동적인 하루.', love: '활발한 곳에서 인연이.', money: '교통/외식비 증가.', health: '다리 근육 주의.', color: '빨강', num: 2 },
  '양': { total: '감수성 풍부.', love: '솔직할 때 마음이 통해요.', money: '취미 지출 증가.', health: '수분 보충.', color: '연두', num: 6 },
  '원숭이': { total: '재치와 유머가 무기.', love: '말솜씨로 호감.', money: '아이디어로 부수입.', health: '손목 주의.', color: '노랑', num: 4 },
  '닭': { total: '꼼꼼함이 인정받음.', love: '약속 지키면 신뢰.', money: '가계부 정리.', health: '목/어깨 결림.', color: '하양', num: 10 },
  '개': { total: '의리와 신뢰의 하루.', love: '오래된 인연에 답이.', money: '친구 권유 신중히.', health: '관절 관리.', color: '베이지', num: 11 },
  '돼지': { total: '복이 들어오는 날.', love: '편안한 분위기에서 인연.', money: '저축에 좋은 날.', health: '과식 주의.', color: '보라', num: 12 }
};

const TAROT = [
  { name: '바보', meaning: '새로운 시작과 자유. 두려움 없이 도전하세요.', key: '시작', past: '순수한 마음으로 시작했던 시기', present: '새로운 출발선에 서 있어요', future: '예상치 못한 모험이 시작돼요', pol: 1 },
  { name: '마법사', meaning: '능력과 의지. 원하는 것을 끌어당기는 힘.', key: '실현', past: '잠재력을 키워온 시간', present: '능력을 펼칠 때가 왔어요', future: '의지가 결실로 이어져요', pol: 1 },
  { name: '여사제', meaning: '내면의 지혜. 직감을 믿으세요.', key: '직관', past: '조용히 쌓아온 지혜', present: '직감이 답을 알려줘요', future: '비밀이 드러나는 시점', pol: 1 },
  { name: '여황제', meaning: '풍요와 사랑. 따뜻한 관계가 시작돼요.', key: '풍요', past: '따뜻함 속에서 자라온 시간', present: '풍요로움이 머물러요', future: '결실과 사랑이 와요', pol: 1 },
  { name: '황제', meaning: '안정과 권위. 체계를 세울 때.', key: '질서', past: '구조를 다져온 시간', present: '안정된 자리에 있어요', future: '리더로 인정받게 돼요', pol: 1 },
  { name: '교황', meaning: '전통과 가르침. 멘토를 만나요.', key: '배움', past: '믿었던 가치관의 영향', present: '멘토가 가까이 있어요', future: '깊은 깨달음이 와요', pol: 1 },
  { name: '연인', meaning: '선택과 사랑. 마음 가는 길을 따라요.', key: '선택', past: '중요한 선택의 영향이 컸어요', present: '마음과 머리가 갈려요', future: '진심을 따르면 답이 나와요', pol: 1 },
  { name: '전차', meaning: '추진력과 승리. 흔들리지 말고 직진.', key: '돌파', past: '강한 추진력으로 달려온 시간', present: '돌파해야 할 순간', future: '의지가 승리를 가져와요', pol: 1 },
  { name: '힘', meaning: '내면의 용기. 부드러움이 강함을 이겨요.', key: '인내', past: '인내로 견뎌온 시간', present: '부드러운 강함이 필요해요', future: '인내가 보상받아요', pol: 1 },
  { name: '은둔자', meaning: '성찰의 시간. 혼자만의 시간이 필요해요.', key: '성찰', past: '홀로 사색한 시간', present: '잠시 멀어져 돌아볼 때', future: '내면의 답을 발견해요', pol: 0 },
  { name: '운명의 수레바퀴', meaning: '전환점. 변화의 흐름을 받아들이세요.', key: '변화', past: '예기치 못한 전환이 있었어요', present: '운명이 바뀌고 있어요', future: '큰 전환점이 다가와요', pol: 0 },
  { name: '정의', meaning: '공정한 결과. 진실이 드러나요.', key: '균형', past: '원인이 만든 결과의 시기', present: '공정한 판단이 필요해요', future: '진실이 드러나며 정리돼요', pol: 0 },
  { name: '매달린 사람', meaning: '관점의 전환. 잠시 멈춤이 답이에요.', key: '관조', past: '멈춰서 견뎌온 시간', present: '관점을 바꿔야 할 때', future: '기다림 끝에 답이 와요', pol: 0 },
  { name: '죽음', meaning: '끝과 새로운 시작. 놓아야 할 것을 놓으세요.', key: '재생', past: '큰 변화가 있었던 시기', present: '한 챕터가 끝나고 있어요', future: '새로워진 모습이 와요', pol: 0 },
  { name: '절제', meaning: '균형과 조화. 극단을 피하세요.', key: '조화', past: '균형을 맞춰온 시간', present: '조화가 답이에요', future: '안정된 균형이 자리잡아요', pol: 1 },
  { name: '악마', meaning: '집착에서 벗어나야 할 때.', key: '해방', past: '집착이 묶었던 시간', present: '벗어나야 할 굴레가 보여요', future: '해방의 순간이 와요', pol: -1 },
  { name: '탑', meaning: '갑작스러운 변화. 흔들리지 마세요.', key: '각성', past: '예기치 못한 충격이 있었어요', present: '흔들리지만 진실이 드러나요', future: '폐허 위에 새 토대를 세워요', pol: -1 },
  { name: '별', meaning: '희망과 영감. 밝은 미래가 보여요.', key: '희망', past: '희망을 품어온 시간', present: '영감과 치유의 시기', future: '밝은 미래가 펼쳐져요', pol: 1 },
  { name: '달', meaning: '불안과 환상. 흔들리는 마음을 정돈해요.', key: '직시', past: '환상에 흔들렸던 시간', present: '불확실함이 가득해요', future: '안개가 걷히며 진실이 보여요', pol: -1 },
  { name: '태양', meaning: '성공과 기쁨. 빛나는 하루.', key: '성취', past: '성공을 쌓아온 시간', present: '빛나는 시기', future: '큰 성취와 기쁨이 와요', pol: 1 },
  { name: '심판', meaning: '깨달음과 부활. 새로운 부름이 와요.', key: '부름', past: '되돌아볼 일이 많은 시간', present: '깨달음이 오는 순간', future: '새로운 부름에 답하게 돼요', pol: 1 },
  { name: '세계', meaning: '완성과 성취. 노력의 결실.', key: '완성', past: '한 단계를 완성해온 시간', present: '결실을 맺는 시기', future: '큰 그림이 완성돼요', pol: 1 }
];

const DREAM_DB = {
  '뱀': '재물운 상승의 길몽. 큰 뱀일수록 더 큰 행운.',
  '돼지': '대표적인 길몽. 금전운이 크게 트입니다.',
  '용': '최고의 길몽. 권력, 명예, 큰 성취.',
  '물': '맑은 물은 재물, 흐린 물은 갈등.',
  '불': '열정과 새로운 시작.',
  '이빨': '가까운 사람과의 변화 의미.',
  '시험': '실생활 평가 부담. 자신감 회복할 시점.',
  '죽음': '오래된 것의 끝, 새로운 시작.',
  '결혼': '새로운 인연이나 큰 변화.',
  '아기': '새로운 프로젝트나 기쁨.',
  '돈': '직접적인 재물운. 줍는 꿈이 길조.',
  '집': '안정과 가족운. 새 집은 환경 변화.',
  '비': '눈물과 감정 정화.',
  '바다': '잔잔하면 평화, 거치면 도전.',
  '하늘': '꿈과 비전 확장.',
  '꽃': '연애운. 시드는 꽃은 이별 예고.',
  '눈물': '감정 해소. 답답함이 풀려요.',
  '거울': '자신과의 대면.'
};

const MBTI_FORTUNES = {
  'INTJ': '큰 그림이 또렷이 보이는 날.', 'INTP': '아이디어가 폭발하는 날.',
  'ENTJ': '결단력이 빛나는 날.', 'ENTP': '말발이 통하는 날.',
  'INFJ': '직감이 정확한 날.', 'INFP': '감수성이 풍부한 날.',
  'ENFJ': '주변에서 의지하는 날.', 'ENFP': '새로운 만남이 즐거운 날.',
  'ISTJ': '꼼꼼함이 빛나는 날.', 'ISFJ': '배려가 보상받는 날.',
  'ESTJ': '체계를 세우기 좋은 날.', 'ESFJ': '인간관계가 즐거운 날.',
  'ISTP': '실용적 판단이 빛나는 날.', 'ISFP': '예술적 감각이 좋은 날.',
  'ESTP': '활력 넘치는 날.', 'ESFP': '분위기 메이커가 되는 날.'
};

const STEMS = ['갑','을','병','정','무','기','경','신','임','계'];
const BRANCHES = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
const STEM_HAN2KOR = { '甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계' };
const BRANCH_HAN2KOR = { '子':'자','丑':'축','寅':'인','卯':'묘','辰':'진','巳':'사','午':'오','未':'미','申':'신','酉':'유','戌':'술','亥':'해' };
const ZODIAC_BY_BRANCH = { '子':'쥐','丑':'소','寅':'호랑이','卯':'토끼','辰':'용','巳':'뱀','午':'말','未':'양','申':'원숭이','酉':'닭','戌':'개','亥':'돼지' };
const STEM_ELEM = { '甲':'목','乙':'목','丙':'화','丁':'화','戊':'토','己':'토','庚':'금','辛':'금','壬':'수','癸':'수' };
const HOUR_TO_BRANCH = { '자':'子','축':'丑','인':'寅','묘':'卯','진':'辰','사':'巳','오':'午','미':'未','신':'申','유':'酉','술':'戌','해':'亥' };

function toSolar(birth, calendar) {
  const [y, m, d] = birth.split('-').map(Number);
  if (calendar === '음력' && typeof Lunar !== 'undefined') return Lunar.fromYmd(y, m, d).getSolar();
  if (typeof Solar !== 'undefined') return Solar.fromYmd(y, m, d);
  return null;
}
function calcHourPillar(dayStem, hourBranch) {
  const startMap = { '甲':0,'己':0, '乙':2,'庚':2, '丙':4,'辛':4, '丁':6,'壬':6, '戊':8,'癸':8 };
  const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const start = startMap[dayStem] || 0;
  const bIdx = branches.indexOf(hourBranch);
  return stems[(start + bIdx) % 10] + hourBranch;
}
function describeElem(e) {
  return { '목':'성장과 진취성이 돋보입니다.','화':'열정과 표현력이 뛰어납니다.','토':'안정과 신뢰가 강점입니다.',
           '금':'결단력과 의리가 있습니다.','수':'지혜와 유연성이 강합니다.' }[e];
}
function lifeFlow(i, g) {
  const arr = ['초년은 학업운, 중년 이후 큰 결실.','20대는 시행착오, 30대 후반부터 자리 잡음.','꾸준한 성취형. 안정적 상승.','인복이 강해 도움이 끊이지 않음.','재능형. 늦게도 새 기회.'];
  return arr[i % arr.length] + (g === '여' ? ' 특히 인간관계에서 복.' : ' 특히 사업·전문 분야에서 두각.');
}
function wealthFlow(i) { return ['오래 쌓는 형.','누적형.','중년 이후 재물운.','횡재 가능.','부동산 흐름.'][i%5]; }
function loveFlow(s, b) { return ['늦게 만난 인연이 오래갑니다.','첫사랑형.','호감 많아 인연 많음.','신중하지만 평생 가는 인연.'][(s+b)%4]; }
function warning(i) { return ['욕심을 내려놓으세요.','말 신중히.','건강 미리 챙기세요.','권유에 휘둘리지 마세요.','서두름이 적.'][i%5]; }

function calcSaju(birth, hour, gender, name, calendar, isLeap) {
  const callName = name && name.trim() ? `${name}님` : '그대';
  const calLabel = calendar === '음력' ? (isLeap ? '음력(윤달)' : '음력') : '양력';
  if (typeof Lunar === 'undefined' || typeof Solar === 'undefined') {
    return calcSajuFallback(birth, hour, gender, callName, calLabel);
  }
  try {
    const solar = toSolar(birth, calendar);
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();
    const yearGZ = eightChar.getYear(), monthGZ = eightChar.getMonth(), dayGZ = eightChar.getDay();
    let hourGZ = '';
    if (hour && HOUR_TO_BRANCH[hour]) hourGZ = calcHourPillar(dayGZ[0], HOUR_TO_BRANCH[hour]);
    const yearK = STEM_HAN2KOR[yearGZ[0]] + BRANCH_HAN2KOR[yearGZ[1]];
    const monthK = STEM_HAN2KOR[monthGZ[0]] + BRANCH_HAN2KOR[monthGZ[1]];
    const dayK = STEM_HAN2KOR[dayGZ[0]] + BRANCH_HAN2KOR[dayGZ[1]];
    const hourK = hourGZ ? STEM_HAN2KOR[hourGZ[0]] + BRANCH_HAN2KOR[hourGZ[1]] : '시간 미입력';
    const zodiacName = ZODIAC_BY_BRANCH[yearGZ[1]];
    const dayStem = dayGZ[0];
    const elem = STEM_ELEM[dayStem];
    const solarStr = `${solar.getYear()}.${solar.getMonth()}.${solar.getDay()} (양력)`;
    const lunarStr = `${lunar.getYear()}.${Math.abs(lunar.getMonth())}.${lunar.getDay()} (음력${lunar.getMonth()<0?' 윤달':''})`;
    const stemIdx = STEMS.indexOf(STEM_HAN2KOR[dayStem]);
    const branchIdx = BRANCHES.indexOf(BRANCH_HAN2KOR[yearGZ[1]]);
    return {
      title: `${callName}의 사주 (${zodiacName}띠 · 일간 ${STEM_HAN2KOR[dayStem]}${elem})`,
      lines: [
        { h: '입력 정보', t: `${calLabel} 입력 · ${solarStr} · ${lunarStr}` },
        { h: '사주 8자', t: `<b>년주</b> ${yearK} · <b>월주</b> ${monthK} · <b>일주</b> ${dayK} · <b>시주</b> ${hourK}` },
        { h: '타고난 기운', t: `일간 ${STEM_HAN2KOR[dayStem]}(${elem}). ${describeElem(elem)}` },
        { h: '평생 흐름', t: lifeFlow(stemIdx >= 0 ? stemIdx : 0, gender) },
        { h: '재물운', t: wealthFlow(branchIdx >= 0 ? branchIdx : 0) },
        { h: '인연운', t: loveFlow(stemIdx >= 0 ? stemIdx : 0, branchIdx >= 0 ? branchIdx : 0) },
        { h: '주의할 점', t: warning(stemIdx >= 0 ? stemIdx : 0) }
      ],
      lucky: [
        `방향: ${{'목':'동','화':'남','토':'중앙','금':'서','수':'북'}[elem]}쪽`,
        `색: ${{'목':'청록','화':'빨강','토':'노랑','금':'흰색','수':'검정'}[elem]}`,
        `숫자: ${{'목':3,'화':2,'토':5,'금':4,'수':1}[elem]}`
      ]
    };
  } catch (e) { console.error(e); return calcSajuFallback(birth, hour, gender, callName, calLabel); }
}
function calcSajuFallback(birth, hour, gender, callName, calLabel) {
  const y = new Date(birth).getFullYear();
  const stemIdx = (y - 4) % 10, branchIdx = (y - 4) % 12;
  const elements = ['목','목','화','화','토','토','금','금','수','수'];
  const elem = elements[stemIdx];
  const zodiac = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'][branchIdx];
  return {
    title: `${callName}의 사주 (${STEMS[stemIdx]}${BRANCHES[branchIdx]}년 · ${zodiac}띠)`,
    lines: [
      { h: '입력 정보', t: `${calLabel} 기준 (간략 계산 - 라이브러리 미로딩)` },
      { h: '타고난 기운', t: `오행 중 ${elem}. ${describeElem(elem)}` },
      { h: '평생 흐름', t: lifeFlow(stemIdx, gender) },
      { h: '재물운', t: wealthFlow(branchIdx) },
      { h: '인연운', t: loveFlow(stemIdx, branchIdx) },
      { h: '주의할 점', t: warning(stemIdx) }
    ],
    lucky: [`방향: ${['동','서','남','북'][stemIdx%4]}쪽`, `색: ${['파랑','녹색','빨강','노랑','검정'][stemIdx%5]}`, `숫자: ${(stemIdx+branchIdx)%9+1}`]
  };
}

function calcGunghap(b1, b2, n1, n2, cal1, cal2) {
  function getZodiac(birth, cal) {
    if (typeof Lunar !== 'undefined' && typeof Solar !== 'undefined') {
      try {
        const [y,m,d] = birth.split('-').map(Number);
        const solar = cal === '음력' ? Lunar.fromYmd(y,m,d).getSolar() : Solar.fromYmd(y,m,d);
        return ZODIAC_BY_BRANCH[solar.getLunar().getEightChar().getYear()[1]];
      } catch(e){}
    }
    const y = new Date(birth).getFullYear();
    return ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'][(y-4)%12];
  }
  const z1 = getZodiac(b1, cal1), z2 = getZodiac(b2, cal2);
  const order = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];
  const diff = Math.abs(order.indexOf(z1) - order.indexOf(z2));
  let score;
  if (diff === 0) score = 70;
  else if (diff === 4 || diff === 8) score = 95;
  else if (diff === 6) score = 40;
  else if (diff === 3 || diff === 9) score = 55;
  else score = 65 + (diff*2);
  score = Math.min(99, Math.max(35, score + ((n1||'').length + (n2||'').length)));
  const verdict = score >= 85 ? '천생연분!' : score >= 70 ? '좋은 인연' : score >= 55 ? '노력하면 좋아요' : '서로 다름을 이해해야 해요';
  return {
    z1, z2, score, verdict,
    lines: [
      { h: '한줄평', t: verdict },
      { h: '관계의 색', t: score>=85?'따뜻한 봄볕 같은 관계.':score>=70?'은은한 가을 햇살.':score>=55?'바람 부는 여름.':'서로 다른 계절.' },
      { h: '강점', t: score>=85?'대화가 잘 통하고 서로를 채워줍니다.':score>=70?'비슷한 듯 다른 매력.':score>=55?'다른 매력이 자극이 돼요.':'각자 독립적이라 자유로워요.' },
      { h: '약점', t: score>=85?'너무 편해서 무뎌질 수 있어요.':score>=70?'가치관 차이가 가끔 부딪쳐요.':score>=55?'소통 부족이 오해를 만들어요.':'자존심 싸움이 빈번해요.' },
      { h: '조언', t: score>=85?'표현을 잊지 마세요.':score>=70?'주기적인 데이트로 신선함을.':score>=55?'먼저 표현하는 쪽이 이끌어요.':'다름을 인정하는 게 첫걸음.' }
    ]
  };
}

function calcDaily(z) { return ZODIAC_FORTUNES[z]; }
function calcMbti(m) { return { mbti: m, msg: MBTI_FORTUNES[m] }; }
function calcDream(kw) {
  const key = Object.keys(DREAM_DB).find(k => kw.includes(k));
  if (key) return { key, msg: DREAM_DB[key] };
  const hash = [...kw].reduce((a, c) => a + c.charCodeAt(0), 0);
  const generic = ['마음속 불안이나 기대가 형상화된 꿈.','잠재의식의 메시지.','변화의 흐름을 암시.','묵혀둔 감정이 떠오르는 시기.'];
  return { key: kw, msg: generic[hash % generic.length] };
}
function calcName(name) {
  const total = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const t = total % 5;
  const elem = ['목','화','토','금','수'][t];
  const types = [
    { kw: '성장형', msg: '꾸준히 자라나는 이름.' }, { kw: '열정형', msg: '활활 타오르는 기운.' },
    { kw: '안정형', msg: '믿음과 신뢰의 이름.' }, { kw: '결단형', msg: '단호하고 분명한 기운.' },
    { kw: '지혜형', msg: '깊이 있는 사유의 이름.' }
  ];
  return {
    name, score: 60 + (total % 35), elem, type: types[t].kw,
    lines: [
      { h: '이름의 기운', t: types[t].msg },
      { h: '어울리는 색', t: ['초록·청록','빨강·분홍','노랑·갈색','흰색·은색','검정·남색'][t] },
      { h: '어울리는 방향', t: ['동','남','중앙','서','북'][t] },
      { h: '주의할 점', t: ['욕심을 줄이세요.','감정 조절.','움직임을 늘리세요.','부드러움을 더하세요.','표현을 자주.'][t] }
    ]
  };
}
function calcAI(question) {
  const tags = [];
  if (/이직|회사|직장|일|업무|상사/.test(question)) tags.push('career');
  if (/연애|남친|여친|사랑|썸|이별/.test(question)) tags.push('love');
  if (/돈|투자|월급|재테크|빚/.test(question)) tags.push('money');
  if (/건강|병원|아프|피곤/.test(question)) tags.push('health');
  if (/공부|시험|합격|진학/.test(question)) tags.push('study');
  if (!tags.length) tags.push('general');
  const intros = ['음... 별운이 마음을 들여다봤어.','오늘 그대의 별빛이 이런 그림을 그리고 있어.','별운이 보는 너의 흐름은 이래.'];
  const advices = {
    career: ['지금은 결단보다 점검이 먼저야.','환경보다 동료 한 명이 더 큰 변화를 만들 거야.','용기보다 준비가 부족한 시기야.'],
    love: ['상대의 침묵은 거절이 아니라 망설임이야.','먼저 손 내미는 사람이 더 큰 사랑을 얻어.','지금의 흔들림은 정리되는 신호.'],
    money: ['큰 결정보다 작은 정리가 더 큰 이익.','서두르지 마. 다음 달 흐름이 더 좋아.','돈을 쫓지 말고 신뢰를 쌓아.'],
    health: ['몸이 보내는 신호를 무시하지 마.','쉼이 가장 좋은 약.','주변의 도움을 받아.'],
    study: ['지금의 정체는 도약 직전의 침묵.','방법보다 환경을 바꿔봐.','쉬는 것도 공부의 일부.'],
    general: ['지금 흐름은 정리의 시기.','큰 그림을 그릴 때야.','작은 행동 하나가 큰 변화를 만들어.']
  };
  const ads = advices[tags[0]] || advices.general;
  return { intro: intros[Math.floor(Math.random()*intros.length)], answer: ads[Math.floor(Math.random()*ads.length)], closing: '별운은 항상 너의 편이야. ✦' };
}

function renderResultLines(el, title, lines, lucky, score, scoreLabel) {
  let html = `<h3>${title}</h3>`;
  if (score !== undefined) html += `<div class="score">${score}<small style="font-size:14px;color:var(--ink-dim)">${scoreLabel||''}</small></div>`;
  lines.forEach(({h, t}) => {
    if (h) html += `<div class="section"><h4>${h}</h4><p>${t}</p></div>`;
    else html += `<p style="margin-top:10px">${t}</p>`;
  });
  if (lucky && lucky.length) {
    html += `<div class="section"><h4>오늘의 행운</h4><div class="lucky">${lucky.map(l => `<span>${l}</span>`).join('')}</div></div>`;
  }
  el.innerHTML = html; el.hidden = false;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.getElementById('formSaju').addEventListener('submit', (e) => {
  e.preventDefault(); const f = new FormData(e.target);
  const r = calcSaju(f.get('birth'), f.get('hour'), f.get('gender'), f.get('name'), f.get('calendar'), !!f.get('leap'));
  renderResultLines(document.getElementById('resultSaju'), r.title, r.lines, r.lucky);
});
document.getElementById('formGunghap').addEventListener('submit', (e) => {
  e.preventDefault(); const f = new FormData(e.target);
  const r = calcGunghap(f.get('birth1'), f.get('birth2'), f.get('name1'), f.get('name2'), f.get('cal1'), f.get('cal2'));
  renderResultLines(document.getElementById('resultGunghap'), `${r.z1}띠 × ${r.z2}띠`, r.lines, null, r.score, '점');
});
document.getElementById('formDaily').addEventListener('submit', (e) => {
  e.preventDefault(); const f = new FormData(e.target); const r = calcDaily(f.get('zodiac'));
  renderResultLines(document.getElementById('resultDaily'), `${f.get('zodiac')}띠 오늘의 운세`,
    [{h:'총운', t: r.total},{h:'애정운', t: r.love},{h:'금전운', t: r.money},{h:'건강운', t: r.health}],
    [`색: ${r.color}`, `숫자: ${r.num}`]);
});
document.getElementById('formMbti').addEventListener('submit', (e) => {
  e.preventDefault(); const f = new FormData(e.target); const r = calcMbti(f.get('mbti'));
  renderResultLines(document.getElementById('resultMbti'), `${r.mbti} 오늘의 운세`, [{h:'흐름', t: r.msg}], null);
});
document.getElementById('formDream').addEventListener('submit', (e) => {
  e.preventDefault(); const f = new FormData(e.target); const r = calcDream(f.get('keyword'));
  renderResultLines(document.getElementById('resultDream'), `'${r.key}' 꿈 풀이`, [{h:'별운의 해석', t: r.msg}], null);
});
document.getElementById('formName').addEventListener('submit', (e) => {
  e.preventDefault(); const f = new FormData(e.target); const r = calcName(f.get('name'));
  renderResultLines(document.getElementById('resultName'), `${r.name} 이름풀이 (${r.type}·${r.elem})`, r.lines, null, r.score, '점');
});

function updateAIStatus() {
  const el = document.getElementById('aiStatus');
  if (!el) return;
  if (STORE.isPremium()) el.innerHTML = '✦ 프리미엄 - 무제한 사용';
  else if (STORE.aiUsedToday()) {
    el.innerHTML = '오늘 무료 1회를 모두 사용했어요. <b style="color:var(--gold);cursor:pointer" id="aiUpsell">프리미엄으로 무제한 ▸</b>';
    setTimeout(() => { const u = document.getElementById('aiUpsell'); if (u) u.addEventListener('click', () => modal.hidden = false); }, 0);
  } else el.innerHTML = '오늘 무료 1회 남았어요. 마음껏 물어보세요.';
}
document.getElementById('formAI').addEventListener('submit', (e) => {
  e.preventDefault(); const f = new FormData(e.target); const q = f.get('question').trim();
  if (!STORE.isPremium() && STORE.aiUsedToday()) { toast('오늘 무료 사용을 모두 썼어요'); modal.hidden = false; return; }
  const result = document.getElementById('resultAI');
  result.hidden = false;
  result.innerHTML = '<h3>별운이 생각 중...</h3><p style="color:var(--ink-dim)">✦ 별빛을 모으는 중...</p>';
  setTimeout(() => {
    const r = calcAI(q);
    renderResultLines(result, '🔮 별운의 답', [{h:'', t: r.intro},{h:'답', t: r.answer},{h:'', t: r.closing}], null);
    if (!STORE.isPremium()) STORE.markAiUsed();
    updateAIStatus();
  }, 1500);
});

// 타로 3장
const TAROT_STATE = { picked: [null, null, null] };
function tarotResetUI() {
  TAROT_STATE.picked = [null, null, null];
  document.querySelectorAll('.tarot-card').forEach(c => {
    c.classList.remove('picked'); c.innerHTML = '<div class="back-face">✦</div>';
  });
  document.getElementById('tarotProgress').textContent = '아직 한 장도 안 뽑았어요. 첫 번째 카드를 클릭!';
  document.getElementById('tarotReset').hidden = true;
  document.getElementById('resultTarot').hidden = true;
}
function tarotPickedCount() { return TAROT_STATE.picked.filter(x => x !== null).length; }
function tarotPick(pos) {
  if (TAROT_STATE.picked[pos] !== null) return;
  const used = TAROT_STATE.picked.filter(x => x).map(x => x.name);
  const pool = TAROT.filter(t => !used.includes(t.name));
  const card = pool[Math.floor(Math.random() * pool.length)];
  TAROT_STATE.picked[pos] = card;
  const el = document.querySelector(`.tarot-card[data-pos="${pos}"]`);
  el.classList.add('picked');
  el.innerHTML = `<div style="text-align:center;padding:6px"><div style="font-size:10px;color:var(--bg-deep);font-weight:700">${card.key}</div><div style="font-size:12px;color:var(--bg-deep);font-weight:700;margin-top:6px;line-height:1.2">${card.name}</div></div>`;
  const cnt = tarotPickedCount();
  const progress = document.getElementById('tarotProgress');
  if (cnt < 3) progress.textContent = `${cnt}장 뽑았어요. ${3-cnt}장 더 뽑아주세요.`;
  else { progress.textContent = '✦ 세 장의 흐름을 풀이해드릴게요...'; setTimeout(tarotRenderSpread, 700); }
}
function tarotRenderSpread() {
  const [past, present, future] = TAROT_STATE.picked;
  const totalPol = past.pol + present.pol + future.pol;
  let verdict, advice;
  if (totalPol >= 2) { verdict = '✨ 흐름이 매우 좋아요. 자신감을 가져도 됩니다.'; advice = '지금 가는 방향을 믿고 한 발 더 내디뎌요.'; }
  else if (totalPol >= 0) { verdict = '🌙 균형 잡힌 흐름이에요.'; advice = '서두르지 말고 작은 신호를 놓치지 마세요.'; }
  else if (totalPol >= -1) { verdict = '⚠️ 조심해야 할 흐름. 멈춤도 답.'; advice = '무리한 결정 대신 한 박자 늦추세요.'; }
  else { verdict = '🌑 흐름이 어두워요. 하지만 끝은 새로운 시작.'; advice = '지금의 어려움이 큰 전환점을 만들어요.'; }
  const story = `<b>지금까지</b>는 <i>${past.past}</i>이었고,<br><b>지금</b>은 <i>${present.present}</i>예요.<br><b>앞으로</b>는 <i>${future.future}</i>.`;
  renderResultLines(
    document.getElementById('resultTarot'),
    `🃏 ${past.name} · ${present.name} · ${future.name}`,
    [
      { h: '✦ 전체 흐름', t: `${past.key} → ${present.key} → ${future.key}` },
      { h: '📖 별운의 스토리', t: story },
      { h: `🕰️ 과거 - ${past.name}`, t: past.meaning },
      { h: `🌙 현재 - ${present.name}`, t: present.meaning },
      { h: `🔮 미래 - ${future.name}`, t: future.meaning },
      { h: '✨ 종합 판단', t: verdict },
      { h: '💡 별운의 조언', t: advice }
    ],
    [`과거: ${past.key}`, `현재: ${present.key}`, `미래: ${future.key}`]
  );
  document.getElementById('tarotReset').hidden = false;
}
document.querySelectorAll('.tarot-card').forEach(card => {
  card.addEventListener('click', () => tarotPick(Number(card.dataset.pos)));
});
document.getElementById('tarotReset').addEventListener('click', tarotResetUI);

// 인사말
(function greeting() {
  const h = new Date().getHours();
  let msg;
  if (h < 6) msg = '깊은 밤이네. 잠 못 드는 너에게 별운이 위로를 보내.';
  else if (h < 12) msg = '좋은 아침이야. 오늘의 별빛을 알려줄게.';
  else if (h < 18) msg = '오후의 인사. 별운이 너의 흐름을 봐줄게.';
  else msg = '저녁 별이 빛나는 시간. 별운이 답해줄게.';
  const el = document.getElementById('homeGreeting');
  if (el) el.innerHTML = `안녕, 나는 <b>별운</b>이야.<br>${msg}`;
})();

applyPremium(); updateAIStatus(); updateSideStatus();

import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View,
  TouchableOpacity, Pressable, Modal,
} from 'react-native';

//============ DATA & ENGINE ============
const DEST = {
  "京都": { emoji: "⛩️", hub: "京都駅", food: { 朝: 600, 昼: 1200, 夜: 2800 }, stay: 8000,
    spots: ["伏見稲荷大社", "清水寺・産寧坂", "嵐山 竹林の道", "錦市場", "金閣寺", "祇園・花見小路"],
    desc: "千年の古都。神社仏閣・庭園が密集し、徒歩＋バスで効率よく巡れる。外国人観光客が多く混雑シーズンは早朝行動が鍵。",
    bestSeason: "3〜4月(桜)・11月(紅葉)", avgTemp: "春/秋 12〜20℃", tags: ["歴史・寺社", "写真映え", "着物体験"] },
  "沖縄": { emoji: "🏝️", hub: "那覇空港", food: { 朝: 700, 昼: 1300, 夜: 3200 }, stay: 9500,
    spots: ["国際通り", "首里城公園", "美ら海水族館", "古宇利島ドライブ", "第一牧志公設市場", "瀬長島ウミカジテラス"],
    desc: "南国リゾート。海・水族館が中心で移動はレンタカー推奨。台風シーズン(8〜9月)は天候リスクあり。",
    bestSeason: "4〜6月・10〜11月", avgTemp: "年間20〜31℃", tags: ["海・リゾート", "ダイビング", "レンタカー移動"] },
  "札幌": { emoji: "🐻", hub: "札幌駅", food: { 朝: 700, 昼: 1400, 夜: 3500 }, stay: 9000,
    spots: ["大通公園・時計台", "白い恋人パーク", "小樽運河", "二条市場", "藻岩山 夜景", "サッポロビール園"],
    desc: "食とビール、雪景色が魅力。冬は雪祭り(2月)で混雑・防寒必須。小樽まで足を伸ばすなら電車で約30分。",
    bestSeason: "6〜8月(避暑)・2月(雪祭り)", avgTemp: "夏 22℃前後・冬 -4℃前後", tags: ["グルメ", "雪景色", "ビール・海鮮"] },
  "福岡": { emoji: "🍜", hub: "博多駅", food: { 朝: 600, 昼: 1100, 夜: 3000 }, stay: 7500,
    spots: ["太宰府天満宮", "中洲 屋台街", "大濠公園", "キャナルシティ博多", "糸島ドライブ", "櫛田神社"],
    desc: "コンパクトで移動しやすく物価も控えめ。屋台文化と博多グルメが人気。空港から市街地まで地下鉄で約5分。",
    bestSeason: "4〜5月・10〜11月", avgTemp: "春/秋 14〜22℃", tags: ["屋台グルメ", "コンパクト", "コスパ良好"] },
  "東京": { emoji: "🗼", hub: "東京駅", food: { 朝: 700, 昼: 1300, 夜: 3300 }, stay: 11000,
    spots: ["浅草・雷門", "渋谷スクランブル", "チームラボ", "上野公園", "豊洲市場", "お台場海浜公園"],
    desc: "都市型観光の代表格。交通網が発達し電車移動が基本。エリアごとに雰囲気が大きく異なる。宿泊費はやや高め。",
    bestSeason: "通年・特に3〜5月/10〜11月", avgTemp: "春/秋 13〜22℃", tags: ["都市観光", "ショッピング", "最新スポット"] },
  "大阪": { emoji: "🐙", hub: "新大阪駅", food: { 朝: 600, 昼: 1200, 夜: 2900 }, stay: 8000,
    spots: ["大阪城公園", "道頓堀・グリコ", "海遊館", "新世界・通天閣", "梅田スカイビル", "黒門市場"],
    desc: "食い倒れの街。庶民的で活気があり、道頓堀周辺は徒歩で楽しめる。USJ目的なら宿は西九条・弁天町が便利。",
    bestSeason: "3〜5月・10〜11月", avgTemp: "春/秋 14〜22℃", tags: ["粉もの・グルメ", "テーマパーク", "活気ある街"] },
};
const ORIGINS = ["東京", "横浜", "名古屋", "大阪", "京都", "神戸", "福岡", "札幌", "仙台", "広島"];
const AV = ["#7c5cff", "#4d8bff", "#3fe0c5", "#ff6b8a", "#ffcb6b", "#c79bff", "#5ad1ff"];
const PRIORITIES = [
  { key: "観光重視", icon: "🗺️", desc: "名所めぐり" },
  { key: "グルメ", icon: "🍽️", desc: "食べ歩き中心" },
  { key: "のんびり", icon: "♨️", desc: "温泉・癒し" },
  { key: "アクティブ", icon: "🚣", desc: "体験・自然" },
  { key: "写真映え", icon: "📸", desc: "映えスポット" },
  { key: "子連れ向け", icon: "👨‍👩‍👧", desc: "安全・休憩しやすい" },
  { key: "ショッピング", icon: "🛍️", desc: "買い物中心" },
  { key: "夜も楽しむ", icon: "🌃", desc: "ナイトスポット" },
];

function travel(o, d) {
  if (o === d) return { cost: 800, hours: 0.5 };
  const base = { "京都": 480, "沖縄": 1200, "札幌": 1100, "福岡": 900, "東京": 500, "大阪": 420 };
  const f = { "東京": 1, "横浜": 1, "名古屋": .7, "大阪": .45, "京都": .4, "神戸": .5, "福岡": .9, "札幌": 1, "仙台": .85, "広島": .7 };
  const km = (base[d] || 600) * (f[o] ?? 1);
  return { cost: Math.max(900, Math.round(km * 18 / 100) * 100), hours: Math.max(0.5, Math.round(km / 180 * 10) / 10) };
}
const yen = n => "¥" + Math.round(n).toLocaleString("ja-JP");

function buildPlan(state) {
  const { dest, days, budget, priorities, note, members } = state;
  const D = DEST[dest];
  const n = members.length;
  const themeLabel = priorities.length ? priorities.join("・") : "おまかせ";
  const mainTheme = priorities[0] || "観光重視";
  const legs = members.map(m => { const t = travel(m.origin, dest); return { ...m, ...t, round: t.cost * 2 }; });
  const slowest = legs.reduce((a, b) => (b.hours > a.hours ? b : a));
  const meetHour = Math.min(13, Math.round(9 + slowest.hours));
  const meetTime = String(meetHour).padStart(2, "0") + ":00";
  const nights = Math.max(0, days - 1);
  const stayPer = D.stay * nights;
  const foodPer = days * (D.food.朝 + D.food.昼 + D.food.夜) * 0.9;
  const activityBase = priorities.includes("アクティブ") ? 3000 : priorities.includes("グルメ") ? 1500 : priorities.includes("ショッピング") ? 2000 : 1200;
  const activityPer = activityBase * days + priorities.length * 300;
  const perEstimate = stayPer + foodPer + activityPer;
  const totalMove = legs.reduce((s, l) => s + l.round, 0);
  const fairPerPerson = perEstimate + totalMove / n;
  const totalBudget = budget * n;
  const totalEstimate = perEstimate * n + totalMove;
  const overPer = fairPerPerson > budget;
  const overTotal = totalEstimate > totalBudget;

  const spots = [...D.spots];
  const pick = k => spots.splice(0, k);
  const dayEvents = [];
  for (let d = 1; d <= days; d++) {
    const ev = [];
    if (d === 1) {
      ev.push(["~" + meetTime, "🚉 " + D.hub + "に集合", "最も遠い" + slowest.name + "さん(" + slowest.origin + ")基準。早い人はカフェで待機", "move", slowest.round]);
      ev.push([meetTime, "🍱 合流ランチ", D.hub + "周辺で全員集合の昼食", "food", D.food.昼]);
      pick(2).forEach((s, k) => ev.push([["14:00", "16:00"][k], "📍 " + s, mainTheme + "の定番スポット", "spot", 0]));
      ev.push(["18:30", "🍽 歓迎ディナー", n + "名で個室予約推奨", "food", D.food.夜]);
      if (nights > 0) ev.push(["20:30", "🏨 宿泊", n + "名 / " + (n >= 4 ? "2部屋以上" : "1〜2部屋") + "・予算重視", "stay", D.stay]);
    } else if (d === days) {
      ev.push(["08:00", "🍳 朝食 → チェックアウト", "荷物は預けて身軽に", "food", D.food.朝]);
      pick(2).forEach((s, k) => ev.push([["09:30", "11:30"][k], "📍 " + s, D.hub + "寄りを優先", "spot", 0]));
      ev.push(["13:00", "🍜 解散ランチ", "最後の食事→各自の出発地へ", "food", D.food.昼]);
      ev.push(["14:30", "🚉 " + D.hub + "で解散", "出発地別に分かれて帰路", "move", 0]);
    } else {
      ev.push(["08:30", "🍳 朝食", "宿またはモーニング", "food", D.food.朝]);
      pick(3).forEach((s, k) => ev.push([["10:00", "13:00", "15:30"][k], "📍 " + s, k === 1 ? "途中ランチ込み" : mainTheme + "を満喫", "spot", 0]));
      ev.push(["19:00", "🍽 夕食", "みんなで郷土料理", "food", D.food.夜]);
      if (d < days && nights > 0) ev.push(["21:00", "🏨 宿泊", n + "名 / 連泊", "stay", D.stay]);
    }
    dayEvents.push(ev);
  }
  return { dest, days, n, themeLabel, note, budget, totalBudget, totalEstimate, fairPerPerson, overPer, overTotal, legs, slowest, meetTime, totalMove, dayEvents, D, nights };
}

//============ UI ============
export default function App() {
  const [step, setStep] = useState(0); // 0-3 wizard, 4 loading, 5 result
  const [dest, setDest] = useState("京都");
  const [detailDest, setDetailDest] = useState(null);
  const [days, setDays] = useState(2);
  const [priorities, setPriorities] = useState(["観光重視"]);
  const [note, setNote] = useState("");
  const [budget, setBudget] = useState(35000);
  const [members, setMembers] = useState([
    { name: "たろう", origin: "東京" }, { name: "はなこ", origin: "大阪" }, { name: "けん", origin: "福岡" },
  ]);
  const [plan, setPlan] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [loadingText, setLoadingText] = useState("");

  const togglePriority = key => setPriorities(ps => ps.includes(key) ? ps.filter(p => p !== key) : [...ps, key]);
  const updateMember = (i, patch) => setMembers(ms => ms.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  const addMember = () => setMembers(ms => [...ms, { name: "", origin: "東京" }]);
  const removeMember = i => setMembers(ms => (ms.length > 1 ? ms.filter((_, idx) => idx !== i) : ms));
  const changeDays = delta => setDays(d => Math.min(14, Math.max(1, d + delta)));

  const goNext = () => {
    if (step < 3) { setStep(step + 1); return; }
    setStep(4);
    const msgs = ["全員の出発地を分析しています", "最適な合流地点を計算中", "予算を移動・宿・食事に配分", "こだわり条件を反映中", "タイムラインを組み立て中"];
    let i = 0;
    setLoadingText(msgs[0]);
    const iv = setInterval(() => { i++; if (i < msgs.length) setLoadingText(msgs[i]); }, 500);
    setTimeout(() => {
      clearInterval(iv);
      setPlan(buildPlan({ dest, days, budget, priorities, note, members: members.map(m => ({ name: m.name || "名無し", origin: m.origin })) }));
      setActiveDay(0);
      setStep(5);
    }, 2600);
  };
  const goBack = () => { if (step > 0 && step < 4) setStep(step - 1); };
  const restart = () => { setStep(0); setPlan(null); };

  return (
    <SafeAreaView style={s.app}>
      <StatusBar style="light" />
      <View style={s.header}>
        {step > 0 && step < 4 && (
          <Pressable onPress={goBack} style={s.backBtn}><Text style={s.backTxt}>‹</Text></Pressable>
        )}
        {step < 5 && (
          <View style={s.brandRow}>
            <View style={s.logo}><Text style={{ fontSize: 18 }}>✈️</Text></View>
            <View>
              <Text style={s.brandTitle}>Tabily</Text>
              <Text style={s.brandSub}>みんなの旅、ひとつのプランに。</Text>
            </View>
          </View>
        )}
        {step < 4 && (
          <View style={s.steps}>
            {[0, 1, 2, 3].map(i => <View key={i} style={[s.stepDot, i <= step && s.stepDotOn]} />)}
          </View>
        )}
      </View>

      {step === 4 ? (
        <View style={s.loadingWrap}>
          <View style={s.orbit} />
          <Text style={s.loadingTitle}>グループ最適化中…</Text>
          <Text style={s.loadingSub}>{loadingText}</Text>
        </View>
      ) : (
        <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 140 }}>
          {step === 0 && (
            <View>
              <Text style={s.eyebrow}>STEP 1 / 4</Text>
              <Text style={s.qtitle}>どこへ行く？</Text>
              <Text style={s.qhint}>気になる目的地は「ⓘ」で詳しく調べられます。</Text>
              <View style={s.grid2}>
                {Object.entries(DEST).map(([k, v]) => (
                  <View key={k} style={{ width: "47%" }}>
                    <OptCard selected={dest === k} icon={v.emoji} title={k} desc={v.hub} onPress={() => setDest(k)} />
                    <Pressable style={s.infoBtn} onPress={() => setDetailDest(k)}>
                      <Text style={s.infoBtnTxt}>ⓘ 詳しく見る</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          )}

          {step === 1 && (
            <View>
              <Text style={s.eyebrow}>STEP 2 / 4</Text>
              <Text style={s.qtitle}>日数とこだわり</Text>
              <Text style={s.qhint}>日数は自由に調整。重視したいことは複数選べます。</Text>

              <View style={s.stepperRow}>
                <Pressable style={s.stepperBtn} onPress={() => changeDays(-1)}><Text style={s.stepperBtnTxt}>−</Text></Pressable>
                <View style={s.stepperCenter}>
                  <Text style={s.stepperNum}>{days}</Text>
                  <Text style={s.stepperLabel}>{days === 1 ? "日（日帰り）" : `日間（${days - 1}泊${days}日）`}</Text>
                </View>
                <Pressable style={s.stepperBtn} onPress={() => changeDays(1)}><Text style={s.stepperBtnTxt}>＋</Text></Pressable>
              </View>

              <Text style={[s.eyebrow, { color: "#8b91bd", marginTop: 20 }]}>重視したいこと（複数選択可）</Text>
              <View style={s.chipWrap}>
                {PRIORITIES.map(p => {
                  const on = priorities.includes(p.key);
                  return (
                    <Pressable key={p.key} style={[s.priChip, on && s.priChipOn]} onPress={() => togglePriority(p.key)}>
                      <Text style={s.priChipIcon}>{p.icon}</Text>
                      <View>
                        <Text style={[s.priChipTxt, on && s.priChipTxtOn]}>{p.key}</Text>
                        <Text style={s.priChipDesc}>{p.desc}</Text>
                      </View>
                      {on && <Text style={s.priChipCheck}>✓</Text>}
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[s.eyebrow, { color: "#8b91bd", marginTop: 18 }]}>自由に書く（任意）</Text>
              <TextInput
                style={s.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="例：写真映えする場所を回りたい／歩く距離は短めがいい／記念日なので少し贅沢したい"
                placeholderTextColor="#5b6090"
                multiline
                numberOfLines={4}
              />
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={s.eyebrow}>STEP 3 / 4</Text>
              <Text style={s.qtitle}>一人あたりの予算</Text>
              <Text style={s.qhint}>この金額を上限に、移動・宿・食事を最適配分します。</Text>
              <View style={{ alignItems: "center", marginVertical: 10 }}>
                <Text style={s.budgetAmt}>{yen(budget)}</Text>
                <Text style={s.budgetPer}>/ 一人あたり</Text>
              </View>
              <View style={s.stepperRow}>
                <Pressable style={s.stepperBtn} onPress={() => setBudget(b => Math.max(5000, b - 1000))}><Text style={s.stepperBtnTxt}>−</Text></Pressable>
                <TextInput
                  style={s.budgetInput}
                  value={String(budget)}
                  keyboardType="numeric"
                  onChangeText={t => setBudget(Math.max(0, parseInt(t.replace(/[^0-9]/g, ""), 10) || 0))}
                />
                <Pressable style={s.stepperBtn} onPress={() => setBudget(b => b + 1000)}><Text style={s.stepperBtnTxt}>＋</Text></Pressable>
              </View>
              <View style={[s.panel, { marginTop: 20 }]}>
                <Text style={s.panelTitle}>💡 グループ予算のポイント</Text>
                <Text style={s.panelLi}>› 合計予算と一人上限を同時にチェック</Text>
                <Text style={s.panelLi}>› 出発地による移動費の差は割り勘プールで公平化</Text>
              </View>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={s.eyebrow}>STEP 4 / 4</Text>
              <Text style={s.qtitle}>メンバーと出発地</Text>
              <Text style={s.qhint}>出発地がバラバラでもOK。合流地点を自動で最適化します。</Text>
              {members.map((m, i) => (
                <View key={i} style={s.memberRow}>
                  <View style={[s.avatar, { backgroundColor: AV[i % AV.length] }]}>
                    <Text style={s.avatarTxt}>{(m.name || "?").slice(0, 1)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput style={s.nameInput} value={m.name} placeholder="名前を入力" placeholderTextColor="#5b6090"
                      onChangeText={t => updateMember(i, { name: t })} />
                    <View style={s.originRow}>
                      <Text style={s.originLabel}>📍 出発地：</Text>
                      <View style={s.originChips}>
                        {ORIGINS.map(o => (
                          <Pressable key={o} onPress={() => updateMember(i, { origin: o })}
                            style={[s.chip, m.origin === o && s.chipOn]}>
                            <Text style={[s.chipTxt, m.origin === o && s.chipTxtOn]}>{o}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  </View>
                  {members.length > 1 && (
                    <Pressable onPress={() => removeMember(i)} style={s.delBtn}><Text style={s.delTxt}>✕</Text></Pressable>
                  )}
                </View>
              ))}
              <Pressable style={s.addM} onPress={addMember}><Text style={s.addMTxt}>＋ メンバーを追加</Text></Pressable>
            </View>
          )}

          {step === 5 && plan && <ResultView x={plan} activeDay={activeDay} setActiveDay={setActiveDay} />}
        </ScrollView>
      )}

      {step < 5 && step !== 4 && (
        <View style={s.footerCta}>
          <TouchableOpacity style={s.btnPrimary} onPress={goNext}>
            <Text style={s.btnPrimaryTxt}>{step === 3 ? "🎒 プランを作成" : "次へ"}</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 5 && (
        <View style={s.footerCta}>
          <TouchableOpacity style={s.btnPrimary} onPress={restart}>
            <Text style={s.btnPrimaryTxt}>条件を変えてやり直す</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={!!detailDest} transparent animationType="fade" onRequestClose={() => setDetailDest(null)}>
        <Pressable style={s.modalBg} onPress={() => setDetailDest(null)}>
          <Pressable style={s.modalCard} onPress={() => {}}>
            {detailDest && (
              <>
                <Text style={s.modalTitle}>{DEST[detailDest].emoji} {detailDest}</Text>
                <Text style={s.modalDesc}>{DEST[detailDest].desc}</Text>
                <View style={s.modalRow}><Text style={s.modalLabel}>集合ハブ</Text><Text style={s.modalVal}>{DEST[detailDest].hub}</Text></View>
                <View style={s.modalRow}><Text style={s.modalLabel}>ベストシーズン</Text><Text style={s.modalVal}>{DEST[detailDest].bestSeason}</Text></View>
                <View style={s.modalRow}><Text style={s.modalLabel}>気温の目安</Text><Text style={s.modalVal}>{DEST[detailDest].avgTemp}</Text></View>
                <View style={s.modalTags}>
                  {DEST[detailDest].tags.map(t => <View key={t} style={s.modalTag}><Text style={s.modalTagTxt}>{t}</Text></View>)}
                </View>
                <Text style={s.modalSub}>主なスポット</Text>
                {DEST[detailDest].spots.map(sp => <Text key={sp} style={s.modalSpot}>› {sp}</Text>)}
                <TouchableOpacity style={s.modalSelectBtn} onPress={() => { setDest(detailDest); setDetailDest(null); }}>
                  <Text style={s.btnPrimaryTxt}>この目的地を選ぶ</Text>
                </TouchableOpacity>
                <Pressable onPress={() => setDetailDest(null)}><Text style={s.modalClose}>閉じる</Text></Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function OptCard({ selected, icon, title, desc, onPress }) {
  return (
    <Pressable style={[s.opt, selected && s.optSel, { width: "100%" }]} onPress={onPress}>
      <View style={[s.optIcon, selected && s.optIconSel]}><Text style={{ fontSize: 20 }}>{icon}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={s.optTitle}>{title}</Text>
        <Text style={s.optDesc}>{desc}</Text>
      </View>
      {selected && <View style={s.optCheck}><Text style={{ color: "#fff", fontSize: 11 }}>✓</Text></View>}
    </Pressable>
  );
}

function ResultView({ x, activeDay, setActiveDay }) {
  return (
    <View>
      <View style={s.hero}>
        <Text style={s.heroDest}>{x.D.emoji} {x.dest}</Text>
        <Text style={s.heroMeta}>{x.days === 1 ? "日帰り" : (x.days - 1) + "泊" + x.days + "日"} ・ {x.n}名グループ ・ {x.themeLabel}</Text>
        <View style={s.pills}>
          <View style={s.pill}><Text style={s.pillTxt}>📍 {x.D.hub} 集合 {x.meetTime}</Text></View>
          <View style={s.pill}><Text style={s.pillTxt}>👥 {x.n}名</Text></View>
        </View>
      </View>

      {x.note ? (
        <View style={[s.panel, { marginTop: 14 }]}>
          <Text style={s.panelTitle}>📝 いただいたこだわり</Text>
          <Text style={s.panelLi}>{x.note}</Text>
        </View>
      ) : null}

      <View style={s.statRow}>
        <View style={[s.scard, x.overTotal ? s.scardAlert : s.scardGood]}>
          <Text style={[s.scardV, x.overTotal ? s.txtAlert : s.txtGood]}>{yen(x.totalEstimate)}</Text>
          <Text style={s.scardL}>合計見込み{"\n"}予算 {yen(x.totalBudget)}</Text>
        </View>
        <View style={[s.scard, x.overPer ? s.scardAlert : s.scardGood]}>
          <Text style={[s.scardV, x.overPer ? s.txtAlert : s.txtGood]}>{yen(x.fairPerPerson)}</Text>
          <Text style={s.scardL}>割り勘 一人{"\n"}上限 {yen(x.budget)}</Text>
        </View>
      </View>

      <View style={s.panel}>
        <Text style={s.panelTitle}>🤝 合流の最適化</Text>
        {x.legs.map((l, i) => (
          <Text key={i} style={s.panelLi}>› {l.name}（{l.origin}）— 片道約{l.hours}h・往復 {yen(l.round)}</Text>
        ))}
        <Text style={s.panelNote}>
          集合は最も遠い {x.slowest.name}さん（{x.slowest.origin}） 基準で {x.meetTime}。移動費合計 {yen(x.totalMove)} を割り勘すると一人 {yen(x.totalMove / x.n)}。
        </Text>
      </View>

      {(x.overPer || x.overTotal) ? (
        <View style={[s.panel, s.panelWarn]}>
          <Text style={[s.panelTitle, { color: "#ffcb6b" }]}>⚠️ 予算調整のおすすめ</Text>
          {x.overTotal && <Text style={s.panelLi}>› 合計が {yen(x.totalEstimate - x.totalBudget)} 超過。相部屋で約 {yen(x.D.stay * 0.3 * x.nights * x.n)} 削減可。</Text>}
          <Text style={s.panelLi}>› 夕食を1回カジュアルにして一人約 {yen(x.D.food.夜 * 0.4)} 圧縮。</Text>
          <Text style={s.panelLi}>› 遠方メンバーは早割・夜行便で移動費を最大30%カット。</Text>
        </View>
      ) : (
        <View style={[s.panel, s.panelGood]}>
          <Text style={[s.panelTitle, { color: "#46e0a0" }]}>✅ 予算内に収まっています</Text>
          <Text style={s.panelLi}>› 余裕 一人約 {yen(x.budget - x.fairPerPerson)}。体験や手土産に回せます。</Text>
        </View>
      )}

      <View style={s.tabs}>
        {x.dayEvents.map((_, i) => (
          <Pressable key={i} onPress={() => setActiveDay(i)} style={[s.tab, activeDay === i && s.tabOn]}>
            <Text style={[s.tabTxt, activeDay === i && s.tabTxtOn]}>{x.days === 1 ? "日帰り" : (i + 1) + "日目"}</Text>
          </Pressable>
        ))}
      </View>

      <View style={s.dayHead}>
        <View style={s.dayNum}><Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>{activeDay + 1}</Text></View>
        <Text style={s.dayHeadTxt}>{x.days === 1 ? "日帰りプラン" : (activeDay + 1 === x.days ? "最終日" : (activeDay + 1) + "日目")}</Text>
      </View>

      <View style={s.timeline}>
        {x.dayEvents[activeDay].map((e, i) => (
          <View key={i} style={s.tlItem}>
            <View style={[s.tlDot, e[3] === "move" && s.tlDotMove, e[3] === "stay" && s.tlDotStay, e[3] === "food" && s.tlDotFood]} />
            <Text style={s.tlTime}>{e[0]}</Text>
            <View style={s.tlCard}>
              <View style={{ flex: 1 }}>
                <Text style={s.tlTitle}>{e[1]}</Text>
                <Text style={s.tlDesc}>{e[2]}</Text>
              </View>
              {e[4] > 0 && <Text style={s.tlCost}>{yen(e[4])}</Text>}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

//============ STYLES ============
const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#0a0b14" },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  backBtn: { position: "absolute", top: 8, left: 20, zIndex: 10, width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(20,22,40,.7)", alignItems: "center", justifyContent: "center" },
  backTxt: { color: "#f2f4ff", fontSize: 18 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  logo: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#7c5cff", alignItems: "center", justifyContent: "center" },
  brandTitle: { color: "#f2f4ff", fontSize: 18, fontWeight: "700" },
  brandSub: { color: "#8b91bd", fontSize: 11 },
  steps: { flexDirection: "row", gap: 6, marginBottom: 10 },
  stepDot: { flex: 1, height: 4, borderRadius: 99, backgroundColor: "#1f2340" },
  stepDotOn: { backgroundColor: "#7c5cff" },

  scroll: { flex: 1, paddingHorizontal: 20 },
  eyebrow: { color: "#3fe0c5", fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 },
  qtitle: { color: "#f2f4ff", fontSize: 23, fontWeight: "700", marginBottom: 4 },
  qhint: { color: "#8b91bd", fontSize: 13, marginBottom: 18, lineHeight: 19 },

  grid2: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 6, justifyContent: "space-between" },
  opt: { backgroundColor: "#171a2e", borderWidth: 1.5, borderColor: "rgba(255,255,255,.07)",
    borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  optSel: { borderColor: "#4d8bff", backgroundColor: "rgba(124,92,255,.15)" },
  optIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#1f2340", alignItems: "center", justifyContent: "center" },
  optIconSel: { backgroundColor: "#7c5cff" },
  optTitle: { color: "#f2f4ff", fontWeight: "600", fontSize: 14 },
  optDesc: { color: "#8b91bd", fontSize: 11, marginTop: 2 },
  optCheck: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#4d8bff", alignItems: "center", justifyContent: "center" },
  infoBtn: { alignItems: "center", paddingVertical: 6 },
  infoBtnTxt: { color: "#3fe0c5", fontSize: 11, fontWeight: "600" },

  stepperRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 18, marginTop: 6 },
  stepperBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#171a2e", borderWidth: 1, borderColor: "rgba(255,255,255,.1)",
    alignItems: "center", justifyContent: "center" },
  stepperBtnTxt: { color: "#f2f4ff", fontSize: 22, fontWeight: "700" },
  stepperCenter: { alignItems: "center", minWidth: 110 },
  stepperNum: { color: "#3fe0c5", fontSize: 34, fontWeight: "800" },
  stepperLabel: { color: "#8b91bd", fontSize: 12, marginTop: 2 },
  budgetInput: { color: "#f2f4ff", fontSize: 20, fontWeight: "700", backgroundColor: "#171a2e", borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,.1)", paddingVertical: 10, paddingHorizontal: 16, minWidth: 130, textAlign: "center" },

  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  priChip: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#171a2e", borderWidth: 1.5,
    borderColor: "rgba(255,255,255,.07)", borderRadius: 12, paddingVertical: 9, paddingHorizontal: 12, width: "47.5%" },
  priChipOn: { borderColor: "#4d8bff", backgroundColor: "rgba(124,92,255,.15)" },
  priChipIcon: { fontSize: 16 },
  priChipTxt: { color: "#f2f4ff", fontSize: 12.5, fontWeight: "600" },
  priChipTxtOn: { color: "#fff" },
  priChipDesc: { color: "#8b91bd", fontSize: 9.5, marginTop: 1 },
  priChipCheck: { color: "#4d8bff", fontWeight: "700", marginLeft: "auto" },

  noteInput: { color: "#f2f4ff", fontSize: 13, backgroundColor: "#171a2e", borderWidth: 1, borderColor: "rgba(255,255,255,.1)",
    borderRadius: 12, padding: 12, minHeight: 90, textAlignVertical: "top", lineHeight: 19 },

  budgetAmt: { color: "#3fe0c5", fontSize: 40, fontWeight: "800" },
  budgetPer: { color: "#8b91bd", fontSize: 12, marginTop: 2 },

  panel: { backgroundColor: "#171a2e", borderWidth: 1, borderColor: "rgba(255,255,255,.07)", borderRadius: 14, padding: 16, marginBottom: 14 },
  panelWarn: { borderColor: "rgba(255,203,107,.35)", backgroundColor: "rgba(255,203,107,.06)" },
  panelGood: { borderColor: "rgba(70,224,160,.3)", backgroundColor: "rgba(70,224,160,.05)" },
  panelTitle: { color: "#f2f4ff", fontSize: 14, fontWeight: "700", marginBottom: 8 },
  panelLi: { color: "#8b91bd", fontSize: 12.5, lineHeight: 20 },
  panelNote: { color: "#8b91bd", fontSize: 12, lineHeight: 19, marginTop: 8 },

  memberRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#171a2e",
    borderWidth: 1, borderColor: "rgba(255,255,255,.07)", borderRadius: 14, padding: 12, marginBottom: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  avatarTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
  nameInput: { color: "#f2f4ff", fontSize: 15, fontWeight: "600", padding: 0 },
  originRow: { marginTop: 6 },
  originLabel: { color: "#8b91bd", fontSize: 11, marginBottom: 4 },
  originChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { backgroundColor: "#1f2340", borderWidth: 1, borderColor: "rgba(255,255,255,.07)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  chipOn: { backgroundColor: "#4d8bff" },
  chipTxt: { color: "#8b91bd", fontSize: 11 },
  chipTxtOn: { color: "#fff", fontWeight: "600" },
  delBtn: { padding: 4 },
  delTxt: { color: "#5b6090", fontSize: 18 },
  addM: { borderWidth: 1.5, borderColor: "rgba(255,255,255,.12)", borderStyle: "dashed", borderRadius: 14, padding: 13, alignItems: "center" },
  addMTxt: { color: "#8b91bd", fontWeight: "600", fontSize: 14 },

  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20, padding: 40 },
  orbit: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#7c5cff" },
  loadingTitle: { color: "#f2f4ff", fontWeight: "700", fontSize: 16 },
  loadingSub: { color: "#8b91bd", fontSize: 13 },

  footerCta: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: 30,
    backgroundColor: "rgba(10,11,20,.95)" },
  btnPrimary: { backgroundColor: "#7c5cff", borderRadius: 16, padding: 17, alignItems: "center" },
  btnPrimaryTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },

  hero: { marginHorizontal: -20, marginTop: -8, padding: 22, backgroundColor: "#6a5cff" },
  heroDest: { color: "#fff", fontSize: 26, fontWeight: "800" },
  heroMeta: { color: "rgba(255,255,255,.9)", fontSize: 13, marginTop: 4 },
  pills: { flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap" },
  pill: { backgroundColor: "rgba(255,255,255,.16)", borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  pillTxt: { color: "#fff", fontSize: 12, fontWeight: "600" },

  statRow: { flexDirection: "row", gap: 10, marginVertical: 16 },
  scard: { flex: 1, borderWidth: 1, borderColor: "rgba(255,255,255,.07)", borderRadius: 14, padding: 13, backgroundColor: "#171a2e" },
  scardAlert: { borderColor: "rgba(255,107,138,.4)", backgroundColor: "rgba(255,107,138,.08)" },
  scardGood: { borderColor: "rgba(70,224,160,.35)", backgroundColor: "rgba(70,224,160,.07)" },
  scardV: { fontSize: 17, fontWeight: "800", color: "#f2f4ff" },
  txtAlert: { color: "#ff6b8a" },
  txtGood: { color: "#46e0a0" },
  scardL: { color: "#8b91bd", fontSize: 10.5, marginTop: 3, lineHeight: 14 },

  tabs: { flexDirection: "row", gap: 6, backgroundColor: "#171a2e", borderRadius: 12, padding: 5, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
  tabOn: { backgroundColor: "#1f2340" },
  tabTxt: { color: "#8b91bd", fontWeight: "600", fontSize: 12.5 },
  tabTxtOn: { color: "#f2f4ff" },

  dayHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  dayNum: { width: 24, height: 24, borderRadius: 8, backgroundColor: "#7c5cff", alignItems: "center", justifyContent: "center" },
  dayHeadTxt: { color: "#f2f4ff", fontWeight: "700", fontSize: 16 },

  timeline: { paddingLeft: 4 },
  tlItem: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 14 },
  tlDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: "#4d8bff", marginTop: 4 },
  tlDotMove: { borderColor: "#4d8bff" },
  tlDotStay: { borderColor: "#c79bff" },
  tlDotFood: { borderColor: "#3fe0c5" },
  tlTime: { color: "#3fe0c5", fontSize: 11, fontWeight: "700", width: 40 },
  tlCard: { flex: 1, flexDirection: "row", backgroundColor: "#171a2e", borderWidth: 1, borderColor: "rgba(255,255,255,.07)",
    borderRadius: 12, padding: 12, gap: 10 },
  tlTitle: { color: "#f2f4ff", fontWeight: "600", fontSize: 14 },
  tlDesc: { color: "#8b91bd", fontSize: 11.5, marginTop: 3, lineHeight: 16 },
  tlCost: { color: "#f2f4ff", fontWeight: "700", fontSize: 12.5, alignSelf: "center" },

  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,.6)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#171a2e", borderRadius: 18, padding: 20, width: "100%", maxWidth: 340, maxHeight: "80%" },
  modalTitle: { color: "#f2f4ff", fontSize: 20, fontWeight: "800", marginBottom: 8 },
  modalDesc: { color: "#8b91bd", fontSize: 12.5, lineHeight: 19, marginBottom: 12 },
  modalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  modalLabel: { color: "#5b6090", fontSize: 11.5 },
  modalVal: { color: "#f2f4ff", fontSize: 11.5, fontWeight: "600" },
  modalTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8, marginBottom: 10 },
  modalTag: { backgroundColor: "#1f2340", borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  modalTagTxt: { color: "#3fe0c5", fontSize: 10.5, fontWeight: "600" },
  modalSub: { color: "#f2f4ff", fontSize: 12.5, fontWeight: "700", marginTop: 6, marginBottom: 4 },
  modalSpot: { color: "#8b91bd", fontSize: 12, lineHeight: 20 },
  modalSelectBtn: { backgroundColor: "#7c5cff", borderRadius: 14, padding: 13, alignItems: "center", marginTop: 14 },
  modalClose: { color: "#5b6090", fontSize: 12.5, textAlign: "center", marginTop: 12 },
});

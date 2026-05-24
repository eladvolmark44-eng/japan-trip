import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update } from "firebase/database";

// ════════════════════════════════════════════════
// 🔥 FIREBASE CONFIG – החלף עם הנתונים שלך
// ════════════════════════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSyCRAFg_hm5vdIQPI9S1Qj_wAdsMIIyzxuc",
  authDomain: "japan-trip-a530c.firebaseapp.com",
  databaseURL: "https://japan-trip-a530c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "japan-trip-a530c",
  storageBucket: "japan-trip-a530c.firebasestorage.app",
  messagingSenderId: "277616419193",
  appId: "1:277616419193:web:eb39d46abc264fb5dd8fa8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ════════════════════════════════════════════════
// DATA DEFAULTS
// ════════════════════════════════════════════════
const DEFAULT_PARTS = [
  { id:0, label:"טוקיו", sub:"נחיתה ודיסני", dates:"8–13.9", accent:"#F4A261", accentDim:"rgba(244,162,97,0.18)",
    hotel:"טוקיו · 5 לילות · 08–13.09",
    days:[
      { date:"08.09", icon:"✈️", title:"נחיתה בנריטה", desc:"נחיתה 08:25. התאוששות מג׳ט-לג וסיבוב ערב ראשון בטוקיו." },
      { date:"09.09", icon:"🎡", title:"DisneySea", desc:"יום פארק דיסני-סי – יום חול, פחות עומס!", attrKey:"DisneySea" },
      { date:"10.09", icon:"🌊", title:"TeamLab Borderless + אקיהברה", desc:"מוזיאון אמנות דיגיטלית + אנימה.", attrKey:"TeamLab Borderless" },
      { date:"11.09", icon:"🌆", title:"שיבויה וסינג׳וקו", desc:"תצפית Shibuya Sky בשקיעה (17:00) + חנות One Piece.", attrKey:"Shibuya Sky" },
      { date:"12.09", icon:"⛩️", title:"הראג׳וקו ואסאקוסה", desc:"שבת – אווירה תוססת בשווקים." },
    ]},
  { id:1, label:"האקונה & האלפים", sub:"טבע ופוג׳י", dates:"13–16.9", accent:"#52B788", accentDim:"rgba(82,183,136,0.18)",
    hotel:"האקונה (13.09) · טאקיאמה (14.09) · קנאזאווה (15.09)",
    days:[
      { date:"13.09", icon:"🗻", title:"האקונה", desc:"נסיעה להאקונה, סיבוב ותצפית על פוג׳י.", attrKey:"הר פוג׳י – האקונה" },
      { date:"14.09", icon:"🚃", title:"האקונה → טאקיאמה", desc:"השלמות בהאקונה + נסיעה (4–5 שעות)." },
      { date:"15.09", icon:"🏘️", title:"טאקיאמה + שירקאווה-גו + קנאזאווה", desc:"כפר שירקאווה-גו וערב בקנאזאווה." },
    ]},
  { id:2, label:"קיוטו", sub:"לב התרבות", dates:"16–21.9", accent:"#C77DFF", accentDim:"rgba(199,125,255,0.18)",
    hotel:"קיוטו · 5 לילות · 16–21.09",
    days:[
      { date:"16.09", icon:"🚄", title:"הגעה לקיוטו", desc:"הגעה ברכבת מהירה והתמקמות." },
      { date:"17.09", icon:"🏯", title:"מזרח קיוטו", desc:"מקדש Kiyomizu-dera וסמטאות עתיקות." },
      { date:"18.09", icon:"🎋", title:"ארשיאמה + Gion", desc:"יער הבמבוק, פארק הקופים, Tenryu-ji. ערב: רובע Gion.", attrKey:"יער הבמבוק – ארשיאמה" },
      { date:"19.09", icon:"✨", title:"מקדש הזהב + Ryoan-ji", desc:"Kinkaku-ji המוזהב + גן האבנים.", attrKey:"מקדש הזהב – Kinkaku-ji" },
      { date:"20.09", icon:"⚠️", title:"יציאה לא אחרי 08:00! ציר דרומי", desc:"נינטנדו (Uji) ← Fushimi Inari ← נארה.", attrKey:"מוזיאון נינטנדו" },
    ]},
  { id:3, label:"אוסקה", sub:"חגיגות בר מצווה", dates:"21–25.9", accent:"#FFB703", accentDim:"rgba(255,183,3,0.18)",
    hotel:"אוסקה · 4 לילות · 21–25.09",
    days:[
      { date:"21.09", icon:"🏯", title:"אוסקה – יום הגעה", desc:"טירת אוסקה ורובע דוטונבורי." },
      { date:"22.09", icon:"🎢", title:"USJ יום א׳", desc:"יום ראשון ביוניברסל סטודיו.", attrKey:"Universal Studios – Nintendo World" },
      { date:"23.09", icon:"🎉", title:"יום השיא – בר מצווה!", desc:"Nintendo World + מופע One Piece (VIP!).", attrKey:"Universal Studios – Nintendo World" },
      { date:"24.09", icon:"🐠", title:"אקווריום + Jojo World", desc:"אקווריום אוסקה ו-Jojo World." },
      { date:"25.09", icon:"🛍️", title:"קניות + שינקנסן", desc:"Tokyu Hands → שינקנסן לטוקיו." },
    ]},
  { id:4, label:"טוקיו & טיסה", sub:"סגירת מעגל", dates:"25–29.9", accent:"#90E0EF", accentDim:"rgba(144,224,239,0.18)",
    hotel:"טוקיו (3 לילות) · נריטה (28.09)",
    days:[
      { date:"25.09", icon:"🚄", title:"חזרה לטוקיו", desc:"הגעה בשינקנסן." },
      { date:"26–27.09", icon:"🌊", title:"TeamLab Planets + קניות", desc:"TeamLab Planets וקניות אחרונות." },
      { date:"28.09", icon:"🏨", title:"נריטה", desc:"יום רגוע + מעבר למלון." },
      { date:"29.09", icon:"✈️", title:"המראה 04:55", desc:"המראה מנריטה – שיהיה בהצלחה!" },
    ]},
];

const DEFAULT_CHECKLIST = [
  { id:"c1", cat:"🎟️ כרטיסים", text:"יוני 2026 – הגרלת מוזיאון נינטנדו (20.09)", urgent:true, done:false },
  { id:"c2", cat:"🎟️ כרטיסים", text:"10 ביולי – TeamLab Borderless (10.09)", urgent:true, done:false },
  { id:"c3", cat:"🎟️ כרטיסים", text:"21 אוגוסט – Shibuya Sky (11.09, שעה 17:00)", urgent:false, done:false },
  { id:"c4", cat:"🎟️ כרטיסים", text:"One Piece Premier Show – VIP מראש!", urgent:true, done:false },
  { id:"c5", cat:"🎟️ כרטיסים", text:"DisneySea – הזמנה מראש", urgent:false, done:false },
  { id:"c6", cat:"🎟️ כרטיסים", text:"USJ – Express Pass + Nintendo World", urgent:false, done:false },
  { id:"c7", cat:"🏨 מלונות", text:"לבחור מלון סופי לכל עיר עד 28.08.2026", urgent:true, done:false },
  { id:"c8", cat:"🧳 לוגיסטיקה", text:"טיסות – לאשר ולהזמין", urgent:false, done:false },
  { id:"c9", cat:"🧳 לוגיסטיקה", text:"ביטוח נסיעות", urgent:false, done:false },
  { id:"c10", cat:"🧳 לוגיסטיקה", text:"IC Card (Suica/Pasmo)", urgent:false, done:false },
  { id:"c11", cat:"🧳 לוגיסטיקה", text:"JR Pass – שווי גבוה לטיול זה", urgent:false, done:false },
  { id:"c12", cat:"🧳 לוגיסטיקה", text:"מסעדות מיוחדות – הזמנה חודשים מראש", urgent:false, done:false },
];

const ATTRACTIONS = [
  { name:"DisneySea", loc:"טוקיו", emoji:"🎡", day:"09.09", tags:["ילדים","חובה"], color:"#E63946",
    mapsUrl:"https://www.google.com/maps/search/Tokyo+DisneySea/@35.6267,139.8851,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+Tokyo+DisneySea",
    description:"פארק דיסני ייחודי ליפן עם 7 נמלים תיימטיים. שונה לגמרי מדיסנילנד הרגיל.",
    highlights:["20 אטרקציות ייחודיות שלא קיימות בשום מקום אחר","Journey to the Center of the Earth – מהמרתקות ביפן","אוכל יפני-איטלקי-אמריקאי מדהים"],
    tips:["להזמין מראש – לא ניתן לקנות בשער","Lightning Lane לאטרקציות הפופולריות","ביום חול ספטמבר – עומס נמוך"],
    hours:"08:00–21:00", price:"¥9,400 / ¥5,300 ילד", bestTime:"יום חול, 09.09", howToGet:"קו Keiyō, תחנת Maihama (15 דק׳)",
    nearbyFood:["Ikspiari – מסעדות בכניסה לפארק","Maihama Restaurant Street","Club Disney – בתוך הפארק"] },
  { name:"TeamLab Borderless", loc:"טוקיו", emoji:"🌊", day:"10.09", tags:["אמנות","חוויה"], color:"#0077B6",
    mapsUrl:"https://www.google.com/maps/search/teamLab+Borderless+Tokyo+Azabudai/@35.6562,139.7395,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+Azabudai+Hills+Tokyo",
    description:"מוזיאון אמנות דיגיטלית אימרסיבי – 50+ חדרים ללא גבולות של אור ואמנות.",
    highlights:["50+ יצירות אינטראקטיביות","Crystal World – מיליון נורות LED","אפשר לבלות שעות"],
    tips:["לבוש כהה לצילומים מרשימים","להגיע בפתיחה","כרטיסים נפתחים 10 ביולי!"],
    hours:"10:00–22:00", price:"¥3,200 / ¥1,000 ילד", bestTime:"בוקר מוקדם", howToGet:"תחנת Azabudai Hills",
    nearbyFood:["Azabudai Hills – מסעדות בוטיק","Roppongi Hills – 10 דק׳","Toriton Sushi"] },
  { name:"Shibuya Sky", loc:"טוקיו", emoji:"🌆", day:"11.09", tags:["תצפית","כרטיס מראש"], color:"#F4A261",
    mapsUrl:"https://www.google.com/maps/search/Shibuya+Sky+Observation+Deck/@35.6581,139.7021,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+Shibuya+Scramble+Square",
    description:"תצפית 360° על טוקיו מגג Scramble Square. פוג׳י נראה בימים בהירים.",
    highlights:["נוף עוצר נשימה בשקיעה","תצפית ישירה על הצומת המפורסם","דק פתוח באוויר"],
    tips:["להזמין לשעה 17:00","21 אוגוסט – נפתחות הזמנות","לבוא 15 דק׳ מוקדם"],
    hours:"10:00–23:00", price:"¥2,000 / ¥1,200 ילד", bestTime:"17:00 שקיעה", howToGet:"תחנת Shibuya",
    nearbyFood:["Scramble Square B2 – פוד קורט","Shibuya Hikarie – מסעדות","Genki Sushi – על מסועים"] },
  { name:"יער הבמבוק – ארשיאמה", loc:"קיוטו", emoji:"🎋", day:"18.09", tags:["טבע","חינם"], color:"#52B788",
    mapsUrl:"https://www.google.com/maps/search/Arashiyama+Bamboo+Grove/@35.0168,135.6717,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+arashiyama+kyoto",
    description:"שביל 400 מטר בין עצי במבוק ענקיים. פארק קופים, מקדש Tenryu-ji, גשר Togetsukyo.",
    highlights:["יער הבמבוק – חינם 24/7","פארק קופים – 170 קופים חופשיים","מקדש Tenryu-ji – גן זן"],
    tips:["לצאת לפני 08:00","ערב: רובע Gion","לאכול Yudofu – טופו מסורתי"],
    hours:"כל שעות / 09:00–17:00 מקדש", price:"חינם / ¥500 מקדש", bestTime:"07:30–09:00", howToGet:"JR Sagano לתחנת Saga-Arashiyama",
    nearbyFood:["Shigetsu – אוכל זן במקדש","Yoshida-ya – Yudofu 200 שנה","Nishiki Market"] },
  { name:"Fushimi Inari", loc:"קיוטו", emoji:"⛩️", day:"20.09", tags:["מקדש","חינם"], color:"#E63946",
    mapsUrl:"https://www.google.com/maps/search/Fushimi+Inari+Taisha/@34.9671,135.7727,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+fushimi+inari+kyoto",
    description:"10,000 שערי טוריי כתומים עד פסגת הר אינארי. אחד האתרים הפופולריים ביפן.",
    highlights:["טיפוס לפסגה – 2–3 שעות","תצפית נהדרת בחצי הדרך","צילום אייקוני"],
    tips:["לצאת ב-07:00","JR Inari ממש בכניסה","בגדים רגילים מספיק"],
    hours:"24/7", price:"חינם", bestTime:"07:00–09:00", howToGet:"JR Nara Line, תחנת Inari",
    nearbyFood:["Inari Sando – רחוב אוכל","Fushimi Sake District – סאקה","Tofuku-ji – שוק מקומי"] },
  { name:"מקדש הזהב – Kinkaku-ji", loc:"קיוטו", emoji:"✨", day:"19.09", tags:["מקדש","אייקוני"], color:"#FFB703",
    mapsUrl:"https://www.google.com/maps/search/Kinkakuji/@35.0394,135.7292,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+kinkakuji+kyoto",
    description:"מקדש בודהיסטי מצופה זהב טהור, משתקף בבריכה. סמל יפן.",
    highlights:["גן מרהיב סביב המקדש","בחורף עם שלג – נוף מושלם","Ryoan-ji – 15 דק׳ הליכה"],
    tips:["ביקור שעה-שעתיים","להגיע ב-09:00","לשלב עם Ryoan-ji"],
    hours:"09:00–17:00", price:"¥500", bestTime:"09:00 פתיחה", howToGet:"אוטובוס 101/205 מקיוטו",
    nearbyFood:["Ippudo Ramen","Nishiki Market","Sarasa Nishijin – קפה עתיק"] },
  { name:"נארה – צבאים חופשיים", loc:"נארה", emoji:"🦌", day:"20.09", tags:["ילדים","חינם"], color:"#52B788",
    mapsUrl:"https://www.google.com/maps/search/Nara+Park/@34.6851,135.8048,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+nara+park",
    description:"1,200 צבאים חופשיים ברחובות. מקדש Todai-ji עם פסל בודהה 15 מ׳.",
    highlights:["צבאים חופשיים בין האנשים","Todai-ji – בניין עץ הגדול בעולם","Kasuga Taisha – 3,000 פנסים"],
    tips:["Shika Senbei ¥200 להאכלה","הצבאים אגרסיביים בחמידות","להביא כובעים ומים"],
    hours:"פארק 24/7 | מקדש 07:30–17:30", price:"חינם / ¥600 מקדש", bestTime:"בוקר מוקדם", howToGet:"JR Nara Line מקיוטו – 45 דק׳",
    nearbyFood:["Kakinoha Sushi – סושי בעלה","Naramachi – שכונת אוכל עתיקה","Mellow Cafe"] },
  { name:"מוזיאון נינטנדו", loc:"Uji, קיוטו", emoji:"🎮", day:"20.09", tags:["ילדים","הגרלה"], color:"#E63946",
    mapsUrl:"https://www.google.com/maps/search/Nintendo+Museum+Uji/@34.9308,135.7953,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+nintendo+museum+uji",
    description:"המוזיאון הרשמי של נינטנדו. כל קונסולה מ-1889, משחקים ענקיים אינטראקטיביים.",
    highlights:["Mario ו-Zelda בגרסאות ענק","כל קונסולה שיצאה אי פעם","קפה בעיצוב נינטנדו"],
    tips:["הגרלה חובה – יוני 2026!","פתוח 10:00–18:00, סגור ג׳","5 דק׳ מתחנת Kintetsu Ogura"],
    hours:"10:00–18:00 (סגור ג׳)", price:"¥3,300 / ¥1,100 ילד", bestTime:"אחה״צ", howToGet:"Kintetsu Kyoto Line לתחנת Ogura",
    nearbyFood:["Uji – מנות מאצ׳ה בכל מסעדה","Tsuen Tea – בית תה מ-1160","Byodoin Omotesando"] },
  { name:"Universal Studios – Nintendo World", loc:"אוסקה", emoji:"🍄", day:"22–23.09", tags:["ילדים","חובה"], color:"#C77DFF",
    mapsUrl:"https://www.google.com/maps/search/Universal+Studios+Japan/@34.6654,135.4323,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+universal+studios+japan",
    description:"USJ עם Nintendo World – Mario Kart AR, Donkey Kong, Harry Potter ועוד.",
    highlights:["Nintendo World – Mario Kart AR","Harry Potter – Hogsmeade","Hollywood Dream – רכבת הרים"],
    tips:["Express Pass – חובה!","Nintendo World – Timed Entry נפרד","להגיע בפתיחה ישר לנינטנדו"],
    hours:"09:00–21:00", price:"¥10,400 + Express Pass", bestTime:"פתיחה – נינטנדו ראשון", howToGet:"JR Yumesaki Line לתחנת Universal City",
    nearbyFood:["Butterbeer + Mario food בפארק","CityWalk Osaka בכניסה","Osaka Namba – 20 דק׳"] },
  { name:"הר פוג׳י – האקונה", loc:"האקונה", emoji:"🗻", day:"13.09", tags:["טבע","אייקוני"], color:"#90E0EF",
    mapsUrl:"https://www.google.com/maps/search/Hakone+Owakudani/@35.2323,139.0231,14z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+hakone+japan",
    description:"עיירת ריזורט עם נוף פוג׳י, אגמים וולקניים, רכבל ואונסן.",
    highlights:["Owakudani – עמק וולקני","אגם Ashi – שייט עם נוף","Hakone Open Air Museum"],
    tips:["בוקר מוקדם לפני עננים","Hakone Free Pass – לכל התחבורה","אונסן בערב – חובה"],
    hours:"משתנה", price:"Hakone Free Pass ¥4,000", bestTime:"בוקר מוקדם", howToGet:"Romancecar מ-Shinjuku (85 דק׳)",
    nearbyFood:["Hakone Bakery בתחנה","Amazake Chaya – בית תה מ-1700","Gyoza Center Hakone"] },
];

// ════════════════════════════════════════════════
// ATTRACTION MODAL
// ════════════════════════════════════════════════
function AttractionModal({ attr, onClose }) {
  const hexToRgb = h => { const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16); return `${r},${g},${b}`; };
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%",maxWidth:680,maxHeight:"91vh",overflowY:"auto",background:"#1C1610",borderRadius:"28px 28px 0 0",border:"1px solid rgba(255,255,255,0.08)",animation:"slideUp 0.3s cubic-bezier(0.34,1.2,0.64,1)" }}>
        <div style={{ height:180,background:`linear-gradient(160deg,${attr.color}44 0%,#1C1610 100%)`,borderRadius:"28px 28px 0 0",display:"flex",alignItems:"center",justifyContent:"center",position:"relative" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:60 }}>{attr.emoji}</div>
            <div style={{ fontSize:22,fontWeight:800,fontFamily:"'Playfair Display',serif",marginTop:8 }}>{attr.name}</div>
            <div style={{ fontSize:12,color:"rgba(255,255,255,0.45)",marginTop:4 }}>📍 {attr.loc} · {attr.day}</div>
          </div>
          <button onClick={onClose} style={{ position:"absolute",top:14,left:14,width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ padding:"16px 20px 44px",fontFamily:"'Heebo',sans-serif" }}>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:14 }}>
            {attr.tags.map(t=><span key={t} style={{ fontSize:12,padding:"3px 10px",borderRadius:100,background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.55)",border:"1px solid rgba(255,255,255,0.08)" }}>{t}</span>)}
          </div>
          <p style={{ fontSize:14,color:"rgba(255,255,255,0.72)",lineHeight:1.8,marginBottom:14 }}>{attr.description}</p>
          <InfoBlock title="✦ למה כדאי" color={attr.color}>
            {attr.highlights.map((h,i)=><InfoRow key={i} icon="★" text={h} color={attr.color}/>)}
          </InfoBlock>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,margin:"12px 0" }}>
            {[["🕐","שעות",attr.hours],["🎫","כניסה",attr.price],["⭐","הזמן הטוב",attr.bestTime],["🚃","הגעה",attr.howToGet]].map(([ic,lb,vl])=>(
              <div key={lb} style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"10px 12px" }}>
                <div style={{ fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:3 }}>{ic} {lb}</div>
                <div style={{ fontSize:12,color:"rgba(255,255,255,0.7)",lineHeight:1.5 }}>{vl}</div>
              </div>
            ))}
          </div>
          <InfoBlock title="💡 טיפים" color="#52B788">
            {attr.tips.map((t,i)=><InfoRow key={i} icon="→" text={t} color="#52B788"/>)}
          </InfoBlock>
          <InfoBlock title="🍜 אוכל באיזור" color="#F4A261">
            {attr.nearbyFood.map((f,i)=><InfoRow key={i} icon="🥢" text={f}/>)}
          </InfoBlock>
          <div style={{ marginTop:14,display:"flex",flexDirection:"column",gap:8 }}>
            <a href={attr.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display:"block",padding:"12px",background:"rgba(66,133,244,0.12)",border:"1px solid rgba(66,133,244,0.28)",borderRadius:14,color:"#74b3ff",fontSize:14,textDecoration:"none",textAlign:"center" }}>📍 מיקום ב-Google Maps</a>
            <a href={attr.mapsNearby} target="_blank" rel="noopener noreferrer" style={{ display:"block",padding:"12px",background:`rgba(${hexToRgb(attr.color)},0.1)`,border:`1px solid rgba(${hexToRgb(attr.color)},0.25)`,borderRadius:14,color:attr.color,fontSize:14,textDecoration:"none",textAlign:"center" }}>🍜 מסעדות ואוכל באיזור</a>
          </div>
        </div>
      </div>
    </div>
  );
}
function InfoBlock({ title, color, children }) {
  return <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"12px 14px",marginBottom:10 }}><div style={{ fontSize:12,fontWeight:700,color,marginBottom:8 }}>{title}</div><div style={{ display:"flex",flexDirection:"column",gap:6 }}>{children}</div></div>;
}
function InfoRow({ icon, text, color }) {
  return <div style={{ display:"flex",gap:8,alignItems:"flex-start" }}><span style={{ color:color||"rgba(255,255,255,0.3)",fontSize:11,flexShrink:0,marginTop:2 }}>{icon}</span><span style={{ fontSize:13,color:"rgba(255,255,255,0.68)",lineHeight:1.6 }}>{text}</span></div>;
}

// ════════════════════════════════════════════════
// EDIT MODALS
// ════════════════════════════════════════════════
function EditDayModal({ partId, dayIdx, day, onSave, onClose }) {
  const [title, setTitle] = useState(day.title);
  const [desc, setDesc] = useState(day.desc);
  const [icon, setIcon] = useState(day.icon);
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#1a1410",borderRadius:20,padding:24,width:"100%",maxWidth:420,border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'Heebo',sans-serif" }}>
        <div style={{ fontSize:18,fontWeight:700,marginBottom:20,color:"#F4E4A6" }}>✏️ עריכת יום</div>
        <label style={{ fontSize:12,color:"rgba(255,255,255,0.4)",display:"block",marginBottom:4 }}>אייקון</label>
        <input value={icon} onChange={e=>setIcon(e.target.value)} style={{ width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"8px 12px",color:"#fff",fontSize:20,marginBottom:14,outline:"none",textAlign:"right" }}/>
        <label style={{ fontSize:12,color:"rgba(255,255,255,0.4)",display:"block",marginBottom:4 }}>כותרת</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} style={{ width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"10px 12px",color:"#fff",fontSize:14,marginBottom:14,outline:"none",textAlign:"right" }}/>
        <label style={{ fontSize:12,color:"rgba(255,255,255,0.4)",display:"block",marginBottom:4 }}>תיאור</label>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} style={{ width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"10px 12px",color:"#fff",fontSize:13,marginBottom:20,outline:"none",resize:"vertical",textAlign:"right",fontFamily:"'Heebo',sans-serif" }}/>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>onSave({...day,title,desc,icon})} style={{ flex:1,padding:"12px",background:"#D4A017",border:"none",borderRadius:12,color:"#000",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif" }}>שמור</button>
          <button onClick={onClose} style={{ flex:1,padding:"12px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"rgba(255,255,255,0.6)",fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif" }}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

function EditCheckModal({ item, onSave, onClose }) {
  const [text, setText] = useState(item.text);
  const [urgent, setUrgent] = useState(item.urgent);
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#1a1410",borderRadius:20,padding:24,width:"100%",maxWidth:420,border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'Heebo',sans-serif" }}>
        <div style={{ fontSize:18,fontWeight:700,marginBottom:20,color:"#F4E4A6" }}>✏️ עריכת משימה</div>
        <label style={{ fontSize:12,color:"rgba(255,255,255,0.4)",display:"block",marginBottom:4 }}>טקסט</label>
        <input value={text} onChange={e=>setText(e.target.value)} style={{ width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"10px 12px",color:"#fff",fontSize:14,marginBottom:14,outline:"none",textAlign:"right" }}/>
        <label style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:20,color:"rgba(255,255,255,0.7)",fontSize:14 }}>
          <input type="checkbox" checked={urgent} onChange={e=>setUrgent(e.target.checked)} style={{ width:18,height:18 }}/>
          סמן כדחוף
        </label>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>onSave({...item,text,urgent})} style={{ flex:1,padding:"12px",background:"#D4A017",border:"none",borderRadius:12,color:"#000",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif" }}>שמור</button>
          <button onClick={onClose} style={{ flex:1,padding:"12px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"rgba(255,255,255,0.6)",fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif" }}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

function AddNoteModal({ partId, dayIdx, note, onSave, onClose }) {
  const [text, setText] = useState(note||"");
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#1a1410",borderRadius:20,padding:24,width:"100%",maxWidth:420,border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'Heebo',sans-serif" }}>
        <div style={{ fontSize:18,fontWeight:700,marginBottom:16,color:"#F4E4A6" }}>📝 הערה ליום</div>
        <textarea value={text} onChange={e=>setText(e.target.value)} rows={4} placeholder="כתוב הערה לכל המשפחה..." style={{ width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"10px 12px",color:"#fff",fontSize:14,marginBottom:16,outline:"none",resize:"vertical",textAlign:"right",fontFamily:"'Heebo',sans-serif" }}/>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>onSave(text)} style={{ flex:1,padding:"12px",background:"#D4A017",border:"none",borderRadius:12,color:"#000",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif" }}>שמור</button>
          <button onClick={onClose} style={{ flex:1,padding:"12px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"rgba(255,255,255,0.6)",fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif" }}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════
export default function JapanTrip() {
  const [tab, setTab] = useState("itinerary");
  const [openPart, setOpenPart] = useState(null);
  const [parts, setParts] = useState(DEFAULT_PARTS);
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [notes, setNotes] = useState({});
  const [editDay, setEditDay] = useState(null);
  const [editCheck, setEditCheck] = useState(null);
  const [addNote, setAddNote] = useState(null);
  const [selectedAttr, setSelectedAttr] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Firebase listeners
  useEffect(()=>{
    const unsubParts = onValue(ref(db,"parts"), snap=>{
      if(snap.exists()) setParts(snap.val());
    });
    const unsubChecklist = onValue(ref(db,"checklist"), snap=>{
      if(snap.exists()) setChecklist(Object.values(snap.val()));
    });
    const unsubNotes = onValue(ref(db,"notes"), snap=>{
      if(snap.exists()) setNotes(snap.val());
    });
    return ()=>{ unsubParts(); unsubChecklist(); unsubNotes(); };
  },[]);

  // Init Firebase with defaults if empty
  useEffect(()=>{
    onValue(ref(db,"initialized"), snap=>{
      if(!snap.exists()){
        set(ref(db,"parts"), DEFAULT_PARTS);
        set(ref(db,"checklist"), Object.fromEntries(DEFAULT_CHECKLIST.map(i=>[i.id,i])));
        set(ref(db,"notes"), {});
        set(ref(db,"initialized"), true);
      }
    }, { onlyOnce:true });
  },[]);

  async function saveDay(partId, dayIdx, updatedDay) {
    setSyncing(true);
    const newParts = parts.map((p,pi)=> pi===partId ? {...p, days: p.days.map((d,di)=> di===dayIdx ? updatedDay : d)} : p);
    await set(ref(db,"parts"), newParts);
    setSyncing(false);
    setEditDay(null);
  }

  async function saveNote(partId, dayIdx, text) {
    setSyncing(true);
    const key = `${partId}_${dayIdx}`;
    await update(ref(db,"notes"), { [key]: text });
    setSyncing(false);
    setAddNote(null);
  }

  async function toggleCheck(id) {
    const item = checklist.find(i=>i.id===id);
    if(!item) return;
    setSyncing(true);
    await update(ref(db,`checklist/${id}`), { done: !item.done });
    setSyncing(false);
  }

  async function saveCheckItem(updated) {
    setSyncing(true);
    await update(ref(db,`checklist/${updated.id}`), updated);
    setSyncing(false);
    setEditCheck(null);
  }

  async function addCheckItem() {
    const id = `c${Date.now()}`;
    const item = { id, cat:"🧳 לוגיסטיקה", text:"משימה חדשה", urgent:false, done:false };
    setSyncing(true);
    await update(ref(db,"checklist"), { [id]: item });
    setSyncing(false);
    setEditCheck(item);
  }

  const done = checklist.filter(i=>i.done).length;
  const cats = [...new Set(checklist.map(i=>i.cat))];

  return (
    <div dir="rtl" style={{ minHeight:"100vh", color:"#fff", fontFamily:"'Heebo',sans-serif", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;700;900&family=Playfair+Display:wght@700;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .fade-up{animation:fadeUp 0.5s ease both}
        .part-card{border-radius:18px;overflow:hidden;cursor:pointer;border:1px solid rgba(255,255,255,0.1);transition:transform .25s,box-shadow .25s}
        .part-card:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(0,0,0,0.5)}
        .day-row{display:flex;gap:12px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,0.07);align-items:flex-start}
        .day-row:last-child{border-bottom:none}
        .day-clickable{cursor:pointer;transition:background .15s;border-radius:8px}
        .day-clickable:hover{background:rgba(255,255,255,0.04)}
        .check-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);transition:background .15s}
        .check-row:hover{background:rgba(255,255,255,0.04)}
        .check-row:last-child{border-bottom:none}
        .tab-btn{padding:9px 18px;border:none;cursor:pointer;border-radius:100px;font-family:'Heebo',sans-serif;font-size:14px;font-weight:600;transition:all .2s}
        .gold{background:linear-gradient(135deg,#F4E4A6,#D4A017,#F4E4A6);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite}
        .urgent{background:rgba(220,50,50,0.18);color:#ff8080;border:1px solid rgba(220,50,50,0.3);padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700;animation:pulse 2s ease infinite}
        .edit-btn{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.5);padding:3px 10px;border-radius:8px;font-size:11px;cursor:pointer;font-family:'Heebo',sans-serif;transition:all .15s;white-space:nowrap}
        .edit-btn:hover{background:rgba(255,255,255,0.13);color:#fff}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:4px}
        input,textarea{font-family:'Heebo',sans-serif}
      `}</style>

      {/* BACKGROUND */}
      <div style={{ position:"fixed", inset:0, zIndex:0 }}>
        <img key={tab}
          src={tab==="itinerary"
            ? "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1200&q=70"
            : "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=70"}
          alt="" style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.35) saturate(1.1)" }}
        />
        <div style={{ position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(6,3,2,0.5) 0%,rgba(4,2,8,0.5) 100%)" }}/>
      </div>

      {/* HERO */}
      <div style={{ position:"relative",zIndex:1,height:310,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",padding:"0 24px",gap:10 }}>
        <div className="fade-up" style={{ fontSize:11,letterSpacing:5,color:"#D4A017",textTransform:"uppercase",fontWeight:400 }}>✦ ספטמבר 2026 ✦</div>
        <h1 className="gold fade-up" style={{ fontSize:"clamp(58px,14vw,96px)",fontFamily:"'Playfair Display',serif",fontWeight:900,lineHeight:0.95,animationDelay:"0.1s",textShadow:"0 4px 40px rgba(0,0,0,0.8)" }}>יפן</h1>
        <div className="fade-up" style={{ fontSize:14,color:"rgba(255,255,255,0.6)",fontWeight:300,animationDelay:"0.2s" }}>טיול משפחת Jimenez · 8.9 – 29.9.2026</div>
        <div className="fade-up" style={{ display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",animationDelay:"0.3s" }}>
          {["21 ימים","5 ערים","🎉 בר מצווה"].map(t=><span key={t} style={{ padding:"4px 13px",borderRadius:100,border:"1px solid rgba(212,160,23,0.4)",color:"#F4E4A6",fontSize:12,background:"rgba(0,0,0,0.3)",backdropFilter:"blur(4px)" }}>{t}</span>)}
        </div>
      </div>

      {/* TABS */}
      <div style={{ position:"sticky",top:0,zIndex:100,padding:"8px 16px",display:"flex",justifyContent:"center",alignItems:"center",gap:6,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        {[{id:"itinerary",label:"📅 לוז"},{id:"checklist",label:`✅ משימות ${done}/${checklist.length}`}].map(t=>(
          <button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)} style={{ background:tab===t.id?"rgba(212,160,23,0.2)":"rgba(255,255,255,0.05)",color:tab===t.id?"#F4E4A6":"rgba(255,255,255,0.5)",border:tab===t.id?"1px solid rgba(212,160,23,0.4)":"1px solid rgba(255,255,255,0.1)" }}>{t.label}</button>
        ))}
        <button onClick={()=>setEditMode(!editMode)} style={{ padding:"8px 14px",border:`1px solid ${editMode?"#D4A017":"rgba(255,255,255,0.15)"}`,background:editMode?"rgba(212,160,23,0.2)":"transparent",color:editMode?"#F4E4A6":"rgba(255,255,255,0.4)",borderRadius:100,fontSize:13,cursor:"pointer",fontFamily:"'Heebo',sans-serif",transition:"all .2s" }}>
          {editMode ? "✓ סיום עריכה" : "✏️ עריכה"}
        </button>
        {syncing && <span style={{ fontSize:11,color:"#F4E4A6",animation:"pulse 1s infinite" }}>שומר…</span>}
      </div>

      <div style={{ position:"relative",zIndex:1,maxWidth:760,margin:"0 auto",padding:"20px 14px 80px" }}>

        {/* ITINERARY */}
        {tab==="itinerary" && (
          <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
            {parts.map((part,pi)=>{
              const isOpen = openPart===pi;
              return (
                <div key={pi} className="part-card fade-up" style={{ animationDelay:`${pi*0.05}s`,background:"rgba(0,0,0,0.58)",backdropFilter:"blur(16px)" }}>
                  <div onClick={()=>setOpenPart(isOpen?null:pi)}
                    style={{ padding:"15px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:isOpen?"1px solid rgba(255,255,255,0.07)":"none",background:`linear-gradient(90deg,${part.accentDim},transparent)` }}>
                    <div>
                      <div style={{ fontSize:10,letterSpacing:3,color:part.accent,textTransform:"uppercase",marginBottom:2,opacity:0.8 }}>{part.dates}</div>
                      <div style={{ fontSize:20,fontWeight:900,fontFamily:"'Playfair Display',serif" }}>{part.label}</div>
                      <div style={{ fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:1 }}>{part.sub}</div>
                    </div>
                    <div style={{ width:30,height:30,borderRadius:"50%",border:`1px solid ${part.accent}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:part.accent,transition:"transform 0.3s",transform:isOpen?"rotate(180deg)":"none",background:part.accentDim,flexShrink:0 }}>▾</div>
                  </div>

                  {isOpen && (
                    <div style={{ padding:"4px 16px 14px" }}>
                      {part.days.map((day,di)=>{
                        const attr = day.attrKey ? ATTRACTIONS.find(a=>a.name===day.attrKey) : null;
                        const noteKey = `${pi}_${di}`;
                        const note = notes[noteKey];
                        return (
                          <div key={di} className="day-row">
                            <div style={{ flexShrink:0,width:40,textAlign:"center",paddingTop:2 }}>
                              <div style={{ fontSize:18 }}>{day.icon}</div>
                              <div style={{ fontSize:9,color:"rgba(255,255,255,0.28)",marginTop:2 }}>{day.date}</div>
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontWeight:700,fontSize:14,color:"#fff",marginBottom:2,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
                                <span className={attr?"day-clickable":""} onClick={attr?(e)=>{e.stopPropagation();setSelectedAttr(attr);}:undefined} style={{ cursor:attr?"pointer":"default" }}>
                                  {day.title}
                                </span>
                                {attr && <span style={{ fontSize:10,color:part.accent,border:`1px solid ${part.accent}55`,borderRadius:100,padding:"1px 7px",background:part.accentDim,cursor:"pointer" }} onClick={(e)=>{e.stopPropagation();setSelectedAttr(attr);}}>פרטים ↗</span>}
                                {editMode && <button className="edit-btn" onClick={(e)=>{e.stopPropagation();setEditDay({partId:pi,dayIdx:di,day});}}>✏️</button>}
                              </div>
                              <div style={{ fontSize:12,color:"rgba(255,255,255,0.45)",lineHeight:1.55 }}>{day.desc}</div>
                              {note && <div style={{ marginTop:6,fontSize:12,color:"#F4E4A6",background:"rgba(212,160,23,0.08)",border:"1px solid rgba(212,160,23,0.2)",borderRadius:8,padding:"6px 10px" }}>📝 {note}</div>}
                              {editMode && <button className="edit-btn" style={{ marginTop:6 }} onClick={(e)=>{e.stopPropagation();setAddNote({partId:pi,dayIdx:di,note:notes[noteKey]||""});}}>📝 {note?"ערוך":"הוסף"} הערה</button>}
                            </div>
                          </div>
                        );
                      })}
                      <div style={{ marginTop:10,padding:"9px 13px",background:"rgba(255,255,255,0.05)",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",display:"flex",gap:8,alignItems:"center" }}>
                        <span style={{ fontSize:14 }}>🏨</span>
                        <span style={{ fontSize:12,color:"rgba(255,255,255,0.5)",flex:1 }}>{part.hotel}</span>
                        <span style={{ fontSize:11,color:"#52B788",fontWeight:700 }}>סגור ✓</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CHECKLIST */}
        {tab==="checklist" && (
          <div className="fade-up">
            <div style={{ background:"rgba(0,0,0,0.58)",backdropFilter:"blur(16px)",border:"1px solid rgba(212,160,23,0.2)",borderRadius:18,padding:"18px",marginBottom:18 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                <span style={{ fontWeight:700,fontSize:16 }}>התקדמות</span>
                <span className="gold" style={{ fontSize:24,fontWeight:900,fontFamily:"'Playfair Display',serif" }}>{done}/{checklist.length}</span>
              </div>
              <div style={{ height:4,background:"rgba(255,255,255,0.08)",borderRadius:4,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${checklist.length?done/checklist.length*100:0}%`,background:"linear-gradient(90deg,#F4E4A6,#D4A017)",borderRadius:4,transition:"width 0.5s ease" }}/>
              </div>
              <div style={{ marginTop:7,fontSize:12,color:"rgba(255,255,255,0.3)" }}>{done===checklist.length?"🎉 הכל מוכן לטיסה!":`נשארו ${checklist.length-done} משימות`}</div>
            </div>

            {cats.map(cat=>(
              <div key={cat} style={{ marginBottom:14 }}>
                <div style={{ fontSize:11,letterSpacing:2,color:"rgba(255,255,255,0.28)",marginBottom:6,textTransform:"uppercase",paddingRight:2 }}>{cat}</div>
                <div style={{ background:"rgba(0,0,0,0.58)",backdropFilter:"blur(16px)",borderRadius:16,overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)" }}>
                  {checklist.filter(i=>i.cat===cat).map(item=>(
                    <div key={item.id} className="check-row">
                      <div onClick={()=>toggleCheck(item.id)} style={{ width:22,height:22,borderRadius:7,flexShrink:0,border:`2px solid ${item.done?"#52B788":"rgba(255,255,255,0.2)"}`,background:item.done?"rgba(82,183,136,0.15)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,transition:"all 0.2s",color:"#52B788",cursor:"pointer" }}>
                        {item.done&&"✓"}
                      </div>
                      <div style={{ flex:1,fontSize:14,color:item.done?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.82)",textDecoration:item.done?"line-through":"none",cursor:"pointer" }} onClick={()=>toggleCheck(item.id)}>{item.text}</div>
                      {item.urgent&&!item.done&&<span className="urgent">דחוף</span>}
                      {editMode && <button className="edit-btn" onClick={()=>setEditCheck(item)}>✏️</button>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {editMode && (
              <button onClick={addCheckItem} style={{ width:"100%",padding:"13px",background:"rgba(212,160,23,0.12)",border:"2px dashed rgba(212,160,23,0.3)",borderRadius:14,color:"#F4E4A6",fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif",marginTop:8 }}>
                + הוסף משימה חדשה
              </button>
            )}
            <div style={{ textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.18)",marginTop:12 }}>✦ הסימונים והעריכות מתעדכנים לכל המשפחה בזמן אמת</div>
          </div>
        )}
      </div>

      {selectedAttr && <AttractionModal attr={selectedAttr} onClose={()=>setSelectedAttr(null)}/>}
      {editDay && <EditDayModal {...editDay} onSave={(d)=>saveDay(editDay.partId,editDay.dayIdx,d)} onClose={()=>setEditDay(null)}/>}
      {editCheck && <EditCheckModal item={editCheck} onSave={saveCheckItem} onClose={()=>setEditCheck(null)}/>}
      {addNote && <AddNoteModal {...addNote} onSave={(t)=>saveNote(addNote.partId,addNote.dayIdx,t)} onClose={()=>setAddNote(null)}/>}
    </div>
  );
}

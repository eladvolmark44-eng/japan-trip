import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, remove } from "firebase/database";

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

const DEFAULT_PARTS = [
  { id:0, label:"טוקיו", sub:"נחיתה ודיסני", dates:"8–13.9", accent:"#C1121F", accentLight:"#FFF5F5",
    hotel:"טוקיו · 5 לילות · 08–13.09",
    days:[
      { date:"08.09", icon:"✈️", title:"נחיתה בנריטה", desc:"נחיתה 08:25. התאוששות מג׳ט-לג וסיבוב ערב ראשון בטוקיו." },
      { date:"09.09", icon:"🎡", title:"DisneySea", desc:"יום פארק דיסני-סי – יום חול, פחות עומס!", attrKey:"DisneySea" },
      { date:"10.09", icon:"🌊", title:"TeamLab Borderless", desc:"מוזיאון אמנות דיגיטלית אימרסיבי.", attrKey:"TeamLab Borderless" },
      { date:"10.09", icon:"🎮", title:"אקיהברה", desc:"אנימה, מרצ׳נדייז וגאצ׳פונים.", attrKey:"אקיהברה" },
      { date:"11.09", icon:"🌆", title:"Shibuya Sky", desc:"תצפית 360° על טוקיו בשקיעה (17:00).", attrKey:"Shibuya Sky" },
      { date:"11.09", icon:"🏴‍☠️", title:"חנות One Piece", desc:"חנות הדגל של One Piece בסינג׳וקו.", attrKey:"One Piece Store" },
      { date:"12.09", icon:"👘", title:"הראג׳וקו", desc:"אופנה, קוספליי ורחוב Takeshita.", attrKey:"הראג׳וקו" },
      { date:"12.09", icon:"⛩️", title:"אסאקוסה", desc:"מקדש סנסו-ג׳י, שוק נקמיסה ואווירה קלאסית.", attrKey:"אסאקוסה" },
    ]},
  { id:1, label:"האקונה & האלפים", sub:"טבע ופוג׳י", dates:"13–16.9", accent:"#386641", accentLight:"#F0F7F0",
    hotel:"האקונה (13.09) · טאקיאמה (14.09) · קנאזאווה (15.09)",
    days:[
      { date:"13.09", icon:"🗻", title:"האקונה – פוג׳י", desc:"נסיעה להאקונה, סיבוב ותצפית על פוג׳י.", attrKey:"הר פוג׳י – האקונה" },
      { date:"14.09", icon:"🚃", title:"האקונה → טאקיאמה", desc:"השלמות בהאקונה + נסיעה (4–5 שעות)." },
      { date:"15.09", icon:"🏘️", title:"שירקאווה-גו", desc:"כפר היסטורי עם בתי גאשו-צוקורי.", attrKey:"שירקאווה-גו" },
      { date:"15.09", icon:"🌸", title:"קנאזאווה", desc:"גן קנרוקו-אן וערב בעיר.", attrKey:"קנאזאווה" },
    ]},
  { id:2, label:"קיוטו", sub:"לב התרבות", dates:"16–21.9", accent:"#6B2D8B", accentLight:"#F8F0FF",
    hotel:"קיוטו · 5 לילות · 16–21.09",
    days:[
      { date:"16.09", icon:"🚄", title:"הגעה לקיוטו", desc:"הגעה ברכבת מהירה והתמקמות." },
      { date:"17.09", icon:"🏯", title:"Kiyomizu-dera", desc:"מקדש מפורסם עם נוף על קיוטו.", attrKey:"Kiyomizu-dera" },
      { date:"17.09", icon:"🪨", title:"סמטאות Ninenzaka & Sannenzaka", desc:"רחובות אבן עתיקים עם חנויות מסורתיות.", attrKey:"Ninenzaka" },
      { date:"18.09", icon:"🎋", title:"יער הבמבוק – ארשיאמה", desc:"שביל במבוק, פארק קופים, מקדש Tenryu-ji.", attrKey:"יער הבמבוק – ארשיאמה" },
      { date:"18.09", icon:"🌙", title:"רובע Gion", desc:"רובע הגיישות המפורסם – יפה במיוחד בערב.", attrKey:"רובע Gion" },
      { date:"19.09", icon:"✨", title:"מקדש הזהב – Kinkaku-ji", desc:"המקדש המוזהב המשתקף בבריכה.", attrKey:"מקדש הזהב – Kinkaku-ji" },
      { date:"19.09", icon:"🪨", title:"Ryoan-ji", desc:"גן האבנים הזן המפורסם ביפן.", attrKey:"Ryoan-ji" },
      { date:"20.09", icon:"⚠️", title:"יציאה לא אחרי 08:00!", desc:"ציר דרומי: נינטנדו ← Fushimi Inari ← נארה." },
      { date:"20.09", icon:"🎮", title:"מוזיאון נינטנדו", desc:"המוזיאון הרשמי של נינטנדו ב-Uji.", attrKey:"מוזיאון נינטנדו" },
      { date:"20.09", icon:"⛩️", title:"Fushimi Inari", desc:"10,000 שערי טוריי כתומים.", attrKey:"Fushimi Inari" },
      { date:"20.09", icon:"🦌", title:"נארה", desc:"צבאים חופשיים ומקדש Todai-ji.", attrKey:"נארה – צבאים חופשיים" },
    ]},
  { id:3, label:"אוסקה", sub:"חגיגות בר מצווה", dates:"21–25.9", accent:"#B5500B", accentLight:"#FFF5EE",
    hotel:"אוסקה · 4 לילות · 21–25.09",
    days:[
      { date:"21.09", icon:"🏯", title:"טירת אוסקה", desc:"הטירה המפורסמת של אוסקה.", attrKey:"טירת אוסקה" },
      { date:"21.09", icon:"🌃", title:"דוטונבורי", desc:"לב הבידור של אוסקה – אוכל, אורות ואווירה.", attrKey:"דוטונבורי" },
      { date:"22.09", icon:"🎢", title:"USJ יום א׳", desc:"יום ראשון ביוניברסל סטודיו.", attrKey:"Universal Studios – Nintendo World" },
      { date:"23.09", icon:"🎉", title:"יום השיא – בר מצווה! USJ יום ב׳", desc:"Nintendo World + מופע One Piece (VIP!).", attrKey:"Universal Studios – Nintendo World" },
      { date:"24.09", icon:"🐠", title:"אקווריום קאיוקאן", desc:"אחד האקווריומים הגדולים בעולם.", attrKey:"אקווריום קאיוקאן" },
      { date:"24.09", icon:"🎭", title:"Jojo World", desc:"חוויה אינטראקטיבית של עולם JoJo's Bizarre Adventure.", attrKey:"Jojo World" },
      { date:"25.09", icon:"🛍️", title:"קניות + שינקנסן", desc:"Tokyu Hands / דון קישוט → שינקנסן לטוקיו." },
    ]},
  { id:4, label:"טוקיו & טיסה", sub:"סגירת מעגל", dates:"25–29.9", accent:"#1A5276", accentLight:"#EFF6FF",
    hotel:"טוקיו (3 לילות) · נריטה (28.09)",
    days:[
      { date:"25.09", icon:"🚄", title:"חזרה לטוקיו", desc:"הגעה בשינקנסן והתמקמות." },
      { date:"26.09", icon:"🌊", title:"TeamLab Planets", desc:"מוזיאון TeamLab Planets – שונה מ-Borderless.", attrKey:"TeamLab Planets" },
      { date:"27.09", icon:"🛍️", title:"קניות אחרונות", desc:"Tokyu Hands, Akihabara, או Don Quijote." },
      { date:"28.09", icon:"🏨", title:"נריטה", desc:"יום רגוע + מעבר למלון ליד שדה התעופה." },
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

const DEFAULT_PACKING = [
  { id:"p1", cat:"📄 מסמכים", text:"דרכונים תקפים לכל המשפחה", done:false },
  { id:"p2", cat:"📄 מסמכים", text:"ביטוח נסיעות – הדפסה ודיגיטל", done:false },
  { id:"p3", cat:"📄 מסמכים", text:"אישורי מלון – כולם הודפסו", done:false },
  { id:"p4", cat:"📄 מסמכים", text:"כרטיסי טיסה", done:false },
  { id:"p5", cat:"📄 מסמכים", text:"JR Pass – להוציא לפני היציאה", done:false },
  { id:"p6", cat:"💴 כסף", text:"מזומן ין יפני (JPY) – ¥50,000 לפחות", done:false },
  { id:"p7", cat:"💴 כסף", text:"כרטיס אשראי ללא עמלת מט\"ח", done:false },
  { id:"p8", cat:"💴 כסף", text:"IC Card (Suica) – ניתן לטעון בנריטה", done:false },
  { id:"p9", cat:"📱 טכנולוגיה", text:"מתאם חשמל יפני (Type A – זהה לישראל, לא צריך)", done:false },
  { id:"p10", cat:"📱 טכנולוגיה", text:"SIM יפני או eSIM לרוחב פס", done:false },
  { id:"p11", cat:"📱 טכנולוגיה", text:"בנק סוללה (Portable Charger)", done:false },
  { id:"p12", cat:"📱 טכנולוגיה", text:"מצלמה / GoPro", done:false },
  { id:"p13", cat:"👕 ביגוד", text:"נעליים נוחות להליכה ארוכה", done:false },
  { id:"p14", cat:"👕 ביגוד", text:"בגדים קלים – ספטמבר חם ולח ביפן", done:false },
  { id:"p15", cat:"👕 ביגוד", text:"מעיל קל / סוודר לערבות", done:false },
  { id:"p16", cat:"👕 ביגוד", text:"גרביים – יורדים לנעליים בהרבה מקדשים", done:false },
  { id:"p17", cat:"🧴 בריאות", text:"תרופות אישיות", done:false },
  { id:"p18", cat:"🧴 בריאות", text:"קרם הגנה SPF50+", done:false },
  { id:"p19", cat:"🧴 בריאות", text:"מטריה קטנה / כובע – שמש וגשם", done:false },
  { id:"p20", cat:"🎒 שונות", text:"תרמיל יומי קטן לטיולים", done:false },
  { id:"p21", cat:"🎒 שונות", text:"שקיות ניילון קטנות – ליפן אין פחים בחוץ", done:false },
  { id:"p22", cat:"🎒 שונות", text:"מדבקות שם על המזוודות", done:false },
];

const ATTRACTIONS = [
  { name:"DisneySea", loc:"טוקיו", emoji:"🎡", day:"09.09", tags:["ילדים","חובה"], color:"#C1121F",
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
    description:"מוזיאון אמנות דיגיטלית אימרסיבי – 50+ חדרים ללא גבולות של אור ואמנות. המיקום החדש נפתח ב-2024 ב-Azabudai Hills.",
    highlights:["50+ יצירות אינטראקטיביות","Crystal World – מיליון נורות LED","אפשר לבלות שעות ולא לראות הכל"],
    tips:["לבוש כהה לצילומים מרשימים","להגיע בפתיחה","כרטיסים נפתחים 10 ביולי!"],
    hours:"10:00–22:00", price:"¥3,200 / ¥1,000 ילד", bestTime:"בוקר מוקדם", howToGet:"תחנת Azabudai Hills (קו Hibiya)",
    nearbyFood:["Azabudai Hills – מסעדות בוטיק","Roppongi Hills – 10 דק׳","Toriton Sushi"] },
  { name:"TeamLab Planets", loc:"טוקיו", emoji:"🌌", day:"26.09", tags:["אמנות","חוויה"], color:"#0077B6",
    mapsUrl:"https://www.google.com/maps/search/teamLab+Planets+Tokyo/@35.6197,139.7946,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+teamlab+planets+tokyo",
    description:"חוויה שונה מ-Borderless – חדרים עמוקים יותר ואינטנסיביים. כולל חדרי מים וצמחיה ענקית. נסיעה ברגל יחפה.",
    highlights:["חדר מים – עומדים בתוך השתקפויות","Garden of Remembrance – פרחים בגובה האדם","מומלץ גם אחרי Borderless – שונה לחלוטין"],
    tips:["להביא בגדים שמותר להרטיב","להזמין מראש – מתמלא מהר","20 דקות מהמרכז ברכבת"],
    hours:"09:00–21:00", price:"¥3,200 / ¥1,000 ילד", bestTime:"אחה״צ", howToGet:"קו Yurikamome, תחנת Shin-Toyosu",
    nearbyFood:["Toyosu Market – שוק הדגים החדש קרוב","Odaiba mall – מסעדות לאורך המים","DiverCity Tokyo – קניון עם מסעדות"] },
  { name:"אקיהברה", loc:"טוקיו", emoji:"🎮", day:"10.09", tags:["אנימה","קניות"], color:"#6B2D8B",
    mapsUrl:"https://www.google.com/maps/search/Akihabara+Tokyo/@35.7023,139.7745,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+akihabara+tokyo",
    description:"בירת האנימה, מנגה, גאצ׳פון ואלקטרוניקה. רחוב מוארים, חנויות בכל קומה, קפה נושאיים.",
    highlights:["גאצ׳פון – מכונות ממכרות, מאות מודלים","Yodobashi Camera – 9 קומות אלקטרוניקה","חנויות Doujin, Figures ו-Merch נדיר"],
    tips:["להביא מזומן – חלק מהחנויות לא מקבלות כרטיס","קומות עליונות = טוב יותר ולא תיירותי","Maid Cafe – חוויה ייחודית אם רוצים"],
    hours:"10:00–21:00 רוב החנויות", price:"חינם להיכנס", bestTime:"אחה״צ – יותר חיים", howToGet:"JR Akihabara Station",
    nearbyFood:["AKB Cafe – קפה נושאי","Kanda Yabu Soba – סובה מסורתי 150 שנה","UDX Food Court – מגוון גדול בקניון"] },
  { name:"Shibuya Sky", loc:"טוקיו", emoji:"🌆", day:"11.09", tags:["תצפית","כרטיס מראש"], color:"#B5500B",
    mapsUrl:"https://www.google.com/maps/search/Shibuya+Sky+Observation+Deck/@35.6581,139.7021,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+Shibuya+Scramble+Square",
    description:"תצפית 360° על טוקיו מגג Scramble Square – הבניין הגבוה ביותר בשיבויה. פוג׳י נראה בימים בהירים.",
    highlights:["נוף עוצר נשימה בשקיעה","תצפית ישירה על הצומת המפורסם מלמעלה","דק פתוח באוויר עם רוח"],
    tips:["להזמין לשעה 17:00 – 30 דק׳ לפני שקיעה","21 אוגוסט – נפתחות הזמנות לספטמבר","לבוא 15 דק׳ מוקדם"],
    hours:"10:00–23:00", price:"¥2,000 / ¥1,200 ילד", bestTime:"17:00 שקיעה", howToGet:"תחנת Shibuya (כל הקווים)",
    nearbyFood:["Scramble Square B2 – פוד קורט מצוין","Shibuya Hikarie – מסעדות עם נוף","Genki Sushi – על מסועים, כיף לילדים"] },
  { name:"One Piece Store", loc:"טוקיו", emoji:"🏴‍☠️", day:"11.09", tags:["קניות","אנימה"], color:"#C1121F",
    mapsUrl:"https://www.google.com/maps/search/One+Piece+Mugiwara+Store+Shinjuku/@35.6896,139.7006,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+shinjuku+tokyo",
    description:"חנות הדגל הרשמית של One Piece – מגדירה האדמירלי בסינג׳וקו. מרצ׳נדייז בלעדי, פסלים, ביגוד ואביזרים.",
    highlights:["מרצ׳נדייז בלעדי שלא נמכר בשום מקום אחר","פסלים וקולקטיבלס בגדלים גדולים","עיצוב החנות עצמו ספקטקולרי"],
    tips:["להגיע בפתיחה – פחות עומס","יש גם בשיבויה ובאסאקוסה","להביא מזומן לבטיחות"],
    hours:"10:00–21:00", price:"חינם להיכנס", bestTime:"בוקר", howToGet:"JR Shinjuku Station, כניסה מזרחית",
    nearbyFood:["Ichiran Ramen Shinjuku – ראמן סולו","Omoide Yokocho – סמטת מסעדות בגחלים","Keika Ramen – ראמן מפורסם מ-1953"] },
  { name:"הראג׳וקו", loc:"טוקיו", emoji:"👘", day:"12.09", tags:["אופנה","תרבות"], color:"#C1121F",
    mapsUrl:"https://www.google.com/maps/search/Harajuku+Takeshita+Street+Tokyo/@35.6702,139.7027,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+harajuku+tokyo",
    description:"הראג׳וקו הוא מרכז תרבות הנוער של יפן – אופנת רחוב, קוספליי, קפה נושאיים ורחוב Takeshita המפורסם.",
    highlights:["רחוב Takeshita – אופנה ייחודית ומשוגעת","Meiji Shrine – מקדש שינטו שקט בלב הסאגה","Omotesando – הגרסה היפנית של Champs-Élysées"],
    tips:["שבת = הכי עמוס ותוסס","קפה נושאיים: חתולים, כריות, בובות","Crepe מהולסייל – חובה לנסות"],
    hours:"כל שעות", price:"חינם", bestTime:"שבת בבוקר", howToGet:"JR Harajuku Station / Metro Meiji-Jingumae",
    nearbyFood:["Marion Crepes – קרפ יפני קלאסי","Kawaii Monster Cafe – חוויה ויזואלית מטורפת","Gyukatsu Motomura – קציצת בקר מטוגנת"] },
  { name:"אסאקוסה", loc:"טוקיו", emoji:"⛩️", day:"12.09", tags:["מקדש","תרבות"], color:"#C1121F",
    mapsUrl:"https://www.google.com/maps/search/Sensoji+Temple+Asakusa/@35.7148,139.7967,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+asakusa+tokyo",
    description:"השכונה ההיסטורית ביותר בטוקיו. מקדש Senso-ji, שוק Nakamise ואווירה יפנית קלאסית.",
    highlights:["Senso-ji – המקדש הבודהיסטי הוותיק ביותר בטוקיו","שוק Nakamise – 200 חנויות מסורתיות","נהר Sumida ושייט מרהיב בסקייטריין"],
    tips:["להגיע מוקדם – לפני ההמונים","להזמין Omikuji – גורל יפני מסורתי","שכירת קימונו – ¥3,000–5,000 לשעות"],
    hours:"24/7 (מקדש), 10:00–19:00 (שוק)", price:"חינם", bestTime:"07:00–09:00", howToGet:"Metro Asakusa Station (קו Ginza/Asakusa)",
    nearbyFood:["Nakamise snacks – נגיסות מסורתיות","Daikokuya Tempura – טמפורה מ-1887","Asakusa Rox – מרכז קניות עם מסעדות"] },
  { name:"הר פוג׳י – האקונה", loc:"האקונה", emoji:"🗻", day:"13.09", tags:["טבע","אייקוני"], color:"#1A5276",
    mapsUrl:"https://www.google.com/maps/search/Hakone+Owakudani/@35.2323,139.0231,14z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+hakone+japan",
    description:"עיירת ריזורט בשולי פוג׳י עם נוף מרהיב, אגמים וולקניים, רכבל ואונסן מפורסמים.",
    highlights:["Owakudani – עמק וולקני עם ביצים שחורות","אגם Ashi – שייט עם נוף ישיר על פוג׳י","Hakone Open Air Museum – מוזיאון פסלים בחוץ"],
    tips:["בוקר מוקדם לפני עננים","Hakone Free Pass – כרטיס לכל התחבורה","אונסן בערב – חוויה יפנית קלאסית"],
    hours:"משתנה", price:"Hakone Free Pass ¥4,000", bestTime:"בוקר מוקדם", howToGet:"Romancecar מ-Shinjuku (85 דק׳)",
    nearbyFood:["Hakone Bakery בתחנה","Amazake Chaya – בית תה מ-1700","Gyoza Center Hakone"] },
  { name:"שירקאווה-גו", loc:"גיפו", emoji:"🏘️", day:"15.09", tags:["היסטוריה","טבע"], color:"#386641",
    mapsUrl:"https://www.google.com/maps/search/Shirakawa-go+Japan/@36.2567,136.9065,14z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+shirakawa-go+japan",
    description:"כפר הורי עם בתי גאשו-צוקורי (גגות קש תלולים) – אתר מורשת עולמית של יונסקו. מרהיב במיוחד בחורף עם שלג.",
    highlights:["בתי גאשו-צוקורי – ארכיטקטורה ייחודית","Wada House – פנים מקורי פתוח לביקור","נוף מגבעת Shiroyama – המבט הכי יפה"],
    tips:["לבוא בשעות הבוקר לפני האוטובוסים","קיץ-סתיו – ירוק ועדיין יפה","להביא מטרייה – מזג אוויר משתנה"],
    hours:"כל שעות", price:"חינם לטיול / ¥300 בתים בתשלום", bestTime:"09:00–11:00", howToGet:"אוטובוס מטאקיאמה (50 דק׳)",
    nearbyFood:["Doburoku Festival Restaurant – אורז מותסס מסורתי","Irori dining – ארוחה מסורתית על אש","Shirakawa-go Canteen – מנות מקומיות פשוטות"] },
  { name:"קנאזאווה", loc:"קנאזאווה", emoji:"🌸", day:"15.09", tags:["גן","תרבות"], color:"#386641",
    mapsUrl:"https://www.google.com/maps/search/Kenroku-en+Garden+Kanazawa/@36.5617,136.6626,15z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+kenrokuen+kanazawa",
    description:"קנאזאווה מכונה 'קיוטו הקטנה' – גן קנרוקו-אן (אחד שלושת הגנים הגדולים ביפן), שוק אוכל, ורובע גיישות.",
    highlights:["גן קנרוקו-אן – יפה בכל עונה","שוק אומי-צ׳ו – ים-הפירות הטרי ביותר","רובע Higashi Chaya – גיישות ובתי תה"],
    tips:["ערב – לטייל ברובע Higashi Chaya","גלידת מאצ׳ה – חובה בגן","כניסה לגן ¥320 בלבד"],
    hours:"07:00–18:00 (גן)", price:"¥320 גן", bestTime:"בוקר", howToGet:"אוטובוס מתחנת קנאזאווה (10 דק׳)",
    nearbyFood:["Omicho Market – דגים ופירות ים טריים","Mugen – מסעדת סושי מקומית מומלצת","Kaga cuisine – מטבח אזורי ייחודי"] },
  { name:"Kiyomizu-dera", loc:"קיוטו", emoji:"🏯", day:"17.09", tags:["מקדש","נוף"], color:"#6B2D8B",
    mapsUrl:"https://www.google.com/maps/search/Kiyomizudera+Temple+Kyoto/@34.9949,135.7851,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+kiyomizudera+kyoto",
    description:"מקדש בודהיסטי מהמאה ה-8 בנוי על צלעות הר. הגזוזטרה העצומה בנויה ללא מסמר אחד. נוף פנורמי על קיוטו.",
    highlights:["גזוזטרת עץ ענקית ללא מסמרים","Otowa Waterfall – שלושה זרמים לאריכות ימים, בריאות והצלחה","סמטאות Ninenzaka ו-Sannenzaka ממש לידה"],
    tips:["להגיע ב-08:00 לפני ההמונים","חורף – השלג על הגזוזטרה מדהים","כניסה ¥500"],
    hours:"06:00–18:00", price:"¥500", bestTime:"08:00 בפתיחה", howToGet:"אוטובוס 100 מתחנת קיוטו (15 דק׳)",
    nearbyFood:["Ninenzaka – חנויות מסורתיות וחטיפים","Kasagi-ya – חנות מוצ׳י עתיקה מ-1914","Okutan – טופו טוגן מסורתי"] },
  { name:"Ninenzaka", loc:"קיוטו", emoji:"🪨", day:"17.09", tags:["היסטוריה","צילומים"], color:"#6B2D8B",
    mapsUrl:"https://www.google.com/maps/search/Ninenzaka+Sannenzaka+Kyoto/@34.9992,135.7820,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+ninenzaka+kyoto",
    description:"שתי סמטאות אבן מהמאה ה-19 עם בתי תה, חנויות מסורתיות ואווירה יפנית קלאסית. המקום הכי מצולם בקיוטו.",
    highlights:["ריצוף אבן ייחודי מהמאה ה-19","חנויות מסורתיות – קרמיקה, תה, מזכרות","נוף לגגות הרעפים של קיוטו"],
    tips:["ערב – פנסי רחוב ואווירה קסומה","יש חנות Starbucks בבית עתיק בסגנון יפני","לבוש קימונו – פופולרי מאוד כאן"],
    hours:"כל שעות", price:"חינם", bestTime:"07:00–09:00 או אחרי 17:00", howToGet:"10 דקות הליכה ממקדש Kiyomizu-dera",
    nearbyFood:["Kagizen Yoshifusa – wagashi מסורתי מ-1716","Tsujiri – מאצ׳ה לאטה ומנות תה","Yudofu Sagano – טופו מסורתי"] },
  { name:"יער הבמבוק – ארשיאמה", loc:"קיוטו", emoji:"🎋", day:"18.09", tags:["טבע","צילומים"], color:"#386641",
    mapsUrl:"https://www.google.com/maps/search/Arashiyama+Bamboo+Grove/@35.0168,135.6717,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+arashiyama+kyoto",
    description:"שביל 400 מטר בין עצי במבוק ענקיים. פארק קופים על גבעה, מקדש Tenryu-ji עם גן זן, גשר Togetsukyo.",
    highlights:["יער הבמבוק – חינם 24/7","פארק קופים (Iwatayama) – 170 קופים וגבעת נוף","מקדש Tenryu-ji – גן זן יפהפה"],
    tips:["לצאת לפני 08:00 – אחרי 09:00 עומס כבד","ערב: לטייל ברובע Gion","Yudofu – טופו מסורתי ספציאלטי של ארשיאמה"],
    hours:"כל שעות / 09:00–17:00 מקדש", price:"חינם / ¥500 מקדש / ¥600 פארק קופים", bestTime:"07:30–09:00", howToGet:"JR Sagano לתחנת Saga-Arashiyama",
    nearbyFood:["Shigetsu – אוכל זן בתוך מקדש Tenryu-ji","Yoshida-ya – Yudofu מסורתי 200 שנה","Nishiki Market – שוק האוכל של קיוטו"] },
  { name:"רובע Gion", loc:"קיוטו", emoji:"🌙", day:"18.09", tags:["תרבות","ערב"], color:"#6B2D8B",
    mapsUrl:"https://www.google.com/maps/search/Gion+District+Kyoto/@35.0036,135.7752,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+gion+kyoto",
    description:"רובע הגיישות המפורסם של קיוטו – בתי עץ ישנים, פנסים אדומים, ואפשרות לפגוש Maiko (גיישה מתמחה).",
    highlights:["Hanamikoji Street – הרחוב הכי יפה בקיוטו","פגישת Maiko בערב – נדירה ואמיתית","Gion Corner – מופע אמנויות מסורתיות"],
    tips:["לבוא אחרי 18:00 – הפנסים נדלקים","לא לצלם Maiko ללא רשות","Gion Hatanaka – חוויית ryokan אותנטית"],
    hours:"כל שעות", price:"חינם לטיול", bestTime:"18:00–21:00", howToGet:"אוטובוס 206 מתחנת קיוטו",
    nearbyFood:["Ippudo Ramen Gion – ראמן מפורסם","Gion Nanba – אוכל יפני מסורתי","Minokichi – מסעדה קיוטית קלאסית מ-1716"] },
  { name:"מקדש הזהב – Kinkaku-ji", loc:"קיוטו", emoji:"✨", day:"19.09", tags:["מקדש","אייקוני"], color:"#B5500B",
    mapsUrl:"https://www.google.com/maps/search/Kinkakuji/@35.0394,135.7292,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+kinkakuji+kyoto",
    description:"מקדש בודהיסטי מהמאה ה-14, מצופה זהב טהור ומשתקף בבריכה. אחד הסמלים המוכרים ביותר של יפן.",
    highlights:["גן מרהיב סביב המקדש","Ryoan-ji – גן האבנים המפורסם 10 דק׳ הליכה","בחורף עם שלג – נוף מושלם"],
    tips:["ביקור שעה-שעתיים","להגיע ב-09:00 לפני הקבוצות","לשלב עם Ryoan-ji ו-Ninnaji"],
    hours:"09:00–17:00", price:"¥500", bestTime:"09:00 פתיחה", howToGet:"אוטובוס 101/205 מתחנת קיוטו",
    nearbyFood:["Ippudo Ramen","Nishiki Market","Sarasa Nishijin – קפה בקרמיקה עתיקה"] },
  { name:"Ryoan-ji", loc:"קיוטו", emoji:"🪨", day:"19.09", tags:["מקדש","מדיטציה"], color:"#6B2D8B",
    mapsUrl:"https://www.google.com/maps/search/Ryoanji+Temple+Kyoto/@35.0345,135.7180,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+ryoanji+kyoto",
    description:"מקדש זן עם גן האבנים המסתורי ביותר ביפן – 15 אבנים מסודרות בחצץ לבן. המשמעות נתונה לפרשנות אישית.",
    highlights:["גן האבנים – לעולם לא רואים את כל 15 האבנות ממקום אחד","בריכת Kyoyochi – גן חיצוני מרהיב","אווירה שקטה ומדיטטיבית"],
    tips:["לשבת ולהתבונן – לא רק לצלם","להגיע עם Kinkaku-ji – מרחק קצר","בוקר מוקדם – שקט ומיסטי"],
    hours:"08:00–17:00", price:"¥600", bestTime:"08:00 בפתיחה", howToGet:"אוטובוס 59 מהמרכז",
    nearbyFood:["Tosuiro – טופו יצירתי","Nishiki Market – 20 דק׳ נסיעה","Sarasa Nishijin – קפה עתיק"] },
  { name:"מוזיאון נינטנדו", loc:"Uji, קיוטו", emoji:"🎮", day:"20.09", tags:["ילדים","הגרלה"], color:"#C1121F",
    mapsUrl:"https://www.google.com/maps/search/Nintendo+Museum+Uji/@34.9308,135.7953,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+nintendo+museum+uji",
    description:"המוזיאון הרשמי של נינטנדו, נפתח 2024. כל קונסולה מ-1889, משחקים ענקיים אינטראקטיביים.",
    highlights:["Mario ו-Zelda בגרסאות ענק פיזיות","כל קונסולה שיצאה אי פעם מ-Game & Watch ועד Switch","קפה עם אוכל בעיצוב נינטנדו"],
    tips:["הגרלה חובה – יוני 2026!","פתוח 10:00–18:00, סגור ג׳","5 דק׳ מתחנת Kintetsu Ogura"],
    hours:"10:00–18:00 (סגור ג׳)", price:"¥3,300 / ¥1,100 ילד", bestTime:"אחה״צ", howToGet:"Kintetsu Kyoto Line לתחנת Ogura",
    nearbyFood:["Uji – מנות מאצ׳ה בכל מסעדה","Tsuen Tea – בית תה מ-1160","Byodoin Omotesando – רחוב חנויות"] },
  { name:"Fushimi Inari", loc:"קיוטו", emoji:"⛩️", day:"20.09", tags:["מקדש","חינם"], color:"#C1121F",
    mapsUrl:"https://www.google.com/maps/search/Fushimi+Inari+Taisha/@34.9671,135.7727,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+fushimi+inari+kyoto",
    description:"10,000 שערי טוריי כתומים עד פסגת הר אינארי. אחד האתרים הפופולריים ביפן.",
    highlights:["טיפוס לפסגה – 2–3 שעות","תצפית נהדרת בחצי הדרך","צילום אייקוני בשערים הכתומים"],
    tips:["לצאת ב-07:00","JR Inari ממש בכניסה","בגדים רגילים מספיק"],
    hours:"24/7", price:"חינם", bestTime:"07:00–09:00", howToGet:"JR Nara Line, תחנת Inari",
    nearbyFood:["Inari Sando – רחוב אוכל לפני הכניסה","Fushimi Sake District – 40 מבשלות סאקה","Tofuku-ji – שוק מקומי"] },
  { name:"נארה – צבאים חופשיים", loc:"נארה", emoji:"🦌", day:"20.09", tags:["ילדים","חינם"], color:"#386641",
    mapsUrl:"https://www.google.com/maps/search/Nara+Park/@34.6851,135.8048,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+nara+park",
    description:"1,200 צבאים חופשיים ברחובות. מקדש Todai-ji עם פסל בודהה 15 מ׳.",
    highlights:["צבאים חופשיים בין האנשים","Todai-ji – בניין עץ הגדול בעולם","Kasuga Taisha – 3,000 פנסי אבן"],
    tips:["Shika Senbei ¥200 להאכלה","הצבאים אגרסיביים בחמידות","להביא כובעים ומים"],
    hours:"פארק 24/7 | מקדש 07:30–17:30", price:"חינם / ¥600 מקדש", bestTime:"בוקר מוקדם", howToGet:"JR Nara Line מקיוטו – 45 דק׳",
    nearbyFood:["Kakinoha Sushi – סושי בעלה","Naramachi – שכונת אוכל עתיקה","Mellow Cafe"] },
  { name:"טירת אוסקה", loc:"אוסקה", emoji:"🏯", day:"21.09", tags:["היסטוריה","נוף"], color:"#B5500B",
    mapsUrl:"https://www.google.com/maps/search/Osaka+Castle/@34.6873,135.5259,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+osaka+castle",
    description:"טירת אוסקה המפורסמת מהמאה ה-16 עם פארק ענק סביבה. מוזיאון בפנים ונוף מרהיב מהקומה השמינית.",
    highlights:["נוף 360° על אוסקה מהקומה ה-8","פארק ענק עם עצי דובדבן","מוזיאון עם ציוד שריון מקורי"],
    tips:["הפארק חינם – הכניסה לטירה בתשלום","בוקר מוקדם – פחות עומס","ספטמבר – ירוק ויפה"],
    hours:"09:00–17:00", price:"¥600", bestTime:"09:00", howToGet:"Metro Tanimachi 4-chome Station",
    nearbyFood:["Osaka Castle Park cafes","Dotonbori – 15 דק׳ נסיעה","Kuromon Market – שוק הטחינות של אוסקה"] },
  { name:"דוטונבורי", loc:"אוסקה", emoji:"🌃", day:"21.09", tags:["אוכל","אווירה"], color:"#B5500B",
    mapsUrl:"https://www.google.com/maps/search/Dotonbori+Osaka/@34.6687,135.5013,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+dotonbori+osaka",
    description:"לב הבידור של אוסקה – תעלה עם שלטי ניאון ענקיים, אוכל רחוב, מסעדות ובידור. 'מטבח יפן'.",
    highlights:["שלט Glico Man – הצילום האייקוני","Takoyaki ו-Okonomiyaki – אוכל רחוב מקומי","Shinsaibashi – קניות ליד"],
    tips:["ערב – הניאון מדהים","לנסות Takoyaki מהמקומות המקוריים","Kuromon Ichiba Market – שוק בוקר מקומי"],
    hours:"כל שעות", price:"חינם לטיול", bestTime:"18:00–22:00", howToGet:"Metro Namba Station",
    nearbyFood:["Ichimi-an – Takoyaki המקורי","Kani Doraku – סרטן מפורסם","Kushikatsu Daruma – קבב מטוגן אוסקאי"] },
  { name:"Universal Studios – Nintendo World", loc:"אוסקה", emoji:"🍄", day:"22–23.09", tags:["ילדים","חובה"], color:"#6B2D8B",
    mapsUrl:"https://www.google.com/maps/search/Universal+Studios+Japan/@34.6654,135.4323,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+universal+studios+japan",
    description:"USJ עם Nintendo World המדהים – Mario Kart AR, Donkey Kong, Yoshi, Harry Potter ועוד.",
    highlights:["Nintendo World – Mario Kart AR, Donkey Kong Mine Cart","Harry Potter – Hogsmeade ושוקולד צפפות","Hollywood Dream – רכבת הרים עם מוזיקה שבוחרים"],
    tips:["Express Pass – חובה!","Nintendo World – Timed Entry נפרד","להגיע בפתיחה ישר לנינטנדו"],
    hours:"09:00–21:00", price:"¥10,400 + Express Pass", bestTime:"פתיחה – נינטנדו ראשון", howToGet:"JR Yumesaki Line לתחנת Universal City",
    nearbyFood:["Butterbeer + Mario food בפארק","CityWalk Osaka בכניסה","Osaka Namba – 20 דק׳"] },
  { name:"אקווריום קאיוקאן", loc:"אוסקה", emoji:"🐠", day:"24.09", tags:["ילדים","טבע"], color:"#1A5276",
    mapsUrl:"https://www.google.com/maps/search/Osaka+Aquarium+Kaiyukan/@34.6546,135.4287,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+osaka+aquarium",
    description:"אחד האקווריומים הגדולים בעולם עם לוויתן-כרישים, לטאות ים, ופינגווינים. 8 קומות של חוויה ימית.",
    highlights:["לוויתן-כרישים – הדגים הגדולים בעולם","15 אזורי אוקיינוס שונים","נוף על מפרץ אוסקה"],
    tips:["להזמין מראש – תורים ארוכים","להגיע בפתיחה","הגלגל הפנורמי ליד – נוף נהדר"],
    hours:"10:00–20:00", price:"¥2,700 / ¥1,400 ילד", bestTime:"09:30 לפני הפתיחה", howToGet:"Metro Chuo Line לתחנת Osakako",
    nearbyFood:["Tempozan Marketplace – קניון מסעדות","Naniwa Kuishinbo Yokocho – 30 מסעדות אוסקאיות","Kaiyukan Café בתוך האקווריום"] },
  { name:"Jojo World", loc:"אוסקה", emoji:"🎭", day:"24.09", tags:["אנימה","חוויה"], color:"#B5500B",
    mapsUrl:"https://www.google.com/maps/search/Universal+Studios+Japan+Osaka/@34.6654,135.4323,16z",
    mapsNearby:"https://www.google.com/maps/search/restaurants+near+universal+studios+japan",
    description:"אירוע מיוחד של JoJo's Bizarre Adventure ב-USJ – אינטראקציות עם דמויות, מרצ׳נדייז בלעדי וחוויות AR.",
    highlights:["מפגש עם דמויות הסדרה","מרצ׳נדייז בלעדי שלא נמכר בשום מקום","פוטו ספוט עם ה-poses האייקוניים"],
    tips:["לבדוק תאריכי האירוע מראש","להגיע מוקדם – מרצ׳נדייז נגמר מהר","Express Pass אינו תקף לכאן"],
    hours:"09:00–21:00", price:"כלול בכרטיס USJ", bestTime:"פתיחה", howToGet:"JR Yumesaki Line לתחנת Universal City",
    nearbyFood:["בתוך USJ – Butterbeer ועוד","CityWalk Osaka","Namba – 20 דק׳"] },
];

// ── Attraction Modal ──
function AttractionModal({ attr, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%",maxWidth:680,maxHeight:"91vh",overflowY:"auto",background:"#fff",borderRadius:"24px 24px 0 0",boxShadow:"0 -8px 40px rgba(0,0,0,0.15)",animation:"slideUp 0.3s cubic-bezier(0.34,1.2,0.64,1)" }}>
        <div style={{ height:160,background:`linear-gradient(160deg,${attr.color}22 0%,${attr.color}08 100%)`,borderRadius:"24px 24px 0 0",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",borderBottom:`3px solid ${attr.color}` }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:56 }}>{attr.emoji}</div>
            <div style={{ fontSize:20,fontWeight:800,fontFamily:"'Playfair Display',serif",marginTop:6,color:"#1a1a1a" }}>{attr.name}</div>
            <div style={{ fontSize:12,color:"#999",marginTop:3 }}>📍 {attr.loc} · {attr.day}</div>
          </div>
          <button onClick={onClose} style={{ position:"absolute",top:14,left:14,width:32,height:32,borderRadius:"50%",background:"#f5f5f5",border:"1px solid #e0e0e0",color:"#666",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ padding:"16px 20px 44px",fontFamily:"'Heebo',sans-serif" }}>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:14 }}>
            {attr.tags.map(t=><span key={t} style={{ fontSize:12,padding:"3px 10px",borderRadius:100,background:`${attr.color}15`,color:attr.color,border:`1px solid ${attr.color}30`,fontWeight:600 }}>{t}</span>)}
          </div>
          <p style={{ fontSize:14,color:"#444",lineHeight:1.8,marginBottom:14 }}>{attr.description}</p>
          <LightBlock title="✦ למה כדאי" color={attr.color}>
            {attr.highlights.map((h,i)=><LightRow key={i} icon="★" text={h} color={attr.color}/>)}
          </LightBlock>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,margin:"12px 0" }}>
            {[["🕐","שעות",attr.hours],["🎫","כניסה",attr.price],["⭐","הזמן הטוב",attr.bestTime],["🚃","הגעה",attr.howToGet]].map(([ic,lb,vl])=>(
              <div key={lb} style={{ background:"#fafaf8",border:"1px solid #ede9e4",borderRadius:12,padding:"10px 12px" }}>
                <div style={{ fontSize:10,color:"#aaa",marginBottom:3 }}>{ic} {lb}</div>
                <div style={{ fontSize:12,color:"#444",lineHeight:1.5 }}>{vl}</div>
              </div>
            ))}
          </div>
          <LightBlock title="💡 טיפים" color="#386641">
            {attr.tips.map((t,i)=><LightRow key={i} icon="→" text={t} color="#386641"/>)}
          </LightBlock>
          <LightBlock title="🍜 אוכל באיזור" color="#B5500B">
            {attr.nearbyFood.map((f,i)=><LightRow key={i} icon="🥢" text={f}/>)}
          </LightBlock>
          <div style={{ marginTop:14,display:"flex",flexDirection:"column",gap:8 }}>
            <a href={attr.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display:"block",padding:"12px",background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:14,color:"#1D4ED8",fontSize:14,textDecoration:"none",textAlign:"center",fontWeight:600 }}>📍 מיקום ב-Google Maps</a>
            <a href={attr.mapsNearby} target="_blank" rel="noopener noreferrer" style={{ display:"block",padding:"12px",background:`${attr.color}10`,border:`1px solid ${attr.color}30`,borderRadius:14,color:attr.color,fontSize:14,textDecoration:"none",textAlign:"center",fontWeight:600 }}>🍜 מסעדות ואוכל באיזור</a>
          </div>
        </div>
      </div>
    </div>
  );
}
function LightBlock({ title, color, children }) {
  return <div style={{ background:`${color}08`,border:`1px solid ${color}20`,borderRadius:14,padding:"12px 14px",marginBottom:10 }}><div style={{ fontSize:12,fontWeight:700,color,marginBottom:8 }}>{title}</div><div style={{ display:"flex",flexDirection:"column",gap:6 }}>{children}</div></div>;
}
function LightRow({ icon, text, color }) {
  return <div style={{ display:"flex",gap:8,alignItems:"flex-start" }}><span style={{ color:color||"#ccc",fontSize:11,flexShrink:0,marginTop:2 }}>{icon}</span><span style={{ fontSize:13,color:"#555",lineHeight:1.6 }}>{text}</span></div>;
}

// ── Edit Modals ──
function EditDayModal({ partId, dayIdx, day, onSave, onClose }) {
  const [title, setTitle] = useState(day.title);
  const [desc, setDesc] = useState(day.desc);
  const [icon, setIcon] = useState(day.icon);
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff",borderRadius:20,padding:24,width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",fontFamily:"'Heebo',sans-serif" }}>
        <div style={{ fontSize:18,fontWeight:700,marginBottom:20,color:"#1a1a1a" }}>✏️ עריכת יום</div>
        {[["אייקון",icon,setIcon,20,"right"],["כותרת",title,setTitle,14,"right"]].map(([lb,val,set,fs,align])=>(
          <div key={lb}>
            <label style={{ fontSize:12,color:"#999",display:"block",marginBottom:4 }}>{lb}</label>
            <input value={val} onChange={e=>set(e.target.value)} style={{ width:"100%",background:"#fafaf8",border:"1px solid #e0ddd8",borderRadius:10,padding:"9px 12px",color:"#1a1a1a",fontSize:fs,marginBottom:14,outline:"none",textAlign:align }}/>
          </div>
        ))}
        <label style={{ fontSize:12,color:"#999",display:"block",marginBottom:4 }}>תיאור</label>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} style={{ width:"100%",background:"#fafaf8",border:"1px solid #e0ddd8",borderRadius:10,padding:"9px 12px",color:"#1a1a1a",fontSize:13,marginBottom:20,outline:"none",resize:"vertical",textAlign:"right",fontFamily:"'Heebo',sans-serif" }}/>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>onSave({...day,title,desc,icon})} style={{ flex:1,padding:"12px",background:"#C1121F",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif" }}>שמור</button>
          <button onClick={onClose} style={{ flex:1,padding:"12px",background:"#f5f5f3",border:"1px solid #e0ddd8",borderRadius:12,color:"#666",fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif" }}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

function EditCheckModal({ item, onSave, onClose }) {
  const [text, setText] = useState(item.text);
  const [cat, setCat] = useState(item.cat);
  const [urgent, setUrgent] = useState(item.urgent);
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff",borderRadius:20,padding:24,width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",fontFamily:"'Heebo',sans-serif" }}>
        <div style={{ fontSize:18,fontWeight:700,marginBottom:20,color:"#1a1a1a" }}>✏️ עריכת משימה</div>
        <label style={{ fontSize:12,color:"#999",display:"block",marginBottom:4 }}>טקסט</label>
        <input value={text} onChange={e=>setText(e.target.value)} style={{ width:"100%",background:"#fafaf8",border:"1px solid #e0ddd8",borderRadius:10,padding:"9px 12px",color:"#1a1a1a",fontSize:14,marginBottom:14,outline:"none",textAlign:"right" }}/>
        <label style={{ fontSize:12,color:"#999",display:"block",marginBottom:4 }}>קטגוריה</label>
        <select value={cat} onChange={e=>setCat(e.target.value)} style={{ width:"100%",background:"#fafaf8",border:"1px solid #e0ddd8",borderRadius:10,padding:"9px 12px",color:"#1a1a1a",fontSize:14,marginBottom:14,outline:"none",fontFamily:"'Heebo',sans-serif" }}>
          <option>🎟️ כרטיסים</option>
          <option>🏨 מלונות</option>
          <option>🧳 לוגיסטיקה</option>
        </select>
        <label style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:20,color:"#444",fontSize:14 }}>
          <input type="checkbox" checked={urgent} onChange={e=>setUrgent(e.target.checked)} style={{ width:18,height:18,accentColor:"#C1121F" }}/>
          סמן כדחוף
        </label>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>onSave({...item,text,cat,urgent})} style={{ flex:1,padding:"12px",background:"#C1121F",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif" }}>שמור</button>
          <button onClick={onClose} style={{ flex:1,padding:"12px",background:"#f5f5f3",border:"1px solid #e0ddd8",borderRadius:12,color:"#666",fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif" }}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

function AddNoteModal({ partId, dayIdx, note, onSave, onClose }) {
  const [text, setText] = useState(note||"");
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff",borderRadius:20,padding:24,width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",fontFamily:"'Heebo',sans-serif" }}>
        <div style={{ fontSize:18,fontWeight:700,marginBottom:16,color:"#1a1a1a" }}>📝 הערה ליום</div>
        <textarea value={text} onChange={e=>setText(e.target.value)} rows={4} placeholder="כתוב הערה לכל המשפחה..." style={{ width:"100%",background:"#fafaf8",border:"1px solid #e0ddd8",borderRadius:10,padding:"9px 12px",color:"#1a1a1a",fontSize:14,marginBottom:16,outline:"none",resize:"vertical",textAlign:"right",fontFamily:"'Heebo',sans-serif" }}/>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>onSave(text)} style={{ flex:1,padding:"12px",background:"#C1121F",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif" }}>שמור</button>
          <button onClick={onClose} style={{ flex:1,padding:"12px",background:"#f5f5f3",border:"1px solid #e0ddd8",borderRadius:12,color:"#666",fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif" }}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──
export default function JapanTrip() {
  const [tab, setTab] = useState("itinerary");
  const [openPart, setOpenPart] = useState(null);
  const [parts, setParts] = useState(DEFAULT_PARTS);
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [notes, setNotes] = useState({});
  const [recs, setRecs] = useState({});
  const [packing, setPacking] = useState({});
  const [editDay, setEditDay] = useState(null);
  const [editCheck, setEditCheck] = useState(null);
  const [addNote, setAddNote] = useState(null);
  const [selectedAttr, setSelectedAttr] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [manualRec, setManualRec] = useState({ cat:"אטרקציות", title:"", desc:"", loc:"" });

  useEffect(()=>{
    const u1 = onValue(ref(db,"parts"), s=>{ if(s.exists()) setParts(s.val()); });
    const u2 = onValue(ref(db,"checklist"), s=>{ if(s.exists()) setChecklist(Object.values(s.val())); });
    const u3 = onValue(ref(db,"notes"), s=>{ if(s.exists()) setNotes(s.val()); });
    const u4 = onValue(ref(db,"recs"), s=>{ if(s.exists()) setRecs(s.val()); });
    const u5 = onValue(ref(db,"packing"), s=>{ if(s.exists()) setPacking(s.val()); });
    return ()=>{ u1(); u2(); u3(); u4(); u5(); };
  },[]);

  useEffect(()=>{
    onValue(ref(db,"initialized"), s=>{
      if(!s.exists()){
        set(ref(db,"parts"), DEFAULT_PARTS);
        set(ref(db,"checklist"), Object.fromEntries(DEFAULT_CHECKLIST.map(i=>[i.id,i])));
        set(ref(db,"notes"), {});
        set(ref(db,"recs"), {});
        set(ref(db,"packing"), Object.fromEntries(DEFAULT_PACKING.map(i=>[i.id,i])));
        set(ref(db,"initialized"), true);
      }
    },{ onlyOnce:true });
  },[]);

  async function saveDay(partId, dayIdx, updatedDay) {
    setSyncing(true);
    const newParts = parts.map((p,pi)=> pi===partId ? {...p, days:p.days.map((d,di)=> di===dayIdx ? updatedDay : d)} : p);
    await set(ref(db,"parts"), newParts);
    setSyncing(false); setEditDay(null);
  }

  async function saveNote(partId, dayIdx, text) {
    setSyncing(true);
    await update(ref(db,"notes"), { [`${partId}_${dayIdx}`]: text });
    setSyncing(false); setAddNote(null);
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
    setSyncing(false); setEditCheck(null);
  }

  async function addCheckItem() {
    const id = `c${Date.now()}`;
    const item = { id, cat:"🧳 לוגיסטיקה", text:"משימה חדשה", urgent:false, done:false };
    setSyncing(true);
    await set(ref(db,`checklist/${id}`), item);
    setSyncing(false);
    setEditCheck(item);
  }

  async function deleteCheckItem(id) {
    if(!window.confirm("Delete this task?")) return;
    setSyncing(true);
    await remove(ref(db,`checklist/${id}`));
    setSyncing(false);
  }

  async function parseAndAddRec() {
    if(!aiInput.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/parse-recs", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ text: aiInput }),
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const items = data.items;
      if(!Array.isArray(items) || items.length===0) throw new Error("לא הצלחתי לזהות המלצות בטקסט");
      await saveRecs(items);
      setAiInput("");
    } catch(e) {
      console.error(e);
      setAiError(e.message || "שגיאה בעיבוד הטקסט");
    }
    setAiLoading(false);
  }

  async function saveRecs(items) {
    setSyncing(true);
    const updates = {};
    items.forEach(item => {
      const id = `r${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
      updates[id] = { id, ...item, done:false };
    });
    await update(ref(db,"recs"), updates);
    setSyncing(false);
  }

  async function addManualRec() {
    const title = manualRec.title.trim();
    if(!title) return;
    await saveRecs([{
      cat: manualRec.cat,
      title,
      desc: manualRec.desc.trim(),
      loc: manualRec.loc.trim(),
    }]);
    setManualRec({ cat:"אטרקציות", title:"", desc:"", loc:"" });
  }

  async function toggleRec(id) {
    const item = Object.values(recs).find(r=>r.id===id);
    if(!item) return;
    await update(ref(db,`recs/${id}`), { done: !item.done });
  }

  async function deleteRec(id) {
    if(!window.confirm("למחוק המלצה זו?")) return;
    await remove(ref(db,`recs/${id}`));
  }

  async function togglePacking(id) {
    const item = Object.values(packing).find(p=>p.id===id);
    if(!item) return;
    await update(ref(db,`packing/${id}`), { done: !item.done });
  }

  async function addPackingItem() {
    const id = `p${Date.now()}`;
    const item = { id, cat:"🧳 כללי", text:"פריט חדש", done:false };
    await set(ref(db,`packing/${id}`), item);
  }

  async function deletePackingItem(id) {
    if(!window.confirm("למחוק פריט זה?")) return;
    await remove(ref(db,`packing/${id}`));
  }

  const done = checklist.filter(i=>i.done).length;
  const cats = [...new Set(checklist.map(i=>i.cat))];

  return (
    <div dir="rtl" style={{ minHeight:"100vh", background:"#FAFAF8", fontFamily:"'Heebo',sans-serif", color:"#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;700;900&family=Playfair+Display:wght@700;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .fade-up{animation:fadeUp 0.5s ease both}
        .part-card{border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,0.07);border:1px solid #ede9e4;transition:transform .2s,box-shadow .2s;cursor:pointer}
        .part-card:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,0.11)}
        .day-row{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #f0ede8;align-items:flex-start;transition:background .15s,padding-right .15s}
        .day-row:last-child{border-bottom:none}
        .day-row:hover{background:#fdfaf8;padding-right:4px;border-radius:8px}
        .check-row{display:flex;align-items:center;gap:12px;padding:13px 18px;cursor:pointer;border-bottom:1px solid #f0ede8;transition:background .15s}
        .check-row:hover{background:#fdf9f5}
        .check-row:last-child{border-bottom:none}
        .tab-btn{padding:9px 20px;border:none;cursor:pointer;border-radius:100px;font-family:'Heebo',sans-serif;font-size:14px;font-weight:600;transition:all .2s}
        .gold-text{background:linear-gradient(135deg,#C8860A,#E8A020,#C8860A);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite}
        .urgent{background:#FFF0F0;color:#C1121F;border:1px solid #FFCDD2;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap}
        .edit-btn{background:#f5f5f3;border:1px solid #e0ddd8;color:#888;padding:3px 10px;border-radius:8px;font-size:11px;cursor:pointer;font-family:'Heebo',sans-serif;transition:all .15s;white-space:nowrap}
        .edit-btn:hover{background:#ede9e4;color:#333}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#ddd;border-radius:4px}
        input,textarea,select{font-family:'Heebo',sans-serif}
      `}</style>

      {/* HERO */}
      <div style={{ background:"#fff", borderBottom:"1px solid #ede9e4", padding:"44px 24px 32px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:4,background:"linear-gradient(90deg,#C1121F,#E8361A,#C1121F)" }}/>
        <div style={{ position:"absolute",inset:0,opacity:0.025,backgroundImage:"repeating-linear-gradient(45deg,#C1121F 0,#C1121F 1px,transparent 0,transparent 50%)",backgroundSize:"20px 20px" }}/>
        <div className="fade-up" style={{ fontSize:11,letterSpacing:5,color:"#C1121F",textTransform:"uppercase",fontWeight:600,marginBottom:10 }}>✦ ספטמבר 2026 ✦</div>
        <h1 className="gold-text fade-up" style={{ fontSize:"clamp(52px,13vw,84px)",fontFamily:"'Playfair Display',serif",fontWeight:900,lineHeight:1,animationDelay:"0.1s",marginBottom:10 }}>יפן</h1>
        <div className="fade-up" style={{ fontSize:15,color:"#777",fontWeight:300,animationDelay:"0.2s",marginBottom:16 }}>טיול משפחת Jimenez · 8.9 – 29.9.2026</div>
        <div className="fade-up" style={{ display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",animationDelay:"0.3s" }}>
          {["21 ימים","5 ערים","🎉 בר מצווה"].map(t=>(
            <span key={t} style={{ padding:"5px 16px",borderRadius:100,border:"1.5px solid #C1121F",color:"#C1121F",fontSize:13,fontWeight:600,background:"#FFF5F5" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.96)",backdropFilter:"blur(12px)",borderBottom:"1px solid #ede9e4",padding:"10px 16px",overflowX:"auto" }}>
        <div style={{ display:"flex",alignItems:"center",gap:6,justifyContent:"center",minWidth:"max-content",margin:"0 auto" }}>
        {[{id:"itinerary",label:"📅 לוז"},{id:"checklist",label:`✅ ${done}/${checklist.length}`},{id:"recs",label:"⭐ המלצות"},{id:"packing",label:"🎒 מה להביא"}].map(t=>(
          <button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)} style={{ background:tab===t.id?"#C1121F":"#F5F5F3", color:tab===t.id?"#fff":"#666", fontWeight:tab===t.id?700:500, flexShrink:0 }}>{t.label}</button>
        ))}
        <button onClick={()=>setEditMode(!editMode)} style={{ padding:"8px 14px",border:`1.5px solid ${editMode?"#C1121F":"#e0ddd8"}`,background:editMode?"#FFF5F5":"transparent",color:editMode?"#C1121F":"#888",borderRadius:100,fontSize:13,cursor:"pointer",fontFamily:"'Heebo',sans-serif",fontWeight:600,transition:"all .2s",flexShrink:0 }}>
          {editMode?"✓ סיום":"✏️"}
        </button>
        {syncing&&<span style={{ fontSize:11,color:"#C1121F",animation:"pulse 1s infinite",flexShrink:0 }}>שומר…</span>}
        </div>
      </div>

      <div style={{ maxWidth:760,margin:"0 auto",padding:"22px 14px 80px" }}>

        {/* ITINERARY */}
        {tab==="itinerary"&&(
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            {parts.map((part,pi)=>{
              const isOpen=openPart===pi;
              return (
                <div key={pi} className="part-card fade-up" style={{ animationDelay:`${pi*0.05}s` }}>
                  <div onClick={()=>setOpenPart(isOpen?null:pi)}
                    style={{ padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:isOpen?"1px solid #f0ede8":"none",borderRight:`4px solid ${part.accent}`,background:isOpen?part.accentLight:"#fff",transition:"background .2s" }}>
                    <div>
                      <div style={{ fontSize:10,letterSpacing:3,color:part.accent,textTransform:"uppercase",marginBottom:3,fontWeight:700 }}>{part.dates}</div>
                      <div style={{ fontSize:20,fontWeight:900,fontFamily:"'Playfair Display',serif",color:"#1a1a1a" }}>{part.label}</div>
                      <div style={{ fontSize:13,color:"#888",marginTop:2 }}>{part.sub}</div>
                    </div>
                    <div style={{ width:32,height:32,borderRadius:"50%",border:`2px solid ${part.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:part.accent,transition:"transform 0.3s",transform:isOpen?"rotate(180deg)":"none",flexShrink:0 }}>▾</div>
                  </div>
                  {isOpen&&(
                    <div style={{ background:"#fff",padding:"4px 20px 16px" }}>
                      {part.days.map((day,di)=>{
                        const attr=day.attrKey?ATTRACTIONS.find(a=>a.name===day.attrKey):null;
                        const noteKey=`${pi}_${di}`;
                        const note=notes[noteKey];
                        const isFirstOfDate = di===0 || part.days[di-1].date !== day.date;
                        return (
                          <div key={di} className="day-row" style={{ borderTop: isFirstOfDate && di>0 ? "2px solid #f0ede8" : undefined, marginTop: isFirstOfDate && di>0 ? 4 : 0 }}>
                            <div style={{ flexShrink:0,width:44,textAlign:"center",paddingTop:2 }}>
                              <div style={{ fontSize:20 }}>{day.icon}</div>
                              <div style={{ fontSize:9,color: isFirstOfDate ? "#aaa" : "transparent",marginTop:2,fontWeight: isFirstOfDate ? 600 : 400 }}>{day.date}</div>
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontWeight:700,fontSize:14,color:"#1a1a1a",marginBottom:2,display:"flex",alignItems:"center",gap:7,flexWrap:"wrap" }}>
                                {day.title}
                                {attr&&<span style={{ fontSize:10,color:part.accent,border:`1px solid ${part.accent}44`,borderRadius:100,padding:"1px 8px",background:part.accentLight,fontWeight:600,cursor:"pointer" }} onClick={(e)=>{e.stopPropagation();setSelectedAttr(attr);}}>פרטים ↗</span>}
                                {editMode&&<button className="edit-btn" onClick={(e)=>{e.stopPropagation();setEditDay({partId:pi,dayIdx:di,day});}}>✏️</button>}
                              </div>
                              <div style={{ fontSize:12,color:"#888",lineHeight:1.6 }}>{day.desc}</div>
                              {note&&<div style={{ marginTop:6,fontSize:12,color:"#B5500B",background:"#FFF5EE",border:"1px solid #FFCDD2",borderRadius:8,padding:"6px 10px" }}>📝 {note}</div>}
                              {editMode&&<button className="edit-btn" style={{ marginTop:6 }} onClick={(e)=>{e.stopPropagation();setAddNote({partId:pi,dayIdx:di,note:notes[noteKey]||""});}}>📝 {note?"ערוך":"הוסף"} הערה</button>}
                            </div>
                          </div>
                        );
                      })}
                      <div style={{ marginTop:12,padding:"10px 14px",background:"#FAFAF8",borderRadius:10,border:"1px solid #ede9e4",display:"flex",gap:8,alignItems:"center" }}>
                        <span>🏨</span>
                        <span style={{ fontSize:12,color:"#666",flex:1 }}>{part.hotel}</span>
                        <span style={{ fontSize:11,color:"#386641",fontWeight:700 }}>סגור ✓</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CHECKLIST */}
        {tab==="checklist"&&(
          <div className="fade-up">
            <div style={{ background:"#fff",border:"1px solid #ede9e4",borderRadius:16,padding:"20px",marginBottom:20,boxShadow:"0 2px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                <span style={{ fontWeight:700,fontSize:16 }}>התקדמות</span>
                <span className="gold-text" style={{ fontSize:24,fontWeight:900,fontFamily:"'Playfair Display',serif" }}>{done}/{checklist.length}</span>
              </div>
              <div style={{ height:6,background:"#f0ede8",borderRadius:6,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${checklist.length?done/checklist.length*100:0}%`,background:"linear-gradient(90deg,#C8860A,#E8A020)",borderRadius:6,transition:"width 0.5s" }}/>
              </div>
              <div style={{ marginTop:8,fontSize:12,color:"#aaa" }}>{done===checklist.length?"🎉 הכל מוכן לטיסה!":`נשארו ${checklist.length-done} משימות`}</div>
            </div>
            {cats.map(cat=>(
              <div key={cat} style={{ marginBottom:16 }}>
                <div style={{ fontSize:11,letterSpacing:2,color:"#bbb",marginBottom:7,textTransform:"uppercase",paddingRight:2 }}>{cat}</div>
                <div style={{ background:"#fff",borderRadius:14,overflow:"hidden",border:"1px solid #ede9e4",boxShadow:"0 1px 8px rgba(0,0,0,0.04)" }}>
                  {checklist.filter(i=>i.cat===cat).map(item=>(
                    <div key={item.id} className="check-row">
                      <div onClick={()=>toggleCheck(item.id)} style={{ width:22,height:22,borderRadius:7,flexShrink:0,border:`2px solid ${item.done?"#386641":"#ddd"}`,background:item.done?"#386641":"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",transition:"all .2s",cursor:"pointer" }}>
                        {item.done&&"✓"}
                      </div>
                      <div style={{ flex:1,fontSize:14,color:item.done?"#bbb":"#333",textDecoration:item.done?"line-through":"none",cursor:"pointer" }} onClick={()=>toggleCheck(item.id)}>{item.text}</div>
                      {item.urgent&&!item.done&&<span className="urgent">דחוף</span>}
                      {editMode&&<button className="edit-btn" onClick={()=>setEditCheck(item)}>✏️</button>}
                      {editMode&&<button className="edit-btn" style={{ color:"#C1121F",borderColor:"#FFCDD2",background:"#FFF5F5" }} onClick={(e)=>{e.stopPropagation();deleteCheckItem(item.id);}}>🗑️</button>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {editMode&&(
              <button onClick={addCheckItem} style={{ width:"100%",padding:"13px",background:"#FFF5F5",border:"2px dashed #FFCDD2",borderRadius:14,color:"#C1121F",fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif",fontWeight:600,marginTop:8,transition:"background .2s" }}>
                + הוסף משימה חדשה
              </button>
            )}
            <div style={{ textAlign:"center",fontSize:12,color:"#ccc",marginTop:12 }}>✦ הסימונים מתעדכנים לכל המשפחה בזמן אמת</div>
          </div>
        )}

        {/* RECOMMENDATIONS */}
        {tab==="recs"&&(
          <div className="fade-up">
            {/* AI Input */}
            <div style={{ background:"#fff",border:"1px solid #ede9e4",borderRadius:16,padding:"18px",marginBottom:20,boxShadow:"0 2px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight:700,fontSize:16,marginBottom:4 }}>✨ הוסף המלצות בטקסט חופשי</div>
              <div style={{ fontSize:12,color:"#aaa",marginBottom:12 }}>הדבק המלצה, טקסט מאינסטגרם, בלוג, או כל מקור – ה-AI יסדר אוטומטית</div>
              <textarea
                value={aiInput} onChange={e=>setAiInput(e.target.value)}
                placeholder={`לדוגמה:\n"חייבים לאכול ב-Ichiran Ramen באוסקה, ראמן סולו מדהים. גם Takoyaki בדוטונבורי חובה. לקנות Kit Kat matcha בלאוסון."`}
                rows={4} style={{ width:"100%",background:"#fafaf8",border:"1px solid #e0ddd8",borderRadius:10,padding:"10px 12px",fontSize:13,color:"#333",outline:"none",resize:"vertical",fontFamily:"'Heebo',sans-serif",textAlign:"right",lineHeight:1.6,marginBottom:10 }}
              />
              <button onClick={parseAndAddRec} disabled={aiLoading||!aiInput.trim()} style={{ width:"100%",padding:"12px",background:aiLoading||!aiInput.trim()?"#f0ede8":"#C1121F",border:"none",borderRadius:12,color:aiLoading||!aiInput.trim()?"#aaa":"#fff",fontWeight:700,fontSize:14,cursor:aiLoading||!aiInput.trim()?"default":"pointer",fontFamily:"'Heebo',sans-serif",transition:"all .2s" }}>
                {aiLoading?"⏳ מסדר המלצות...":"✨ סדר והוסף להמלצות"}
              </button>
              {aiError&&<div style={{ marginTop:10,padding:"9px 12px",background:"#FFF5F5",border:"1px solid #FFCDD2",borderRadius:10,color:"#C1121F",fontSize:12,textAlign:"right" }}>⚠️ {aiError}</div>}
            </div>

            {/* Manual add (fallback) */}
            <div style={{ background:"#fff",border:"1px solid #ede9e4",borderRadius:16,padding:"18px",marginBottom:20,boxShadow:"0 2px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight:700,fontSize:16,marginBottom:4 }}>✍️ הוסף המלצה ידנית</div>
              <div style={{ fontSize:12,color:"#aaa",marginBottom:12 }}>אם ה-AI לא זמין – הוסף ישירות</div>
              <select value={manualRec.cat} onChange={e=>setManualRec({...manualRec,cat:e.target.value})} style={{ width:"100%",background:"#fafaf8",border:"1px solid #e0ddd8",borderRadius:10,padding:"9px 12px",fontSize:13,marginBottom:8,outline:"none",fontFamily:"'Heebo',sans-serif" }}>
                <option>אטרקציות</option>
                <option>מסעדות</option>
                <option>קניות</option>
                <option>לינה</option>
                <option>טיפים כלליים</option>
              </select>
              <input value={manualRec.title} onChange={e=>setManualRec({...manualRec,title:e.target.value})} placeholder="שם / כותרת" style={{ width:"100%",background:"#fafaf8",border:"1px solid #e0ddd8",borderRadius:10,padding:"9px 12px",fontSize:13,marginBottom:8,outline:"none",textAlign:"right",fontFamily:"'Heebo',sans-serif" }}/>
              <input value={manualRec.desc} onChange={e=>setManualRec({...manualRec,desc:e.target.value})} placeholder="תיאור קצר (אופציונלי)" style={{ width:"100%",background:"#fafaf8",border:"1px solid #e0ddd8",borderRadius:10,padding:"9px 12px",fontSize:13,marginBottom:8,outline:"none",textAlign:"right",fontFamily:"'Heebo',sans-serif" }}/>
              <input value={manualRec.loc} onChange={e=>setManualRec({...manualRec,loc:e.target.value})} placeholder="מיקום (אופציונלי)" style={{ width:"100%",background:"#fafaf8",border:"1px solid #e0ddd8",borderRadius:10,padding:"9px 12px",fontSize:13,marginBottom:10,outline:"none",textAlign:"right",fontFamily:"'Heebo',sans-serif" }}/>
              <button onClick={addManualRec} disabled={!manualRec.title.trim()} style={{ width:"100%",padding:"12px",background:!manualRec.title.trim()?"#f0ede8":"#386641",border:"none",borderRadius:12,color:!manualRec.title.trim()?"#aaa":"#fff",fontWeight:700,fontSize:14,cursor:!manualRec.title.trim()?"default":"pointer",fontFamily:"'Heebo',sans-serif" }}>
                + הוסף המלצה
              </button>
            </div>

            {/* Recs by category */}
            {Object.keys(recs).length===0 ? (
              <div style={{ textAlign:"center",color:"#ccc",padding:"40px 0",fontSize:14 }}>עדיין אין המלצות – הוסף מלמעלה!</div>
            ) : (
              [...new Set(Object.values(recs).map(r=>r.cat))].map(cat=>(
                <div key={cat} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12,letterSpacing:2,color:"#bbb",marginBottom:7,textTransform:"uppercase" }}>{cat}</div>
                  <div style={{ background:"#fff",borderRadius:14,overflow:"hidden",border:"1px solid #ede9e4",boxShadow:"0 1px 8px rgba(0,0,0,0.04)" }}>
                    {Object.values(recs).filter(r=>r.cat===cat).map(rec=>(
                      <div key={rec.id} style={{ display:"flex",alignItems:"flex-start",gap:12,padding:"13px 16px",borderBottom:"1px solid #f0ede8",cursor:"pointer",transition:"background .15s" }}
                        className="check-row" onClick={()=>toggleRec(rec.id)}>
                        <div style={{ width:22,height:22,borderRadius:7,flexShrink:0,border:`2px solid ${rec.done?"#386641":"#ddd"}`,background:rec.done?"#386641":"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",transition:"all .2s",marginTop:1 }}>
                          {rec.done&&"✓"}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700,fontSize:14,color:rec.done?"#bbb":"#1a1a1a",textDecoration:rec.done?"line-through":"none" }}>{rec.title}</div>
                          {rec.desc&&<div style={{ fontSize:12,color:"#888",marginTop:2,lineHeight:1.5 }}>{rec.desc}</div>}
                          {rec.loc&&<div style={{ fontSize:11,color:"#C1121F",marginTop:2 }}>📍 {rec.loc}</div>}
                        </div>
                        {editMode&&<button className="edit-btn" style={{ color:"#C1121F",borderColor:"#FFCDD2",background:"#FFF5F5",flexShrink:0 }} onClick={e=>{e.stopPropagation();deleteRec(rec.id);}}>🗑️</button>}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
            <div style={{ textAlign:"center",fontSize:12,color:"#ccc",marginTop:12 }}>✦ ההמלצות משותפות לכל המשפחה</div>
          </div>
        )}

        {/* PACKING LIST */}
        {tab==="packing"&&(
          <div className="fade-up">
            {/* Progress */}
            <div style={{ background:"#fff",border:"1px solid #ede9e4",borderRadius:16,padding:"18px",marginBottom:20,boxShadow:"0 2px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                <span style={{ fontWeight:700,fontSize:16 }}>🎒 מה להביא ליפן</span>
                <span style={{ fontSize:13,color:"#386641",fontWeight:700 }}>{Object.values(packing).filter(p=>p.done).length}/{Object.values(packing).length}</span>
              </div>
              <div style={{ height:5,background:"#f0ede8",borderRadius:5,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${Object.values(packing).length?Object.values(packing).filter(p=>p.done).length/Object.values(packing).length*100:0}%`,background:"linear-gradient(90deg,#386641,#52B788)",borderRadius:5,transition:"width 0.5s" }}/>
              </div>
            </div>

            {Object.values(packing).length===0 ? (
              <div style={{ textAlign:"center",color:"#ccc",padding:"40px 0",fontSize:14 }}>הרשימה ריקה – לחץ ✏️ עריכה והוסף פריטים</div>
            ) : (
              [...new Set(Object.values(packing).map(p=>p.cat))].map(cat=>(
                <div key={cat} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11,letterSpacing:2,color:"#bbb",marginBottom:7,textTransform:"uppercase" }}>{cat}</div>
                  <div style={{ background:"#fff",borderRadius:14,overflow:"hidden",border:"1px solid #ede9e4",boxShadow:"0 1px 8px rgba(0,0,0,0.04)" }}>
                    {Object.values(packing).filter(p=>p.cat===cat).map(item=>(
                      <div key={item.id} className="check-row" onClick={()=>togglePacking(item.id)}>
                        <div style={{ width:22,height:22,borderRadius:7,flexShrink:0,border:`2px solid ${item.done?"#386641":"#ddd"}`,background:item.done?"#386641":"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",transition:"all .2s",cursor:"pointer" }}>
                          {item.done&&"✓"}
                        </div>
                        <div style={{ flex:1,fontSize:14,color:item.done?"#bbb":"#333",textDecoration:item.done?"line-through":"none" }}>{item.text}</div>
                        {editMode&&<button className="edit-btn" style={{ color:"#C1121F",borderColor:"#FFCDD2",background:"#FFF5F5" }} onClick={e=>{e.stopPropagation();deletePackingItem(item.id);}}>🗑️</button>}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
            <button onClick={addPackingItem} style={{ width:"100%",padding:"13px",background:"#F0F7F0",border:"2px dashed #B7DFC0",borderRadius:14,color:"#386641",fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif",fontWeight:600,marginTop:8 }}>
              + הוסף פריט
            </button>
            <div style={{ textAlign:"center",fontSize:12,color:"#ccc",marginTop:12 }}>✦ הרשימה משותפת לכל המשפחה</div>
          </div>
        )}
      </div>

      {selectedAttr&&<AttractionModal attr={selectedAttr} onClose={()=>setSelectedAttr(null)}/>}
      {editDay&&<EditDayModal {...editDay} onSave={(d)=>saveDay(editDay.partId,editDay.dayIdx,d)} onClose={()=>setEditDay(null)}/>}
      {editCheck&&<EditCheckModal item={editCheck} onSave={saveCheckItem} onClose={()=>setEditCheck(null)}/>}
      {addNote&&<AddNoteModal {...addNote} onSave={(t)=>saveNote(addNote.partId,addNote.dayIdx,t)} onClose={()=>setAddNote(null)}/>}
    </div>
  );
}

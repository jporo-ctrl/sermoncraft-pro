import { useState, createContext, useContext } from "react";

// ══════════════════════════════════════════════════════════
//  BROWSER TAB — TITLE + FAVICON
// ══════════════════════════════════════════════════════════
(() => {
  if (typeof document === "undefined") return;

  // Set page title
  document.title = "R4 — Remember the Word";

  // Inject SVG favicon (gold cross on dark circle)
  if (!document.getElementById("cw-favicon")) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="32" fill="#0d0a1a"/>
      <rect x="29" y="10" width="6" height="44" rx="3" fill="#c9a84c"/>
      <rect x="14" y="22" width="36" height="6" rx="3" fill="#c9a84c"/>
    </svg>`;
    const encoded = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    const link = document.createElement("link");
    link.id = "cw-favicon";
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = encoded;
    document.head.appendChild(link);
  }
})();

// ══════════════════════════════════════════════════════════
//  FONT & GLOBAL CSS
// ══════════════════════════════════════════════════════════
(() => {
  if (typeof document === "undefined") return;
  if (!document.getElementById("cw-fonts")) {
    const l = document.createElement("link");
    l.id = "cw-fonts"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap";
    document.head.appendChild(l);
  }
  if (!document.getElementById("cw-css")) {
    const s = document.createElement("style");
    s.id = "cw-css";
    s.textContent = `
      *,*::before,*::after{box-sizing:border-box}
      html,body{margin:0;padding:0;height:100%;overflow:hidden}
      #root{height:100%}
      .cw{font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
      .serif{font-family:'Cormorant Garamond',serif}
      .scr{overflow-y:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
      .scr::-webkit-scrollbar{display:none}
      input,textarea{font-family:'DM Sans',sans-serif;outline:none;background:none}
      button{cursor:pointer;border:none;background:none;font-family:'DM Sans',sans-serif;padding:0}
      @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      @keyframes scaleIn{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
      @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
      .fu{animation:fadeUp 0.42s ease both}
      .si{animation:scaleIn 0.32s ease both}
      .su{animation:slideUp 0.38s cubic-bezier(0.34,1.05,0.64,1) both}
    `;
    document.head.appendChild(s);
  }
})();

// ══════════════════════════════════════════════════════════
//  THEMES
// ══════════════════════════════════════════════════════════
const DARK = {
  mode:"dark",
  bg:"#0d0a1a", surf:"#121022", card:"#19162e", cardH:"#201d3c",
  border:"#272049", borderL:"#342d5c",
  gold:"#c9a84c", goldL:"#e8d5a3", goldD:"#7a5e1e",
  goldBg:"#c9a84c12", goldBgH:"#c9a84c22",
  cream:"#ede4d0", text2:"#8a7ca0", muted:"#4e4668",
  green:"#5ab98a", greenB:"#5ab98a18",
  red:"#d85858", redB:"#d8585818",
  blue:"#5a95d8", blueB:"#5a95d818",
  purple:"#8b6bc4", purpleB:"#8b6bc418",
  orange:"#d4834a", orangeB:"#d4834a18",
  inputBg:"#121022", shadow:"rgba(0,0,0,0.5)",
  noteBody:"#b0a4c4", noteText:"#c8bdd8",
};

const LIGHT = {
  mode:"light",
  bg:"#f5f0e8", surf:"#ede7db", card:"#ffffff", cardH:"#faf7f1",
  border:"#ddd3c0", borderL:"#ccc0a8",
  gold:"#8a5f10", goldL:"#5e3e08", goldD:"#c9a84c",
  goldBg:"#8a5f1012", goldBgH:"#8a5f1020",
  cream:"#1c1208", text2:"#7a6245", muted:"#b09878",
  green:"#1e7a4a", greenB:"#1e7a4a14",
  red:"#b03030", redB:"#b0303014",
  blue:"#2a5fa8", blueB:"#2a5fa814",
  purple:"#6b3fa8", purpleB:"#6b3fa814",
  orange:"#b85a10", orangeB:"#b85a1014",
  inputBg:"#ede7db", shadow:"rgba(0,0,0,0.12)",
  noteBody:"#6b5840", noteText:"#5a4530",
};

// ══════════════════════════════════════════════════════════
//  THEME CONTEXT
// ══════════════════════════════════════════════════════════
const ThemeCtx = createContext(DARK);
const useTheme = () => useContext(ThemeCtx);

// ══════════════════════════════════════════════════════════
//  DATA
// ══════════════════════════════════════════════════════════
const ERAS = [
  { id:1, icon:"🌍", name:"Creation & The Fall",    ref:"Genesis 1–11",             lessons:8,  done:8,  accent_d:"#5a95d8", accent_l:"#2a5fa8", desc:"In the beginning, God created the heavens and the earth. Explore creation, humanity's God-given purpose, and the first fracture between Creator and creation.", themes:["Creation","Sin","Covenant Promise","Human Dignity"], keyVerses:["Genesis 1:1","Genesis 3:15"], charIds:[] },
  { id:2, icon:"⭐", name:"The Patriarchs",          ref:"Genesis 12 – Exodus 1",    lessons:14, done:7,  accent_d:"#8b6bc4", accent_l:"#6b3fa8", desc:"Through Abraham, Isaac, Jacob, and Joseph, God builds a covenant people. Providence runs through family dysfunction, deception, and extraordinary faith.", themes:["Covenant","Faith","Providence","Family"], keyVerses:["Genesis 12:1–3","Genesis 50:20"], charIds:["abraham"] },
  { id:3, icon:"🔥", name:"Moses & The Exodus",     ref:"Exodus – Deuteronomy",     lessons:16, done:3,  accent_d:"#c9a84c", accent_l:"#8a5f10", desc:"God raises up a deliverer. Ten plagues, the Passover lamb, the Red Sea crossing, Mount Sinai, and the Law that defines a holy nation.", themes:["Deliverance","Law","Holiness","Tabernacle"], keyVerses:["Exodus 14:14","Deuteronomy 6:4–5"], charIds:["moses"] },
  { id:4, icon:"⚔️", name:"Conquest & Judges",     ref:"Joshua – Ruth",            lessons:11, done:0,  accent_d:"#d85858", accent_l:"#b03030", desc:"Israel enters Canaan under Joshua. The Judges era follows — a painful cycle of sin, oppression, repentance, and deliverance.", themes:["Promise","Obedience","Cycles","Redemption"], keyVerses:["Joshua 1:9","Ruth 1:16"], charIds:[] },
  { id:5, icon:"👑", name:"United Kingdom",         ref:"1 Samuel – 1 Kings 11",    lessons:13, done:0,  accent_d:"#5ab98a", accent_l:"#1e7a4a", desc:"Saul, David, and Solomon. Israel rises to her greatest height — and the seeds of her division are quietly planted in the court of the wisest king.", themes:["Kingship","Davidic Covenant","Temple","Wisdom"], keyVerses:["1 Samuel 16:7","Psalm 23:1"], charIds:["david"] },
  { id:6, icon:"💔", name:"Divided Kingdom",        ref:"1 Kings 12 – 2 Kings 25",  lessons:15, done:0,  accent_d:"#d4834a", accent_l:"#b85a10", desc:"The kingdom tears in two. Prophets warn kings and commoners alike. Israel falls to Assyria. Judah falls to Babylon. The land goes silent.", themes:["Division","Idolatry","Prophecy","Judgment"], keyVerses:["2 Chronicles 7:14","Jeremiah 29:11"], charIds:[] },
  { id:7, icon:"🌊", name:"Exile & The Prophets",  ref:"Jeremiah, Ezekiel, Daniel", lessons:13, done:0,  accent_d:"#5a95d8", accent_l:"#2a5fa8", desc:"God's people in Babylon. Daniel refuses to bow, Ezekiel sees visions of glory, and Jeremiah weeps over Jerusalem — yet hope burns in the darkness.", themes:["Exile","Suffering","New Covenant","Hope"], keyVerses:["Jeremiah 29:11","Daniel 3:17–18"], charIds:[] },
  { id:8, icon:"🏛️", name:"Return & Restoration",  ref:"Ezra, Nehemiah, Esther",   lessons:9,  done:0,  accent_d:"#8b6bc4", accent_l:"#6b3fa8", desc:"A remnant returns from exile. Nehemiah rebuilds the walls, Ezra restores the Law, and Esther risks her life for her people.", themes:["Restoration","Faithfulness","Courage","Prayer"], keyVerses:["Nehemiah 8:10","Esther 4:14"], charIds:[] },
  { id:9, icon:"✝️",  name:"The Life of Jesus",    ref:"Matthew, Mark, Luke, John", lessons:22, done:0,  accent_d:"#c9a84c", accent_l:"#8a5f10", desc:"The fullness of time. God becomes flesh. The four gospels woven in chronological harmony — from Bethlehem through Galilee, Jerusalem, the Cross, and the Empty Tomb.", themes:["Incarnation","Kingdom of God","Atonement","Resurrection"], keyVerses:["John 1:14","John 3:16"], charIds:[] },
  { id:10,icon:"🕊️", name:"Early Church & Paul",   ref:"Acts – Revelation",         lessons:20, done:0,  accent_d:"#5ab98a", accent_l:"#1e7a4a", desc:"The Spirit poured out at Pentecost. Paul's three missionary journeys. Letters from prison. John's vision on Patmos. The story of God charges forward.", themes:["Holy Spirit","Mission","Grace","Eternity"], keyVerses:["Acts 1:8","Romans 8:28"], charIds:["paul"] },
];

const CHARACTERS = [
  { id:"paul", name:"Paul the Apostle", era:"Early Church", icon:"✉️", lifespan:"c. 5 – 67 AD",
    summary:"Pharisee turned apostle. No figure shaped the written theology of Christianity more than Paul — thirteen letters, three missionary journeys, and a theology of grace that changed the world.",
    sections:[
      { title:"Early Life & Education", content:"Born Saul in Tarsus, a Roman citizen and son of a Pharisee. Educated at the feet of Gamaliel in Jerusalem — the Harvard of Jewish learning. His devotion to Torah was absolute, his knowledge formidable. He was exactly who you would not expect God to choose." },
      { title:"The Damascus Road", content:"En route to Damascus to arrest Christians, the risen Jesus appeared to him in blinding light. 'Saul, Saul, why do you persecute me?' Three days of darkness followed. Ananias prayed, scales fell from his eyes, and the persecutor became the proclaimer." },
      { title:"First Missionary Journey", content:"With Barnabas from Antioch: Cyprus, Pisidian Antioch, Iconium, Lystra, Derbe. The first systematic Gentile mission. In Lystra he was stoned and left for dead outside the city. He got up and walked back in." },
      { title:"Second Journey", content:"With Silas: Syria, Cilicia, then west to Macedonia. Philippi — jail, earthquake, the jailer's family baptized at midnight. Thessalonica. Berea. Athens on Mars Hill. Corinth for 18 months. He writes 1 & 2 Thessalonians here." },
      { title:"Third Journey", content:"Ephesus becomes his base for nearly 3 years — the longest he stayed anywhere. He writes 1 & 2 Corinthians, Galatians, and Romans during this stretch. A riot by the silversmiths of Artemis ends it." },
      { title:"Prison Epistles", content:"Arrested in Jerusalem, held in Caesarea for two years, he appeals to Caesar. Under house arrest in Rome he writes Philippians, Colossians, Ephesians, and Philemon — his most tender letters, from his most confined circumstances." },
      { title:"Legacy & Martyrdom", content:"Tradition holds he was beheaded in Rome under Nero around 67 AD. He left 13 letters, the theological backbone of the New Testament. He gave us justification by faith, the body of Christ, and the surpassing worth of knowing Christ." },
    ], letters:["Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon"] },
  { id:"moses", name:"Moses", era:"Exodus", icon:"🔥", lifespan:"c. 1391–1271 BC",
    summary:"Drawn from the Nile, raised in Pharaoh's courts, humbled in Midian for 40 years, then called from a burning bush to lead two million people out of the oldest superpower on earth.",
    sections:[
      { title:"Birth & The Nile", content:"Born during Pharaoh's genocide of Hebrew infant boys. His mother hid him three months, then placed him in a basket on the Nile. Pharaoh's daughter found him, named him Moses — 'drawn out of water' — and raised him as royalty in the palace that enslaved his people." },
      { title:"Flight to Midian", content:"At 40, after killing an Egyptian taskmaster, Moses fled to the Midianite wilderness. He married Zipporah, fathered a son, and spent 40 years as a shepherd — learning humility in the silence of the desert. The man who would lead millions first learned to follow sheep." },
      { title:"The Burning Bush", content:"On Horeb, the mountain of God, a bush burned without being consumed. 'Take off your sandals — the ground you stand on is holy.' God declared his name: I AM WHO I AM. Moses made five excuses. God answered every one." },
      { title:"The Ten Plagues", content:"God's power displayed through ten escalating signs: water to blood, frogs, lice, flies, livestock disease, boils, hail, locusts, three days of darkness, and finally — the death of every firstborn. Each plague targeted a specific Egyptian deity." },
      { title:"Exodus & Red Sea", content:"The Passover lamb's blood on the doorposts. Israel free after 430 years. Pharaoh's army in pursuit. The sea opens — walls of water on both sides. Two million people cross on dry ground. The sea closes. Israel's first song of worship erupts on the far shore." },
      { title:"Sinai & The Law", content:"Forty days on the mountain, twice. The Ten Commandments. The covenant. Detailed blueprints for the Tabernacle — God's dwelling among his people. Moses' face shone after being in God's presence so brightly the people could not look at him." },
      { title:"The Wilderness & Canaan's Edge", content:"Israel's repeated rebellion led to 40 years of wandering. Moses struck the rock in anger at Meribah, was disqualified from entering Canaan. He saw it from Mount Nebo, and died there. God buried him — and no one knows where." },
    ], letters:[] },
  { id:"david", name:"King David", era:"United Kingdom", icon:"👑", lifespan:"c. 1040–970 BC",
    summary:"Shepherd, warrior, poet, adulterer, murderer, repenter, king — and above all, a man after God's own heart. David's story is the most complete portrait of grace in the Old Testament.",
    sections:[
      { title:"The Shepherd of Bethlehem", content:"Youngest of eight sons of Jesse, overlooked even at his own anointing. While his brothers stood tall, Samuel waited. 'Is there another?' Yes — the one with the sheep. God's eye for people defies human logic: 'The Lord looks at the heart.'" },
      { title:"Goliath", content:"For 40 days Israel's army cowered before the Philistine giant. David arrived with cheese for his brothers. He had no armor, no military training. He ran toward Goliath with five smooth stones and a sling and the conviction that the battle belonged to the Lord." },
      { title:"Saul's Court & Years of Exile", content:"Brought to the palace after the victory, befriended by Jonathan in a covenant of love, and then hunted for years by Saul's jealousy. David lived in caves, in foreign courts, at the edge of survival. He had two opportunities to kill Saul and took neither." },
      { title:"King, City, and the Ark", content:"Crowned first over Judah at Hebron, then over all Israel seven years later. He captured Jerusalem from the Jebusites and made it his capital. He brought the Ark of the Covenant back with singing and dancing — leaping before the Lord with abandon." },
      { title:"Bathsheba & Nathan", content:"From the palace rooftop he saw her. He summoned her. When she was pregnant, he arranged for her husband Uriah to die in battle. Prophet Nathan told a parable about a stolen lamb and then said: 'You are the man.' David collapsed into Psalm 51." },
      { title:"The Davidic Covenant", content:"God made a covenant with David that echoes through all of Scripture: 'Your house and your kingdom will endure forever before me; your throne will be established forever.' Every prophet who spoke of a coming king was pointing at this promise. Jesus, Son of David, fulfills it." },
    ], letters:[] },
  { id:"abraham", name:"Abraham", era:"Patriarchs", icon:"⭐", lifespan:"c. 2166–1991 BC",
    summary:"Father of faith. Called at 75 from the comfort of Ur. Promised a son he waited 25 years to receive. Then asked to give that son back. The root from which three world religions grew.",
    sections:[
      { title:"The Call from Ur", content:"God spoke to Abram in Ur of the Chaldeans — one of the most advanced cities of the ancient world. 'Leave your country, your people, your father's household, and go to the land I will show you.' He went, not knowing where he was going. Faith moves before it sees." },
      { title:"The Covenant Cut", content:"God made a covenant with Abram in the ancient way — animals split in two, the parties walking between the pieces, pledging their lives to the agreement. But in a deep sleep, only God passed through the pieces. The covenant depended entirely on God, not on Abram." },
      { title:"Ishmael — The Shortcut", content:"A decade passed with no child. Sarai offered her servant Hagar. Abram agreed. Ishmael was born. The consequences of this one impatient decision — the tension between Isaac and Ishmael, between their descendants — reverberate through the Middle East to this day." },
      { title:"Renamed at 99", content:"Abram became Abraham — 'father of many nations.' Sarai became Sarah. Circumcision became the sign of the covenant. God promised Sarah a son within the year. She laughed. 'Is anything too hard for the Lord?'" },
      { title:"Isaac — The Impossible Gift", content:"At 100 years old, Abraham held his son. Sarah's laughter had changed — from the disbelief of impossibility to the joy of fulfilled promise. Isaac means 'laughter.' God had waited until the moment it was clearest: this birth was his doing, not human achievement." },
      { title:"The Binding of Isaac", content:"God tested Abraham with a command that would break any father: 'Take your son, your only son, whom you love — Isaac — and sacrifice him.' Abraham obeyed. He raised the knife. God stopped his hand and provided a ram in the thicket. This moment is the clearest Old Testament shadow of the cross." },
    ], letters:[] },
];

const WEEKLY_VERSES = [
  { day:"Monday", ref:"Romans 8:28", text:"And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", context:"Paul wrote Romans from Corinth in 57 AD, near the end of his third missionary journey. He had been shipwrecked, beaten, imprisoned, and stoned. 'All things' was not theoretical to him.", reflection:"What is the 'all thing' in your life right now that you need to trust God is working through?", prayer:"Lord, I confess I don't always see how you're working. Help me trust your purpose even in the things I don't understand. Amen.", mastery:72, words:["And","we","know","that","in","all","things","God","works","for","the","good","of","those","who","love","him,","who","have","been","called","according","to","his","purpose."] },
  { day:"Wednesday", ref:"Philippians 4:13", text:"I can do all this through him who gives me strength.", context:"Paul wrote Philippians from a Roman prison. It is his most joyful letter. He had learned the secret of contentment in any circumstance — not through willpower, but through union with Christ.", reflection:"Where in your life are you striving in your own strength rather than drawing from his?", prayer:"Jesus, I want to stop relying on myself and start drawing from you. Teach me what it means to live in your strength, not mine. Amen.", mastery:45, words:["I","can","do","all","this","through","him","who","gives","me","strength."] },
  { day:"Friday", ref:"Jeremiah 29:11", text:"For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", context:"God spoke these words to Israel — while they were in Babylon, in exile, with 70 more years ahead of them. This was not a word to comfortable people. It was hope spoken into devastation.", reflection:"Can you trust a future you cannot see, planned by a God who has never once been wrong?", prayer:"Father, I choose to trust your plans over my fears. Even when I can't see the way forward, you do. I rest in that today. Amen.", mastery:20, words:["For","I","know","the","plans","I","have","for","you,","declares","the","Lord,","plans","to","prosper","you","and","not","to","harm","you,","plans","to","give","you","hope","and","a","future."] },
];

const VERSE_VAULT = [
  { ref:"John 3:16",      text:"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", mastery:100, week:"Week 1" },
  { ref:"Psalm 23:1",     text:"The Lord is my shepherd, I lack nothing.", mastery:100, week:"Week 2" },
  { ref:"Romans 3:23",    text:"For all have sinned and fall short of the glory of God.", mastery:96, week:"Week 3" },
  { ref:"Matthew 6:33",   text:"But seek first his kingdom and his righteousness, and all these things will be given to you as well.", mastery:89, week:"Week 4" },
  { ref:"Proverbs 3:5–6", text:"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", mastery:82, week:"Week 5" },
  { ref:"Isaiah 40:31",   text:"But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", mastery:75, week:"Week 6" },
  { ref:"Psalm 46:1",     text:"God is our refuge and strength, an ever-present help in trouble.", mastery:68, week:"Week 7" },
];

const TODAY_DEVOTIONAL = {
  verse:"Exodus 14:14", verseText:"The Lord will fight for you; you need only to be still.",
  title:"When the Sea Is Before You",
  body:`The Israelites stood with Pharaoh's army thundering behind them and the Red Sea spread wide before them. Every natural instinct screamed panic, fight, or flee. God said something stranger: be still.\n\nThere are seasons in life where you have exhausted every resource, tried every strategy, called every person you know — and you are simply out of moves. This is not a failure of faith. This is the posture God has been preparing you for.\n\nBeing still is not passive resignation. It is the most active form of trust available to a human being — the deliberate choice to stop striving, stop controlling, and let God be God in your impossible situation. Moses had done everything God asked. Now it was time to watch.\n\nThe sea opened. It always does. Just not always when we expect it.`,
  question:"What battle in your life are you trying to fight that God is asking you to surrender to him?",
  prayer:"Lord, teach me to be still when everything in me wants to run or fight. I trust that you are fighting for me even when I cannot see it. Let the sea open in your time. Amen.",
};

const WATCH_HOURS = [
  { time:"6:00 AM",  label:"Morning Watch", icon:"🌅", done:true,  mode:"read",    tip:"Read the full verse. Let it anchor your day before anything else touches you." },
  { time:"9:00 AM",  label:"Third Hour",    icon:"🕘", done:true,  mode:"context", tip:"Read it again. Today, hold the historical context in mind as you recite." },
  { time:"12:00 PM", label:"Sixth Hour",    icon:"☀️", done:false, mode:"fill",    tip:"Fill in the missing words. Let your memory do the work." },
  { time:"3:00 PM",  label:"Ninth Hour",    icon:"🕒", done:false, mode:"recall",  tip:"Just the reference. Say the verse aloud from memory." },
  { time:"6:00 PM",  label:"Evening Watch", icon:"🌆", done:false, mode:"reflect", tip:"Full verse + reflection. Let it close your day as it opened it." },
];

const SAMPLE_NOTES = [
  { id:1, title:"Paul's Prison Joy",      verse:"Philippians 1:21", body:"How does a man write his most joyful letter from prison? Because joy isn't dependent on circumstances — it's dependent on the object of your hope. Paul's hope was Christ. Death itself couldn't take that from him.\n\nFor to me, to live is Christ and to die is gain.", date:"Mar 28, 2025", tag:"Paul" },
  { id:2, title:"The Red Sea Pattern",    verse:"Exodus 14:14",     body:"I keep seeing this pattern throughout Scripture — God waits until human options are exhausted. The Red Sea. The empty tomb. Lazarus four days dead. Gideon's 300 men.\n\nHe doesn't just solve problems. He dismantles them in ways that leave no room for anyone else to take credit.", date:"Mar 25, 2025", tag:"Exodus" },
  { id:3, title:"What God sees in David", verse:"1 Samuel 16:7",    body:"When Samuel went to anoint a king, he saw Eliab — tall, firstborn, impressive. God saw right past him. 'People look at the outward appearance, but the Lord looks at the heart.'\n\nThis means God has seen everything in me too. The parts no one else sees. And he still chose.", date:"Mar 20, 2025", tag:"David" },
];

const STATS = { streak:14, versesMemorized:21, lessonsCompleted:18, totalTime:"42h", currentEra:"The Patriarchs", masteryAvg:78 };

// ══════════════════════════════════════════════════════════
//  ICONS
// ══════════════════════════════════════════════════════════
const Icon = {
  Home:   ({sz=20,c="#fff"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Book:   ({sz=20,c="#fff"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Cross:  ({sz=20,c="#fff"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="5" y1="8" x2="19" y2="8"/></svg>,
  Edit:   ({sz=20,c="#fff"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  User:   ({sz=20,c="#fff"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Bell:   ({sz=20,c="#fff"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Check:  ({sz=20,c="#fff"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Arrow:  ({sz=20,c="#fff"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Back:   ({sz=20,c="#fff"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Share:  ({sz=20,c="#fff"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Plus:   ({sz=20,c="#fff"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Close:  ({sz=20,c="#fff"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Search: ({sz=20,c="#fff"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Lock:   ({sz=20,c="#fff"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Sun:    ({sz=20,c="#fff"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon:   ({sz=20,c="#fff"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
};

// ══════════════════════════════════════════════════════════
//  REUSABLE COMPONENTS (all theme-aware)
// ══════════════════════════════════════════════════════════
const Badge = ({ label, color, bg }) => {
  const C = useTheme();
  const col = color || C.gold;
  return <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600, letterSpacing:"0.04em", color:col, background: bg || col+"22" }}>{label}</span>;
};

const ProgressBar = ({ pct, color, height=4 }) => {
  const C = useTheme();
  return (
    <div style={{ width:"100%", height, background:C.border, borderRadius:height }}>
      <div style={{ width:`${pct}%`, height:"100%", background:color||C.gold, borderRadius:height, transition:"width 0.6s ease" }}/>
    </div>
  );
};

const MasteryRing = ({ pct, size=56, color }) => {
  const C = useTheme();
  const col = color || C.gold;
  const r = (size-8)/2, circ = 2*Math.PI*r, dash = (pct/100)*circ;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth="4"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="4" strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round" style={{ transition:"stroke-dasharray 0.8s ease" }}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" style={{ fill:col, fontSize:size*0.22, fontWeight:600, fontFamily:"DM Sans,sans-serif", transform:`rotate(90deg)`, transformOrigin:`${size/2}px ${size/2}px` }}>{pct}%</text>
    </svg>
  );
};

const Pill = ({ children, active, onClick }) => {
  const C = useTheme();
  return (
    <button onClick={onClick} style={{ padding:"6px 16px", borderRadius:20, fontSize:13, fontWeight:500, border:"1px solid", borderColor:active?C.gold:C.border, background:active?C.goldBg:"transparent", color:active?C.gold:C.text2, transition:"all 0.2s" }}>{children}</button>
  );
};

const GoldBtn = ({ children, onClick, full, small }) => {
  const C = useTheme();
  return (
    <button onClick={onClick} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:`linear-gradient(135deg, ${C.gold}, ${C.goldD})`, color: C.mode==="dark" ? "#0d0a1a" : "#fff", fontWeight:600, fontSize:small?13:15, padding:small?"8px 20px":"13px 28px", borderRadius:14, width:full?"100%":"auto", boxShadow:`0 4px 20px ${C.gold}33`, transition:"transform 0.15s" }} onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>{children}</button>
  );
};

const OutlineBtn = ({ children, onClick, full, small, color }) => {
  const C = useTheme();
  const col = color || C.gold;
  return (
    <button onClick={onClick} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, border:`1px solid ${col}44`, borderRadius:14, color:col, fontWeight:500, fontSize:small?12:14, padding:small?"8px 18px":"11px 24px", width:full?"100%":"auto", background:col+"0a", transition:"all 0.2s" }}>{children}</button>
  );
};

const Toggle = ({ val, onToggle }) => {
  const C = useTheme();
  return (
    <button onClick={onToggle} style={{ width:44, height:24, borderRadius:12, background:val?C.gold:C.border, position:"relative", transition:"background 0.25s", flexShrink:0 }}>
      <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:val?23:3, transition:"left 0.25s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
    </button>
  );
};

// ══════════════════════════════════════════════════════════
//  HOME SCREEN
// ══════════════════════════════════════════════════════════
function HomeScreen({ onNavigate }) {
  const C = useTheme();
  const [devExpanded, setDevExpanded] = useState(false);
  const dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
  const isWatchDay = ["Monday","Wednesday","Friday"].includes(dayName);
  const doneCount = WATCH_HOURS.filter(w=>w.done).length;

  return (
    <div className="scr fu" style={{ padding:"0 0 20px" }}>
      {/* Hero Verse Card */}
      <div style={{ margin:"16px 16px 0", borderRadius:20, background: C.mode==="dark" ? "linear-gradient(145deg,#1e1a3a,#0f0c21)" : "linear-gradient(145deg,#fff8ee,#fff)", border:`1px solid ${C.border}`, padding:"24px 22px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%", background:C.gold+"0a", filter:"blur(30px)" }}/>
        <div style={{ position:"relative" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
            <div>
              <p style={{ fontSize:11, letterSpacing:"0.12em", color:C.text2, marginBottom:4, fontWeight:500 }}>TODAY'S VERSE · {dayName.toUpperCase()}</p>
              <p style={{ fontSize:13, color:C.gold, fontWeight:600 }}>{TODAY_DEVOTIONAL.verse}</p>
            </div>
            {isWatchDay && <Badge label="Watch Day" color={C.gold}/>}
          </div>
          <p className="serif" style={{ fontSize:22, lineHeight:1.55, color:C.cream, fontStyle:"italic", fontWeight:400, marginBottom:20 }}>"{TODAY_DEVOTIONAL.verseText}"</p>
          <div style={{ display:"flex", gap:10 }}>
            <GoldBtn small onClick={()=>onNavigate("memorize")}>Practice Today's Verse</GoldBtn>
            <OutlineBtn small onClick={()=>setDevExpanded(!devExpanded)} color={C.text2}>{devExpanded?"Less":"Read More"}</OutlineBtn>
          </div>
        </div>
      </div>

      {devExpanded && (
        <div className="fu" style={{ margin:"0 16px", background:C.card, border:`1px solid ${C.border}`, borderTop:"none", borderRadius:"0 0 20px 20px", padding:"20px 22px" }}>
          <p className="serif" style={{ fontSize:21, fontWeight:600, color:C.cream, marginBottom:16 }}>{TODAY_DEVOTIONAL.title}</p>
          {TODAY_DEVOTIONAL.body.split("\n\n").map((para,i)=><p key={i} style={{ fontSize:14.5, lineHeight:1.8, color:C.noteText, marginBottom:14 }}>{para}</p>)}
          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
            <p style={{ fontSize:12, color:C.gold, fontWeight:600, marginBottom:8, letterSpacing:"0.06em" }}>REFLECT</p>
            <p style={{ fontSize:14, lineHeight:1.7, color:C.cream, fontStyle:"italic" }}>"{TODAY_DEVOTIONAL.question}"</p>
          </div>
          <div style={{ marginTop:16, background:C.goldBg, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
            <p style={{ fontSize:12, color:C.gold, fontWeight:600, marginBottom:6, letterSpacing:"0.06em" }}>TODAY'S PRAYER</p>
            <p style={{ fontSize:13.5, lineHeight:1.7, color:C.noteText, fontStyle:"italic" }}>{TODAY_DEVOTIONAL.prayer}</p>
          </div>
          <div style={{ marginTop:16 }}><OutlineBtn full color={C.gold}><Icon.Share sz={15} c={C.gold}/> Share</OutlineBtn></div>
        </div>
      )}

      {isWatchDay && (
        <div style={{ margin:"16px 16px 0", background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:"18px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:C.cream }}>⏱ Today's Watch Hours</p>
              <p style={{ fontSize:12, color:C.text2, marginTop:2 }}>{doneCount}/5 completed</p>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {WATCH_HOURS.map((w,i)=>(
                <div key={i} style={{ width:28, height:28, borderRadius:"50%", border:`2px solid ${w.done?C.gold:C.border}`, background:w.done?C.goldBg:"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {w.done?<Icon.Check sz={12} c={C.gold}/>:<span style={{ fontSize:10, color:C.muted }}>{i+1}</span>}
                </div>
              ))}
            </div>
          </div>
          <ProgressBar pct={(doneCount/5)*100}/>
          {WATCH_HOURS.map((w,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, marginTop:10, padding:"8px 12px", borderRadius:10, background:w.done?C.greenB:"transparent" }}>
              <span style={{ fontSize:18, width:24 }}>{w.icon}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:500, color:w.done?C.green:C.cream }}>{w.time} · {w.label}</p>
                <p style={{ fontSize:11, color:C.text2, marginTop:1 }}>{w.tip}</p>
              </div>
              {w.done&&<Icon.Check sz={14} c={C.green}/>}
            </div>
          ))}
        </div>
      )}

      <div style={{ margin:"16px 16px 0", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        {[{label:"Day Streak",value:STATS.streak,icon:"🔥",color:C.orange},{label:"Memorized",value:STATS.versesMemorized,icon:"✝️",color:C.gold},{label:"Lessons",value:STATS.lessonsCompleted,icon:"📖",color:C.blue}].map((s,i)=>(
          <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"16px 12px", textAlign:"center" }}>
            <p style={{ fontSize:22 }}>{s.icon}</p>
            <p style={{ fontSize:24, fontWeight:700, color:s.color, lineHeight:1.1, marginTop:4 }}>{s.value}</p>
            <p style={{ fontSize:11, color:C.text2, marginTop:3 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ margin:"16px 16px 0", background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:"18px 20px" }}>
        <p style={{ fontSize:12, color:C.text2, letterSpacing:"0.08em", marginBottom:10 }}>CURRENTLY STUDYING</p>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:28 }}>⭐</span>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:15, fontWeight:600, color:C.cream }}>The Patriarchs</p>
            <p style={{ fontSize:12, color:C.text2, marginTop:2 }}>Genesis 12 – Exodus 1 · Lesson 7 of 14</p>
            <div style={{ marginTop:8 }}><ProgressBar pct={50} color={C.purple}/></div>
          </div>
        </div>
        <div style={{ marginTop:16 }}><GoldBtn full onClick={()=>onNavigate("study")}>Continue Lesson <Icon.Arrow sz={14} c={C.mode==="dark"?"#0d0a1a":"#fff"}/></GoldBtn></div>
      </div>

      <div style={{ margin:"16px 16px 0", background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:"18px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <p style={{ fontSize:13, fontWeight:600, color:C.cream }}>This Week's Verses</p>
          <button onClick={()=>onNavigate("memorize")} style={{ fontSize:12, color:C.gold, fontWeight:500 }}>View All →</button>
        </div>
        {WEEKLY_VERSES.map((v,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:i<2?10:0 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:v.mastery>60?C.greenB:C.goldBg, border:`1px solid ${v.mastery>60?C.green+"44":C.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <p style={{ fontSize:11, color:v.mastery>60?C.green:C.gold, fontWeight:600 }}>{v.day.slice(0,3)}</p>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:600, color:C.cream, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{v.ref}</p>
              <div style={{ marginTop:4 }}><ProgressBar pct={v.mastery} color={v.mastery>60?C.green:C.gold} height={3}/></div>
            </div>
            <p style={{ fontSize:12, color:C.text2, flexShrink:0 }}>{v.mastery}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  STUDY SCREEN
// ══════════════════════════════════════════════════════════
function StudyScreen() {
  const C = useTheme();
  const [view, setView] = useState("eras");
  const [selectedEra, setSelectedEra] = useState(null);
  const [selectedChar, setSelectedChar] = useState(null);
  const [mode, setMode] = useState("standard");
  const [tab, setTab] = useState("timeline");

  const totalLessons = ERAS.reduce((a,e)=>a+e.lessons,0);
  const doneLessons  = ERAS.reduce((a,e)=>a+e.done,0);
  const getAccent = (era) => C.mode==="dark" ? era.accent_d : era.accent_l;

  if (view==="character" && selectedChar) {
    const ch = CHARACTERS.find(c=>c.id===selectedChar);
    return (
      <div className="scr fu" style={{ padding:"0 0 20px" }}>
        <div style={{ padding:"16px 16px 0" }}>
          <button onClick={()=>setView("eras")} style={{ display:"flex", alignItems:"center", gap:6, color:C.text2, fontSize:13, marginBottom:16 }}><Icon.Back sz={16} c={C.text2}/> All Eras</button>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:"22px 20px", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
              <div style={{ width:56, height:56, borderRadius:16, background:C.goldBg, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{ch.icon}</div>
              <div>
                <p className="serif" style={{ fontSize:26, fontWeight:700, color:C.cream, lineHeight:1.2 }}>{ch.name}</p>
                <p style={{ fontSize:12, color:C.gold, marginTop:4 }}>{ch.era} · {ch.lifespan}</p>
              </div>
            </div>
            <p style={{ fontSize:14, lineHeight:1.75, color:C.noteText, marginTop:16 }}>{ch.summary}</p>
            {ch.letters.length>0&&(
              <div style={{ marginTop:14 }}>
                <p style={{ fontSize:11, letterSpacing:"0.08em", color:C.text2, marginBottom:8 }}>LETTERS WRITTEN</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{ch.letters.map(l=><Badge key={l} label={l} color={C.gold}/>)}</div>
              </div>
            )}
          </div>
          {ch.sections.map((sec,i)=>(
            <div key={i} className="fu" style={{ animationDelay:`${i*0.05}s`, background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"18px", marginBottom:10 }}>
              <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ width:28, height:28, borderRadius:8, background:C.goldBg, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:C.gold, fontWeight:700, flexShrink:0 }}>{i+1}</div>
                <div>
                  <p style={{ fontSize:14, fontWeight:600, color:C.cream, marginBottom:8 }}>{sec.title}</p>
                  <p style={{ fontSize:13.5, lineHeight:1.78, color:C.noteBody }}>{sec.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view==="era" && selectedEra) {
    const era = ERAS.find(e=>e.id===selectedEra);
    const accent = getAccent(era);
    const eraPct = Math.round((era.done/era.lessons)*100);
    const eraChars = CHARACTERS.filter(c=>era.charIds.includes(c.id));
    return (
      <div className="scr fu" style={{ padding:"0 0 20px" }}>
        <div style={{ padding:"16px 16px 0" }}>
          <button onClick={()=>setView("eras")} style={{ display:"flex", alignItems:"center", gap:6, color:C.text2, fontSize:13, marginBottom:16 }}><Icon.Back sz={16} c={C.text2}/> All Eras</button>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:"22px 20px", marginBottom:14, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${accent}, ${accent}44)` }}/>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
              <span style={{ fontSize:32 }}>{era.icon}</span>
              <div>
                <p className="serif" style={{ fontSize:24, fontWeight:700, color:C.cream }}>{era.name}</p>
                <p style={{ fontSize:13, color:accent, marginTop:2 }}>{era.ref}</p>
              </div>
            </div>
            <p style={{ fontSize:14, lineHeight:1.75, color:C.noteText, marginBottom:16 }}>{era.desc}</p>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <p style={{ fontSize:12, color:C.text2 }}>{era.done} of {era.lessons} lessons</p>
              <p style={{ fontSize:13, color:accent, fontWeight:600 }}>{eraPct}%</p>
            </div>
            <ProgressBar pct={eraPct} color={accent}/>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:14 }}>
              {era.themes.map(t=><Badge key={t} label={t} color={accent}/>)}
            </div>
          </div>
          <p style={{ fontSize:12, letterSpacing:"0.08em", color:C.text2, marginBottom:10, paddingLeft:4 }}>KEY VERSES</p>
          {era.keyVerses.map((v,i)=>(
            <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 16px", marginBottom:8, display:"flex", alignItems:"center", gap:12 }}>
              <Icon.Cross sz={16} c={accent}/><p style={{ fontSize:14, color:C.cream }}>{v}</p>
            </div>
          ))}
          {eraChars.length>0&&(
            <>
              <p style={{ fontSize:12, letterSpacing:"0.08em", color:C.text2, marginTop:14, marginBottom:10, paddingLeft:4 }}>CHARACTER DEEP DIVE</p>
              {eraChars.map(ch=>(
                <button key={ch.id} onClick={()=>{setSelectedChar(ch.id);setView("character");}} style={{ width:"100%", background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"16px", marginBottom:8, display:"flex", alignItems:"center", gap:14, textAlign:"left" }}>
                  <span style={{ fontSize:24 }}>{ch.icon}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:15, fontWeight:600, color:C.cream }}>{ch.name}</p>
                    <p style={{ fontSize:12, color:C.text2, marginTop:2 }}>{ch.sections.length} chapters · Full life study</p>
                  </div>
                  <Icon.Arrow sz={16} c={C.text2}/>
                </button>
              ))}
            </>
          )}
          <p style={{ fontSize:12, letterSpacing:"0.08em", color:C.text2, marginTop:14, marginBottom:10, paddingLeft:4 }}>LESSONS</p>
          {Array.from({length:era.lessons},(_,i)=>{
            const isDone=i<era.done, isNext=i===era.done;
            return (
              <div key={i} style={{ background:isNext?C.goldBg:C.card, border:`1px solid ${isNext?C.gold+"44":C.border}`, borderRadius:13, padding:"14px 16px", marginBottom:8, display:"flex", alignItems:"center", gap:12, opacity:isDone||isNext?1:0.5 }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:isDone?C.greenB:isNext?C.goldBg:C.surf, border:`2px solid ${isDone?C.green:isNext?C.gold:C.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {isDone?<Icon.Check sz={13} c={C.green}/>:<span style={{ fontSize:12, color:isNext?C.gold:C.text2, fontWeight:600 }}>{i+1}</span>}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:isNext?600:400, color:isNext?C.cream:isDone?C.text2:C.muted }}>Lesson {i+1}{isNext?" · Continue":""}</p>
                </div>
                {!isDone&&!isNext&&<Icon.Lock sz={14} c={C.muted}/>}
                {isNext&&<Icon.Arrow sz={14} c={C.gold}/>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="scr fu" style={{ padding:"0 0 20px" }}>
      <div style={{ padding:"16px 16px 0" }}>
        <div style={{ background:C.surf, border:`1px solid ${C.border}`, borderRadius:14, padding:4, display:"flex", marginBottom:16 }}>
          {["standard","deep"].map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{ flex:1, padding:"8px", borderRadius:10, fontSize:13, fontWeight:500, background:mode===m?C.card:"transparent", color:mode===m?C.cream:C.text2, border:`1px solid ${mode===m?C.border:"transparent"}`, transition:"all 0.2s" }}>
              {m==="standard"?"📖 Standard":"🔬 Deep Study"}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          <Pill active={tab==="timeline"} onClick={()=>setTab("timeline")}>Timeline</Pill>
          <Pill active={tab==="characters"} onClick={()=>setTab("characters")}>Characters</Pill>
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"16px 18px", marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <p style={{ fontSize:13, color:C.cream, fontWeight:500 }}>Bible Journey Progress</p>
            <p style={{ fontSize:13, color:C.gold, fontWeight:600 }}>{doneLessons}/{totalLessons}</p>
          </div>
          <ProgressBar pct={Math.round((doneLessons/totalLessons)*100)} height={6}/>
          <p style={{ fontSize:12, color:C.text2, marginTop:8 }}>Studying chronologically · {10-ERAS.filter(e=>e.done===e.lessons).length} eras remaining</p>
        </div>

        {tab==="timeline"&&ERAS.map((era,i)=>{
          const accent=getAccent(era), pct=Math.round((era.done/era.lessons)*100), done=era.done===era.lessons, locked=i>0&&ERAS[i-1].done<ERAS[i-1].lessons*0.5;
          return (
            <button key={era.id} onClick={()=>{if(!locked){setSelectedEra(era.id);setView("era");}}} className="fu" style={{ animationDelay:`${i*0.04}s`, width:"100%", display:"flex", alignItems:"flex-start", gap:14, background:C.card, border:`1px solid ${done?C.green+"33":C.border}`, borderRadius:18, padding:"16px", marginBottom:10, textAlign:"left", opacity:locked?0.5:1, position:"relative", overflow:"hidden" }}>
              {done&&<div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.green}, ${C.green}44)` }}/>}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:accent+"18", border:`1.5px solid ${accent}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{era.icon}</div>
                {i<ERAS.length-1&&<div style={{ width:2, height:24, background:done?C.green+"44":C.border, borderRadius:1 }}/>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:15, fontWeight:600, color:C.cream, marginBottom:3 }}>{era.name}</p>
                <p style={{ fontSize:12, color:accent, marginBottom:6 }}>{era.ref}</p>
                <p style={{ fontSize:12.5, color:C.text2, lineHeight:1.6, marginBottom:8 }}>{era.desc.slice(0,90)}…</p>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ flex:1 }}><ProgressBar pct={pct} color={done?C.green:accent} height={3}/></div>
                  <p style={{ fontSize:11, color:done?C.green:C.text2, fontWeight:500, flexShrink:0 }}>{era.done}/{era.lessons}</p>
                </div>
              </div>
              <Icon.Arrow sz={16} c={locked?C.muted:C.text2}/>
            </button>
          );
        })}

        {tab==="characters"&&(
          <>
            <p style={{ fontSize:12, color:C.text2, marginBottom:14, lineHeight:1.6 }}>Full biographical studies — complete life arcs, not isolated moments.</p>
            {CHARACTERS.map((ch,i)=>(
              <button key={ch.id} onClick={()=>{setSelectedChar(ch.id);setView("character");}} className="fu" style={{ animationDelay:`${i*0.05}s`, width:"100%", background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"18px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:14, textAlign:"left" }}>
                <div style={{ width:52, height:52, borderRadius:15, background:C.goldBg, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{ch.icon}</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:15, fontWeight:600, color:C.cream }}>{ch.name}</p>
                  <p style={{ fontSize:12, color:C.gold, marginTop:2 }}>{ch.era}</p>
                  <p style={{ fontSize:12, color:C.text2, marginTop:4 }}>{ch.sections.length} chapters · {ch.letters.length>0?`${ch.letters.length} letters`:"Full life study"}</p>
                </div>
                <Icon.Arrow sz={16} c={C.text2}/>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  MEMORIZE SCREEN
// ══════════════════════════════════════════════════════════
function MemorizeScreen() {
  const C = useTheme();
  const [tab, setTab] = useState("week");
  const [activeIdx, setActiveIdx] = useState(0);
  const [practice, setPractice] = useState(null);
  const [revealCount, setRevealCount] = useState(0);
  const [typeInput, setTypeInput] = useState("");
  const [fillSelected, setFillSelected] = useState({});
  const [showResult, setShowResult] = useState(false);
  const verse = WEEKLY_VERSES[activeIdx];

  const reset = () => { setPractice(null); setRevealCount(0); setTypeInput(""); setFillSelected({}); setShowResult(false); };
  const BLANK_IDX = verse.words.reduce((acc,w,i)=>{ if(i%4===2||i%7===5) acc.push(i); return acc; },[]);
  const typeAcc = () => {
    if(!typeInput) return 0;
    const iw=typeInput.trim().toLowerCase().replace(/[.,!?;:]/g,"").split(/\s+/);
    const cw=verse.words.map(w=>w.toLowerCase().replace(/[.,!?;:]/g,""));
    let m=0; iw.forEach((w,i)=>{if(cw[i]===w)m++;}); return Math.round((m/cw.length)*100);
  };

  return (
    <div className="scr fu" style={{ padding:"0 0 20px" }}>
      <div style={{ padding:"16px 16px 0" }}>
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          <Pill active={tab==="week"} onClick={()=>setTab("week")}>This Week</Pill>
          <Pill active={tab==="vault"} onClick={()=>setTab("vault")}>Verse Vault ({VERSE_VAULT.length})</Pill>
        </div>

        {tab==="week"&&(
          <>
            <div style={{ background:C.goldBg, border:`1px solid ${C.gold}33`, borderRadius:14, padding:"12px 16px", marginBottom:16 }}>
              <p style={{ fontSize:13, color:C.gold, fontWeight:600, marginBottom:4 }}>⏰ Watch Hour System</p>
              <p style={{ fontSize:12.5, color:C.noteBody, lineHeight:1.6 }}>On Monday, Wednesday & Friday, you'll receive 5 reminders at 6am · 9am · 12pm · 3pm · 6pm — the biblical watch hours — each a different practice mode.</p>
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              {WEEKLY_VERSES.map((v,i)=>(
                <button key={i} onClick={()=>{setActiveIdx(i);reset();}} style={{ flex:1, padding:"10px 4px", borderRadius:12, border:`1px solid ${activeIdx===i?C.gold+"66":C.border}`, background:activeIdx===i?C.goldBg:C.card, textAlign:"center" }}>
                  <p style={{ fontSize:11, fontWeight:600, color:activeIdx===i?C.gold:C.text2 }}>{v.day.slice(0,3).toUpperCase()}</p>
                  <p style={{ fontSize:10, color:C.text2, marginTop:2 }}>{v.mastery}%</p>
                </button>
              ))}
            </div>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:"22px 20px", marginBottom:14, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${C.gold}, ${C.gold}44)` }}/>
              <p style={{ fontSize:12, color:C.text2, letterSpacing:"0.08em", marginBottom:6 }}>{verse.day.toUpperCase()} · {verse.ref}</p>
              <p className="serif" style={{ fontSize:20, lineHeight:1.65, color:C.cream, fontStyle:"italic", marginBottom:16 }}>"{verse.text}"</p>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <p style={{ fontSize:12, color:C.text2 }}>Mastery</p>
                <p style={{ fontSize:13, color:verse.mastery>60?C.green:C.gold, fontWeight:600 }}>{verse.mastery}%</p>
              </div>
              <ProgressBar pct={verse.mastery} color={verse.mastery>60?C.green:C.gold}/>
            </div>
            <div style={{ background:C.surf, border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 16px", marginBottom:16 }}>
              <p style={{ fontSize:11, color:C.gold, fontWeight:600, letterSpacing:"0.06em", marginBottom:6 }}>CONTEXT</p>
              <p style={{ fontSize:13.5, lineHeight:1.75, color:C.noteText }}>{verse.context}</p>
            </div>

            {!practice&&(
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:12, color:C.text2, letterSpacing:"0.08em", marginBottom:12 }}>PRACTICE MODE</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                  {[{mode:"reveal",icon:"👁",label:"Reveal",desc:"Word by word"},{mode:"fill",icon:"✏️",label:"Fill In",desc:"Fill blanks"},{mode:"type",icon:"⌨️",label:"Type It",desc:"From memory"}].map(p=>(
                    <button key={p.mode} onClick={()=>setPractice(p.mode)} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"16px 10px", textAlign:"center" }}>
                      <p style={{ fontSize:24, marginBottom:6 }}>{p.icon}</p>
                      <p style={{ fontSize:13, fontWeight:600, color:C.cream }}>{p.label}</p>
                      <p style={{ fontSize:11, color:C.text2, marginTop:3 }}>{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {practice==="reveal"&&(
              <div className="si" style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:"22px 20px", marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:C.cream }}>👁 Reveal Mode</p>
                  <button onClick={reset} style={{ color:C.text2, fontSize:12 }}>Done</button>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
                  {verse.words.map((word,i)=>(
                    <span key={i} onClick={()=>setRevealCount(Math.max(revealCount,i+1))} style={{ padding:"5px 10px", borderRadius:8, fontSize:15, fontWeight:i<revealCount?400:600, color:i<revealCount?C.cream:"transparent", background:i<revealCount?"transparent":C.gold, border:`1px solid ${i<revealCount?C.border:"transparent"}`, cursor:"pointer", transition:"all 0.3s", userSelect:"none" }}>{i<revealCount?word:"___"}</span>
                  ))}
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <OutlineBtn full color={C.gold} onClick={()=>setRevealCount(0)}>Reset</OutlineBtn>
                  <GoldBtn full onClick={()=>setRevealCount(verse.words.length)}>Reveal All</GoldBtn>
                </div>
              </div>
            )}

            {practice==="fill"&&(
              <div className="si" style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:"22px 20px", marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:C.cream }}>✏️ Fill In The Blanks</p>
                  <button onClick={reset} style={{ color:C.text2, fontSize:12 }}>Done</button>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20, lineHeight:2 }}>
                  {verse.words.map((word,i)=>{
                    const isBlank=BLANK_IDX.includes(i), chosen=fillSelected[i]!==undefined;
                    if(isBlank) return <button key={i} onClick={()=>setFillSelected(prev=>({...prev,[i]:word}))} style={{ minWidth:60, padding:"4px 10px", borderRadius:8, fontSize:14, color:chosen?C.green:C.gold, border:`1.5px dashed ${chosen?C.green:C.gold}`, background:chosen?C.greenB:C.goldBg, fontWeight:600 }}>{chosen?word:"___"}</button>;
                    return <span key={i} style={{ fontSize:15, color:C.cream, padding:"4px 0" }}>{word}</span>;
                  })}
                </div>
                <GoldBtn full onClick={()=>setFillSelected(BLANK_IDX.reduce((acc,i)=>({...acc,[i]:verse.words[i]}),{}))}>Show Answers</GoldBtn>
              </div>
            )}

            {practice==="type"&&(
              <div className="si" style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:"22px 20px", marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:C.cream }}>⌨️ Type From Memory</p>
                  <button onClick={reset} style={{ color:C.text2, fontSize:12 }}>Done</button>
                </div>
                <p style={{ fontSize:13, color:C.gold, fontWeight:500, marginBottom:12 }}>{verse.ref}</p>
                <textarea value={typeInput} onChange={e=>{setTypeInput(e.target.value);setShowResult(false);}} placeholder="Type the verse from memory…" style={{ width:"100%", minHeight:110, background:C.surf, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px", fontSize:14.5, color:C.cream, lineHeight:1.7, resize:"vertical" }}/>
                {!showResult
                  ?<div style={{ marginTop:12 }}><GoldBtn full onClick={()=>setShowResult(true)}>Check My Answer</GoldBtn></div>
                  :<div style={{ marginTop:14 }}>
                    <div style={{ background:typeAcc()>=70?C.greenB:C.redB, border:`1px solid ${typeAcc()>=70?C.green+"44":C.red+"44"}`, borderRadius:12, padding:"14px 16px", marginBottom:12 }}>
                      <p style={{ fontSize:24, fontWeight:700, color:typeAcc()>=70?C.green:C.red }}>{typeAcc()}% accurate</p>
                      <p style={{ fontSize:13, color:C.text2, marginTop:4 }}>{typeAcc()>=90?"Excellent! Nearly mastered.":typeAcc()>=70?"Good progress. Keep going.":"Keep practicing — repetition is the key."}</p>
                    </div>
                    <div style={{ background:C.surf, borderRadius:12, padding:"14px 16px" }}>
                      <p style={{ fontSize:11, color:C.text2, marginBottom:6, letterSpacing:"0.06em" }}>CORRECT VERSE</p>
                      <p className="serif" style={{ fontSize:16, lineHeight:1.7, color:C.cream, fontStyle:"italic" }}>{verse.text}</p>
                    </div>
                    <div style={{ marginTop:12 }}><OutlineBtn full color={C.gold} onClick={()=>{setTypeInput("");setShowResult(false);}}>Try Again</OutlineBtn></div>
                  </div>
                }
              </div>
            )}

            <div style={{ background:C.surf, border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 16px", marginBottom:14 }}>
              <p style={{ fontSize:11, color:C.gold, fontWeight:600, letterSpacing:"0.06em", marginBottom:6 }}>REFLECT</p>
              <p style={{ fontSize:13.5, lineHeight:1.75, color:C.cream, fontStyle:"italic" }}>"{verse.reflection}"</p>
            </div>
            <div style={{ background:C.goldBg, border:`1px solid ${C.gold}22`, borderRadius:14, padding:"14px 16px" }}>
              <p style={{ fontSize:11, color:C.gold, fontWeight:600, letterSpacing:"0.06em", marginBottom:6 }}>PRAYER</p>
              <p style={{ fontSize:13, lineHeight:1.75, color:C.noteBody, fontStyle:"italic" }}>{verse.prayer}</p>
            </div>
          </>
        )}

        {tab==="vault"&&(
          <>
            <p style={{ fontSize:13, color:C.text2, lineHeight:1.6, marginBottom:14 }}>Every verse you've committed to memory. Reviewed periodically through spaced repetition.</p>
            {VERSE_VAULT.map((v,i)=>(
              <div key={i} className="fu" style={{ animationDelay:`${i*0.04}s`, background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"18px", marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:C.gold }}>{v.ref}</p>
                    <p style={{ fontSize:11, color:C.text2, marginTop:2 }}>{v.week}</p>
                  </div>
                  <MasteryRing pct={v.mastery} size={48} color={v.mastery>=90?C.green:C.gold}/>
                </div>
                <p className="serif" style={{ fontSize:15, lineHeight:1.7, color:C.noteText, fontStyle:"italic", marginBottom:12 }}>"{v.text}"</p>
                <div style={{ display:"flex", gap:8 }}>
                  <OutlineBtn small color={C.gold}><Icon.Cross sz={13} c={C.gold}/> Review</OutlineBtn>
                  <OutlineBtn small color={C.text2}><Icon.Share sz={13} c={C.text2}/> Share</OutlineBtn>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  NOTES SCREEN
// ══════════════════════════════════════════════════════════
function NotesScreen() {
  const C = useTheme();
  const [notes, setNotes] = useState(SAMPLE_NOTES);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editVerse, setEditVerse] = useState("");
  const [editBody, setEditBody] = useState("");

  const openNew = () => { setEditTitle(""); setEditVerse(""); setEditBody(""); setEditing("new"); };
  const openEdit = n => { setEditTitle(n.title); setEditVerse(n.verse); setEditBody(n.body); setEditing(n); };
  const save = () => {
    if(editing==="new") setNotes(prev=>[{ id:Date.now(), title:editTitle||"Untitled", verse:editVerse, body:editBody, date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}), tag:"General" },...prev]);
    else setNotes(prev=>prev.map(n=>n.id===editing.id?{...n,title:editTitle,verse:editVerse,body:editBody}:n));
    setEditing(null);
  };

  const filtered = notes.filter(n=>n.title.toLowerCase().includes(search.toLowerCase())||n.body.toLowerCase().includes(search.toLowerCase()));

  if(editing) return (
    <div className="scr su" style={{ padding:"0 0 20px" }}>
      <div style={{ padding:"16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <button onClick={()=>setEditing(null)} style={{ color:C.text2, fontSize:14 }}>Cancel</button>
          <p style={{ fontSize:15, fontWeight:600, color:C.cream }}>{editing==="new"?"New Note":"Edit Note"}</p>
          <button onClick={save} style={{ color:C.gold, fontSize:14, fontWeight:600 }}>Save</button>
        </div>
        <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} placeholder="Note title…" style={{ width:"100%", background:"transparent", fontSize:22, fontWeight:700, color:C.cream, borderBottom:`1px solid ${C.border}`, paddingBottom:12, marginBottom:14, fontFamily:"'Cormorant Garamond',serif" }}/>
        <input value={editVerse} onChange={e=>setEditVerse(e.target.value)} placeholder="Scripture reference…" style={{ width:"100%", background:C.surf, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:C.gold, marginBottom:14 }}/>
        <textarea value={editBody} onChange={e=>setEditBody(e.target.value)} placeholder="Write your thoughts…" style={{ width:"100%", minHeight:280, background:"transparent", fontSize:15, color:C.noteText, lineHeight:1.85, resize:"none", borderTop:`1px solid ${C.border}`, paddingTop:14 }}/>
      </div>
    </div>
  );

  return (
    <div className="scr fu" style={{ padding:"0 0 20px" }}>
      <div style={{ padding:"16px 16px 0" }}>
        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          <div style={{ flex:1, background:C.surf, border:`1px solid ${C.border}`, borderRadius:12, padding:"10px 14px", display:"flex", gap:10, alignItems:"center" }}>
            <Icon.Search sz={16} c={C.muted}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search notes…" style={{ flex:1, fontSize:14, color:C.cream }}/>
          </div>
          <button onClick={openNew} style={{ width:44, height:44, borderRadius:12, background:C.goldBg, border:`1px solid ${C.gold}44`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Icon.Plus sz={20} c={C.gold}/></button>
        </div>
        {filtered.length===0&&(
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <p style={{ fontSize:36, marginBottom:14 }}>📝</p>
            <p className="serif" style={{ fontSize:22, color:C.cream, marginBottom:8 }}>No notes yet</p>
            <p style={{ fontSize:14, color:C.text2, lineHeight:1.6, marginBottom:20 }}>Your thoughts, questions, and observations as you study the Word.</p>
            <GoldBtn onClick={openNew}><Icon.Plus sz={14} c={C.mode==="dark"?"#0d0a1a":"#fff"}/> Write Your First Note</GoldBtn>
          </div>
        )}
        {filtered.map((note,i)=>(
          <div key={note.id} className="fu" style={{ animationDelay:`${i*0.04}s`, background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:"18px", marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:16, fontWeight:700, color:C.cream, marginBottom:4 }}>{note.title}</p>
                {note.verse&&<p style={{ fontSize:12, color:C.gold, fontWeight:500 }}>{note.verse}</p>}
              </div>
              <button onClick={()=>openEdit(note)} style={{ padding:6, marginLeft:8 }}><Icon.Edit sz={15} c={C.text2}/></button>
            </div>
            <p style={{ fontSize:13.5, lineHeight:1.75, color:C.noteBody, marginBottom:14, display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{note.body}</p>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <Badge label={note.tag} color={C.purple}/><p style={{ fontSize:11, color:C.muted }}>{note.date}</p>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button><Icon.Share sz={14} c={C.text2}/></button>
                <button onClick={()=>setNotes(prev=>prev.filter(n=>n.id!==note.id))} style={{ padding:4 }}><Icon.Close sz={14} c={C.red}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  PROFILE SCREEN
// ══════════════════════════════════════════════════════════
function ProfileScreen({ onToggleTheme }) {
  const C = useTheme();
  const [notif, setNotif] = useState({ mwf:true, tue:false, thu:false, sat:false, sun:false, h6a:true, h9a:true, h12p:true, h3p:true, h6p:true });
  const [studyMode, setStudyMode] = useState("standard");
  const tog = k => setNotif(prev=>({...prev,[k]:!prev[k]}));

  return (
    <div className="scr fu" style={{ padding:"0 0 20px" }}>
      <div style={{ padding:"16px 16px 0" }}>
        {/* Profile Header */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:"22px 20px", marginBottom:16, textAlign:"center" }}>
          <div style={{ width:72, height:72, borderRadius:"50%", background:`linear-gradient(135deg, ${C.gold}, ${C.goldD})`, margin:"0 auto 14px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>✝️</div>
          <p className="serif" style={{ fontSize:22, fontWeight:700, color:C.cream }}>Joshua</p>
          <p style={{ fontSize:13, color:C.text2, marginTop:4 }}>Member since January 2025</p>
          <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:12 }}>
            <Badge label="14 Day Streak 🔥" color={C.orange}/>
            <Badge label="Deep Learner" color={C.purple}/>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[{label:"Day Streak",val:STATS.streak,icon:"🔥",color:C.orange},{label:"Verses Memorized",val:STATS.versesMemorized,icon:"✝️",color:C.gold},{label:"Lessons Done",val:STATS.lessonsCompleted,icon:"📖",color:C.blue},{label:"Study Hours",val:STATS.totalTime,icon:"⏱",color:C.green},{label:"Avg. Mastery",val:`${STATS.masteryAvg}%`,icon:"🧠",color:C.purple},{label:"Current Era",val:"Patriarchs",icon:"⭐",color:C.text2}].map((s,i)=>(
            <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 16px" }}>
              <p style={{ fontSize:18, marginBottom:6 }}>{s.icon}</p>
              <p style={{ fontSize:20, fontWeight:700, color:s.color }}>{s.val}</p>
              <p style={{ fontSize:11, color:C.text2, marginTop:3 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Theme Toggle */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:"18px", marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:C.cream }}>
                {C.mode==="dark" ? "🌙 Dark Theme" : "☀️ Light Theme"}
              </p>
              <p style={{ fontSize:12, color:C.text2, marginTop:3 }}>Switch between light and dark mode</p>
            </div>
            <Toggle val={C.mode==="dark"} onToggle={onToggleTheme}/>
          </div>
        </div>

        {/* Study Mode */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:"18px", marginBottom:14 }}>
          <p style={{ fontSize:14, fontWeight:600, color:C.cream, marginBottom:4 }}>Study Mode</p>
          <p style={{ fontSize:12, color:C.text2, lineHeight:1.6, marginBottom:14 }}>Standard for most learners. Deep Study adds Hebrew/Greek notes, historical-critical context, and theological commentary.</p>
          <div style={{ background:C.surf, borderRadius:12, padding:4, display:"flex" }}>
            {["standard","deep"].map(m=>(
              <button key={m} onClick={()=>setStudyMode(m)} style={{ flex:1, padding:"8px", borderRadius:8, fontSize:13, fontWeight:500, background:studyMode===m?C.card:"transparent", color:studyMode===m?C.cream:C.text2, border:`1px solid ${studyMode===m?C.border:"transparent"}` }}>
                {m==="standard"?"📖 Standard":"🔬 Deep Study"}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:"18px", marginBottom:14 }}>
          <p style={{ fontSize:14, fontWeight:600, color:C.cream, marginBottom:4 }}>🔔 Watch Hour Notifications</p>
          <p style={{ fontSize:12, color:C.text2, lineHeight:1.6, marginBottom:16 }}>Monday, Wednesday & Friday are your core memorization days. Each watch hour sends a different practice prompt.</p>
          <p style={{ fontSize:11, color:C.gold, letterSpacing:"0.08em", marginBottom:10, fontWeight:600 }}>WATCH TIMES (Mon / Wed / Fri)</p>
          {[{key:"h6a",label:"6:00 AM · Morning Watch",icon:"🌅"},{key:"h9a",label:"9:00 AM · Third Hour",icon:"🕘"},{key:"h12p",label:"12:00 PM · Sixth Hour",icon:"☀️"},{key:"h3p",label:"3:00 PM · Ninth Hour",icon:"🕒"},{key:"h6p",label:"6:00 PM · Evening Watch",icon:"🌆"}].map(t=>(
            <div key={t.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:12, marginBottom:12, borderBottom:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ fontSize:18 }}>{t.icon}</span>
                <p style={{ fontSize:13, color:C.cream }}>{t.label}</p>
              </div>
              <Toggle val={notif[t.key]} onToggle={()=>tog(t.key)}/>
            </div>
          ))}
          <p style={{ fontSize:11, color:C.text2, letterSpacing:"0.08em", marginBottom:10, fontWeight:600 }}>OPTIONAL DAYS</p>
          {[{key:"tue",label:"Tuesday"},{key:"thu",label:"Thursday"},{key:"sat",label:"Saturday"},{key:"sun",label:"Sunday"}].map(d=>(
            <div key={d.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:10, marginBottom:10, borderBottom:`1px solid ${C.border}` }}>
              <p style={{ fontSize:13, color:notif[d.key]?C.cream:C.text2 }}>{d.label}</p>
              <Toggle val={notif[d.key]} onToggle={()=>tog(d.key)}/>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:"14px 18px", marginBottom:14 }}>
          {[{label:"Share Your Progress",icon:"📲",color:C.blue},{label:"Bible Maps & Geography",icon:"🗺️",color:C.green},{label:"Reading Plans",icon:"📅",color:C.purple},{label:"Invite a Friend",icon:"🤝",color:C.gold}].map((a,i)=>(
            <button key={i} style={{ width:"100%", display:"flex", alignItems:"center", gap:14, padding:"13px 0", borderBottom:i<3?`1px solid ${C.border}`:"none" }}>
              <span style={{ fontSize:20, width:28 }}>{a.icon}</span>
              <p style={{ fontSize:14, color:C.cream, flex:1, textAlign:"left" }}>{a.label}</p>
              <Icon.Arrow sz={14} c={C.text2}/>
            </button>
          ))}
        </div>
        <div style={{ textAlign:"center", paddingTop:8 }}>
          <p style={{ fontSize:12, color:C.muted }}>R4 — Remember the Word · Free forever</p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  BOTTOM NAV
// ══════════════════════════════════════════════════════════
function BottomNav({ tab, setTab }) {
  const C = useTheme();
  const items = [
    { key:"home",     Ico:Icon.Home,  label:"Home" },
    { key:"study",    Ico:Icon.Book,  label:"Study" },
    { key:"memorize", Ico:Icon.Cross, label:"Memorize" },
    { key:"notes",    Ico:Icon.Edit,  label:"Notes" },
    { key:"profile",  Ico:Icon.User,  label:"Profile" },
  ];
  return (
    <div style={{ display:"flex", borderTop:`1px solid ${C.border}`, background:C.surf, paddingBottom:"env(safe-area-inset-bottom,8px)", flexShrink:0 }}>
      {items.map(({key,Ico,label})=>{
        const active=tab===key;
        return (
          <button key={key} onClick={()=>setTab(key)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 4px", position:"relative" }}>
            {active&&<div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:2, background:C.gold, borderRadius:"0 0 3px 3px" }}/>}
            <Ico sz={20} c={active?C.gold:C.muted}/>
            <p style={{ fontSize:10, color:active?C.gold:C.muted, fontWeight:active?600:400, letterSpacing:"0.02em" }}>{label}</p>
          </button>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("home");
  const [theme, setTheme] = useState("dark");
  const C = theme==="dark" ? DARK : LIGHT;
  const toggleTheme = () => setTheme(t=>t==="dark"?"light":"dark");

  const titles = { home:"R4", study:"Bible Study", memorize:"Memorize", notes:"My Notes", profile:"Profile" };

  return (
    <ThemeCtx.Provider value={C}>
      <div className="cw" style={{ display:"flex", flexDirection:"column", height:"100%", maxWidth:430, margin:"0 auto", background:C.bg, transition:"background 0.3s" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px 12px", borderBottom:`1px solid ${C.border}`, background:C.surf, flexShrink:0, transition:"background 0.3s" }}>
          {tab==="home"
            ?<p className="serif" style={{ fontSize:22, fontWeight:700, background:`linear-gradient(135deg, ${C.gold}, ${C.goldL})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>R4</p>
            :<p style={{ fontSize:17, fontWeight:600, color:C.cream }}>{titles[tab]}</p>
          }
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {/* Theme toggle in header */}
            <button onClick={toggleTheme} style={{ width:36, height:36, borderRadius:10, background:C.goldBg, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
              {theme==="dark"
                ?<Icon.Sun sz={16} c={C.gold}/>
                :<Icon.Moon sz={16} c={C.gold}/>
              }
            </button>
            <button style={{ width:36, height:36, borderRadius:10, background:C.goldBg, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon.Bell sz={17} c={C.gold}/>
            </button>
          </div>
        </div>

        {/* Screen */}
        <div className="scr" style={{ flex:1, minHeight:0 }} key={tab}>
          {tab==="home"     && <HomeScreen onNavigate={setTab}/>}
          {tab==="study"    && <StudyScreen/>}
          {tab==="memorize" && <MemorizeScreen/>}
          {tab==="notes"    && <NotesScreen/>}
          {tab==="profile"  && <ProfileScreen onToggleTheme={toggleTheme}/>}
        </div>

        <BottomNav tab={tab} setTab={setTab}/>
      </div>
    </ThemeCtx.Provider>
  );
}

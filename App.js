/* ═══════════════════════════════════════════
   CRIMELENS — app.js
   ═══════════════════════════════════════════ */

const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
const ANTHROPIC_API_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE';

// ─── EMAILJS CONFIG ───────────────────────────
// SETUP STEPS:
// 1. Go to https://www.emailjs.com and create a free account
// 2. Add Email Service → connect Gmail → copy Service ID below
// 3. Create Email Template → use variables shown below → copy Template ID
// 4. Go to Account → API Keys → copy Public Key below
const EMAILJS_PUBLIC_KEY  = 'QsANelzaX2Xzm1gky';
const EMAILJS_SERVICE_ID  = 'service_frz66ns';
const EMAILJS_TEMPLATE_ID = 'template_7lq5itq';

// Initialize EmailJS v4
window.addEventListener('load', function () {
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    console.log('✅ EmailJS initialized');
  } else {
    console.error('❌ EmailJS SDK not loaded — check CDN');
  }
});

// ─── AREA DATA HELPER ─────────────────────────
// Each area: { name, crimeRate (0-100), topCrime, reports }
// verdict derived from crimeRate: <35 = safe, 35-65 = caution, >65 = danger

const DISTRICT_AREAS = {
  'Chennai': [
    { name:'T. Nagar',       crimeRate:82, topCrime:'Theft',      reports:145 },
    { name:'Perambur',       crimeRate:75, topCrime:'Assault',    reports:112 },
    { name:'Koyambedu',      crimeRate:68, topCrime:'Theft',      reports:98  },
    { name:'Anna Nagar',     crimeRate:55, topCrime:'Cyber Crime', reports:72  },
    { name:'Adyar',          crimeRate:40, topCrime:'Vandalism',  reports:50  },
  ],
  'Coimbatore': [
    { name:'Gandhipuram',    crimeRate:72, topCrime:'Theft',      reports:88  },
    { name:'RS Puram',       crimeRate:58, topCrime:'Harassment', reports:64  },
    { name:'Peelamedu',      crimeRate:50, topCrime:'Cyber Crime', reports:52  },
    { name:'Singanallur',    crimeRate:42, topCrime:'Vandalism',  reports:40  },
    { name:'Saravanampatti', crimeRate:30, topCrime:'Theft',      reports:28  },
  ],
  'Madurai': [
    { name:'Mattuthavani',   crimeRate:80, topCrime:'Assault',    reports:102 },
    { name:'KK Nagar',       crimeRate:70, topCrime:'Theft',      reports:88  },
    { name:'Tallakulam',     crimeRate:62, topCrime:'Burglary',   reports:70  },
    { name:'Anna Nagar',     crimeRate:48, topCrime:'Vandalism',  reports:52  },
    { name:'Goripalayam',    crimeRate:35, topCrime:'Harassment', reports:38  },
  ],
  'Tiruchirappalli': [
    { name:'Srirangam',      crimeRate:65, topCrime:'Theft',      reports:75  },
    { name:'Thillai Nagar',  crimeRate:55, topCrime:'Cyber Crime', reports:60  },
    { name:'Ariyamangalam',  crimeRate:48, topCrime:'Vandalism',  reports:50  },
    { name:'Palpannai',      crimeRate:38, topCrime:'Assault',    reports:38  },
    { name:'Manachanallur',  crimeRate:28, topCrime:'Theft',      reports:26  },
  ],
  'Salem': [
    { name:'Shevapet',       crimeRate:75, topCrime:'Assault',    reports:90  },
    { name:'Suramangalam',   crimeRate:62, topCrime:'Theft',      reports:74  },
    { name:'Ammapet',        crimeRate:52, topCrime:'Burglary',   reports:58  },
    { name:'Kondalampatti',  crimeRate:40, topCrime:'Vandalism',  reports:42  },
    { name:'Omalur',         crimeRate:28, topCrime:'Theft',      reports:24  },
  ],
  'Tirunelveli': [
    { name:'Palayamkottai',  crimeRate:68, topCrime:'Theft',      reports:78  },
    { name:'Melapalayam',    crimeRate:58, topCrime:'Assault',    reports:62  },
    { name:'Pettai',         crimeRate:48, topCrime:'Harassment', reports:48  },
    { name:'Muthulakshmipuram', crimeRate:35, topCrime:'Vandalism', reports:34 },
    { name:'Nanguneri',      crimeRate:25, topCrime:'Theft',      reports:20  },
  ],
  'Vellore': [
    { name:'Katpadi',        crimeRate:70, topCrime:'Theft',      reports:80  },
    { name:'Sathuvachari',   crimeRate:60, topCrime:'Assault',    reports:65  },
    { name:'Gandhi Nagar',   crimeRate:50, topCrime:'Burglary',   reports:52  },
    { name:'Arumbakkam',     crimeRate:38, topCrime:'Vandalism',  reports:36  },
    { name:'Gudiyatham',     crimeRate:28, topCrime:'Theft',      reports:22  },
  ],
  'Erode': [
    { name:'Erode Town',     crimeRate:65, topCrime:'Theft',      reports:70  },
    { name:'Perundurai',     crimeRate:55, topCrime:'Vandalism',  reports:56  },
    { name:'Gobichettipalayam', crimeRate:45, topCrime:'Assault', reports:44  },
    { name:'Bhavani',        crimeRate:36, topCrime:'Burglary',   reports:34  },
    { name:'Anthiyur',       crimeRate:26, topCrime:'Theft',      reports:22  },
  ],
  'Tiruppur': [
    { name:'Tiruppur Town',  crimeRate:68, topCrime:'Cyber Crime', reports:72 },
    { name:'Palladam',       crimeRate:55, topCrime:'Theft',      reports:55  },
    { name:'Kangeyam',       crimeRate:45, topCrime:'Assault',    reports:43  },
    { name:'Dharapuram',     crimeRate:36, topCrime:'Vandalism',  reports:32  },
    { name:'Udumalaipettai', crimeRate:26, topCrime:'Theft',      reports:22  },
  ],
  'Thanjavur': [
    { name:'Thanjavur Town', crimeRate:60, topCrime:'Theft',      reports:65  },
    { name:'Kumbakonam',     crimeRate:50, topCrime:'Burglary',   reports:52  },
    { name:'Papanasam',      crimeRate:42, topCrime:'Assault',    reports:40  },
    { name:'Pattukottai',    crimeRate:32, topCrime:'Vandalism',  reports:30  },
    { name:'Thiruvaiyaru',   crimeRate:22, topCrime:'Theft',      reports:18  },
  ],
  'Dindigul': [
    { name:'Dindigul Town',  crimeRate:62, topCrime:'Theft',      reports:65  },
    { name:'Palani',         crimeRate:52, topCrime:'Harassment', reports:52  },
    { name:'Natham',         crimeRate:42, topCrime:'Assault',    reports:40  },
    { name:'Oddanchatram',   crimeRate:33, topCrime:'Vandalism',  reports:30  },
    { name:'Kodaikanal',     crimeRate:22, topCrime:'Theft',      reports:18  },
  ],
  'Kancheepuram': [
    { name:'Kancheepuram Town', crimeRate:68, topCrime:'Theft',   reports:75  },
    { name:'Sriperumbudur',  crimeRate:58, topCrime:'Burglary',   reports:62  },
    { name:'Uthiramerur',    crimeRate:46, topCrime:'Assault',    reports:46  },
    { name:'Walajabad',      crimeRate:36, topCrime:'Vandalism',  reports:34  },
    { name:'Maduranthagam',  crimeRate:26, topCrime:'Theft',      reports:22  },
  ],
  'Villupuram': [
    { name:'Villupuram Town',crimeRate:65, topCrime:'Theft',      reports:68  },
    { name:'Tindivanam',     crimeRate:54, topCrime:'Assault',    reports:54  },
    { name:'Gingee',         crimeRate:44, topCrime:'Burglary',   reports:42  },
    { name:'Kallakurichi',   crimeRate:34, topCrime:'Vandalism',  reports:30  },
    { name:'Ulundurpet',     crimeRate:24, topCrime:'Theft',      reports:20  },
  ],
  'Cuddalore': [
    { name:'Cuddalore Town', crimeRate:62, topCrime:'Theft',      reports:64  },
    { name:'Chidambaram',    crimeRate:50, topCrime:'Harassment', reports:50  },
    { name:'Panruti',        crimeRate:40, topCrime:'Assault',    reports:38  },
    { name:'Virudhachalam',  crimeRate:32, topCrime:'Vandalism',  reports:28  },
    { name:'Kattumannarkoil',crimeRate:22, topCrime:'Theft',      reports:18  },
  ],
  'Nagapattinam': [
    { name:'Nagapattinam Town', crimeRate:58, topCrime:'Theft',   reports:55  },
    { name:'Vedaranyam',     crimeRate:46, topCrime:'Assault',    reports:44  },
    { name:'Sirkali',        crimeRate:36, topCrime:'Vandalism',  reports:32  },
    { name:'Mayiladuthurai', crimeRate:28, topCrime:'Burglary',   reports:24  },
    { name:'Kilvelur',       crimeRate:18, topCrime:'Theft',      reports:14  },
  ],
  'Pudukkottai': [
    { name:'Pudukkottai Town',crimeRate:55, topCrime:'Theft',     reports:52  },
    { name:'Aranthangi',     crimeRate:44, topCrime:'Assault',    reports:40  },
    { name:'Karambakudi',    crimeRate:35, topCrime:'Vandalism',  reports:30  },
    { name:'Thirumayam',     crimeRate:26, topCrime:'Burglary',   reports:22  },
    { name:'Illuppur',       crimeRate:18, topCrime:'Theft',      reports:14  },
  ],
  'Ramanathapuram': [
    { name:'Ramanathapuram Town', crimeRate:60, topCrime:'Theft', reports:60  },
    { name:'Paramakudi',     crimeRate:50, topCrime:'Assault',    reports:48  },
    { name:'Rameswaram',     crimeRate:40, topCrime:'Burglary',   reports:36  },
    { name:'Kamuthi',        crimeRate:30, topCrime:'Vandalism',  reports:26  },
    { name:'Mudukulathur',   crimeRate:22, topCrime:'Harassment', reports:18  },
  ],
  'Virudhunagar': [
    { name:'Virudhunagar Town', crimeRate:65, topCrime:'Theft',   reports:68  },
    { name:'Sivakasi',       crimeRate:55, topCrime:'Assault',    reports:55  },
    { name:'Sattur',         crimeRate:44, topCrime:'Burglary',   reports:42  },
    { name:'Aruppukkottai',  crimeRate:34, topCrime:'Vandalism',  reports:30  },
    { name:'Rajapalayam',    crimeRate:24, topCrime:'Theft',      reports:20  },
  ],
  'Thoothukudi': [
    { name:'Thoothukudi Town', crimeRate:68, topCrime:'Theft',    reports:72  },
    { name:'Tiruchendur',    crimeRate:55, topCrime:'Assault',    reports:55  },
    { name:'Kovilpatti',     crimeRate:45, topCrime:'Burglary',   reports:43  },
    { name:'Ottapidaram',    crimeRate:35, topCrime:'Vandalism',  reports:32  },
    { name:'Srivaikuntam',   crimeRate:25, topCrime:'Theft',      reports:20  },
  ],
  'Kanyakumari': [
    { name:'Nagercoil',      crimeRate:50, topCrime:'Theft',      reports:45  },
    { name:'Colachel',       crimeRate:40, topCrime:'Assault',    reports:35  },
    { name:'Padmanabhapuram',crimeRate:30, topCrime:'Vandalism',  reports:25  },
    { name:'Thuckalay',      crimeRate:22, topCrime:'Burglary',   reports:18  },
    { name:'Marthandam',     crimeRate:15, topCrime:'Theft',      reports:12  },
  ],
  'Dharmapuri': [
    { name:'Dharmapuri Town', crimeRate:62, topCrime:'Theft',     reports:62  },
    { name:'Palacode',       crimeRate:52, topCrime:'Assault',    reports:50  },
    { name:'Pennagaram',     crimeRate:42, topCrime:'Burglary',   reports:38  },
    { name:'Harur',          crimeRate:32, topCrime:'Vandalism',  reports:28  },
    { name:'Nallampalli',    crimeRate:22, topCrime:'Theft',      reports:18  },
  ],
  'Krishnagiri': [
    { name:'Krishnagiri Town', crimeRate:68, topCrime:'Theft',    reports:70  },
    { name:'Hosur',          crimeRate:60, topCrime:'Cyber Crime', reports:62 },
    { name:'Denkanikottai',  crimeRate:48, topCrime:'Assault',    reports:46  },
    { name:'Bargur',         crimeRate:36, topCrime:'Vandalism',  reports:32  },
    { name:'Veppanahalli',   crimeRate:25, topCrime:'Theft',      reports:20  },
  ],
  'Namakkal': [
    { name:'Namakkal Town',  crimeRate:65, topCrime:'Theft',      reports:65  },
    { name:'Rasipuram',      crimeRate:54, topCrime:'Assault',    reports:52  },
    { name:'Tiruchengode',   crimeRate:44, topCrime:'Burglary',   reports:42  },
    { name:'Paramathi',      crimeRate:34, topCrime:'Vandalism',  reports:30  },
    { name:'Senthamangalam', crimeRate:24, topCrime:'Theft',      reports:20  },
  ],
  'Perambalur': [
    { name:'Perambalur Town', crimeRate:52, topCrime:'Theft',     reports:45  },
    { name:'Ariyalur',       crimeRate:42, topCrime:'Assault',    reports:36  },
    { name:'Kunnam',         crimeRate:33, topCrime:'Vandalism',  reports:28  },
    { name:'Veppanthattai',  crimeRate:24, topCrime:'Burglary',   reports:20  },
    { name:'Alathur',        crimeRate:16, topCrime:'Theft',      reports:13  },
  ],
  'Ariyalur': [
    { name:'Ariyalur Town',  crimeRate:54, topCrime:'Theft',      reports:46  },
    { name:'Sendurai',       crimeRate:44, topCrime:'Assault',    reports:38  },
    { name:'Andimadam',      crimeRate:34, topCrime:'Vandalism',  reports:28  },
    { name:'Jayankondam',    crimeRate:26, topCrime:'Burglary',   reports:22  },
    { name:'Udayarpalayam',  crimeRate:18, topCrime:'Theft',      reports:14  },
  ],
  'Sivaganga': [
    { name:'Sivaganga Town', crimeRate:60, topCrime:'Theft',      reports:58  },
    { name:'Karaikudi',      crimeRate:50, topCrime:'Assault',    reports:48  },
    { name:'Devakottai',     crimeRate:40, topCrime:'Burglary',   reports:36  },
    { name:'Manamadurai',    crimeRate:30, topCrime:'Vandalism',  reports:26  },
    { name:'Ilayangudi',     crimeRate:20, topCrime:'Theft',      reports:16  },
  ],
  'Tiruvarur': [
    { name:'Tiruvarur Town', crimeRate:55, topCrime:'Theft',      reports:50  },
    { name:'Nagapattinam',   crimeRate:45, topCrime:'Assault',    reports:40  },
    { name:'Papanasam',      crimeRate:35, topCrime:'Vandalism',  reports:30  },
    { name:'Valangaiman',    crimeRate:26, topCrime:'Burglary',   reports:22  },
    { name:'Mannargudi',     crimeRate:18, topCrime:'Theft',      reports:14  },
  ],
  'The Nilgiris': [
    { name:'Ooty',           crimeRate:45, topCrime:'Theft',      reports:38  },
    { name:'Coonoor',        crimeRate:35, topCrime:'Vandalism',  reports:28  },
    { name:'Kotagiri',       crimeRate:26, topCrime:'Assault',    reports:20  },
    { name:'Gudalur',        crimeRate:20, topCrime:'Burglary',   reports:14  },
    { name:'Udhagamandalam', crimeRate:14, topCrime:'Theft',      reports:10  },
  ],
  'Karur': [
    { name:'Karur Town',     crimeRate:60, topCrime:'Theft',      reports:58  },
    { name:'Kulithalai',     crimeRate:50, topCrime:'Assault',    reports:46  },
    { name:'Aravakurichi',   crimeRate:40, topCrime:'Burglary',   reports:36  },
    { name:'Krishnarayapuram',crimeRate:30,topCrime:'Vandalism',  reports:26  },
    { name:'Manmangalam',    crimeRate:20, topCrime:'Theft',      reports:16  },
  ],
  'Tiruvannamalai': [
    { name:'Tiruvannamalai Town', crimeRate:66, topCrime:'Theft', reports:68 },
    { name:'Polur',          crimeRate:55, topCrime:'Assault',    reports:55  },
    { name:'Arni',           crimeRate:44, topCrime:'Burglary',   reports:42  },
    { name:'Vembakkam',      crimeRate:34, topCrime:'Vandalism',  reports:30  },
    { name:'Kilpennathur',   crimeRate:24, topCrime:'Theft',      reports:20  },
  ],
  'Kallakurichi': [
    { name:'Kallakurichi Town', crimeRate:62, topCrime:'Theft',   reports:58  },
    { name:'Ulundurpet',     crimeRate:50, topCrime:'Assault',    reports:46  },
    { name:'Sankarapuram',   crimeRate:40, topCrime:'Vandalism',  reports:36  },
    { name:'Chinnasalem',    crimeRate:30, topCrime:'Burglary',   reports:26  },
    { name:'Tirukoilur',     crimeRate:20, topCrime:'Theft',      reports:16  },
  ],
  'Ranipet': [
    { name:'Ranipet Town',   crimeRate:65, topCrime:'Theft',      reports:65  },
    { name:'Arcot',          crimeRate:55, topCrime:'Assault',    reports:52  },
    { name:'Walajah',        crimeRate:44, topCrime:'Burglary',   reports:42  },
    { name:'Sholinghur',     crimeRate:34, topCrime:'Vandalism',  reports:30  },
    { name:'Nemili',         crimeRate:24, topCrime:'Theft',      reports:20  },
  ],
  'Tirupattur': [
    { name:'Tirupattur Town', crimeRate:60, topCrime:'Theft',     reports:60  },
    { name:'Vaniyambadi',    crimeRate:50, topCrime:'Assault',    reports:48  },
    { name:'Ambur',          crimeRate:42, topCrime:'Burglary',   reports:40  },
    { name:'Natrampalli',    crimeRate:32, topCrime:'Vandalism',  reports:28  },
    { name:'Jolarpettai',    crimeRate:22, topCrime:'Theft',      reports:18  },
  ],
  'Tenkasi': [
    { name:'Tenkasi Town',   crimeRate:58, topCrime:'Theft',      reports:55  },
    { name:'Shenkottai',     crimeRate:46, topCrime:'Assault',    reports:42  },
    { name:'Sankarankovil',  crimeRate:36, topCrime:'Burglary',   reports:32  },
    { name:'Kadayanallur',   crimeRate:28, topCrime:'Vandalism',  reports:24  },
    { name:'Courtallam',     crimeRate:18, topCrime:'Theft',      reports:14  },
  ],
  'Chengalpattu': [
    { name:'Chengalpattu Town', crimeRate:70, topCrime:'Theft',   reports:75  },
    { name:'Tambaram',       crimeRate:62, topCrime:'Cyber Crime', reports:64 },
    { name:'Maraimalai Nagar',crimeRate:50, topCrime:'Assault',   reports:50  },
    { name:'Vandalur',       crimeRate:40, topCrime:'Burglary',   reports:38  },
    { name:'Urapakkam',      crimeRate:28, topCrime:'Vandalism',  reports:24  },
  ],
  'Mayiladuthurai': [
    { name:'Mayiladuthurai Town', crimeRate:56, topCrime:'Theft', reports:52  },
    { name:'Sirkazhi',       crimeRate:45, topCrime:'Assault',    reports:40  },
    { name:'Kuthalam',       crimeRate:36, topCrime:'Vandalism',  reports:30  },
    { name:'Sembanarkoil',   crimeRate:27, topCrime:'Burglary',   reports:22  },
    { name:'Poompuhar',      crimeRate:18, topCrime:'Theft',      reports:14  },
  ],
  'Hosur': [
    { name:'Hosur Town',     crimeRate:72, topCrime:'Cyber Crime', reports:80 },
    { name:'Denkanikottai',  crimeRate:58, topCrime:'Theft',      reports:60  },
    { name:'Mathigiri',      crimeRate:48, topCrime:'Assault',    reports:46  },
    { name:'Shoolagiri',     crimeRate:36, topCrime:'Burglary',   reports:32  },
    { name:'Rayakottai',     crimeRate:24, topCrime:'Vandalism',  reports:20  },
  ],
};

// ─── TAMIL NADU DISTRICT BASE DATA ────────────
const TN_DISTRICTS = [
  { name:'Chennai',        lat:13.0827, lng:80.2707, crimes:{Theft:145,Assault:62,Vandalism:38,Cyber:75,Harassment:42,Burglary:30}, trend:[72,85,91,78,103,119,98,112,125,108,134,89], safety:32 },
  { name:'Coimbatore',     lat:11.0168, lng:76.9558, crimes:{Theft:98, Assault:44,Vandalism:22,Cyber:55,Harassment:28,Burglary:18}, trend:[45,52,61,48,70,80,65,72,88,74,90,60], safety:45 },
  { name:'Madurai',        lat:9.9252,  lng:78.1198, crimes:{Theft:88, Assault:50,Vandalism:30,Cyber:38,Harassment:35,Burglary:22}, trend:[40,48,55,42,65,72,58,68,80,65,82,52], safety:42 },
  { name:'Tiruchirappalli',lat:10.7905, lng:78.7047, crimes:{Theft:65, Assault:30,Vandalism:18,Cyber:28,Harassment:20,Burglary:14}, trend:[30,38,42,35,50,58,48,55,62,50,65,42], safety:55 },
  { name:'Salem',          lat:11.6643, lng:78.1460, crimes:{Theft:72, Assault:38,Vandalism:24,Cyber:30,Harassment:25,Burglary:16}, trend:[35,42,48,38,58,65,52,60,70,58,72,48], safety:50 },
  { name:'Tirunelveli',    lat:8.7139,  lng:77.7567, crimes:{Theft:55, Assault:28,Vandalism:15,Cyber:22,Harassment:18,Burglary:12}, trend:[25,30,36,28,42,48,38,45,52,42,55,35], safety:60 },
  { name:'Vellore',        lat:12.9165, lng:79.1325, crimes:{Theft:60, Assault:32,Vandalism:20,Cyber:25,Harassment:22,Burglary:14}, trend:[28,34,40,32,48,54,44,50,58,46,60,40], safety:54 },
  { name:'Erode',          lat:11.3410, lng:77.7172, crimes:{Theft:52, Assault:25,Vandalism:14,Cyber:20,Harassment:16,Burglary:10}, trend:[22,28,32,25,38,44,36,42,48,38,50,32], safety:63 },
  { name:'Tiruppur',       lat:11.1085, lng:77.3411, crimes:{Theft:48, Assault:22,Vandalism:12,Cyber:18,Harassment:14,Burglary:9},  trend:[20,25,30,22,35,40,32,38,45,35,48,30], safety:65 },
  { name:'Thanjavur',      lat:10.7870, lng:79.1378, crimes:{Theft:40, Assault:18,Vandalism:10,Cyber:15,Harassment:12,Burglary:8},  trend:[18,22,26,20,30,35,28,32,38,30,40,25], safety:70 },
  { name:'Dindigul',       lat:10.3673, lng:77.9803, crimes:{Theft:38, Assault:20,Vandalism:12,Cyber:14,Harassment:15,Burglary:8},  trend:[16,20,24,18,28,32,26,30,36,28,38,24], safety:68 },
  { name:'Kancheepuram',   lat:12.8185, lng:79.6947, crimes:{Theft:55, Assault:28,Vandalism:16,Cyber:22,Harassment:18,Burglary:12}, trend:[25,30,35,28,42,48,38,45,52,42,55,36], safety:58 },
  { name:'Villupuram',     lat:11.9401, lng:79.4861, crimes:{Theft:42, Assault:22,Vandalism:14,Cyber:16,Harassment:14,Burglary:9},  trend:[18,22,28,20,32,38,30,35,40,32,42,28], safety:64 },
  { name:'Cuddalore',      lat:11.7480, lng:79.7714, crimes:{Theft:38, Assault:18,Vandalism:10,Cyber:14,Harassment:12,Burglary:7},  trend:[16,20,24,18,28,32,26,30,34,26,38,22], safety:66 },
  { name:'Nagapattinam',   lat:10.7660, lng:79.8426, crimes:{Theft:30, Assault:14,Vandalism:8, Cyber:10,Harassment:9, Burglary:6},  trend:[12,15,18,14,22,26,20,24,28,22,30,18], safety:74 },
  { name:'Pudukkottai',    lat:10.3797, lng:78.8213, crimes:{Theft:28, Assault:12,Vandalism:7, Cyber:9, Harassment:8, Burglary:5},  trend:[10,13,16,12,20,24,18,22,26,20,28,16], safety:76 },
  { name:'Ramanathapuram', lat:9.3639,  lng:78.8395, crimes:{Theft:32, Assault:16,Vandalism:9, Cyber:12,Harassment:10,Burglary:7},  trend:[12,16,20,14,24,28,22,26,30,24,32,20], safety:72 },
  { name:'Virudhunagar',   lat:9.5851,  lng:77.9629, crimes:{Theft:35, Assault:18,Vandalism:10,Cyber:13,Harassment:11,Burglary:7},  trend:[14,18,22,16,26,30,24,28,32,26,35,22], safety:70 },
  { name:'Thoothukudi',    lat:8.7642,  lng:78.1348, crimes:{Theft:45, Assault:22,Vandalism:13,Cyber:18,Harassment:15,Burglary:9},  trend:[20,24,28,22,34,38,30,35,42,34,45,28], safety:62 },
  { name:'Kanyakumari',    lat:8.0883,  lng:77.5385, crimes:{Theft:22, Assault:10,Vandalism:6, Cyber:8, Harassment:6, Burglary:4},  trend:[8,10,12,9,15,18,14,16,20,15,22,12],  safety:82 },
  { name:'Dharmapuri',     lat:12.1211, lng:78.1582, crimes:{Theft:34, Assault:16,Vandalism:9, Cyber:12,Harassment:10,Burglary:7},  trend:[13,16,20,14,25,28,22,26,30,24,34,20], safety:69 },
  { name:'Krishnagiri',    lat:12.5266, lng:78.2141, crimes:{Theft:40, Assault:20,Vandalism:12,Cyber:15,Harassment:13,Burglary:9},  trend:[16,20,24,18,30,34,28,32,38,30,40,26], safety:65 },
  { name:'Namakkal',       lat:11.2189, lng:78.1676, crimes:{Theft:36, Assault:17,Vandalism:10,Cyber:13,Harassment:11,Burglary:7},  trend:[14,17,21,15,26,30,24,28,34,26,36,22], safety:67 },
  { name:'Perambalur',     lat:11.2340, lng:78.8805, crimes:{Theft:20, Assault:9, Vandalism:5, Cyber:7, Harassment:6, Burglary:4},  trend:[7,9,11,8,13,16,12,14,18,13,20,11],   safety:80 },
  { name:'Ariyalur',       lat:11.1421, lng:79.0769, crimes:{Theft:22, Assault:10,Vandalism:6, Cyber:8, Harassment:6, Burglary:4},  trend:[8,10,12,9,15,17,13,15,18,14,22,12],  safety:79 },
  { name:'Sivaganga',      lat:9.8477,  lng:78.4814, crimes:{Theft:28, Assault:13,Vandalism:7, Cyber:10,Harassment:8, Burglary:5},  trend:[10,13,16,12,20,23,18,21,25,19,28,16], safety:75 },
  { name:'Tiruvarur',      lat:10.7726, lng:79.6342, crimes:{Theft:24, Assault:11,Vandalism:6, Cyber:8, Harassment:7, Burglary:4},  trend:[8,11,13,10,16,19,15,17,22,16,24,14],  safety:77 },
  { name:'The Nilgiris',   lat:11.4916, lng:76.7337, crimes:{Theft:18, Assault:8, Vandalism:5, Cyber:6, Harassment:5, Burglary:3},  trend:[6,8,10,7,12,14,11,13,16,12,18,10],   safety:84 },
  { name:'Karur',          lat:10.9601, lng:78.0766, crimes:{Theft:32, Assault:15,Vandalism:9, Cyber:11,Harassment:10,Burglary:6},  trend:[12,15,19,13,23,27,21,25,30,23,32,19], safety:71 },
  { name:'Tiruvannamalai', lat:12.2253, lng:79.0747, crimes:{Theft:38, Assault:19,Vandalism:11,Cyber:14,Harassment:12,Burglary:8},  trend:[15,18,22,16,28,32,26,30,36,28,38,24], safety:66 },
  { name:'Kallakurichi',   lat:11.7380, lng:78.9593, crimes:{Theft:26, Assault:12,Vandalism:7, Cyber:9, Harassment:8, Burglary:5},  trend:[9,12,15,11,18,22,17,20,24,18,26,15],  safety:76 },
  { name:'Ranipet',        lat:12.9224, lng:79.3330, crimes:{Theft:34, Assault:16,Vandalism:10,Cyber:12,Harassment:11,Burglary:7},  trend:[13,16,20,14,24,28,22,26,32,25,34,21], safety:68 },
  { name:'Tirupattur',     lat:12.4965, lng:78.5732, crimes:{Theft:28, Assault:13,Vandalism:8, Cyber:10,Harassment:9, Burglary:5},  trend:[10,13,16,12,20,24,18,22,26,20,28,16], safety:74 },
  { name:'Tenkasi',        lat:8.9593,  lng:77.3152, crimes:{Theft:24, Assault:11,Vandalism:6, Cyber:8, Harassment:7, Burglary:4},  trend:[8,11,13,10,16,19,15,17,21,16,24,14],  safety:78 },
  { name:'Chengalpattu',   lat:12.6921, lng:79.9766, crimes:{Theft:50, Assault:25,Vandalism:14,Cyber:20,Harassment:16,Burglary:11}, trend:[22,26,32,24,38,44,36,42,48,38,50,32], safety:57 },
  { name:'Mayiladuthurai', lat:11.1021, lng:79.6519, crimes:{Theft:26, Assault:12,Vandalism:7, Cyber:9, Harassment:8, Burglary:4},  trend:[9,12,14,11,18,21,16,19,23,17,26,14],  safety:76 },
  { name:'Hosur',          lat:12.7409, lng:77.8253, crimes:{Theft:44, Assault:21,Vandalism:13,Cyber:17,Harassment:14,Burglary:10}, trend:[19,23,27,21,33,38,31,36,43,34,44,29], safety:60 },
];

const MONTHS      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CRIME_TYPES = ['Theft','Assault','Vandalism','Cyber','Harassment','Burglary'];
const CRIME_COLORS= ['#e63946','#ff6b35','#ffd166','#06d6a0','#118ab2','#7b2d8b'];

// ─── STATE ────────────────────────────────────
let selectedDistrict  = null;
let mapInstance       = null;
let chartsInitialized = false;
let trendChartObj = null, typeChartObj = null, areaChartObj = null;

// ─── PAGE NAVIGATION ─────────────────────────
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === name));
  window.scrollTo({ top:0, behavior:'smooth' });
  if (name === 'analytics') setTimeout(initAnalytics, 150);
}
function closeMobile() { document.getElementById('mobileMenu').classList.remove('open'); }
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
});

// ─── COUNTER ANIMATION ───────────────────────
setTimeout(() => {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    let cur = 0;
    const step = Math.ceil(target / 60);
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur.toLocaleString();
      if (cur >= target) clearInterval(t);
    }, 20);
  });
}, 400);

// ─── SEVERITY ─────────────────────────────────
let selectedSeverity = 'Medium';
document.querySelectorAll('.sev-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sev-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedSeverity = btn.dataset.val;
  });
});

// ─── FILE UPLOAD ─────────────────────────────
document.getElementById('imageInput').addEventListener('change', function () {
  const file = this.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('previewImg').src = e.target.result;
    document.getElementById('filePreview').style.display = 'flex';
    document.getElementById('fileDrop').style.display = 'none';
  };
  reader.readAsDataURL(file);
});
const drop = document.getElementById('fileDrop');
drop.addEventListener('dragover', e => { e.preventDefault(); drop.style.borderColor='var(--red)'; });
drop.addEventListener('dragleave', () => { drop.style.borderColor=''; });
drop.addEventListener('drop', e => {
  e.preventDefault(); drop.style.borderColor='';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById('previewImg').src = ev.target.result;
      document.getElementById('filePreview').style.display = 'flex';
      drop.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
});
function removeFile() {
  document.getElementById('imageInput').value = '';
  document.getElementById('filePreview').style.display = 'none';
  document.getElementById('fileDrop').style.display = 'block';
}

// ─── FORM ─────────────────────────────────────
function validateForm() {
  let valid = true;
  [
    { id:'email',       errId:'emailErr',       check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { id:'crimeType',   errId:'crimeTypeErr',   check: v => v !== '' },
    { id:'location',    errId:'locationErr',    check: v => v.trim().length > 0 },
    { id:'datetime',    errId:'datetimeErr',    check: v => v !== '' },
    { id:'description', errId:'descriptionErr', check: v => v.trim().length >= 20 },
  ].forEach(f => {
    const el = document.getElementById(f.id), err = document.getElementById(f.errId);
    const ok = f.check(el.value);
    el.classList.toggle('has-error', !ok); err.classList.toggle('show', !ok);
    if (!ok) valid = false;
  });
  return valid;
}
document.getElementById('crimeForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!validateForm()) return;

  const btn = document.getElementById('submitBtn');
  btn.classList.add('loading'); btn.disabled = true;

  const reportId   = 'CL-' + Date.now().toString(36).toUpperCase();
  const submitTime = new Date().toLocaleString('en-IN', { dateStyle:'full', timeStyle:'short' });

  const description = document.getElementById("description").value;

// 🔥 CALL AI (BERT)
const aiResult = await analyzeText(description);
alert("AI Prediction: " + aiResult.prediction[0].label);
  const fd = {
    email:       document.getElementById('email').value,
    crimeType:   document.getElementById('crimeType').value,
    location:    document.getElementById('location').value,
    datetime:    document.getElementById('datetime').value,
    description: document.getElementById('description').value,
    severity:    selectedSeverity,
    timestamp:   new Date().toISOString(),
  };

  // ── Get image as base64 (if uploaded) ────
  let imageBase64 = '';
  let imageName   = 'No image uploaded';
  const imageFile = document.getElementById('imageInput').files[0];

  if (imageFile) {
    imageName = imageFile.name;
    imageBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result); // data:image/jpeg;base64,...
      reader.readAsDataURL(imageFile);
    });
  }

  // Build image HTML block for email
  const imageHTML = imageBase64
    ? `<img src="${imageBase64}" alt="Evidence Photo" style="width:100%;max-width:520px;height:auto;border-radius:8px;border:1px solid #2a2a2a;display:block;margin-top:10px;" />`
    : `<div style="padding:20px;text-align:center;background:#111;border-radius:8px;border:1px dashed #333;color:#555;font-size:13px;">No image was uploaded with this report.</div>`;

  // ── Send via EmailJS ──────────────────────
  const templateParams = {
    report_id:         reportId,
    reporter_email:    fd.email,
    crime_type:        fd.crimeType,
    location:          fd.location,
    incident_datetime: fd.datetime,
    severity:          fd.severity,
    description:       fd.description,
    submitted_at:      submitTime,
    image_name:        imageName,
    evidence_image:    imageHTML,
  };

  try {
    if (typeof emailjs === 'undefined') {
      throw new Error('EmailJS SDK not loaded.');
    }

    console.log('📧 Sending email...');
    console.log('Params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Email sent! Status:', response.status, response.text);

    if (GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
      fetch(GOOGLE_SCRIPT_URL, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/json'}, body:JSON.stringify(fd) });
    }

    showSuccess(reportId);

  } catch (err) {
    console.error('❌ EmailJS error:', err);
    console.error('Error status:', err.status);
    console.error('Error text:', err.text);
    const errMsg = err.text || err.message || JSON.stringify(err);
    alert('⚠ Email could not be sent.\n\nError: ' + errMsg + '\n\nCheck browser console (F12) for details.');
  } finally {
    btn.classList.remove('loading'); btn.disabled = false;
  }
});
function showSuccess(reportId) {
  const rid = reportId || ('CL-' + Date.now().toString(36).toUpperCase());
  document.getElementById('reportId').textContent = rid;
  document.getElementById('reportFormCard').style.display = 'none';
  document.getElementById('successCard').style.display = 'block';
}
function resetForm() {
  document.getElementById('crimeForm').reset();
  document.getElementById('reportFormCard').style.display = 'block';
  document.getElementById('successCard').style.display = 'none';
  removeFile(); selectedSeverity = 'Medium';
  document.querySelectorAll('.sev-btn').forEach(b => b.classList.toggle('active', b.dataset.val==='Medium'));
  document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
  document.querySelectorAll('.err-msg.show').forEach(el => el.classList.remove('show'));
}

// ═══════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════
function initAnalytics() {
  if (!chartsInitialized) {
    Chart.defaults.color = '#666'; Chart.defaults.borderColor = '#222';
    Chart.defaults.font.family = "'JetBrains Mono', monospace";
    chartsInitialized = true;
  }
  buildDistrictList();
  initMap();
  renderCharts(null);
  buildHeatmap(null);
  buildSafetyGrid(null);
}

// ─── DISTRICT LIST ────────────────────────────
function buildDistrictList() {
  const container = document.getElementById('districtList');
  if (container.children.length > 0) return;
  TN_DISTRICTS.forEach(d => {
    const total = Object.values(d.crimes).reduce((a,b)=>a+b,0);
    const level = total > 300 ? 'high' : total > 150 ? 'med' : 'low';
    const item = document.createElement('div');
    item.className = 'd-item'; item.dataset.name = d.name;
    item.innerHTML = `<span class="d-name">${d.name}</span><span class="d-badge ${level}">${total}</span>`;
    item.addEventListener('click', () => selectDistrict(d.name));
    container.appendChild(item);
  });
}
function filterDistrictList(q) {
  document.querySelectorAll('.d-item').forEach(el => {
    el.style.display = el.dataset.name.toLowerCase().includes(q.toLowerCase()) ? 'flex' : 'none';
  });
}

// ─── MAP ─────────────────────────────────────
function initMap() {
  if (mapInstance) { mapInstance.invalidateSize(); return; }
  mapInstance = L.map('tnMap', { center:[10.8505,78.6677], zoom:7, zoomControl:true, scrollWheelZoom:true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap', maxZoom:18 }).addTo(mapInstance);
  L.rectangle([[8.0,76.2],[13.5,80.4]], { color:'rgba(230,57,70,0.6)', weight:2.5, fill:true, fillColor:'rgba(230,57,70,0.04)', dashArray:'6,4' }).addTo(mapInstance);

  TN_DISTRICTS.forEach(d => {
    const total = Object.values(d.crimes).reduce((a,b)=>a+b,0);
    const color = total > 300 ? '#e63946' : total > 150 ? '#ffd166' : '#06d6a0';
    const size  = total > 300 ? 20 : total > 150 ? 15 : 11;
    const icon = L.divIcon({
      className:'',
      html:`<div title="${d.name}" style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 8px ${color},0 0 16px ${color}66;cursor:pointer;transition:transform 0.15s;" onmouseover="this.style.transform='scale(1.4)'" onmouseout="this.style.transform='scale(1)'"></div>`,
      iconSize:[size,size], iconAnchor:[size/2,size/2],
    });
    const topCrime = Object.entries(d.crimes).sort((a,b)=>b[1]-a[1])[0];
    const riskLabel = total>300?'HIGH':total>150?'MEDIUM':'LOW';
    const riskColor = total>300?'#e63946':total>150?'#ffd166':'#06d6a0';
    L.marker([d.lat,d.lng],{icon}).addTo(mapInstance)
      .bindPopup(`<div style="font-family:'Syne',sans-serif;min-width:210px">
        <div style="font-size:1.05rem;font-weight:800;margin-bottom:5px;color:#f0f0f0">${d.name}</div>
        <div style="font-size:0.68rem;letter-spacing:2px;color:${riskColor};margin-bottom:10px">● RISK: ${riskLabel}</div>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:0.78rem;color:#888">
          <span>Total Reports</span><span style="color:#e63946;font-weight:700">${total}</span>
          <span>Top Crime</span><span style="color:#ffd166;font-weight:700">${topCrime[0]} (${topCrime[1]})</span>
          <span>Safety Score</span><span style="color:#06d6a0;font-weight:700">${d.safety}/100</span>
        </div>
        <button onclick="selectDistrict('${d.name}')" style="margin-top:12px;width:100%;padding:8px;background:#e63946;color:#fff;border:none;border-radius:5px;font-family:'Syne',sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:1px;cursor:pointer;">VIEW FULL ANALYTICS →</button>
      </div>`,{className:'crimelens-popup',maxWidth:260});
  });
}

// ─── SELECT DISTRICT ─────────────────────────
function selectDistrict(name) {
  selectedDistrict = name;
  const d = TN_DISTRICTS.find(x => x.name === name);
  if (!d) return;

  mapInstance.flyTo([d.lat,d.lng], 10, {duration:1.2});

  document.querySelectorAll('.d-item').forEach(el => el.classList.toggle('active', el.dataset.name===name));
  const ai = document.querySelector(`.d-item[data-name="${name}"]`);
  if (ai) ai.scrollIntoView({block:'nearest',behavior:'smooth'});

  // Banner
  const banner = document.getElementById('districtBanner');
  banner.style.display = 'flex';
  document.getElementById('dbName').textContent = name;
  const total = Object.values(d.crimes).reduce((a,b)=>a+b,0);
  const topCrime = Object.entries(d.crimes).sort((a,b)=>b[1]-a[1])[0];
  document.getElementById('dbStats').innerHTML = `
    <div class="db-stat"><span class="db-stat-num" style="color:#e63946">${total}</span><span class="db-stat-label">Total Reports</span></div>
    <div class="db-stat"><span class="db-stat-num" style="color:#ffd166">${topCrime[0]}</span><span class="db-stat-label">Top Crime</span></div>
    <div class="db-stat"><span class="db-stat-num" style="color:#06d6a0">${d.safety}/100</span><span class="db-stat-label">Safety Score</span></div>`;

  // Titles
  document.getElementById('trendTitle').textContent = `Monthly Crime Trends — ${name}`;
  document.getElementById('typeTitle').textContent  = `Crime Types — ${name}`;
  document.getElementById('areaTitle').textContent  = `Crime Breakdown — ${name}`;
  document.getElementById('heatTitle').textContent  = `Crime Heatmap — ${name}`;

  // Summary
  document.getElementById('sumTotal').textContent    = total;
  document.getElementById('sumAreas').textContent    = '1';
  document.getElementById('sumMonth').textContent    = d.trend[new Date().getMonth()];
  document.getElementById('sumResolved').textContent = d.safety + '%';

  // Area safety panel
  renderAreaSafetyPanel(name);

  renderCharts(d);
  buildHeatmap(d);
  buildSafetyGrid(d);

  setTimeout(() => {
    document.getElementById('areaSafetySection').scrollIntoView({behavior:'smooth',block:'start'});
  }, 400);
}

// ─── AREA SAFETY PANEL ───────────────────────
function renderAreaSafetyPanel(districtName) {
  const section = document.getElementById('areaSafetySection');
  const areas = DISTRICT_AREAS[districtName];
  if (!areas) { section.style.display = 'none'; return; }

  document.getElementById('asPanelDistrict').textContent = districtName.toUpperCase();
  section.style.display = 'block';

  const container = document.getElementById('areaCards');
  container.innerHTML = '';

  const maxReports = Math.max(...areas.map(a => a.reports));

  areas.forEach((area, i) => {
    const verdict  = area.crimeRate > 65 ? 'danger' : area.crimeRate > 35 ? 'caution' : 'safe';
    const verdictLabel = verdict === 'safe' ? '✓ Safe to Visit' : verdict === 'caution' ? '⚠ Use Caution' : '✕ High Risk';
    const barColor = verdict === 'safe' ? '#06d6a0' : verdict === 'caution' ? '#ffd166' : '#e63946';
    const cardClass = verdict === 'safe' ? 'safe-card' : verdict === 'caution' ? 'caution-card' : 'danger-card';
    const barWidth = Math.round((area.reports / maxReports) * 100);

    const card = document.createElement('div');
    card.className = `area-card ${cardClass}`;
    card.style.animationDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <div class="ac-rank">AREA ${i + 1} OF 5</div>
      <div class="ac-name">${area.name}</div>
      <div class="ac-crime-rate">
        <span class="ac-cr-label">Crime Rate</span>
        <span class="ac-cr-value" style="color:${barColor}">${area.crimeRate}/100</span>
      </div>
      <div class="ac-bar-bg">
        <div class="ac-bar-fill" style="width:0%;background:${barColor}" data-width="${barWidth}%"></div>
      </div>
      <div class="ac-top-crime">Top crime: <span>${area.topCrime}</span></div>
      <div class="ac-top-crime">Reports: <span>${area.reports} cases</span></div>
      <div class="ac-verdict ${verdict}">
        <div class="ac-verdict-dot"></div>
        ${verdictLabel}
      </div>
    `;
    container.appendChild(card);
  });

  // Animate bars after render
  setTimeout(() => {
    document.querySelectorAll('.ac-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  }, 80);
}

function clearDistrictFilter() {
  selectedDistrict = null;
  document.getElementById('districtBanner').style.display    = 'none';
  document.getElementById('areaSafetySection').style.display = 'none';
  document.querySelectorAll('.d-item').forEach(el => el.classList.remove('active'));
  mapInstance.flyTo([10.8505,78.6677], 7, {duration:1.2});
  document.getElementById('trendTitle').textContent = 'Monthly Crime Trends — All Tamil Nadu';
  document.getElementById('typeTitle').textContent  = 'Crime Type Distribution';
  document.getElementById('areaTitle').textContent  = 'Top Crime Areas';
  document.getElementById('heatTitle').textContent  = 'Area × Crime Type Heatmap — All Tamil Nadu';
  document.getElementById('sumTotal').textContent    = '1,247';
  document.getElementById('sumAreas').textContent    = '38';
  document.getElementById('sumMonth').textContent    = '89';
  document.getElementById('sumResolved').textContent = '72%';
  renderCharts(null); buildHeatmap(null); buildSafetyGrid(null);
}

// ─── CHARTS ──────────────────────────────────
function renderCharts(d) { renderTrendChart(d); renderTypeChart(d); renderAreaChart(d); }

function renderTrendChart(d) {
  if (trendChartObj) { trendChartObj.destroy(); trendChartObj = null; }
  const data1 = d ? d.trend : [72,85,91,78,103,119,98,112,125,108,134,89];
  const data2 = d ? d.trend.map(v => Math.round(v * d.safety / 100)) : [50,62,70,55,80,90,72,85,96,80,100,65];
  trendChartObj = new Chart(document.getElementById('trendChart'), {
    type:'line',
    data:{ labels:MONTHS, datasets:[
      { label:'Reports',  data:data1, borderColor:'#e63946', backgroundColor:'rgba(230,57,70,0.08)', fill:true, tension:0.4, pointBackgroundColor:'#e63946', pointRadius:4 },
      { label:'Resolved', data:data2, borderColor:'#06d6a0', backgroundColor:'rgba(6,214,160,0.06)', fill:true, tension:0.4, pointBackgroundColor:'#06d6a0', pointRadius:4 },
    ]},
    options:{ responsive:true, plugins:{legend:{position:'top'}}, scales:{ x:{grid:{color:'#1a1a1a'}}, y:{grid:{color:'#1a1a1a'},beginAtZero:true} } }
  });
}

function renderTypeChart(d) {
  if (typeChartObj) { typeChartObj.destroy(); typeChartObj = null; }
  const values = d ? CRIME_TYPES.map(t => d.crimes[t]||0) : [312,198,145,187,132,97];
  typeChartObj = new Chart(document.getElementById('typeChart'), {
    type:'doughnut',
    data:{ labels:CRIME_TYPES, datasets:[{ data:values, backgroundColor:CRIME_COLORS, borderWidth:0, hoverOffset:8 }] },
    options:{ responsive:true, plugins:{ legend:{ position:'bottom', labels:{ padding:12, font:{size:11} } } } }
  });
}

function renderAreaChart(d) {
  if (areaChartObj) { areaChartObj.destroy(); areaChartObj = null; }
  let labels, values, colors;
  if (d) {
    const areas = DISTRICT_AREAS[d.name] || [];
    labels = areas.map(a => a.name);
    values = areas.map(a => a.reports);
    colors = areas.map(a => a.crimeRate > 65 ? '#e63946' : a.crimeRate > 35 ? '#ffd166' : '#06d6a0');
  } else {
    labels = ['Chennai','Coimbatore','Madurai','Tiruchi','Salem','Tirunelveli','Vellore'];
    values = [392,265,263,165,205,133,158];
    colors = 'rgba(230,57,70,0.7)';
  }
  areaChartObj = new Chart(document.getElementById('areaChart'), {
    type:'bar',
    data:{ labels, datasets:[{ label: d ? 'Reports' : 'Reports', data:values, backgroundColor:colors, borderColor: d ? colors : '#e63946', borderWidth:1, borderRadius:4 }] },
    options:{ indexAxis: d ? 'y' : 'y', responsive:true, plugins:{legend:{display:false}}, scales:{ x:{grid:{color:'#1a1a1a'},beginAtZero:true}, y:{grid:{color:'#1a1a1a'}} } }
  });
}

function buildSafetyGrid(district) {
  const grid = document.getElementById('safetyGrid'); grid.innerHTML = '';
  const areas = district ? [district] : TN_DISTRICTS.slice(0,8);
  areas.forEach(d => {
    const color = d.safety>=70?'#06d6a0':d.safety>=50?'#ffd166':'#e63946';
    const div = document.createElement('div'); div.className = 'safety-item';
    div.innerHTML = `<div class="safety-area">${d.name}</div><div class="safety-bar-bg"><div class="safety-bar-fill" style="width:0%;background:${color}" data-width="${d.safety}%"></div></div><div class="safety-score">Safety Score: ${d.safety}/100</div>`;
    grid.appendChild(div);
  });
  setTimeout(() => { document.querySelectorAll('.safety-bar-fill').forEach(b => { b.style.width = b.dataset.width; }); }, 100);
}

function buildHeatmap(district) {
  const wrap = document.getElementById('heatmapWrap'); wrap.innerHTML = '';
  const rows = district ? [district] : TN_DISTRICTS.slice(0,10);
  const allVals = rows.flatMap(r => CRIME_TYPES.map(c => r.crimes[c]||0));
  const max = Math.max(...allVals)||1;
  const table = document.createElement('table'); table.className = 'heatmap-table';
  table.innerHTML = `<thead><tr><th>Area</th>${CRIME_TYPES.map(c=>`<th>${c}</th>`).join('')}</tr></thead>`;
  const tbody = document.createElement('tbody');
  rows.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td style="text-align:left;font-family:var(--font-body);font-weight:600;white-space:nowrap">${row.name}</td>`;
    CRIME_TYPES.forEach(c => {
      const val = row.crimes[c]||0, intensity = val/max;
      const td = document.createElement('td'); td.textContent = val;
      td.style.background = `rgba(230,57,70,${intensity*0.75+0.05})`;
      td.style.color = intensity>0.5?'#fff':'#888'; tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody); wrap.appendChild(table);
}

// ═══════════════════════════════════════════
// CHATBOT
// ═══════════════════════════════════════════
const chatHistory = [];
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim(); if (!message) return;
  input.value = ''; appendMessage('user', message);
  chatHistory.push({ role:'user', content:message });
  await getBotResponse();
}
function sendQuick(text) { document.getElementById('chatInput').value = text; sendMessage(); }

function appendMessage(role, text) {
  const win = document.getElementById('chatWindow');
  const div = document.createElement('div'); div.className = `chat-msg ${role}`;
  div.innerHTML = `<div class="msg-avatar">${role==='bot'?'🤖':'👤'}</div><div class="msg-bubble">${text.replace(/\n/g,'<br>')}</div>`;
  win.appendChild(div); win.scrollTop = win.scrollHeight;
}
function showTyping() {
  const win = document.getElementById('chatWindow');
  const div = document.createElement('div'); div.className='chat-msg bot'; div.id='typingIndicator';
  div.innerHTML=`<div class="msg-avatar">🤖</div><div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  win.appendChild(div); win.scrollTop=win.scrollHeight;
}
function removeTyping() { const el=document.getElementById('typingIndicator'); if(el) el.remove(); }

async function getBotResponse() {
  showTyping();
  const sys=`You are CrimeLens AI Assistant for a Tamil Nadu crime monitoring website. Help with crime reporting, safety tips, emergency contacts (Police:100, Fire:101, Ambulance:108, Women:1091, Child:1098, Emergency:112, Cyber:1930), crime awareness, and using the interactive Tamil Nadu district map in the Analytics page. Be concise and helpful.`;
  try {
    if (ANTHROPIC_API_KEY==='YOUR_ANTHROPIC_API_KEY_HERE') throw new Error('no key');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:600, system:sys, messages:chatHistory }),
    });
    const data = await res.json(); removeTyping();
    if (data.content?.[0]) { const reply=data.content[0].text; chatHistory.push({role:'assistant',content:reply}); appendMessage('bot',reply); }
    else fallbackResponse();
  } catch { removeTyping(); fallbackResponse(); }
}
function fallbackResponse() {
  const last = chatHistory[chatHistory.length-1]?.content?.toLowerCase()||'';
  let reply = '';
  if (last.includes('report')||last.includes('how to'))
    reply='To submit a report:\n\n1. Click <strong>Report</strong> in nav\n2. Fill email, crime type, location, date/time\n3. Describe incident (min 20 chars)\n4. Upload image (optional)\n5. Set severity → click <strong>Submit</strong>';
  else if (last.includes('map')||last.includes('district')||last.includes('area'))
    reply='On the <strong>Analytics</strong> page:\n\n• Click any <strong>district marker</strong> on the Tamil Nadu map\n• A panel shows <strong>5 key areas</strong> in that district with crime rate & safety verdict\n• 🟢 Safe to Visit | 🟡 Use Caution | 🔴 High Risk\n• All charts filter to show that district\'s data\n• Click <strong>"Show All Districts"</strong> to reset';
  else if (last.includes('safety')||last.includes('safe'))
    reply='Key safety tips:\n\n• Stay aware of surroundings\n• Avoid poorly lit areas at night\n• Share location with trusted contacts\n• Save <strong>100</strong> (Police) and <strong>112</strong> (Emergency)\n• Check the <strong>Analytics map</strong> before visiting an area';
  else if (last.includes('emergency')||last.includes('contact'))
    reply='🚨 <strong>Emergency Contacts:</strong>\n\n• <strong>112</strong> — National Emergency\n• <strong>100</strong> — Police\n• <strong>101</strong> — Fire\n• <strong>108</strong> — Ambulance\n• <strong>1091</strong> — Women Helpline\n• <strong>1098</strong> — Child Helpline\n• <strong>1930</strong> — Cyber Crime';
  else
    reply='I\'m <strong>CrimeLens AI Assistant</strong>. Ask me about:\n\n• Crime reporting steps\n• Checking area safety on the Tamil Nadu map\n• Safety tips & emergency contacts\n\n⚠️ <em>Add Anthropic API key in app.js for full AI.</em>';
  chatHistory.push({role:'assistant',content:reply}); appendMessage('bot',reply);
}
async function analyzeText(description) {
  const res = await fetch("http://127.0.0.1:5000/analyze-text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: description })
  });

  const data = await res.json();
  return data;
}
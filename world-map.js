// =====================================================
// 3D Interactive Globe - World Travel Guide
// Canvas-based rotating sphere with clickable pins
// =====================================================

(function () {
    'use strict';

    // === Configuration ===
    const CONFIG = {
        rotationSpeed: 0.003,
        dragSensitivity: 0.005,
        pinSize: 6,
        pinHoverSize: 10,
        glowIntensity: 0.6,
        particleCount: 60,
        globeColor: 'rgba(20, 60, 120, 0.35)',
        gridColor: 'rgba(100, 180, 255, 0.08)',
        landColor: 'rgba(80, 160, 255, 0.15)',
        landStroke: 'rgba(100, 180, 255, 0.25)',
        coastColor: 'rgba(140, 200, 255, 0.12)',
    };

    let canvas, ctx;
    let width, height;
    let baseRadius = 250;
    let radius = 250;
    let zoomLevel = 1.0;
    let targetZoomLevel = 1.0;
    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 3.0;
    let rotX = -0.3, rotY = 0.5; // initial rotation (centered on Europe)
    let targetRotX = rotX, targetRotY = rotY;
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let autoRotate = true;
    let countries = [];
    let hoveredPin = null;
    let animationId;
    let globeCenterX, globeCenterY;

    // === Continent polygons (Natural Earth-derived simplified coastlines) ===
    const CL = CONFIG.landColor;
    const CONTINENTS = [
        // ── North America ──
        { points: [
            [60,-168],[62,-166],[64,-166],[66,-164],[68,-162],[70,-158],[71,-153],[71,-148],
            [70,-143],[69,-139],[68,-137],[66,-135],[64,-133],[62,-131],[60,-135],[58,-133],
            [56,-130],[55,-128],[54,-126],[52,-125],[50,-124],[49,-123],[48,-123],[47,-124],
            [46,-124],[44,-124],[43,-124],[42,-124],[40,-122],[38,-123],[36,-121],[35,-120],
            [34,-119],[33,-118],[32,-117],[31,-116],[30,-114],[29,-113],[28,-112],[27,-111],
            [26,-110],[25,-109],[24,-108],[23,-106],[22,-102],[21,-98],[20,-97],[19,-96],
            [18,-95],[17,-93],[16,-91],[16,-88],[18,-88],[19,-87],[21,-87],[22,-86],
            [23,-84],[24,-82],[25,-80],[26,-80],[27,-80],[28,-81],[29,-82],[30,-83],
            [30,-82],[30,-80],[29,-79],[27,-77],[25,-77],[24,-78],[22,-80],[20,-83],
            [18,-85],[16,-88],[15,-89],[14,-90],[16,-92],[18,-96],[20,-97],
            [22,-101],[25,-99],[27,-97],[29,-95],[30,-93],[30,-90],[29,-88],[28,-85],
            [27,-82],[26,-80],[28,-76],[30,-72],[33,-68],[35,-66],[37,-64],[39,-62],
            [41,-60],[43,-58],[45,-56],[47,-54],[49,-54],[50,-56],[52,-58],[54,-60],
            [56,-60],[58,-58],[60,-60],[62,-64],[64,-66],[66,-70],[68,-72],[70,-76],
            [71,-80],[72,-86],[73,-92],[74,-100],[74,-108],[74,-115],[73,-122],[72,-130],
            [72,-138],[71,-142],[70,-146],[68,-150],[66,-155],[64,-160],[62,-164],[60,-168]
        ], color: CL },

        // ── South America ──
        { points: [
            [12,-72],[11,-74],[10,-76],[8,-77],[6,-77],[4,-77],[2,-78],[0,-80],
            [-2,-80],[-4,-78],[-5,-76],[-6,-77],[-8,-79],[-10,-77],[-12,-77],
            [-14,-76],[-16,-74],[-18,-71],[-20,-69],[-22,-67],[-23,-64],[-24,-60],
            [-25,-57],[-26,-54],[-27,-50],[-28,-48],[-29,-47],[-30,-48],[-31,-50],
            [-32,-52],[-33,-53],[-34,-55],[-36,-57],[-38,-58],[-40,-61],[-42,-63],
            [-44,-65],[-46,-67],[-48,-69],[-50,-71],[-52,-72],[-54,-70],[-55,-68],
            [-54,-64],[-52,-60],[-50,-56],[-48,-52],[-46,-48],[-44,-44],
            [-42,-42],[-40,-40],[-38,-38],[-36,-37],[-34,-36],[-32,-37],[-30,-39],
            [-28,-41],[-26,-43],[-24,-45],[-22,-43],[-20,-40],[-18,-39],[-16,-38],
            [-14,-37],[-12,-36],[-10,-35],[-8,-34],[-6,-35],[-4,-36],[-2,-38],
            [0,-41],[1,-44],[2,-48],[3,-52],[4,-56],[5,-60],[6,-64],[8,-68],
            [10,-70],[11,-71],[12,-72]
        ], color: CL },

        // ── Europe (mainland) ──
        { points: [
            [71,28],[70,26],[69,22],[68,18],[67,16],[66,14],[65,12],[64,10],[62,6],
            [60,5],[59,4],[58,3],[57,5],[56,6],[55,8],[54,9],[53,10],[52,7],
            [51,4],[50,2],[49,0],[48,-1],[47,-2],[46,-2],[45,-1],[44,0],[43,-1],
            [42,-3],[41,-6],[40,-7],[39,-9],[38,-10],[37,-10],[36,-6],[36,-3],
            [37,0],[38,2],[39,4],[38,6],[37,8],[38,10],[38,13],[38,16],[39,20],
            [39,22],[40,24],[40,26],[41,28],[42,29],[43,28],[43,26],[44,24],
            [44,26],[45,28],[45,30],[46,30],[47,28],[48,24],[49,20],[50,18],
            [50,20],[51,22],[52,21],[53,20],[54,19],[55,18],[56,20],[56,24],
            [57,22],[58,18],[59,16],[60,18],[60,22],[60,26],[61,24],[62,22],
            [63,18],[64,16],[66,14],[68,16],[68,20],[69,24],[70,26],[71,28]
        ], color: CL },

        // ── Italy ──
        { points: [
            [46,7],[45,8],[44,8],[43,10],[42,12],[41,13],[41,15],[40,16],[39,16],
            [38,16],[37,15],[38,13],[39,12],[40,13],[41,14],[41,12],[40,10],
            [39,9],[38,8],[37,9],[38,12],[38,16],[39,18],[40,18],[41,17],
            [42,16],[43,14],[44,12],[45,10],[46,8],[46,7]
        ], color: CL },

        // ── Africa ──
        { points: [
            [37,-10],[36,-6],[35,-2],[35,0],[34,2],[33,5],[33,8],[32,10],
            [31,10],[30,10],[28,10],[26,10],[24,8],[22,6],[20,5],[18,3],
            [16,0],[15,-4],[14,-8],[12,-13],[10,-16],[8,-15],[6,-12],[5,-10],
            [4,-8],[3,-5],[2,-2],[1,2],[0,6],[-1,9],[-2,12],[-3,15],
            [-5,18],[-6,22],[-8,28],[-10,32],[-12,35],[-14,38],[-16,40],
            [-18,38],[-20,36],[-22,35],[-24,33],[-26,32],[-28,30],[-30,28],
            [-31,26],[-33,24],[-34,22],[-35,20],[-35,18],[-34,16],[-33,14],
            [-32,16],[-30,20],[-28,24],[-26,28],[-24,30],[-22,33],[-20,34],
            [-18,36],[-16,37],[-14,36],[-12,34],[-10,32],[-8,30],[-6,28],
            [-4,24],[-2,20],[0,18],[2,16],[4,14],[6,11],[8,8],[10,5],
            [12,4],[14,3],[16,1],[18,-1],[20,-4],[22,-6],[24,-8],[26,-10],
            [28,-10],[30,-8],[32,-6],[34,-5],[36,-6],[37,-10]
        ], color: CL },

        // ── Asia (mainland) ──
        { points: [
            [71,28],[70,32],[69,36],[68,40],[67,44],[66,48],[65,52],[63,56],
            [61,60],[60,62],[58,65],[56,68],[55,72],[54,76],[53,78],[52,80],
            [50,82],[48,84],[46,86],[44,88],[42,84],[40,80],[38,76],[36,72],
            [35,68],[34,66],[32,64],[30,62],[28,60],[26,58],[24,60],[22,64],
            [20,68],[18,72],[16,78],[14,82],[12,86],[10,92],[8,98],[6,100],
            [4,102],[2,104],[1,104],[0,104],[1,106],[3,108],[5,108],[6,106],
            [8,104],[10,104],[12,106],[14,108],[16,106],[18,104],[20,100],
            [22,104],[24,108],[26,110],[28,112],[30,116],[32,118],[34,120],
            [36,122],[38,124],[40,122],[42,120],[44,118],[46,120],[48,124],
            [50,128],[52,131],[54,134],[56,136],[58,138],[60,140],[62,142],
            [64,144],[66,148],[68,152],[70,156],[72,158],
            [72,152],[72,148],[71,142],[70,138],[70,134],[69,130],[68,126],
            [68,122],[68,118],[68,114],[68,108],[68,102],[68,96],[68,90],
            [68,84],[68,78],[68,72],[68,66],[68,60],[69,54],[70,48],
            [70,42],[70,36],[71,30],[71,28]
        ], color: CL },

        // ── Arabian Peninsula ──
        { points: [
            [30,35],[29,36],[27,37],[25,38],[23,40],[21,42],[19,44],[16,45],
            [14,46],[13,48],[14,50],[16,52],[18,55],[20,56],[22,56],[24,54],
            [26,52],[28,48],[30,44],[31,40],[31,38],[30,35]
        ], color: CL },

        // ── India ──
        { points: [
            [34,72],[32,74],[30,76],[28,78],[26,80],[24,82],[22,84],[20,86],
            [18,84],[16,82],[14,80],[12,78],[10,77],[8,78],[7,78],[8,76],
            [10,74],[12,72],[14,74],[16,76],[18,78],[20,80],[22,78],[24,76],
            [26,74],[28,72],[30,70],[32,70],[34,72]
        ], color: CL },

        // ── Australia ──
        { points: [
            [-12,136],[-13,132],[-14,130],[-15,128],[-16,126],[-17,124],
            [-18,122],[-20,118],[-22,116],[-24,114],[-26,114],[-28,114],
            [-30,116],[-31,118],[-32,120],[-33,122],[-34,125],[-35,128],
            [-35,132],[-36,136],[-37,140],[-38,144],[-38,148],[-37,150],
            [-36,152],[-34,154],[-32,153],[-30,152],[-28,153],[-26,152],
            [-24,150],[-22,150],[-20,148],[-18,146],[-16,144],[-14,142],
            [-13,140],[-12,138],[-12,136]
        ], color: CL },

        // ── Great Britain ──
        { points: [
            [58,-5],[57,-6],[56,-6],[55,-5],[54,-4],[53,-3],[52,-3],[51,-1],
            [51,0],[51,1],[52,2],[53,1],[54,0],[55,-1],[56,-2],[57,-4],[58,-5]
        ], color: CL },

        // ── Ireland ──
        { points: [
            [55,-10],[54,-10],[53,-10],[52,-9],[52,-7],[53,-6],[54,-7],[55,-8],[55,-10]
        ], color: CL },

        // ── Scandinavia (Norway/Sweden) ──
        { points: [
            [58,6],[59,5],[60,5],[62,5],[64,8],[66,12],[68,14],[69,16],
            [70,18],[71,20],[71,24],[70,26],[69,28],[68,26],[66,22],
            [65,18],[64,14],[62,10],[60,8],[58,6]
        ], color: CL },

        // ── Greenland ──
        { points: [
            [84,-30],[82,-22],[80,-18],[78,-16],[76,-18],[74,-20],[72,-24],
            [70,-28],[68,-34],[66,-42],[65,-46],[64,-50],[66,-52],[68,-54],
            [70,-54],[72,-52],[74,-48],[76,-44],[78,-38],[80,-34],[82,-30],[84,-30]
        ], color: CL },

        // ── Japan (Honshu) ──
        { points: [
            [41,140],[40,140],[39,139],[38,138],[37,137],[36,136],[35,135],
            [35,134],[34,133],[34,132],[34,131],[35,130],[36,131],[37,132],
            [38,134],[39,136],[40,138],[41,140],[42,141],[42,140],[41,140]
        ], color: CL },

        // ── Japan (Hokkaido) ──
        { points: [
            [45,141],[44,143],[43,145],[42,145],[42,143],[43,142],[44,141],[45,141]
        ], color: CL },

        // ── Japan (Kyushu) ──
        { points: [
            [34,130],[33,131],[32,131],[31,131],[32,130],[33,129],[34,130]
        ], color: CL },

        // ── Korea ──
        { points: [
            [43,128],[42,128],[41,127],[40,126],[39,126],[38,126],[37,127],
            [36,127],[35,126],[34,126],[35,128],[36,129],[37,129],[38,128],
            [39,128],[40,128],[42,130],[43,128]
        ], color: CL },

        // ── Indonesia / Borneo ──
        { points: [
            [7,109],[5,108],[3,108],[1,109],[0,110],[-1,112],[-2,115],
            [-3,116],[-2,118],[-1,118],[1,118],[3,117],[5,116],[6,114],[7,112],[7,109]
        ], color: CL },

        // ── Sumatra ──
        { points: [
            [5,95],[3,98],[1,100],[0,102],[-2,104],[-5,105],[-4,103],
            [-2,100],[0,98],[2,96],[5,95]
        ], color: CL },

        // ── Java ──
        { points: [
            [-6,106],[-7,108],[-7,110],[-7,112],[-8,114],[-8,112],
            [-7,110],[-7,108],[-6,106]
        ], color: CL },

        // ── New Guinea ──
        { points: [
            [-1,132],[-2,135],[-4,138],[-6,140],[-8,142],[-9,144],[-10,148],
            [-8,148],[-6,146],[-4,144],[-2,140],[0,137],[0,134],[-1,132]
        ], color: CL },

        // ── New Zealand (North Island) ──
        { points: [
            [-35,174],[-36,175],[-38,176],[-40,176],[-41,175],[-40,174],
            [-38,173],[-36,173],[-35,174]
        ], color: CL },

        // ── New Zealand (South Island) ──
        { points: [
            [-42,170],[-43,171],[-44,172],[-46,170],[-46,168],[-45,167],
            [-43,168],[-42,170]
        ], color: CL },

        // ── Madagascar ──
        { points: [
            [-12,49],[-14,48],[-16,46],[-18,44],[-20,44],[-22,44],[-24,46],
            [-25,47],[-24,48],[-22,49],[-20,49],[-18,50],[-16,50],[-14,50],[-12,49]
        ], color: CL },

        // ── Sri Lanka ──
        { points: [[10,80],[8,80],[7,81],[6,82],[7,82],[8,82],[10,80]], color: CL },

        // ── Iceland ──
        { points: [
            [66,-24],[65,-22],[64,-18],[64,-14],[65,-14],[66,-16],[67,-18],[66,-22],[66,-24]
        ], color: CL },

        // ── Taiwan ──
        { points: [[25,121],[24,121],[23,120],[22,121],[23,122],[24,122],[25,121]], color: CL },

        // ── Philippines (Luzon) ──
        { points: [
            [19,120],[17,120],[16,120],[15,121],[14,122],[16,122],[18,122],[19,121],[19,120]
        ], color: CL },
    ];

    // === I18N Language Support ===
    const I18N = {
        tr: {
            world_title: "Dünya Gezi Rehberi",
            share_btn_title: "Paylaş",
            hero_eyebrow: "İNTERAKTİF GEZİ REHBERİ",
            hero_word1: "Dünyayı",
            hero_word2: "Keşfedin",
            hero_sub: "Küreyi döndürün, bir şehir seçin, maceraya başlayın.",
            scroll_hint: "Küreyi sürükleyin",
            share_modal_title: "Paylaş",
            copy_btn: "Kopyala",
            footer_designed: "Designed by",
            share_text: "Dünyanın en güzel şehirlerini keşfedin!",
            copied_text: "Kopyalandı!",
            nav_cloud: "Bulut Mimarisi & AWS",
            nav_about: "Hakkımızda",
            nav_contact: "İletişim",
            cloud_modal_title: "Platform & AWS Bulut Mimarisi",
            cloud_hero_title: "İnteraktif Coğrafi Seyahat Rehberi Platformu",
            cloud_hero_desc: "Platformumuz, kullanıcıların dünya genelindeki şehirleri 3D küre ve vektörel haritalar üzerinde keşfetmelerini, kişiselleştirilmiş seyahat rotaları oluşturmalarını ve veri analitiği ile gezilerini planlamalarını sağlayan bulut tabanlı bir sistemdir.",
            cloud_stack_title: "AWS Bulut Altyapısı & Servis Mimarisi",
            aws_s3_desc: "3D küre kaplamaları, yüksek çözünürlüklü vektör harita karoları ve medya varlıklarının dünya genelinde düşük gecikmeyle (edge location) dağıtılması.",
            aws_lambda_desc: "Sunucusuz (serverless) mimari ile dinamik lokasyon aramaları, rota hesaplama algoritmaları ve kullanıcı geri bildirim mikro-servislerinin yürütülmesi.",
            aws_dynamo_desc: "Global şehir POI (Points of Interest) verilerinin, kullanıcı favori listelerinin ve anlık seyahat analitiğinin milisaniye düzeyinde erişimle saklanması.",
            aws_watch_desc: "Gerçek zamanlı sistem sağlık metriği izleme, otomatik SSL/TLS sertifika yönetimi ve DNS yönlendirme güvenliği.",
            cloud_purpose_heading: "🎯 Projenin Amacı ve Hedefleri",
            cloud_purpose_text: "Bu platform, gezginlere sıradan rehberlerin ötesinde interaktif 3D haritalar, kategori tabanlı akıllı filtreleme ve kişiselleştirilmiş rota günlükleri sunarak seyahat deneyimini dijitalleştirmeyi amaçlar. Bulut altyapımız, hızlı ölçeklenme ve yüksek kullanılabilirlik için tasarlanmıştır.",
            about_modal_title: "Hakkımızda",
            about_heading: "Dünya Gezi Rehberi",
            about_tagline: "Dijital Çağın İnteraktif Coğrafi Keşif Platformu",
            about_p1: "Dünya Gezi Rehberi, modern seyahat tutkunlarının şehirleri detaylı, etkileşimli ve görsel bir biçimde keşfetmelerini sağlamak amacıyla geliştirilmiş yenilikçi bir rehber platformudur.",
            about_features_title: "Öne Çıkan Özellikler:",
            about_f1: "3D Küre Deneyimi: Dünya genelindeki popüler destinasyonları Canvas tabanlı 3D küre üzerinde görün.",
            about_f2: "İnteraktif Şehir Haritaları: Müzelerden restoranlara, parklardan tarihi mekanlara kadar kategori odaklı filtreleme.",
            about_f3: "Kişisel Seyahat Analitiği: Gidilen yerleri işaretleyin, günlük rotanızı ve seyahat ilerlemenizi takip edin.",
            about_f4: "Çoklu Dil Desteği: Türkçe ve İngilizce dil seçenekleriyle küresel erişim.",
            legal_modal_title: "Gizlilik & Şartlar",
            tab_privacy: "Gizlilik Politikası",
            tab_terms: "Kullanım Koşulları",
            privacy_h1: "1. Kişisel Verilerin Korunması ve Gizlilik",
            privacy_p1: "Dünya Gezi Rehberi olarak kullanıcılarımızın gizliliğine büyük önem veriyoruz. Sitemizi ziyaret ettiğinizde varsayılan olarak herhangi bir kişisel veriniz kayıt altına alınmaz.",
            privacy_h2: "2. Çerezler (Cookies) ve Yerel Depolama",
            privacy_p2: "Sitemiz, dil tercihleriniz (TR/EN) ve gezdiğiniz yerleri hatırlamak için tarayıcınızın yerel depolamasını kullanır.",
            privacy_h3: "3. Analitik Takibi",
            privacy_p3: "Performans ve kullanıcı deneyimini iyileştirmek amacıyla anonimleştirilmiş Google Analytics verileri toplanmaktadır.",
            terms_h1: "1. Hizmet Kullanım Şartları",
            terms_p1: "Bu web sitesindeki harita ve rehber bilgileri bilgilendirme amacıyla sunulmaktadır.",
            terms_h2: "2. Fikri Mülkiyet Hakları",
            terms_p2: "Web sitesinde yer alan tasarım, 3D küre algoritması, kod yapısı ve özgün içerikler Dünya Gezi Rehberi'ne aittir.",
            contact_modal_title: "İletişim",
            contact_desc: "Projeyle ilgili sorularınız, iş birliği teklifleriniz veya teknik destek için doğrudan bizimle iletişime geçebilirsiniz.",
            footer_desc: "Dünyanın en popüler şehirlerini interaktif 3D haritalar, kategori bazlı rehberler ve özelleştirilmiş seyahat rotaları ile keşfedin.",
            footer_nav: "Navigasyon",
            footer_legal: "Kurumsal & Yasal",
            footer_link_globe: "🌍 3D Dünya Haritası"
        },
        en: {
            world_title: "World Travel Guide",
            share_btn_title: "Share",
            hero_eyebrow: "INTERACTIVE TRAVEL GUIDE",
            hero_word1: "Explore",
            hero_word2: "The World",
            hero_sub: "Spin the globe, pick a city, start the adventure.",
            scroll_hint: "Drag the globe",
            share_modal_title: "Share",
            copy_btn: "Copy",
            footer_designed: "Designed by",
            share_text: "Discover the most beautiful cities in the world!",
            copied_text: "Copied!",
            nav_cloud: "Cloud Arch & AWS",
            nav_about: "About Us",
            nav_contact: "Contact",
            cloud_modal_title: "Platform & AWS Cloud Architecture",
            cloud_hero_title: "Interactive Geospatial Travel Guide Platform",
            cloud_hero_desc: "Our platform is a cloud-native system enabling users to explore global cities on interactive 3D globes and vector maps, build custom travel itineraries, and leverage analytics.",
            cloud_stack_title: "AWS Cloud Infrastructure & Service Architecture",
            aws_s3_desc: "Global low-latency edge distribution of 3D textures, vector map tiles, and spatial media via CloudFront and S3.",
            aws_lambda_desc: "Serverless microservices for dynamic POI queries, route optimization algorithms, and feedback endpoints.",
            aws_dynamo_desc: "Low-latency NoSQL storage for global POI datasets, user favorite lists, and real-time travel analytics telemetry.",
            aws_watch_desc: "Real-time system health metrics, automated SSL certificate management, and Route 53 global DNS security.",
            cloud_purpose_heading: "🎯 Platform Vision & Objectives",
            cloud_purpose_text: "This platform digitizes travel by offering interactive 3D spatial exploration, category-based smart filters, and custom route management. Built on AWS for rapid scalability and high availability.",
            about_modal_title: "About Us",
            about_heading: "World Travel Guide",
            about_tagline: "The Interactive Geospatial Exploration Platform",
            about_p1: "World Travel Guide is an innovative platform empowering travelers to visually explore global cities with spatial detail and interactive maps.",
            about_features_title: "Key Features:",
            about_f1: "3D Globe Experience: Explore global destinations on a WebGL/Canvas 3D sphere.",
            about_f2: "Interactive City Maps: Categorized spatial discovery for museums, dining, parks, and attractions.",
            about_f3: "Personal Travel Analytics: Track visited spots, daily itineraries, and travel completion rates.",
            about_f4: "Multi-Language Support: Global reach with seamless Turkish and English language switching.",
            legal_modal_title: "Privacy & Terms",
            tab_privacy: "Privacy Policy",
            tab_terms: "Terms of Service",
            privacy_h1: "1. Data Protection & Privacy",
            privacy_p1: "We prioritize user privacy. By default, no personally identifiable information is stored on our servers.",
            privacy_h2: "2. Cookies & Local Storage",
            privacy_p2: "Our site uses browser local storage to save your language preference (TR/EN) and visited places.",
            privacy_h3: "3. Analytics Tracking",
            privacy_p3: "Anonymized Google Analytics metrics are collected to improve site performance and user experience.",
            terms_h1: "1. Terms of Use",
            terms_p1: "All map and travel guide information on this site is provided for general informational purposes.",
            terms_h2: "2. Intellectual Property",
            terms_p2: "Design, 3D algorithms, code architecture, and spatial content belong to World Travel Guide.",
            contact_modal_title: "Contact Us",
            contact_desc: "Reach out to us directly for inquiries, technical support, or partnership opportunities.",
            footer_desc: "Discover the world's top cities with interactive 3D maps, smart category guides, and tailored travel itineraries.",
            footer_nav: "Navigation",
            footer_legal: "Legal & Corporate",
            footer_link_globe: "🌍 3D World Globe"
        }
    };
    
    let currentLang = localStorage.getItem('appLang') || 'tr';

    function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('appLang', lang);
        
        document.querySelectorAll('.lang-switcher button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (I18N[lang] && I18N[lang][key]) {
                el.textContent = I18N[lang][key];
            }
        });
        
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.dataset.i18nTitle;
            if (I18N[lang] && I18N[lang][key]) {
                el.title = I18N[lang][key];
            }
        });
        
        if (countries.length > 0) {
            renderCountryPills(countries);
            updateCityLabel();
        }
    }

    // === Initialize ===
    document.addEventListener('DOMContentLoaded', async () => {
        canvas = document.getElementById('globeCanvas');
        ctx = canvas.getContext('2d');

        resize();
        window.addEventListener('resize', resize);

        countries = await loadCountries();
        
        // Setup lang switch UI
        applyLanguage(currentLang);
        document.querySelectorAll('.lang-switcher button').forEach(btn => {
            btn.addEventListener('click', (e) => applyLanguage(e.target.dataset.lang));
        });

        renderCountryPills(countries);
        createParticles();
        initInteraction();
        initShareModal();
        initInfoModals();
        animateEntrance();

        // Burger menu toggle
        const burgerBtn = document.getElementById('burgerBtn');
        const navActions = document.getElementById('globeNavActions');
        if (burgerBtn && navActions) {
            burgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navActions.classList.toggle('open');
                burgerBtn.querySelector('i').className = navActions.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
            });
            document.addEventListener('click', (e) => {
                if (!navActions.contains(e.target) && !burgerBtn.contains(e.target)) {
                    navActions.classList.remove('open');
                    burgerBtn.querySelector('i').className = 'fas fa-bars';
                }
            });
        }

        requestAnimationFrame(loop);
    });

    function resize() {
        const container = document.getElementById('globeContainer');
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        width = rect.width;
        height = rect.height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Globe sizing - smaller and lower so text stays clear
        baseRadius = Math.min(width, height) * 0.30;
        radius = baseRadius * zoomLevel;
        globeCenterX = width * 0.5;
        globeCenterY = height * 0.58;
    }

    // === Data loading ===
    async function loadCountries() {
        try {
            const r = await fetch('data/countries.json?v=' + Date.now(), { cache: 'no-cache' });
            const d = await r.json();
            return d.countries.filter(c => c.active);
        } catch (e) {
            console.error('Failed to load countries:', e);
            return [];
        }
    }

    // === 3D Math ===
    function latLngTo3D(lat, lng) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = (lng + 180) * Math.PI / 180;
        return {
            x: -Math.sin(phi) * Math.cos(theta),
            y: Math.cos(phi),
            z: Math.sin(phi) * Math.sin(theta)
        };
    }

    function rotatePoint(p) {
        // Rotate around Y axis (longitude)
        let x1 = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
        let z1 = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
        // Rotate around X axis (latitude)
        let y1 = p.y * Math.cos(rotX) - z1 * Math.sin(rotX);
        let z2 = p.y * Math.sin(rotX) + z1 * Math.cos(rotX);
        return { x: x1, y: y1, z: z2 };
    }

    function project(p) {
        const perspective = 3;
        const scale = perspective / (perspective + p.z);
        return {
            x: globeCenterX + p.x * radius * scale,
            y: globeCenterY - p.y * radius * scale,
            scale: scale,
            z: p.z
        };
    }

    // === Render Loop ===
    function loop() {
        // Auto-rotate
        if (autoRotate && !isDragging) {
            targetRotY += CONFIG.rotationSpeed;
        }

        // Smooth interpolation
        rotX += (targetRotX - rotX) * 0.08;
        rotY += (targetRotY - rotY) * 0.08;
        
        // Zoom interpolation
        zoomLevel += (targetZoomLevel - zoomLevel) * 0.1;
        radius = baseRadius * zoomLevel;

        draw();
        animationId = requestAnimationFrame(loop);
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // === Outer glow ===
        const glowGrad = ctx.createRadialGradient(
            globeCenterX, globeCenterY, radius * 0.8,
            globeCenterX, globeCenterY, radius * 1.4
        );
        glowGrad.addColorStop(0, 'rgba(50, 120, 220, 0.12)');
        glowGrad.addColorStop(0.5, 'rgba(50, 120, 220, 0.04)');
        glowGrad.addColorStop(1, 'rgba(50, 120, 220, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, width, height);

        // === Globe sphere ===
        ctx.beginPath();
        ctx.arc(globeCenterX, globeCenterY, radius, 0, Math.PI * 2);
        
        // Sphere gradient
        const sphereGrad = ctx.createRadialGradient(
            globeCenterX - radius * 0.3, globeCenterY - radius * 0.3, radius * 0.1,
            globeCenterX, globeCenterY, radius
        );
        sphereGrad.addColorStop(0, 'rgba(30, 80, 160, 0.5)');
        sphereGrad.addColorStop(0.5, 'rgba(15, 50, 110, 0.35)');
        sphereGrad.addColorStop(1, 'rgba(5, 20, 60, 0.5)');
        ctx.fillStyle = sphereGrad;
        ctx.fill();

        // Sphere border
        ctx.strokeStyle = 'rgba(100, 180, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // === Grid lines (latitude / longitude) ===
        drawGrid();

        // === Continents ===
        drawContinents();

        // === Atmosphere edge ===
        const atmosGrad = ctx.createRadialGradient(
            globeCenterX, globeCenterY, radius * 0.92,
            globeCenterX, globeCenterY, radius * 1.08
        );
        atmosGrad.addColorStop(0, 'rgba(100, 180, 255, 0)');
        atmosGrad.addColorStop(0.5, 'rgba(100, 180, 255, 0.1)');
        atmosGrad.addColorStop(1, 'rgba(100, 180, 255, 0)');
        ctx.beginPath();
        ctx.arc(globeCenterX, globeCenterY, radius * 1.05, 0, Math.PI * 2);
        ctx.fillStyle = atmosGrad;
        ctx.fill();

        // === Country pins ===
        drawPins();

        // === Specular highlight ===
        const specGrad = ctx.createRadialGradient(
            globeCenterX - radius * 0.35, globeCenterY - radius * 0.35, 0,
            globeCenterX - radius * 0.35, globeCenterY - radius * 0.35, radius * 0.6
        );
        specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
        specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.beginPath();
        ctx.arc(globeCenterX, globeCenterY, radius, 0, Math.PI * 2);
        ctx.fillStyle = specGrad;
        ctx.fill();
    }

    function drawGrid() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(globeCenterX, globeCenterY, radius, 0, Math.PI * 2);
        ctx.clip();

        ctx.strokeStyle = CONFIG.gridColor;
        ctx.lineWidth = 0.5;

        // Latitude lines
        for (let lat = -60; lat <= 60; lat += 30) {
            ctx.beginPath();
            let started = false;
            for (let lng = -180; lng <= 180; lng += 5) {
                const p = rotatePoint(latLngTo3D(lat, lng));
                if (p.z < -0.1) { started = false; continue; }
                const s = project(p);
                if (!started) { ctx.moveTo(s.x, s.y); started = true; }
                else ctx.lineTo(s.x, s.y);
            }
            ctx.stroke();
        }

        // Longitude lines
        for (let lng = -180; lng < 180; lng += 30) {
            ctx.beginPath();
            let started = false;
            for (let lat = -90; lat <= 90; lat += 5) {
                const p = rotatePoint(latLngTo3D(lat, lng));
                if (p.z < -0.1) { started = false; continue; }
                const s = project(p);
                if (!started) { ctx.moveTo(s.x, s.y); started = true; }
                else ctx.lineTo(s.x, s.y);
            }
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawContinents() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(globeCenterX, globeCenterY, radius, 0, Math.PI * 2);
        ctx.clip();

        CONTINENTS.forEach(cont => {
            ctx.beginPath();
            let started = false;
            let allBehind = true;

            const projected = cont.points.map(([lat, lng]) => {
                const p = rotatePoint(latLngTo3D(lat, lng));
                const s = project(p);
                s.behind = p.z < -0.05;
                if (!s.behind) allBehind = false;
                return s;
            });

            if (allBehind) return;

            projected.forEach((s, i) => {
                if (s.behind) { started = false; return; }
                if (!started) { ctx.moveTo(s.x, s.y); started = true; }
                else ctx.lineTo(s.x, s.y);
            });

            ctx.closePath();
            
            // Enhanced continent graphics
            const contFill = cont.color || 'rgba(40, 130, 220, 0.25)'; // stronger earth-like base
            ctx.fillStyle = contFill;
            ctx.fill();
            
            // Neon glowing stroke
            ctx.strokeStyle = 'rgba(80, 200, 255, 0.6)';
            ctx.lineWidth = Math.max(0.6, 1.2 * zoomLevel);
            ctx.stroke();
        });

        ctx.restore();
    }

    function drawPins() {
        hoveredPin = null;

        // Sort by z for depth ordering (back to front)
        const pinData = countries.map(c => {
            const p3d = rotatePoint(latLngTo3D(c.position.lat, c.position.lng));
            const p2d = project(p3d);
            return { country: c, p3d, p2d, visible: p3d.z > -0.15 };
        }).filter(p => p.visible).sort((a, b) => a.p3d.z - b.p3d.z);

        pinData.forEach(({ country, p2d, p3d }) => {
            const alpha = Math.max(0, Math.min(1, (p3d.z + 0.15) * 2));
            const color = country.color || '#e94560';
            const isHovered = isPointNearMouse(p2d.x, p2d.y, 20);

            if (isHovered) hoveredPin = country;

            const size = isHovered ? CONFIG.pinHoverSize : CONFIG.pinSize;

            // Pulse ring
            const pulseTime = (Date.now() % 2000) / 2000;
            const pulseRadius = size + pulseTime * 18;
            const pulseAlpha = (1 - pulseTime) * 0.5 * alpha;
            ctx.beginPath();
            ctx.arc(p2d.x, p2d.y, pulseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = color.replace(')', `,${pulseAlpha})`).replace('rgb', 'rgba');
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Second pulse ring (offset)
            const pulse2Time = ((Date.now() + 1000) % 2000) / 2000;
            const pulse2Radius = size + pulse2Time * 14;
            const pulse2Alpha = (1 - pulse2Time) * 0.3 * alpha;
            ctx.beginPath();
            ctx.arc(p2d.x, p2d.y, pulse2Radius, 0, Math.PI * 2);
            ctx.strokeStyle = color.replace(')', `,${pulse2Alpha})`).replace('rgb', 'rgba');
            ctx.lineWidth = 1;
            ctx.stroke();

            // Glow
            const glowGrad = ctx.createRadialGradient(p2d.x, p2d.y, 0, p2d.x, p2d.y, size * 3);
            glowGrad.addColorStop(0, hexToRgba(color, 0.3 * alpha));
            glowGrad.addColorStop(1, hexToRgba(color, 0));
            ctx.beginPath();
            ctx.arc(p2d.x, p2d.y, size * 3, 0, Math.PI * 2);
            ctx.fillStyle = glowGrad;
            ctx.fill();

            // Main dot
            ctx.beginPath();
            ctx.arc(p2d.x, p2d.y, size, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(color, alpha);
            ctx.fill();
            ctx.strokeStyle = `rgba(255,255,255,${0.8 * alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Inner dot
            ctx.beginPath();
            ctx.arc(p2d.x, p2d.y, size * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${0.9 * alpha})`;
            ctx.fill();

            // Flag label (above pin)
            if (alpha > 0.4) {
                const labelY = p2d.y - size - 18;
                ctx.font = `${isHovered ? 22 : 18}px 'Space Grotesk', sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Label background
                const flagText = country.flag;
                const metrics = ctx.measureText(flagText);
                const labelW = Math.max(metrics.width + 16, 40);
                const labelH = isHovered ? 32 : 28;

                ctx.beginPath();
                roundRect(ctx, p2d.x - labelW / 2, labelY - labelH / 2, labelW, labelH, 14);
                ctx.fillStyle = `rgba(0,0,0,${0.7 * alpha})`;
                ctx.fill();
                ctx.strokeStyle = hexToRgba(color, 0.5 * alpha);
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.fillText(flagText, p2d.x, labelY + 1);
            }
        });

        // Update city label
        updateCityLabel();
    }

    // === Interaction ===
    let mouseX = -999, mouseY = -999;

    function initInteraction() {
        // Mouse
        canvas.addEventListener('mousedown', onPointerDown);
        canvas.addEventListener('mousemove', onPointerMove);
        canvas.addEventListener('mouseup', onPointerUp);
        canvas.addEventListener('mouseleave', onPointerUp);
        canvas.addEventListener('click', onClick);

        // Zoom functionality
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.15;
            if (e.deltaY < 0) {
                targetZoomLevel += zoomSpeed;
            } else {
                targetZoomLevel -= zoomSpeed;
            }
            targetZoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoomLevel));
            isInteracting = true;
            clearTimeout(window._autoRotateTimer);
            window._autoRotateTimer = setTimeout(() => { autoRotate = true; isInteracting = false; }, 4000);
        }, { passive: false });

        // Touch
        canvas.addEventListener('touchstart', e => { e.preventDefault(); onPointerDown(touchToMouse(e)); }, { passive: false });
        canvas.addEventListener('touchmove', e => { e.preventDefault(); onPointerMove(touchToMouse(e)); }, { passive: false });
        canvas.addEventListener('touchend', e => { onPointerUp(touchToMouse(e)); });
    }

    function touchToMouse(e) {
        const t = e.touches[0] || e.changedTouches[0];
        return { clientX: t.clientX, clientY: t.clientY, offsetX: t.clientX - canvas.getBoundingClientRect().left, offsetY: t.clientY - canvas.getBoundingClientRect().top };
    }

    function onPointerDown(e) {
        isDragging = true;
        autoRotate = false;
        dragStart = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = 'grabbing';

        // Hide scroll hint
        const hint = document.getElementById('scrollHint');
        if (hint) hint.style.opacity = '0';
    }

    function onPointerMove(e) {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX || e.offsetX) - rect.left;
        mouseY = (e.clientY || e.offsetY) - rect.top;

        if (isDragging) {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            targetRotY += dx * CONFIG.dragSensitivity;
            targetRotX -= dy * CONFIG.dragSensitivity;
            targetRotX = Math.max(-1.2, Math.min(1.2, targetRotX));
            dragStart = { x: e.clientX, y: e.clientY };
        }

        // Cursor
        canvas.style.cursor = hoveredPin ? 'pointer' : (isDragging ? 'grabbing' : 'grab');
    }

    function onPointerUp() {
        isDragging = false;
        canvas.style.cursor = hoveredPin ? 'pointer' : 'grab';

        // Resume auto-rotate after 4s of no interaction
        clearTimeout(window._autoRotateTimer);
        window._autoRotateTimer = setTimeout(() => { autoRotate = true; }, 4000);
    }

    function onClick(e) {
        if (hoveredPin) {
            navigateToCity(hoveredPin.slug);
        }
    }

    function isPointNearMouse(px, py, threshold) {
        return Math.hypot(px - mouseX, py - mouseY) < threshold;
    }

    // === City Label ===
    function updateCityLabel() {
        const label = document.getElementById('cityLabel');
        if (!label) return;

        if (hoveredPin) {
            const p3d = rotatePoint(latLngTo3D(hoveredPin.position.lat, hoveredPin.position.lng));
            const p2d = project(p3d);

            document.getElementById('cityLabelFlag').textContent = hoveredPin.flag;
            document.getElementById('cityLabelName').textContent = currentLang === 'tr' ? hoveredPin.city : (hoveredPin.name_en || hoveredPin.city);
            document.getElementById('cityLabelCountry').textContent = hoveredPin.name;

            label.style.left = p2d.x + 'px';
            label.style.top = (p2d.y - CONFIG.pinHoverSize - 60) + 'px';
            label.classList.add('visible');
        } else {
            label.classList.remove('visible');
        }
    }

    // === Country Pills ===
    function renderCountryPills(countries) {
        const container = document.getElementById('countryPills');
        if (!container) return;

        container.innerHTML = countries.map(c => `
            <button class="country-pill" onclick="focusOnCountry('${c.id}')" style="--pill-color: ${c.color}">
                <span class="pill-flag">${c.flag}</span>
                <span class="pill-city">${currentLang === 'tr' ? c.city : (c.name_en || c.city)}</span>
                <i class="fas fa-chevron-right pill-arrow"></i>
            </button>
        `).join('');
    }

    // Focus globe on specific country
    window.focusOnCountry = function (id) {
        const c = countries.find(co => co.id === id);
        if (!c) return;

        autoRotate = false;
        clearTimeout(window._autoRotateTimer);

        // Calculate target rotation to center this country
        const phi = (90 - c.position.lat) * Math.PI / 180;
        const theta = (c.position.lng + 180) * Math.PI / 180;

        targetRotY = -(theta - Math.PI);
        targetRotX = -(phi - Math.PI / 2);
        targetRotX = Math.max(-1.2, Math.min(1.2, targetRotX));

        // Navigate after a short animation
        setTimeout(() => navigateToCity(c.slug), 1200);
    };

    // === Navigation ===
    function navigateToCity(slug) {
        document.body.classList.add('page-transitioning');
        setTimeout(() => {
            window.location.href = `city.html?city=${slug}`;
        }, 500);
    }

    // === Entrance Animation ===
    function animateEntrance() {
        const heroText = document.getElementById('heroText');
        setTimeout(() => heroText?.classList.add('visible'), 300);

        const bottomBar = document.getElementById('bottomBar');
        setTimeout(() => bottomBar?.classList.add('visible'), 800);
    }

    // === Particles ===
    function createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        for (let i = 0; i < CONFIG.particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                width: ${1 + Math.random() * 2}px;
                height: ${1 + Math.random() * 2}px;
                animation-duration: ${5 + Math.random() * 10}s;
                animation-delay: ${Math.random() * 5}s;
                opacity: ${0.1 + Math.random() * 0.3};
            `;
            container.appendChild(p);
        }
    }

    // === Info & AWS Modals ===
    function initInfoModals() {
        const modals = {
            cloud: { modal: document.getElementById('cloudArchModal'), btn: document.getElementById('cloudArchBtn'), footerBtn: document.getElementById('footerLinkCloud'), close: document.getElementById('closeCloudArchModal') },
            about: { modal: document.getElementById('aboutModal'), btn: document.getElementById('aboutNavBtn'), footerBtn: document.getElementById('footerLinkAbout'), close: document.getElementById('closeAboutModal') },
            legal: { modal: document.getElementById('legalModal'), close: document.getElementById('closeLegalModal') },
            contact: { modal: document.getElementById('contactModal'), btn: document.getElementById('contactNavBtn'), footerBtn: document.getElementById('footerLinkContact'), close: document.getElementById('closeContactModal') }
        };

        const openModal = (m) => m?.classList.add('active');
        const closeModal = (m) => m?.classList.remove('active');

        // Cloud Arch
        modals.cloud.btn?.addEventListener('click', () => openModal(modals.cloud.modal));
        modals.cloud.footerBtn?.addEventListener('click', () => openModal(modals.cloud.modal));
        modals.cloud.close?.addEventListener('click', () => closeModal(modals.cloud.modal));

        // About
        modals.about.btn?.addEventListener('click', () => openModal(modals.about.modal));
        modals.about.footerBtn?.addEventListener('click', () => openModal(modals.about.modal));
        modals.about.close?.addEventListener('click', () => closeModal(modals.about.modal));

        // Contact
        modals.contact.btn?.addEventListener('click', () => openModal(modals.contact.modal));
        modals.contact.footerBtn?.addEventListener('click', () => openModal(modals.contact.modal));
        modals.contact.close?.addEventListener('click', () => closeModal(modals.contact.modal));

        // Legal & Tabs
        const privacyFooterBtn = document.getElementById('footerLinkPrivacy');
        const termsFooterBtn = document.getElementById('footerLinkTerms');
        const tabPrivacyBtn = document.getElementById('tabPrivacyBtn');
        const tabTermsBtn = document.getElementById('tabTermsBtn');
        const privacyTabContent = document.getElementById('privacyTabContent');
        const termsTabContent = document.getElementById('termsTabContent');

        function switchLegalTab(tab) {
            if (tab === 'privacy') {
                tabPrivacyBtn?.classList.add('active');
                tabTermsBtn?.classList.remove('active');
                privacyTabContent?.classList.add('active');
                termsTabContent?.classList.remove('active');
            } else {
                tabTermsBtn?.classList.add('active');
                tabPrivacyBtn?.classList.remove('active');
                termsTabContent?.classList.add('active');
                privacyTabContent?.classList.remove('active');
            }
        }

        privacyFooterBtn?.addEventListener('click', () => {
            switchLegalTab('privacy');
            openModal(modals.legal.modal);
        });

        termsFooterBtn?.addEventListener('click', () => {
            switchLegalTab('terms');
            openModal(modals.legal.modal);
        });

        tabPrivacyBtn?.addEventListener('click', () => switchLegalTab('privacy'));
        tabTermsBtn?.addEventListener('click', () => switchLegalTab('terms'));
        modals.legal.close?.addEventListener('click', () => closeModal(modals.legal.modal));

        // General Outside click listener for all modals
        window.addEventListener('click', (e) => {
            Object.values(modals).forEach(item => {
                if (item.modal && e.target === item.modal) {
                    closeModal(item.modal);
                }
            });
        });
    }

    // === Share Modal ===
    function initShareModal() {
        const modal = document.getElementById('shareModal');
        const btn = document.getElementById('shareBtn');
        const close = document.getElementById('closeModal');
        const link = document.getElementById('shareLink');

        btn?.addEventListener('click', () => { modal.classList.add('active'); link.value = window.location.href; });
        close?.addEventListener('click', () => modal.classList.remove('active'));
        modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
    }


    window.shareOn = function (platform) {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(currentLang === 'tr' ? I18N.tr.share_text : I18N.en.share_text);
        let u = '';
        switch (platform) {
            case 'facebook': u = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
            case 'twitter': u = `https://x.com/intent/tweet?url=${url}&text=${text}`; break;
            case 'whatsapp': u = `https://wa.me/?text=${text}%20${url}`; break;
            case 'linkedin': u = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`; break;
        }
        if (u) window.open(u, '_blank', 'width=600,height=400');
    };

    window.copyLink = function () {
        const inp = document.getElementById('shareLink');
        inp.select();
        navigator.clipboard.writeText(inp.value).then(() => {
            const b = document.querySelector('.btn-copy');
            const o = b.innerHTML;
            b.innerHTML = '<i class="fas fa-check"></i> Kopyalandı!';
            b.style.background = '#27ae60';
            setTimeout(() => { b.innerHTML = o; b.style.background = ''; }, 2000);
        });
    };

    // === Helpers ===
    function hexToRgba(hex, alpha) {
        // Support named colors too
        if (hex.startsWith('#')) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r},${g},${b},${alpha})`;
        }
        return hex;
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
    }

})();

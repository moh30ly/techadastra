// Yalnızca kurumsal sürümde kullanılan metinler (config.js → theme: 'enterprise').
// Diğer tüm metinler ../tr.mjs dosyasından gelir.
export default {
  nav: { cta: 'Teklif isteyin' },
  footerTagline: 'Beşiktaş, İstanbul’dan kurumsal teknoloji eğitimi ve danışmanlık.',

  hero: {
    eyebrow: 'Kurumsal teknoloji eğitimi',
    title: 'Kurumunuzun ihtiyaç duyduğu teknoloji yetkinliklerini kazandırıyoruz.',
    lead:
      'Adastra; yapay zekâ, yazılım mühendisliği, dijital çalışma becerileri ve oyun teknolojileri alanlarında kurumsal eğitimler tasarlar ve verir — İstanbul’da yerinde veya canlı online, Türkçe, İngilizce ve Almanca.',
    primary: 'Teklif isteyin',
    secondary: 'Eğitim programlarını görün',
    facts: ['Türkçe, İngilizce ve Almanca eğitim', 'İstanbul’da yerinde veya canlı online', 'Her program ekibinize özel'],
  },

  plan: {
    label: 'Örnek program planı',
    title: 'Yapay Zekâ Yetkinlik Programı',
    meta: 'Ekibinize özel · karma eğitim',
    modules: ['Tüm çalışanlar için YZ okuryazarlığı', 'Prompt yazımı & iş akışı otomasyonu', 'Analistler için Python', 'Canlı ortamda makine öğrenmesi'],
    footer: ['Yerinde', 'Online', 'Karma'],
    assess: 'Yetkinlik ölçümü',
    before: 'Önce',
    after: 'Sonra',
  },

  solutions: {
    eyebrow: 'Eğitim çözümleri',
    title: 'Sadece bireyler için değil, ekipler için tasarlanmış programlar.',
    lead: 'Hazır bir müfredat seçin ya da araçlarınıza, verilerinize ve hedeflerinize göre size özel bir program tasarlayalım.',
    items: [
      {
        key: 'ai',
        title: 'Yapay Zekâ Yetkinlikleri',
        text: 'Tüm departmanların yapay zekâyı güvenli ve verimli kullanmasını sağlayın.',
        points: ['İş ekipleri için üretken yapay zekâ', 'Teknik ekipler için makine öğrenmesi', 'Sorumlu YZ ve veri politikaları'],
      },
      {
        key: 'software',
        title: 'Yazılım Mühendisliği Akademileri',
        text: 'Yazılımcılarınızı başlangıç seviyesinden canlı projelere hazır hâle getirin.',
        points: ['Python, web ve full-stack eğitimleri', 'Git, test ve kod inceleme', 'Yeni çalışanlar için uyum programları'],
      },
      {
        key: 'computer',
        title: 'Dijital Çalışma Becerileri',
        text: 'Şirket genelinde dijital yetkinlik seviyesini yükseltin.',
        points: ['Microsoft 365 ve verimlilik', 'Excel ile veri analizi', 'Çalışanlar için güvenlik farkındalığı'],
      },
      {
        key: 'games',
        title: 'Oyun & Simülasyon Teknolojileri',
        text: 'Eğitim, simülasyon ve medya ekipleri için Unity ve Unreal yetkinlikleri.',
        points: ['İnteraktif ve ciddi oyun tasarımı', 'Unity ve Unreal Engine', 'Oyunlaştırılmış eğitim içerikleri'],
      },
    ],
  },

  delivery: {
    eyebrow: 'Eğitim formatları',
    title: 'Kurumunuzun çalışma düzenine uyan eğitimler.',
    text: 'Eğitimleri operasyonunuza göre planlıyoruz — tam gün, yarım gün veya haftalık oturumlar — ve ekibinizin düşündüğü dilde veriyoruz.',
    items: [
      { icon: 'mentor', title: 'Yerinde, eğitmen eşliğinde', text: 'İstanbul’daki ofislerinizde veya Beşiktaş’taki eğitim salonumuzda.' },
      { icon: 'hybrid', title: 'Canlı sanal sınıf', text: 'Dağınık ve uluslararası ekipler için interaktif, eğitmen eşliğinde oturumlar.' },
      { icon: 'transform', title: 'Karma programlar', text: 'Atölyeler, rehberli uygulamalar ve takip oturumları bir arada.' },
      { icon: 'build', title: 'Kurumsal akademiler', text: 'Rolleriniz ve kariyer yollarınız etrafında kurgulanan çok aylı programlar.' },
    ],
  },

  approach: {
    eyebrow: 'Yaklaşımımız',
    title: 'İlk oturumdan sonuncusuna kadar ölçülebilir.',
    steps: [
      { title: 'Analiz', text: 'Mevcut yetkinlikleri belirler, işiniz için önemli olan hedefleri birlikte tanımlarız.' },
      { title: 'Tasarım', text: 'Araçlarınıza, verilerinize ve işinizden gerçek örneklere dayanan bir müfredat.' },
      { title: 'Eğitim', text: 'Seçtiğiniz format ve dilde, sahadan uzmanlarla uygulamalı eğitim.' },
      { title: 'Ölçüm', text: 'Eğitim sonrası değerlendirme ve İK ile eğitim ekipleriniz için rapor.' },
    ],
  },

  included: {
    eyebrow: 'Her programa dahil',
    title: 'Eğitim ve gelişim ekibinizin ihtiyaç duyduğu her şey.',
    items: [
      'Başlamadan önce eğitim ihtiyaç analizi',
      'Araçlarınıza ve sektörünüze özel müfredat',
      'Eğitim öncesi ve sonrası yetkinlik ölçümü',
      'Katılım ve ilerleme raporları',
      'Katılımcılara katılım sertifikası',
      'Katılımcıların saklayacağı eğitim materyalleri',
      'Türkçe, İngilizce veya Almanca eğitim',
      'Program sonrası destek',
    ],
  },

  consulting: {
    eyebrow: 'Eğitimin ötesinde',
    title: 'Yeni yetkinlikleri sonuca dönüştüren danışmanlık.',
    text: 'Ekiplerinizi eğiten uzmanlar, öğrendiklerini uygulamanıza da yardımcı olabilir — yapay zekâ stratejisi ve otomasyondan özel yazılıma kadar.',
    cta: 'Danışmanlığı keşfedin',
  },

  faq: {
    eyebrow: 'SSS',
    title: 'İK ve eğitim ekiplerinden gelen sorular',
    items: [
      { q: 'Programı şirketimize göre uyarlayabilir misiniz?', a: 'Evet. Her çalışma bir ihtiyaç analiziyle başlar; içerik, örnekler, takvim ve dili ekibinize göre uyarlarız.' },
      { q: 'Ofisimizde eğitim veriyor musunuz?', a: 'Evet. İstanbul’da yerinde, Beşiktaş’taki eğitim salonumuzda veya dağınık ekipler için canlı sanal sınıf olarak eğitim veriyoruz.' },
      { q: 'Hangi dillerde eğitim veriyorsunuz?', a: 'Türkçe, İngilizce ve Almanca. Farklı dillerdeki gruplar paralel oturumlara ayrılabilir.' },
      { q: 'Sonuçları nasıl göreceğiz?', a: 'Katılımcılar program öncesi ve sonrası değerlendirilir; size katılım, ilerleme ve önerileri içeren bir rapor sunulur.' },
      { q: 'Nasıl teklif alabiliriz?', a: 'Hedeflerinizi, ekip büyüklüğünü ve zamanlamayı bize iletin. Bir iş günü içinde kısa bir görüşme planlamak için dönüş yapar, ardından yazılı teklifimizi göndeririz.' },
    ],
  },

  cta: {
    title: 'Ekibinizin bir sonraki yetkinliğini planlayın.',
    text: 'Ekibinizden ve hedeflerinizden bahsedin. Bir iş günü içinde sonraki adımlarla size dönüş yapalım.',
    primary: 'Teklif isteyin',
    secondary: 'E-posta gönderin',
  },

  programs: {
    eyebrow: 'Kurumsal eğitim programları',
    title: 'Ekipleriniz için eğitim programları.',
    lead: 'Aşağıdaki tüm programlar şirketinize özel olarak verilebilir — ekibinize göre uyarlanır, planlanır ve tercih ettiğiniz dilde anlatılır.',
    enquire: 'Ekibim için talep et',
  },
};

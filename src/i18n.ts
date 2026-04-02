import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        experts: 'Our Experts',
        portfolio: 'Smile Portfolio',
        dashboard: 'Dashboard',
        signIn: 'Sign In',
      },
      hero: {
        badge: 'Redefining Aesthetic Dentistry',
        title: 'World-Class Orthodontic Excellence',
        subtitle: 'Experience clinical excellence combined with luxury care. Our world-class experts use cutting-edge technology to craft your most confident smile.',
        cta: 'Start Your Journey',
        stats: '5,000+ Happy Patients',
      },
      services: {
        title: 'World-Class Services',
        subtitle: 'We provide a comprehensive range of dental treatments using the latest clinical advancements.',
        smileDesign: {
          title: 'Smile Design',
          desc: 'Digital smile planning for perfectly symmetrical and natural-looking results.',
        },
        implants: {
          title: 'Dental Implants',
          desc: 'Permanent, stable solutions for missing teeth using premium titanium implants.',
        },
        ortho: {
          title: 'Orthodontics',
          desc: 'Invisalign and modern braces for perfectly aligned teeth at any age.',
        },
        learnMore: 'Learn More',
      },
      booking: {
        title: 'Book Your Consultation',
        subtitle: 'Take the first step towards your dream smile. Fill out the form and our team will get back to you shortly.',
        form: {
          firstName: 'First Name',
          lastName: 'Last Name',
          email: 'Email Address',
          service: 'Service Interested In',
          message: 'Message (Optional)',
          submit: 'Request Appointment',
          submitting: 'Processing...',
          signInToBook: 'Sign in to Book',
        },
        success: {
          title: 'Request Received!',
          desc: 'Our coordinator will contact you within 2 hours to confirm your preferred time slot.',
          back: 'Back to Home',
        },
        confirmation: {
          title: 'Appointment Confirmed',
          details: 'Appointment Details',
          patient: 'Patient',
          service: 'Service',
          date: 'Date & Time',
          nextSteps: 'Next Steps',
          step1: 'Our team will review your request and verify the clinical availability.',
          step2: 'You will receive a confirmation call or SMS within 2 hours.',
          step3: 'Please arrive at the clinic 10 minutes before your scheduled time.',
          done: 'Done',
        },
      },
      dashboard: {
        patient: {
          welcome: 'Welcome, {{name}}',
          subtitle: 'Manage your dental health and appointments.',
          nextAppointment: 'Next Appointment',
          noUpcoming: 'No upcoming appointments',
          healthStatus: 'Health Status',
          healthDesc: 'Clinical excellence verified.',
          balance: 'Outstanding Balance',
          balanceZero: '$0.00 (All clear)',
          history: 'Appointment History',
          viewAll: 'View All',
          table: {
            date: 'Date',
            dentist: 'Dentist',
            type: 'Type',
            status: 'Status',
            noAppointments: 'No appointments found.',
          },
        },
        staff: {
          title: 'Staff Dashboard',
          appointments: 'Appointments',
          experts: 'Experts',
          reminders: {
            sendSms: 'Send SMS',
            sendWhatsapp: 'Send WhatsApp',
            smsSent: 'SMS Sent',
            whatsappSent: 'WhatsApp Sent',
            noReminders: 'No reminders sent',
            sending: 'Sending...',
          },
        },
      },
      experts: {
        title: 'Meet Our Experts',
        subtitle: 'A dedicated team of specialists committed to your oral health.',
        drSarah: {
          name: 'Dr. Mohamed Ahmed Tulba',
          role: 'Consultant Orthodontist',
          bio: 'Specializing in digital smile design with over 12 years of international experience.',
        },
        drMichael: {
          name: 'Dr. Michael Chen',
          role: 'Implant Specialist',
          bio: 'Expert in minimally invasive implantology and full-mouth reconstruction.',
        },
        drElena: {
          name: 'Dr. Elena Rossi',
          role: 'Orthodontist',
          bio: 'Certified Invisalign Diamond provider focusing on functional aesthetics.',
        },
      },
      portfolio: {
        title: 'Smile Portfolio',
        subtitle: 'Real transformations from our happy patients.',
        cases: {
          makeover: { title: 'Full Smile Makeover', desc: 'Veneers & Whitening' },
          alignment: { title: 'Invisible Alignment', desc: 'Invisalign Treatment' },
          restoration: { title: 'Dental Restoration', desc: 'Premium Implants' },
        },
      },
      stats: {
        experience: 'Years Experience',
        doctors: 'Expert Doctors',
        success: 'Success Rate',
        clinics: 'Modern Clinics',
      },
      tech: {
        badge: 'Future of Dentistry',
        title: 'Precision Driven by Advanced Technology',
        desc: 'We invest in the world\'s most advanced diagnostic and treatment tools, from 3D intraoral scanners to AI-assisted surgical planning, ensuring painless and accurate results.',
        items: [
          'AI-Powered Diagnostic Imaging',
          'Pain-Free Laser Dentistry',
          '3D Digital Smile Design',
          'Microscopic Precision Surgery'
        ],
      },
      testimonials: {
        title: 'What our patients say',
        subtitle: 'Hear from those who have experienced the S Dental Center difference.',
        items: [
          { name: 'nur shakirah', text: 'The clinic is beautiful, clean and very comfortable. The atmosphere feels calm and relaxing. The dentist and staff is kind and friendly and most importantly, the treatment is completely painless. The appointments are well-organized, so there’s no long waiting time. Highly recommended for those who want to do any teeth treatment.', role: '6 months ago' },
          { name: 'mizzu', text: 'I was very happy, comfortable, safe, and trustworthy. The doctor was also very professional, with straight teeth, achieving your best smile❤️❤️', role: '5 months ago' },
          { name: 'Izzatul Sholihah', text: 'Excellent. The doctor is very kind and the treatment is very gentle. Extremely satisfied. The place is also very comfortable. The waiting time was short because the appointment was scheduled in advance. I recommend this clinic if anyone want to do any teeth treatment.', role: '9 months ago' }
        ],
      },
      cta: {
        title: 'Ready for Your New Smile?',
        subtitle: 'Schedule your comprehensive consultation today and discover the possibilities for your smile.',
        button: 'Book Your Appointment',
      },
      footer: {
        desc: 'Setting the gold standard in aesthetic dentistry. Our commitment to clinical excellence and patient comfort is unwavering.',
        links: 'Quick Links',
        legal: 'Legal',
        rights: '© 2026 S Dental Center. All rights reserved.',
      },
    },
  },
  ar: {
    translation: {
      nav: {
        home: 'الرئيسية',
        experts: 'خبراؤنا',
        portfolio: 'معرض الابتسامات',
        dashboard: 'لوحة التحكم',
        signIn: 'تسجيل الدخول',
      },
      hero: {
        badge: 'إعادة تعريف طب الأسنان التجميلي',
        title: 'تميز عالمي في تقويم الأسنان',
        subtitle: 'اختبر التميز السريري الممزوج بالرعاية الفاخرة. يستخدم خبراؤنا العالميون أحدث التقنيات لصياغة ابتسامتك الأكثر ثقة.',
        cta: 'ابدأ رحلتك',
        stats: 'أكثر من 5000 مريض سعيد',
      },
      services: {
        title: 'خدمات عالمية المستوى',
        subtitle: 'نقدم مجموعة شاملة من علاجات الأسنان باستخدام أحدث التطورات السريرية.',
        smileDesign: {
          title: 'تصميم الابتسامة',
          desc: 'تخطيط الابتسامة الرقمي للحصول على نتائج متناظرة تماماً وطبيعية المظهر.',
        },
        implants: {
          title: 'زراعة الأسنان',
          desc: 'حلول دائمة ومستقرة للأسنان المفقودة باستخدام غرسات التيتانيوم الممتازة.',
        },
        ortho: {
          title: 'تقويم الأسنان',
          desc: 'إنفيسالاين والتقويم الحديث لأسنان متناسقة تماماً في أي عمر.',
        },
        learnMore: 'اقرأ المزيد',
      },
      booking: {
        title: 'احجز استشارتك',
        subtitle: 'اتخذ الخطوة الأولى نحو ابتسامة أحلامك. املأ النموذج وسيتواصل معك فريقنا قريباً.',
        form: {
          firstName: 'الاسم الأول',
          lastName: 'اسم العائلة',
          email: 'البريد الإلكتروني',
          service: 'الخدمة المهتم بها',
          message: 'رسالة (اختياري)',
          submit: 'طلب موعد',
          submitting: 'جاري المعالجة...',
          signInToBook: 'سجل الدخول للحجز',
        },
        success: {
          title: 'تم استلام الطلب!',
          desc: 'سيتصل بك منسقنا في غضون ساعتين لتأكيد موعدك المفضل.',
          back: 'العودة للرئيسية',
        },
      },
      dashboard: {
        patient: {
          welcome: 'مرحباً، {{name}}',
          subtitle: 'إدارة صحة أسنانك ومواعيدك.',
          nextAppointment: 'الموعد القادم',
          noUpcoming: 'لا توجد مواعيد قادمة',
          healthStatus: 'الحالة الصحية',
          healthDesc: 'تم التحقق من التميز السريري.',
          balance: 'الرصيد المستحق',
          balanceZero: '0.00$ (كل شيء تمام)',
          history: 'سجل المواعيد',
          viewAll: 'عرض الكل',
          table: {
            date: 'التاريخ',
            dentist: 'الطبيب',
            type: 'النوع',
            status: 'الحالة',
            noAppointments: 'لم يتم العثور على مواعيد.',
          },
        },
      },
      experts: {
        title: 'تعرف على خبراؤنا',
        subtitle: 'فريق متخصص من الأطباء الملتزمين بصحة فمك.',
        drSarah: {
          name: 'د. محمد أحمد طلبة',
          role: 'استشاري تقويم أسنان',
          bio: 'متخصص في تصميم الابتسامة الرقمي مع أكثر من 12 عاماً من الخبرة الدولية.',
        },
        drMichael: {
          name: 'د. مايكل تشين',
          role: 'أخصائي زراعة الأسنان',
          bio: 'خبير في زراعة الأسنان طفيفة التوغل وإعادة بناء الفم بالكامل.',
        },
        drElena: {
          name: 'د. إيلينا روسي',
          role: 'أخصائية تقويم الأسنان',
          bio: 'مزود معتمد لإنفيسالاين دايموند مع التركيز على الجماليات الوظيفية.',
        },
      },
      portfolio: {
        title: 'معرض الابتسامات',
        subtitle: 'تحولات حقيقية لمرضانا السعداء.',
        cases: {
          makeover: { title: 'تجميل كامل للابتسامة', desc: 'فينير وتبييض' },
          alignment: { title: 'تقويم غير مرئي', desc: 'علاج إنفيسالاين' },
          restoration: { title: 'ترميم الأسنان', desc: 'زراعة أسنان ممتازة' },
        },
      },
      stats: {
        experience: 'سنوات الخبرة',
        doctors: 'أطباء خبراء',
        success: 'نسبة النجاح',
        clinics: 'عيادات حديثة',
      },
      tech: {
        badge: 'مستقبل طب الأسنان',
        title: 'دقة مدفوعة بالتكنولوجيا المتقدمة',
        desc: 'نستثمر في أكثر أدوات التشخيص والعلاج تقدماً في العالم، من الماسحات الضوئية الرقمية للفم إلى التخطيط الجراحي بمساعدة الذكاء الاصطناعي، لضمان نتائج دقيقة وغير مؤلمة.',
        items: [
          'تصوير تشخيصي مدعوم بالذكاء الاصطناعي',
          'طب أسنان بالليزر بدون ألم',
          'تصميم الابتسامة الرقمي ثلاثي الأبعاد',
          'جراحة مجهرية دقيقة'
        ],
      },
      testimonials: {
        title: 'ماذا يقول مرضانا',
        subtitle: 'استمع إلى أولئك الذين اختبروا فرق مركز S للأسنان.',
        items: [
          { name: 'nur shakirah', text: 'The clinic is beautiful, clean and very comfortable. The atmosphere feels calm and relaxing. The dentist and staff is kind and friendly and most importantly, the treatment is completely painless. The appointments are well-organized, so there’s no long waiting time. Highly recommended for those who want to do any teeth treatment.', role: '6 months ago' },
          { name: 'mizzu', text: 'I was very happy, comfortable, safe, and trustworthy. The doctor was also very professional, with straight teeth, achieving your best smile❤️❤️', role: '5 months ago' },
          { name: 'Izzatul Sholihah', text: 'Excellent. The doctor is very kind and the treatment is very gentle. Extremely satisfied. The place is also very comfortable. The waiting time was short because the appointment was scheduled in advance. I recommend this clinic if anyone want to do any teeth treatment.', role: '9 months ago' }
        ],
      },
      cta: {
        title: 'هل أنت مستعد لابتسامتك الجديدة؟',
        subtitle: 'حدد موعد استشارتك الشاملة اليوم واكتشف الاحتمالات لابتسامتك.',
        button: 'احجز موعدك الآن',
      },
      footer: {
        desc: 'وضع المعايير الذهبية في طب الأسنان التجميلي. التزامنا بالتميز السريري وراحة المريض لا يتزعزع.',
        links: 'روابط سريعة',
        legal: 'قانوني',
        rights: '© 2026 مركز S للأسنان. جميع الحقوق محفوظة.',
      },
    },
  },
  ms: {
    translation: {
      nav: {
        home: 'Utama',
        experts: 'Pakar Kami',
        portfolio: 'Portfolio Senyuman',
        dashboard: 'Papan Pemuka',
        signIn: 'Log Masuk',
      },
      hero: {
        badge: 'Mentakrif Semula Pergigian Estetik',
        title: 'Kecemerlangan Ortodontik Bertaraf Dunia',
        subtitle: 'Alami kecemerlangan klinikal digabungkan dengan penjagaan mewah. Pakar bertaraf dunia kami menggunakan teknologi terkini untuk menghasilkan senyuman paling yakin anda.',
        cta: 'Mulakan Perjalanan Anda',
        stats: '5,000+ Pesakit Gembira',
      },
      services: {
        title: 'Perkhidmatan Bertaraf Dunia',
        subtitle: 'Kami menyediakan rangkaian rawatan pergigian yang komprehensif menggunakan kemajuan klinikal terkini.',
        smileDesign: {
          title: 'Reka Bentuk Senyuman',
          desc: 'Perancangan senyuman digital untuk hasil yang simetri dan kelihatan semula jadi.',
        },
        implants: {
          title: 'Implan Gigi',
          desc: 'Penyelesaian kekal dan stabil untuk gigi yang hilang menggunakan implan titanium premium.',
        },
        ortho: {
          title: 'Ortodontik',
          desc: 'Invisalign dan pendakap moden untuk gigi yang sejajar sempurna pada sebarang usia.',
        },
        learnMore: 'Ketahui Lebih Lanjut',
      },
      booking: {
        title: 'Tempah Konsultasi Anda',
        subtitle: 'Ambil langkah pertama ke arah senyuman impian anda. Isi borang dan pasukan kami akan menghubungi anda sebentar lagi.',
        form: {
          firstName: 'Nama Pertama',
          lastName: 'Nama Keluarga',
          email: 'Alamat Emel',
          service: 'Perkhidmatan Yang Diminati',
          message: 'Mesej (Pilihan)',
          submit: 'Minta Temujanji',
          submitting: 'Memproses...',
          signInToBook: 'Log masuk untuk Menempah',
        },
        success: {
          title: 'Permintaan Diterima!',
          desc: 'Penyelaras kami akan menghubungi anda dalam masa 2 jam untuk mengesahkan slot masa pilihan anda.',
          back: 'Kembali ke Utama',
        },
      },
      dashboard: {
        patient: {
          welcome: 'Selamat Datang, {{name}}',
          subtitle: 'Urus kesihatan pergigian dan temujanji anda.',
          nextAppointment: 'Temujanji Seterusnya',
          noUpcoming: 'Tiada temujanji akan datang',
          healthStatus: 'Status Kesihatan',
          healthDesc: 'Kecemerlangan klinikal disahkan.',
          balance: 'Baki Belum Jelas',
          balanceZero: '$0.00 (Semua jelas)',
          history: 'Sejarah Temujanji',
          viewAll: 'Lihat Semua',
          table: {
            date: 'Tarikh',
            dentist: 'Doktor Gigi',
            type: 'Jenis',
            status: 'Status',
            noAppointments: 'Tiada temujanji ditemui.',
          },
        },
      },
      experts: {
        title: 'Kenali Pakar Kami',
        subtitle: 'Pasukan pakar yang berdedikasi komited terhadap kesihatan mulut anda.',
        drSarah: {
          name: 'Dr. Mohamed Ahmed Tulba',
          role: 'Pakar Perunding Ortodontik',
          bio: 'Pakar dalam reka bentuk senyuman digital dengan lebih 12 tahun pengalaman antarabangsa.',
        },
        drMichael: {
          name: 'Dr. Michael Chen',
          role: 'Pakar Implan',
          bio: 'Pakar dalam implantologi invasif minimum dan pembinaan semula mulut penuh.',
        },
        drElena: {
          name: 'Dr. Elena Rossi',
          role: 'Ortodontik',
          bio: 'Penyedia Invisalign Diamond bertauliah yang memberi tumpuan kepada estetika fungsi.',
        },
      },
      portfolio: {
        title: 'Portfolio Senyuman',
        subtitle: 'Transformasi sebenar daripada pesakit kami yang gembira.',
        cases: {
          makeover: { title: 'Makeover Senyuman Penuh', desc: 'Veneer & Pemutihan' },
          alignment: { title: 'Penyelarasan Tidak Kelihatan', desc: 'Rawatan Invisalign' },
          restoration: { title: 'Restorasi Pergigian', desc: 'Implan Premium' },
        },
      },
      stats: {
        experience: 'Tahun Pengalaman',
        doctors: 'Doktor Pakar',
        success: 'Kadar Kejayaan',
        clinics: 'Klinik Moden',
      },
      tech: {
        badge: 'Masa Depan Pergigian',
        title: 'Ketepatan Didorong oleh Teknologi Terkini',
        desc: 'Kami melabur dalam alat diagnostik dan rawatan yang paling maju di dunia, daripada pengimbas intraoral 3D kepada perancangan pembedahan berbantukan AI, memastikan hasil yang tidak menyakitkan dan tepat.',
        items: [
          'Pengimejan Diagnostik Berkuasa AI',
          'Pergigian Laser Tanpa Sakit',
          'Reka Bentuk Senyuman Digital 3D',
          'Pembedahan Ketepatan Mikroskopik'
        ],
      },
      testimonials: {
        title: 'Apa kata pesakit kami',
        subtitle: 'Dengar daripada mereka yang telah merasai perbezaan Pusat Pergigian S.',
        items: [
          { name: 'nur shakirah', text: 'The clinic is beautiful, clean and very comfortable. The atmosphere feels calm and relaxing. The dentist and staff is kind and friendly and most importantly, the treatment is completely painless. The appointments are well-organized, so there’s no long waiting time. Highly recommended for those who want to do any teeth treatment.', role: '6 months ago' },
          { name: 'mizzu', text: 'I was very happy, comfortable, safe, and trustworthy. The doctor was also very professional, with straight teeth, achieving your best smile❤️❤️', role: '5 months ago' },
          { name: 'Izzatul Sholihah', text: 'Excellent. The doctor is very kind and the treatment is very gentle. Extremely satisfied. The place is also very comfortable. The waiting time was short because the appointment was scheduled in advance. I recommend this clinic if anyone want to do any teeth treatment.', role: '9 months ago' }
        ],
      },
      cta: {
        title: 'Bersedia untuk Senyuman Baru Anda?',
        subtitle: 'Jadualkan konsultasi komprehensif anda hari ini dan temui kemungkinan untuk senyuman anda.',
        button: 'Tempah Temujanji Anda',
      },
      footer: {
        desc: 'Menetapkan standard emas dalam pergigian estetik. Komitmen kami terhadap kecemerlangan klinikal dan keselesaan pesakit adalah tidak berbelah bahagi.',
        links: 'Pautan Pantas',
        legal: 'Undang-undang',
        rights: '© 2026 Pusat Pergigian S. Semua hak terpelihara.',
      },
    },
  },
  id: {
    translation: {
      nav: {
        home: 'Beranda',
        experts: 'Pakar Kami',
        portfolio: 'Portofolio Senyum',
        dashboard: 'Dasbor',
        signIn: 'Masuk',
      },
      hero: {
        badge: 'Mendefinisikan Ulang Kedokteran Gigi Estetik',
        title: 'Keunggulan Ortodonti Kelas Dunia',
        subtitle: 'Rasakan keunggulan klinis yang dikombinasikan dengan perawatan mewah. Pakar kelas dunia kami menggunakan teknologi mutakhir untuk menciptakan senyum paling percaya diri Anda.',
        cta: 'Mulai Perjalanan Anda',
        stats: '5.000+ Pasien Bahagia',
      },
      services: {
        title: 'Layanan Kelas Dunia',
        subtitle: 'Kami menyediakan berbagai macam perawatan gigi yang komprehensif menggunakan kemajuan klinis terbaru.',
        smileDesign: {
          title: 'Desain Senyum',
          desc: 'Perencanaan senyum digital untuk hasil yang simetris sempurna dan tampak alami.',
        },
        implants: {
          title: 'Implan Gigi',
          desc: 'Solusi permanen dan stabil untuk gigi yang hilang menggunakan implan titanium premium.',
        },
        ortho: {
          title: 'Ortodonti',
          desc: 'Invisalign dan kawat gigi modern untuk gigi yang selaras sempurna pada usia berapa pun.',
        },
        learnMore: 'Pelajari Lebih Lanjut',
      },
      booking: {
        title: 'Pesan Konsultasi Anda',
        subtitle: 'Ambil langkah pertama menuju senyum impian Anda. Isi formulir dan tim kami akan segera menghubungi Anda.',
        form: {
          firstName: 'Nama Depan',
          lastName: 'Nama Belakang',
          email: 'Alamat Email',
          service: 'Layanan yang Diminati',
          message: 'Pesan (Opsional)',
          submit: 'Minta Janji Temu',
          submitting: 'Memproses...',
          signInToBook: 'Masuk untuk Memesan',
        },
        success: {
          title: 'Permintaan Diterima!',
          desc: 'Koordinator kami akan menghubungi Anda dalam waktu 2 jam untuk mengonfirmasi slot waktu pilihan Anda.',
          back: 'Kembali ke Beranda',
        },
      },
      dashboard: {
        patient: {
          welcome: 'Selamat Datang, {{name}}',
          subtitle: 'Kelola kesehatan gigi dan janji temu Anda.',
          nextAppointment: 'Janji Temu Berikutnya',
          noUpcoming: 'Tidak ada janji temu mendatang',
          healthStatus: 'Status Kesehatan',
          healthDesc: 'Keunggulan klinis terverifikasi.',
          balance: 'Saldo Belum Terbayar',
          balanceZero: '$0.00 (Semua lunas)',
          history: 'Riwayat Janji Temu',
          viewAll: 'Lihat Semua',
          table: {
            date: 'Tanggal',
            dentist: 'Dokter Gigi',
            type: 'Tipe',
            status: 'Status',
            noAppointments: 'Tidak ada janji temu ditemukan.',
          },
        },
      },
      experts: {
        title: 'Kenali Pakar Kami',
        subtitle: 'Tim spesialis yang berdedikasi berkomitmen pada kesehatan mulut Anda.',
        drSarah: {
          name: 'Dr. Mohamed Ahmed Tulba',
          role: 'Konsultan Ortodontis',
          bio: 'Spesialis dalam desain senyum digital dengan lebih dari 12 tahun pengalaman internasional.',
        },
        drMichael: {
          name: 'Dr. Michael Chen',
          role: 'Spesialis Implan',
          bio: 'Pakar dalam implantologi invasif minimal dan rekonstruksi mulut penuh.',
        },
        drElena: {
          name: 'Dr. Elena Rossi',
          role: 'Ortodontis',
          bio: 'Penyedia Invisalign Diamond bersertifikat yang berfokus pada estetika fungsional.',
        },
      },
      portfolio: {
        title: 'Portofolio Senyum',
        subtitle: 'Transformasi nyata dari pasien kami yang bahagia.',
        cases: {
          makeover: { title: 'Makeover Senyum Penuh', desc: 'Veneer & Pemutihan' },
          alignment: { title: 'Penyelarasan Tak Terlihat', desc: 'Perawatan Invisalign' },
          restoration: { title: 'Restorasi Gigi', desc: 'Implan Premium' },
        },
      },
      stats: {
        experience: 'Tahun Pengalaman',
        doctors: 'Dokter Pakar',
        success: 'Tingkat Keberhasilan',
        clinics: 'Klinik Modern',
      },
      tech: {
        badge: 'Masa Depan Kedokteran Gigi',
        title: 'Presisi yang Didorong oleh Teknologi Canggih',
        desc: 'Kami berinvestasi dalam alat diagnostik dan perawatan tercanggih di dunia, mulai dari pemindai intraoral 3D hingga perencanaan bedah berbantuan AI, memastikan hasil yang tidak menyakitkan dan akurat.',
        items: [
          'Pencitraan Diagnostik Berbasis AI',
          'Kedokteran Gigi Laser Tanpa Rasa Sakit',
          'Desain Senyum Digital 3D',
          'Bedah Presisi Mikroskopis'
        ],
      },
      testimonials: {
        title: 'Apa kata pasien kami',
        subtitle: 'Dengarkan dari mereka yang telah merasakan perbedaan Pusat Gigi S.',
        items: [
          { name: 'nur shakirah', text: 'The clinic is beautiful, clean and very comfortable. The atmosphere feels calm and relaxing. The dentist and staff is kind and friendly and most importantly, the treatment is completely painless. The appointments are well-organized, so there’s no long waiting time. Highly recommended for those who want to do any teeth treatment.', role: '6 months ago' },
          { name: 'mizzu', text: 'I was very happy, comfortable, safe, and trustworthy. The doctor was also very professional, with straight teeth, achieving your best smile❤️❤️', role: '5 months ago' },
          { name: 'Izzatul Sholihah', text: 'Excellent. The doctor is very kind and the treatment is very gentle. Extremely satisfied. The place is also very comfortable. The waiting time was short because the appointment was scheduled in advance. I recommend this clinic if anyone want to do any teeth treatment.', role: '9 months ago' }
        ],
      },
      cta: {
        title: 'Siap untuk Senyum Baru Anda?',
        subtitle: 'Jadwalkan konsultasi komprehensif Anda hari ini dan temukan kemungkinan untuk senyum Anda.',
        button: 'Pesan Janji Temu Anda',
      },
      footer: {
        desc: 'Menetapkan standar emas dalam kedokteran gigi estetik. Komitmen kami terhadap keunggulan klinis dan kenyamanan pasien tidak tergoyahkan.',
        links: 'Tautan Cepat',
        legal: 'Legal',
        rights: '© 2026 Pusat Gigi S. Seluruh hak cipta dilindungi undang-undang.',
      },
    },
  },
  th: {
    translation: {
      nav: {
        home: 'หน้าแรก',
        experts: 'ผู้เชี่ยวชาญของเรา',
        portfolio: 'ผลงานรอยยิ้ม',
        dashboard: 'แดชบอร์ด',
        signIn: 'เข้าสู่ระบบ',
      },
      hero: {
        badge: 'นิยามใหม่ของทันตกรรมเพื่อความงาม',
        title: 'ความเป็นเลิศด้านการจัดฟันระดับโลก',
        subtitle: 'สัมผัสความเป็นเลิศทางคลินิกควบคู่ไปกับการดูแลระดับหรูหรา ผู้เชี่ยวชาญระดับโลกของเราใช้เทคโนโลยีล้ำสมัยเพื่อสร้างสรรค์รอยยิ้มที่มั่นใจที่สุดของคุณ',
        cta: 'เริ่มต้นการเดินทางของคุณ',
        stats: 'คนไข้ที่มีความสุขกว่า 5,000 คน',
      },
      services: {
        title: 'บริการระดับโลก',
        subtitle: 'เราให้บริการการรักษาทางทันตกรรมที่ครอบคลุมโดยใช้ความก้าวหน้าทางคลินิกล่าสุด',
        smileDesign: {
          title: 'การออกแบบรอยยิ้ม',
          desc: 'การวางแผนรอยยิ้มแบบดิจิทัลเพื่อผลลัพธ์ที่สมมาตรและดูเป็นธรรมชาติอย่างสมบูรณ์แบบ',
        },
        implants: {
          title: 'รากเทียม',
          desc: 'ทางเลือกที่ถาวรและมั่นคงสำหรับฟันที่สูญเสียไปโดยใช้รากเทียมไทเทเนียมระดับพรีเมียม',
        },
        ortho: {
          title: 'จัดฟัน',
          desc: 'Invisalign และเครื่องมือจัดฟันสมัยใหม่เพื่อฟันที่เรียงตัวสวยงามในทุกช่วงวัย',
        },
        learnMore: 'เรียนรู้เพิ่มเติม',
      },
      booking: {
        title: 'จองการปรึกษาของคุณ',
        subtitle: 'ก้าวแรกสู่รอยยิ้มในฝันของคุณ กรอกแบบฟอร์มแล้วทีมงานของเราจะติดต่อกลับหาคุณโดยเร็วที่สุด',
        form: {
          firstName: 'ชื่อ',
          lastName: 'นามสกุล',
          email: 'ที่อยู่อีเมล',
          service: 'บริการที่สนใจ',
          message: 'ข้อความ (ไม่บังคับ)',
          submit: 'ขอนัดหมาย',
          submitting: 'กำลังดำเนินการ...',
          signInToBook: 'เข้าสู่ระบบเพื่อจอง',
        },
        success: {
          title: 'ได้รับคำขอแล้ว!',
          desc: 'เจ้าหน้าที่ประสานงานของเราจะติดต่อคุณภายใน 2 ชั่วโมงเพื่อยืนยันช่วงเวลาที่คุณต้องการ',
          back: 'กลับสู่หน้าแรก',
        },
      },
      dashboard: {
        patient: {
          welcome: 'ยินดีต้อนรับคุณ {{name}}',
          subtitle: 'จัดการสุขภาพฟันและการนัดหมายของคุณ',
          nextAppointment: 'การนัดหมายครั้งต่อไป',
          noUpcoming: 'ไม่มีการนัดหมายที่กำลังจะมาถึง',
          healthStatus: 'สถานะสุขภาพ',
          healthDesc: 'ผ่านการตรวจสอบความเป็นเลิศทางคลินิก',
          balance: 'ยอดค้างชำระ',
          balanceZero: '0.00 บาท (ไม่มีภาระผูกพัน)',
          history: 'ประวัติการนัดหมาย',
          viewAll: 'ดูทั้งหมด',
          table: {
            date: 'วันที่',
            dentist: 'ทันตแพทย์',
            type: 'ประเภท',
            status: 'สถานะ',
            noAppointments: 'ไม่พบข้อมูลการนัดหมาย',
          },
        },
      },
      experts: {
        title: 'พบกับผู้เชี่ยวชาญของเรา',
        subtitle: 'ทีมผู้เชี่ยวชาญที่ทุ่มเทเพื่อสุขภาพช่องปากของคุณ',
        drSarah: {
          name: 'ทพ. Mohamed Ahmed Tulba',
          role: 'ทันตแพทย์จัดฟันระดับที่ปรึกษา',
          bio: 'เชี่ยวชาญด้านการออกแบบรอยยิ้มแบบดิจิทัลด้วยประสบการณ์ระดับนานาชาติกว่า 12 ปี',
        },
        drMichael: {
          name: 'ทพ. ไมเคิล เฉิน',
          role: 'ผู้เชี่ยวชาญด้านรากเทียม',
          bio: 'ผู้เชี่ยวชาญด้านรากเทียมแบบแผลเล็กและการฟื้นฟูช่องปากแบบครบวงจร',
        },
        drElena: {
          name: 'ทพญ. เอเลน่า รอสซี่',
          role: 'ทันตแพทย์จัดฟัน',
          bio: 'ผู้ให้บริการ Invisalign Diamond ที่ได้รับการรับรอง โดยเน้นที่ความสวยงามและการใช้งาน',
        },
      },
      portfolio: {
        title: 'ผลงานรอยยิ้ม',
        subtitle: 'การเปลี่ยนแปลงที่แท้จริงจากคนไข้ที่มีความสุขของเรา',
        cases: {
          makeover: { title: 'การปรับโฉมรอยยิ้มแบบครบวงจร', desc: 'วีเนียร์และการฟอกสีฟัน' },
          alignment: { title: 'การจัดฟันแบบใส', desc: 'การรักษาด้วย Invisalign' },
          restoration: { title: 'การบูรณะฟัน', desc: 'รากเทียมระดับพรีเมียม' },
        },
      },
      stats: {
        experience: 'ปีแห่งประสบการณ์',
        doctors: 'ทันตแพทย์ผู้เชี่ยวชาญ',
        success: 'อัตราความสำเร็จ',
        clinics: 'คลินิกที่ทันสมัย',
      },
      tech: {
        badge: 'อนาคตของทันตกรรม',
        title: 'ความแม่นยำที่ขับเคลื่อนด้วยเทคโนโลยีล้ำสมัย',
        desc: 'เราลงทุนในเครื่องมือวินิจฉัยและการรักษาที่ทันสมัยที่สุดในโลก ตั้งแต่เครื่องสแกนช่องปาก 3D ไปจนถึงการวางแผนการผ่าตัดด้วย AI เพื่อให้มั่นใจในผลลัพธ์ที่แม่นยำและไม่เจ็บปวด',
        items: [
          'การวินิจฉัยด้วยภาพด้วย AI',
          'ทันตกรรมเลเซอร์แบบไม่เจ็บปวด',
          'การออกแบบรอยยิ้มดิจิทัล 3D',
          'การผ่าตัดด้วยกล้องจุลทรรศน์ที่มีความแม่นยำสูง'
        ],
      },
      testimonials: {
        title: 'สิ่งที่คนไข้ของเราพูด',
        subtitle: 'ฟังเสียงจากผู้ที่สัมผัสความแตกต่างของ S Dental Center',
        items: [
          { name: 'nur shakirah', text: 'The clinic is beautiful, clean and very comfortable. The atmosphere feels calm and relaxing. The dentist and staff is kind and friendly and most importantly, the treatment is completely painless. The appointments are well-organized, so there’s no long waiting time. Highly recommended for those who want to do any teeth treatment.', role: '6 months ago' },
          { name: 'mizzu', text: 'I was very happy, comfortable, safe, and trustworthy. The doctor was also very professional, with straight teeth, achieving your best smile❤️❤️', role: '5 months ago' },
          { name: 'Izzatul Sholihah', text: 'Excellent. The doctor is very kind and the treatment is very gentle. Extremely satisfied. The place is also very comfortable. The waiting time was short because the appointment was scheduled in advance. I recommend this clinic if anyone want to do any teeth treatment.', role: '9 months ago' }
        ],
      },
      cta: {
        title: 'พร้อมสำหรับรอยยิ้มใหม่ของคุณหรือยัง?',
        subtitle: 'นัดหมายการปรึกษาแบบครบวงจรวันนี้และค้นพบความเป็นไปได้สำหรับรอยยิ้มของคุณ',
        button: 'จองการนัดหมายของคุณ',
      },
      footer: {
        desc: 'กำหนดมาตรฐานระดับทองในทันตกรรมเพื่อความงาม ความมุ่งมั่นของเราต่อความเป็นเลิศทางคลินิกและความสะดวกสบายของคนไข้นั้นไม่เปลี่ยนแปลง',
        links: 'ลิงก์ด่วน',
        legal: 'กฎหมาย',
        rights: '© 2026 S Dental Center. สงวนลิขสิทธิ์',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

export type SeedBrand = {
    name: string
    slug: string
    description: string
    order: number
}

export type SeedCategory = {
    name: string
    slug: string
    description: string
}

export type SeedProductSpec = {
    size?: string
    thickness?: string
    weight?: string
    application?: string
}

export type SeedProduct = {
    name: string
    slug: string
    brandSlug: string
    categorySlugs: string[]
    price: number
    stock: number
    featured?: boolean
    description?: string
    specifications?: SeedProductSpec
}

export type SeedUser = {
    email: string
    password: string
    name: string
    phone?: string
    role: 'customer' | 'employee' | 'admin'
    addresses?: Array<{
        label: string
        fullName: string
        phone: string
        address: string
        city: string
        province: string
        isPrimary?: boolean
    }>
}

export type SeedSocial = {
    name: string
    label: string
    description?: string
    url: string
    order: number
    iconEmoji?: string
}

export const SEED_BRANDS: SeedBrand[] = [
    {
        name: 'آبفارین',
        slug: 'abafarin',
        description:
            'نمایندگی رسمی محصولات آبفارین؛ لوله و اتصالات فاضلابی و آب با کیفیت استاندارد ملی ایران.',
        order: 1,
    },
    {
        name: 'آذر اتصال',
        slug: 'azar-ettesal',
        description:
            'تولیدکننده لوله و اتصالات پلیمری با بیش از دو دهه تجربه در صنایع آب و فاضلاب.',
        order: 2,
    },
    {
        name: 'مسعود',
        slug: 'masoud',
        description:
            'برند مسعود؛ متخصص در تولید اتصالات پیچی و جوشی برای مصارف خانگی و صنعتی.',
        order: 3,
    },
    {
        name: 'مگاپول',
        slug: 'megapol',
        description:
            'مگاپول؛ تولیدکننده لوله‌های پلی‌اتیلن و سیستم‌های لوله‌کشی تحت فشار.',
        order: 4,
    },
]

export const SEED_CATEGORIES: SeedCategory[] = [
    {
        name: 'لوله فاضلابی',
        slug: 'loole-fazlabi',
        description: 'لوله‌های پوشفیت و پلیکا برای سیستم فاضلاب ساختمان.',
    },
    {
        name: 'لوله آب',
        slug: 'loole-ab',
        description: 'لوله‌های پنج‌لایه، PPR و پلی‌اتیلن برای آب سرد و گرم.',
    },
    {
        name: 'اتصالات',
        slug: 'ettesalat',
        description: 'زانو، سه‌راهی، تبدیل، فلنج و سایر اتصالات.',
    },
]

export const SEED_PRODUCTS: SeedProduct[] = [
    {
        name: 'لوله فاضلابی پوشفیت ۱۱۰ میلی‌متری',
        slug: 'loole-fazlabi-110',
        brandSlug: 'abafarin',
        categorySlugs: ['loole-fazlabi'],
        price: 285000,
        stock: 120,
        featured: true,
        description:
            'لوله فاضلابی پوشفیت با قطر ۱۱۰ میلی‌متر، مناسب برای سیستم فاضلاب ساختمان. نصب آسان با سوکت و حلقه آب‌بندی.',
        specifications: {
            size: '۱۱۰ میلی‌متر',
            thickness: '۳.۲ میلی‌متر',
            weight: '۱.۷ کیلوگرم بر متر',
            application: 'فاضلاب ساختمانی',
        },
    },
    {
        name: 'لوله فاضلابی پوشفیت ۶۳ میلی‌متری',
        slug: 'loole-fazlabi-63',
        brandSlug: 'abafarin',
        categorySlugs: ['loole-fazlabi'],
        price: 145000,
        stock: 200,
        description: 'لوله فاضلابی ۶۳ میلی‌متر برای انشعابات داخلی ساختمان.',
        specifications: {
            size: '۶۳ میلی‌متر',
            thickness: '۲.۵ میلی‌متر',
            weight: '۰.۸ کیلوگرم بر متر',
            application: 'فاضلاب خانگی',
        },
    },
    {
        name: 'زانو ۹۰ درجه ۱۱۰ میلی‌متری',
        slug: 'zano-90-110',
        brandSlug: 'abafarin',
        categorySlugs: ['ettesalat'],
        price: 38000,
        stock: 350,
        featured: true,
        description: 'زانو ۹۰ درجه پوشفیت با سوکت و حلقه آب‌بندی، مناسب برای تغییر مسیر لوله فاضلاب.',
        specifications: {
            size: '۱۱۰ میلی‌متر',
            weight: '۰.۲۵ کیلوگرم',
            application: 'اتصال لوله فاضلاب',
        },
    },
    {
        name: 'سه‌راهی ۱۱۰×۶۳ میلی‌متر',
        slug: 'se-rahi-110-63',
        brandSlug: 'abafarin',
        categorySlugs: ['ettesalat'],
        price: 52000,
        stock: 180,
        description: 'سه‌راهی تبدیلی برای انشعاب‌گیری از لوله ۱۱۰ به ۶۳ میلی‌متر.',
        specifications: {
            size: '۱۱۰×۶۳ میلی‌متر',
            weight: '۰.۴ کیلوگرم',
            application: 'انشعاب فاضلاب',
        },
    },
    {
        name: 'لوله پنج‌لایه ۲۰ میلی‌متری',
        slug: 'loole-5-layer-20',
        brandSlug: 'azar-ettesal',
        categorySlugs: ['loole-ab'],
        price: 95000,
        stock: 90,
        featured: true,
        description:
            'لوله پنج‌لایه با لایه میانی آلومینیوم، مناسب برای آب سرد و گرم. تحمل فشار و دمای بالا، ضد رسوب و زنگ‌زدگی.',
        specifications: {
            size: '۲۰ میلی‌متر',
            thickness: '۳.۴ میلی‌متر',
            weight: '۰.۲۲ کیلوگرم بر متر',
            application: 'لوله‌کشی آب سرد و گرم',
        },
    },
    {
        name: 'لوله پنج‌لایه ۲۵ میلی‌متری',
        slug: 'loole-5-layer-25',
        brandSlug: 'azar-ettesal',
        categorySlugs: ['loole-ab'],
        price: 135000,
        stock: 60,
        description: 'لوله پنج‌لایه ۲۵ میلی‌متری برای خطوط اصلی آب ساختمان.',
        specifications: {
            size: '۲۵ میلی‌متر',
            thickness: '۴.۲ میلی‌متر',
            weight: '۰.۳۵ کیلوگرم بر متر',
            application: 'لوله‌کشی آب ساختمان',
        },
    },
    {
        name: 'اتصال پرسی ۲۰ میلی‌متری',
        slug: 'ettesal-persi-20',
        brandSlug: 'azar-ettesal',
        categorySlugs: ['ettesalat'],
        price: 28000,
        stock: 220,
        description: 'اتصال پرسی برنجی برای لوله‌های پنج‌لایه. نصب سریع با ابزار پرس.',
        specifications: {
            size: '۲۰ میلی‌متر',
            weight: '۰.۰۸ کیلوگرم',
            application: 'اتصال لوله پنج‌لایه',
        },
    },
    {
        name: 'لوله PPR ۲۵ میلی‌متری',
        slug: 'loole-ppr-25',
        brandSlug: 'masoud',
        categorySlugs: ['loole-ab'],
        price: 42000,
        stock: 140,
        description: 'لوله PPR سبز ۲۵ میلی‌متری برای آب سرد و گرم. مقاوم در برابر خوردگی و رسوب.',
        specifications: {
            size: '۲۵ میلی‌متر',
            thickness: '۴.۲ میلی‌متر',
            weight: '۰.۲ کیلوگرم بر متر',
            application: 'لوله‌کشی آب سرد و گرم',
        },
    },
    {
        name: 'زانو PPR ۲۵ میلی‌متری',
        slug: 'zano-ppr-25',
        brandSlug: 'masoud',
        categorySlugs: ['ettesalat'],
        price: 12000,
        stock: 400,
        description: 'زانو ۹۰ درجه PPR برای اتصالات جوشی.',
        specifications: {
            size: '۲۵ میلی‌متر',
            weight: '۰.۰۴ کیلوگرم',
            application: 'اتصال PPR',
        },
    },
    {
        name: 'لوله پلی‌اتیلن ۳۲ میلی‌متر',
        slug: 'loole-pe-32',
        brandSlug: 'megapol',
        categorySlugs: ['loole-ab'],
        price: 65000,
        stock: 75,
        featured: true,
        description: 'لوله پلی‌اتیلن PE80 با قطر ۳۲ میلی‌متر، مناسب برای خطوط آب و آبرسانی.',
        specifications: {
            size: '۳۲ میلی‌متر',
            thickness: '۳.۰ میلی‌متر',
            weight: '۰.۲۸ کیلوگرم بر متر',
            application: 'آبرسانی روستایی و شهری',
        },
    },
    {
        name: 'فلنج پلی‌اتیلن ۶۳ میلی‌متر',
        slug: 'flange-pe-63',
        brandSlug: 'megapol',
        categorySlugs: ['ettesalat'],
        price: 95000,
        stock: 40,
        description: 'فلنج پلی‌اتیلن برای اتصال لوله‌های PE به شیرآلات و تجهیزات فلنج‌دار.',
        specifications: {
            size: '۶۳ میلی‌متر',
            weight: '۰.۵ کیلوگرم',
            application: 'اتصال صنعتی',
        },
    },
    {
        name: 'دریچه بازدید ۲۰×۲۰',
        slug: 'darcheh-bazdid-20',
        brandSlug: 'abafarin',
        categorySlugs: ['ettesalat'],
        price: 35000,
        stock: 3,
        description: 'دریچه بازدید پلاستیکی سفید، مناسب برای دسترسی به لوله‌های فاضلاب در دیوار.',
        specifications: {
            size: '۲۰×۲۰ سانتی‌متر',
            weight: '۰.۳ کیلوگرم',
            application: 'بازدید فاضلاب',
        },
    },
]

export const SEED_USERS: SeedUser[] = [
    {
        email: 'admin@abafarin.local',
        password: 'admin1234',
        name: 'مدیر آبفارین',
        phone: '021-12345678',
        role: 'admin',
    },
    {
        email: 'employee@abafarin.local',
        password: 'employee1234',
        name: 'کارمند فروش',
        phone: '021-12345679',
        role: 'employee',
    },
    {
        email: 'customer@abafarin.local',
        password: 'customer1234',
        name: 'مشتری نمونه',
        phone: '09123456789',
        role: 'customer',
        addresses: [
            {
                label: 'منزل',
                fullName: 'مشتری نمونه',
                phone: '09123456789',
                address: 'تهران، خیابان ولیعصر، کوچه فلان، پلاک ۱۰، طبقه ۳، واحد ۵',
                city: 'تهران',
                province: 'تهران',
                isPrimary: true,
            },
        ],
    },
]

export const SEED_SOCIALS: SeedSocial[] = [
    {
        name: 'WhatsApp',
        label: 'پشتیبانی واتساپ',
        description: 'پاسخگویی ۲۴ ساعته',
        url: 'https://wa.me/989121234567',
        order: 1,
    },
    {
        name: 'Telegram',
        label: 'کانال تلگرام',
        description: 'جدیدترین محصولات و تخفیف‌ها',
        url: 'https://t.me/abafarin',
        order: 2,
    },
    {
        name: 'Instagram',
        label: 'اینستاگرام',
        url: 'https://instagram.com/abafarin',
        order: 3,
    },
]

export const SEED_SITE_SETTINGS = {
    siteName: 'آبفارین',
    contactInfo: {
        phones: [
            { label: 'دفتر مرکزی', number: '021-12345678', isPrimary: true },
            { label: 'پشتیبانی', number: '09121234567', isPrimary: false },
        ],
        emails: [
            { label: 'info', email: 'info@abafarin.local', isPrimary: true },
            { label: 'sales', email: 'sales@abafarin.local', isPrimary: false },
        ],
        addresses: [
            {
                label: 'دفتر مرکزی',
                address: 'تهران، خیابان آزادی، نبش کارگر شمالی، پلاک ۱۲۳، طبقه ۴',
                isPrimary: true,
            },
            {
                label: 'انبار مرکزی',
                address: 'تهران، بزرگراه آزادگان، شهرک صنعتی پرند، خیابان لیزرسازی',
                isPrimary: false,
            },
        ],
    },
    socialLinks: SEED_SOCIALS,
}
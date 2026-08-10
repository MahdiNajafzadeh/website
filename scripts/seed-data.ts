export type SeedLocalized<T> = { en: T; fa: T }

export type SeedBrand = {
    name: SeedLocalized<string>
    slug: string
    description: SeedLocalized<string>
    order: number
}

export type SeedCategory = {
    name: SeedLocalized<string>
    slug: string
    description: string
}

export type SeedProductSpec = SeedLocalized<{
    size?: string
    thickness?: string
    weight?: string
    application?: string
}>

export type SeedProduct = {
    name: SeedLocalized<string>
    slug: string
    brandSlug: string
    categorySlugs: string[]
    price: number
    stock: number
    featured?: boolean
    description?: SeedLocalized<string>
    specifications?: SeedProductSpec
}

export type SeedUser = {
    // Login is by phone number. Email is optional display-only.
    email?: string
    password: string
    firstName: string
    lastName: string
    phone: string
    role: 'customer' | 'employee' | 'admin'
    firstLoginAt?: string | null
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
        name: { en: 'Abafarin', fa: 'آبفارین' },
        slug: 'abafarin',
        description: {
            en: 'Official distributor of Abafarin products; sewage and water pipes and fittings meeting the Iranian national standard.',
            fa: 'نمایندگی رسمی محصولات آبفارین؛ لوله و اتصالات فاضلابی و آب با کیفیت استاندارد ملی ایران.',
        },
        order: 1,
    },
    {
        name: { en: 'Azar Ettesal', fa: 'آذر اتصال' },
        slug: 'azar-ettesal',
        description: {
            en: 'Manufacturer of polymer pipes and fittings with over two decades of experience in water and wastewater industries.',
            fa: 'تولیدکننده لوله و اتصالات پلیمری با بیش از دو دهه تجربه در صنایع آب و فاضلاب.',
        },
        order: 2,
    },
    {
        name: { en: 'Masoud', fa: 'مسعود' },
        slug: 'masoud',
        description: {
            en: 'Masoud brand; specialist in threaded and welded fittings for domestic and industrial use.',
            fa: 'برند مسعود؛ متخصص در تولید اتصالات پیچی و جوشی برای مصارف خانگی و صنعتی.',
        },
        order: 3,
    },
    {
        name: { en: 'Megapol', fa: 'مگاپول' },
        slug: 'megapol',
        description: {
            en: 'Megapol; manufacturer of polyethylene pipes and pressurised plumbing systems.',
            fa: 'مگاپول؛ تولیدکننده لوله‌های پلی‌اتیلن و سیستم‌های لوله‌کشی تحت فشار.',
        },
        order: 4,
    },
]

export const SEED_CATEGORIES: SeedCategory[] = [
    {
        name: { en: 'Sewage Pipe', fa: 'لوله فاضلابی' },
        slug: 'sewage-pipe',
        description: 'Push-fit and Polika pipes for building sewage systems.',
    },
    {
        name: { en: 'Water Pipe', fa: 'لوله آب' },
        slug: 'water-pipe',
        description: 'Five-layer, PPR and polyethylene pipes for hot and cold water.',
    },
    {
        name: { en: 'Fittings', fa: 'اتصالات' },
        slug: 'fittings',
        description: 'Elbows, tees, reducers, flanges and other fittings.',
    },
]

export const SEED_PRODUCTS: SeedProduct[] = [
    {
        name: {
            en: 'Push-fit Sewage Pipe 110 mm',
            fa: 'لوله فاضلابی پوشفیت ۱۱۰ میلی‌متری',
        },
        slug: 'sewage-pipe-110',
        brandSlug: 'abafarin',
        categorySlugs: ['sewage-pipe'],
        price: 285000,
        stock: 120,
        featured: true,
        description: {
            en: 'Push-fit sewage pipe, 110 mm diameter, suitable for building sewage systems. Easy installation with socket and sealing ring.',
            fa: 'لوله فاضلابی پوشفیت با قطر ۱۱۰ میلی‌متر، مناسب برای سیستم فاضلاب ساختمان. نصب آسان با سوکت و حلقه آب‌بندی.',
        },
        specifications: {
            en: {
                size: '110 mm',
                thickness: '3.2 mm',
                weight: '1.7 kg/m',
                application: 'Building sewage',
            },
            fa: {
                size: '۱۱۰ میلی‌متر',
                thickness: '۳.۲ میلی‌متر',
                weight: '۱.۷ کیلوگرم بر متر',
                application: 'فاضلاب ساختمانی',
            },
        },
    },
    {
        name: {
            en: 'Push-fit Sewage Pipe 63 mm',
            fa: 'لوله فاضلابی پوشفیت ۶۳ میلی‌متری',
        },
        slug: 'sewage-pipe-63',
        brandSlug: 'abafarin',
        categorySlugs: ['sewage-pipe'],
        price: 145000,
        stock: 200,
        description: {
            en: '63 mm sewage pipe for indoor building branches.',
            fa: 'لوله فاضلابی ۶۳ میلی‌متر برای انشعابات داخلی ساختمان.',
        },
        specifications: {
            en: {
                size: '63 mm',
                thickness: '2.5 mm',
                weight: '0.8 kg/m',
                application: 'Domestic sewage',
            },
            fa: {
                size: '۶۳ میلی‌متر',
                thickness: '۲.۵ میلی‌متر',
                weight: '۰.۸ کیلوگرم بر متر',
                application: 'فاضلاب خانگی',
            },
        },
    },
    {
        name: { en: '90° Elbow 110 mm', fa: 'زانو ۹۰ درجه ۱۱۰ میلی‌متری' },
        slug: 'elbow-90-110',
        brandSlug: 'abafarin',
        categorySlugs: ['fittings'],
        price: 38000,
        stock: 350,
        featured: true,
        description: {
            en: '90° push-fit elbow with socket and sealing ring, ideal for changing direction in sewage lines.',
            fa: 'زانو ۹۰ درجه پوشفیت با سوکت و حلقه آب‌بندی، مناسب برای تغییر مسیر لوله فاضلاب.',
        },
        specifications: {
            en: {
                size: '110 mm',
                weight: '0.25 kg',
                application: 'Sewage pipe connection',
            },
            fa: {
                size: '۱۱۰ میلی‌متر',
                weight: '۰.۲۵ کیلوگرم',
                application: 'اتصال لوله فاضلاب',
            },
        },
    },
    {
        name: { en: 'Tee 110×63 mm', fa: 'سه‌راهی ۱۱۰×۶۳ میلی‌متر' },
        slug: 'tee-110-63',
        brandSlug: 'abafarin',
        categorySlugs: ['fittings'],
        price: 52000,
        stock: 180,
        description: {
            en: 'Reducing tee for branching from a 110 mm pipe to a 63 mm pipe.',
            fa: 'سه‌راهی تبدیلی برای انشعاب‌گیری از لوله ۱۱۰ به ۶۳ میلی‌متر.',
        },
        specifications: {
            en: {
                size: '110×63 mm',
                weight: '0.4 kg',
                application: 'Sewage branch',
            },
            fa: {
                size: '۱۱۰×۶۳ میلی‌متر',
                weight: '۰.۴ کیلوگرم',
                application: 'انشعاب فاضلاب',
            },
        },
    },
    {
        name: { en: 'Five-layer Pipe 20 mm', fa: 'لوله پنج‌لایه ۲۰ میلی‌متری' },
        slug: 'five-layer-20',
        brandSlug: 'azar-ettesal',
        categorySlugs: ['water-pipe'],
        price: 95000,
        stock: 90,
        featured: true,
        description: {
            en: 'Five-layer pipe with aluminium core, suitable for hot and cold water. High pressure and temperature tolerance, scale and rust resistant.',
            fa: 'لوله پنج‌لایه با لایه میانی آلومینیوم، مناسب برای آب سرد و گرم. تحمل فشار و دمای بالا، ضد رسوب و زنگ‌زدگی.',
        },
        specifications: {
            en: {
                size: '20 mm',
                thickness: '3.4 mm',
                weight: '0.22 kg/m',
                application: 'Hot and cold water plumbing',
            },
            fa: {
                size: '۲۰ میلی‌متر',
                thickness: '۳.۴ میلی‌متر',
                weight: '۰.۲۲ کیلوگرم بر متر',
                application: 'لوله‌کشی آب سرد و گرم',
            },
        },
    },
    {
        name: { en: 'Five-layer Pipe 25 mm', fa: 'لوله پنج‌لایه ۲۵ میلی‌متری' },
        slug: 'five-layer-25',
        brandSlug: 'azar-ettesal',
        categorySlugs: ['water-pipe'],
        price: 135000,
        stock: 60,
        description: {
            en: '25 mm five-layer pipe for main building water lines.',
            fa: 'لوله پنج‌لایه ۲۵ میلی‌متری برای خطوط اصلی آب ساختمان.',
        },
        specifications: {
            en: {
                size: '25 mm',
                thickness: '4.2 mm',
                weight: '0.35 kg/m',
                application: 'Building water plumbing',
            },
            fa: {
                size: '۲۵ میلی‌متر',
                thickness: '۴.۲ میلی‌متر',
                weight: '۰.۳۵ کیلوگرم بر متر',
                application: 'لوله‌کشی آب ساختمان',
            },
        },
    },
    {
        name: { en: 'Press Fitting 20 mm', fa: 'اتصال پرسی ۲۰ میلی‌متری' },
        slug: 'press-fitting-20',
        brandSlug: 'azar-ettesal',
        categorySlugs: ['fittings'],
        price: 28000,
        stock: 220,
        description: {
            en: 'Brass press fitting for five-layer pipes. Quick installation with a press tool.',
            fa: 'اتصال پرسی برنجی برای لوله‌های پنج‌لایه. نصب سریع با ابزار پرس.',
        },
        specifications: {
            en: {
                size: '20 mm',
                weight: '0.08 kg',
                application: 'Five-layer pipe connection',
            },
            fa: {
                size: '۲۰ میلی‌متر',
                weight: '۰.۰۸ کیلوگرم',
                application: 'اتصال لوله پنج‌لایه',
            },
        },
    },
    {
        name: { en: 'PPR Pipe 25 mm', fa: 'لوله PPR ۲۵ میلی‌متری' },
        slug: 'ppr-pipe-25',
        brandSlug: 'masoud',
        categorySlugs: ['water-pipe'],
        price: 42000,
        stock: 140,
        description: {
            en: 'Green PPR pipe, 25 mm, for hot and cold water. Corrosion and scale resistant.',
            fa: 'لوله PPR سبز ۲۵ میلی‌متری برای آب سرد و گرم. مقاوم در برابر خوردگی و رسوب.',
        },
        specifications: {
            en: {
                size: '25 mm',
                thickness: '4.2 mm',
                weight: '0.2 kg/m',
                application: 'Hot and cold water plumbing',
            },
            fa: {
                size: '۲۵ میلی‌متر',
                thickness: '۴.۲ میلی‌متر',
                weight: '۰.۲ کیلوگرم بر متر',
                application: 'لوله‌کشی آب سرد و گرم',
            },
        },
    },
    {
        name: { en: 'PPR Elbow 25 mm', fa: 'زانو PPR ۲۵ میلی‌متری' },
        slug: 'ppr-elbow-25',
        brandSlug: 'masoud',
        categorySlugs: ['fittings'],
        price: 12000,
        stock: 400,
        description: {
            en: '90° PPR elbow for welded connections.',
            fa: 'زانو ۹۰ درجه PPR برای اتصالات جوشی.',
        },
        specifications: {
            en: {
                size: '25 mm',
                weight: '0.04 kg',
                application: 'PPR connection',
            },
            fa: {
                size: '۲۵ میلی‌متر',
                weight: '۰.۰۴ کیلوگرم',
                application: 'اتصال PPR',
            },
        },
    },
    {
        name: { en: 'PE Pipe 32 mm', fa: 'لوله پلی‌اتیلن ۳۲ میلی‌متر' },
        slug: 'pe-pipe-32',
        brandSlug: 'megapol',
        categorySlugs: ['water-pipe'],
        price: 65000,
        stock: 75,
        featured: true,
        description: {
            en: 'PE80 polyethylene pipe, 32 mm diameter, suitable for water lines and supply.',
            fa: 'لوله پلی‌اتیلن PE80 با قطر ۳۲ میلی‌متر، مناسب برای خطوط آب و آبرسانی.',
        },
        specifications: {
            en: {
                size: '32 mm',
                thickness: '3.0 mm',
                weight: '0.28 kg/m',
                application: 'Rural and urban water supply',
            },
            fa: {
                size: '۳۲ میلی‌متر',
                thickness: '۳.۰ میلی‌متر',
                weight: '۰.۲۸ کیلوگرم بر متر',
                application: 'آبرسانی روستایی و شهری',
            },
        },
    },
    {
        name: { en: 'PE Flange 63 mm', fa: 'فلنج پلی‌اتیلن ۶۳ میلی‌متر' },
        slug: 'pe-flange-63',
        brandSlug: 'megapol',
        categorySlugs: ['fittings'],
        price: 95000,
        stock: 40,
        description: {
            en: 'Polyethylene flange for connecting PE pipes to valves and flanged equipment.',
            fa: 'فلنج پلی‌اتیلن برای اتصال لوله‌های PE به شیرآلات و تجهیزات فلنج‌دار.',
        },
        specifications: {
            en: {
                size: '63 mm',
                weight: '0.5 kg',
                application: 'Industrial connection',
            },
            fa: {
                size: '۶۳ میلی‌متر',
                weight: '۰.۵ کیلوگرم',
                application: 'اتصال صنعتی',
            },
        },
    },
    {
        name: { en: 'Inspection Cover 20×20', fa: 'دریچه بازدید ۲۰×۲۰' },
        slug: 'inspection-cover-20',
        brandSlug: 'abafarin',
        categorySlugs: ['fittings'],
        price: 35000,
        stock: 3,
        description: {
            en: 'White plastic inspection cover, suitable for accessing sewage pipes in walls.',
            fa: 'دریچه بازدید پلاستیکی سفید، مناسب برای دسترسی به لوله‌های فاضلاب در دیوار.',
        },
        specifications: {
            en: {
                size: '20×20 cm',
                weight: '0.3 kg',
                application: 'Sewage access',
            },
            fa: {
                size: '۲۰×۲۰ سانتی‌متر',
                weight: '۰.۳ کیلوگرم',
                application: 'بازدید فاضلاب',
            },
        },
    },
]

// ponytail: omit `email` so seed.ts synthesizes `${phoneDigits}@phone.local`,
// which is the same form the phone-login route matches against — keeping the
// password hash and login lookup on the same email.
export const SEED_USERS: SeedUser[] = [
    {
        password: 'admin1234',
        firstName: 'مدیر',
        lastName: 'آبفارین',
        phone: '09121111111',
        role: 'admin',
    },
    {
        password: 'employee1234',
        firstName: 'کارمند',
        lastName: 'فروش',
        phone: '09122222222',
        role: 'employee',
    },
    {
        password: 'customer1234',
        firstName: 'مشتری',
        lastName: 'نمونه',
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
    siteName: { en: 'Abafarin', fa: 'آبفارین' },
    footerText: {
        en: 'Abafarin online shop — pipes and fittings for every project.',
        fa: 'فروشگاه اینترنتی آبفارین — لوله و اتصالات برای هر پروژه.',
    },
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
import { MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-body-bg-light border-t border-slate-200">
      <div className="container mx-auto px-3 py-8 lg:px-4">
        <div className="mb-8 grid gap-8 md:grid-cols-3 lg:gap-12">
          {/* Column 1: Company Info */}
          <div>
            <a href="/" className="mb-3 inline-flex items-center gap-2">
              <div className="flex flex-col">
                <img
                  src="/src/assets/images/logo.webp"
                  alt="Vietnam Buyer's Guide"
                  width={150}
                  height={80}
                  className="object-contain"
                />
              </div>
            </a>
            <p className="mb-2 text-base font-medium leading-relaxed text-black">
              建豪(越南)責任有限公司
            </p>
            <p className="mb-4 text-sm leading-relaxed text-slate-600">
              越南華商採購名錄 - 提供所有華商採購名錄的資訊給華語閱讀者
            </p>
            {/* Government Registration Badge */}
            <div className="mt-4">
              <img
                src="/src/assets/images/gov-badge.png"
                alt="ĐÃ ĐĂNG KÝ BỘ CÔNG THƯƠNG"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
          </div>

          {/* Column 2: Contact Info */}
          <div>
            <h3 className="mb-4 text-base font-bold text-black">聯絡資訊</h3>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-600" />
                <span className="leading-relaxed">
                  越南胡志明市富潤郡第9坊胡文慧路81/11號
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-600" />
                <span>
                  0909822101{' '}
                  <span className="text-xs text-slate-500">(購買名錄)</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-600" />
                <span>028 38 298 298</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-600" />
                <a
                  href="mailto:kienhaovn6688@gmail.com"
                  className="transition-colors hover:text-red-600"
                >
                  kienhaovn6688@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-600" />
                <a
                  href="mailto:vipbook1688@gmail.com"
                  className="transition-colors hover:text-red-600"
                >
                  vipbook1688@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company Location with Map */}
          <div>
            <h3 className="mb-4 text-base font-bold text-black">公司位置</h3>
            <div className="mb-2 h-48 w-full overflow-hidden rounded-lg border border-slate-300 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.8543424578!2d106.6451!3d10.8231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ5JzIzLjIiTiAxMDbCsDM4JzQyLjQiRQ!5e0!3m2!1sen!2s!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="公司位置地圖"
                className="h-full w-full"
              />
            </div>
            <p className="mt-2 text-xs text-slate-600">
              81/11 Hồ Văn Huê, P.9, Q.Phú Nhuận, TP.HCM
            </p>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-300 pt-8 text-sm text-slate-600 md:flex-row">
          <p>© 2025 vnbuyerguide.com All rights reserved.</p>
          <p className="font-medium">CÔNG TY TNHH TM VÀ DV KIẾN HÀO VII</p>
        </div>
      </div>
    </footer>
  )
}

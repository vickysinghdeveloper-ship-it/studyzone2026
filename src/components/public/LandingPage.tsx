import React, { useState } from 'react';
import {
  BookOpen,
  Wifi,
  Zap,
  Wind,
  ShieldCheck,
  Coffee,
  VolumeX,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Star,
  MapPin,
  Send,
  MessageSquare,
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';
import { LibrarySettings, MembershipPlan, Seat, Student } from '../../types';

interface LandingPageProps {
  settings: LibrarySettings;
  plans?: MembershipPlan[];
  seats?: Seat[];
  setActiveTab?: (tab: string) => void;
  onOpenLogin: (type: 'student' | 'admin' | 'owner') => void;
  onSignUpStudent?: (newStudent: Partial<Student>) => Student;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  settings,
  plans = [],
  seats = [],
  setActiveTab,
  onOpenLogin,
  onSignUpStudent
}) => {
  const [selectedPlanForBook, setSelectedPlanForBook] = useState<MembershipPlan | null>(null);
  const [bookingFormData, setBookingFormData] = useState({ name: '', phone: '', shift: 'morning', exam: '' });
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [createdStudentDetails, setCreatedStudentDetails] = useState<Student | null>(null);

  const totalSeatsCount = seats.length || 30;
  const occupiedSeatsCount = seats.filter((s) => s.status === 'occupied').length;
  const availableSeatsCount = seats.filter((s) => s.status === 'available').length;
  const occupancyPercentage = Math.round((occupiedSeatsCount / totalSeatsCount) * 100);

  const facilities = [
    { icon: Wind, title: 'Fully Air Conditioned', desc: 'Climate controlled silent study halls maintained at comfortable 24°C.' },
    { icon: Wifi, title: '100 Mbps Dual Fiber WiFi', desc: 'Dedicated high-speed Internet with zero dead zones across all floors.' },
    { icon: VolumeX, title: 'Pin-Drop Silent Zones', desc: 'Acoustically insulated reading halls for deep focus study.' },
    { icon: Zap, title: '100% Power Backup', desc: 'Heavy duty silent generator auto-starts during electricity cuts.' },
    { icon: ShieldCheck, title: 'CCTV & Security', desc: '24/7 HD camera monitoring with biometric/QR attendance entry.' },
    { icon: Coffee, title: 'Tea, Coffee & RO Water', desc: 'Complimentary hot beverages & purified drinking water stations.' }
  ];

  const testimonials = [
    { name: 'Aarav Sharma', exam: 'UPSC Civil Services 2026', text: 'StudyZone changed my preparation routine completely. The 24-hour Full Day Pass and personal locker meant I could study without any noise or distraction.', rating: 5, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' },
    { name: 'Sneha Patel', exam: 'CA Final Aspirant', text: 'The ergonomic chairs and personal LED desk light in Silent Zone made 10-hour study marathons pain-free. Worth every rupee!', rating: 5, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80' },
    { name: 'Rohan Gupta', exam: 'GATE Computer Science', text: 'Cleanliness, high-speed WiFi for video lectures, and polite management. Best study center in town!', rating: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' }
  ];

  const faqs = [
    { q: 'Is seat assignment fixed or first-come first-serve?', a: 'Every student gets a dedicated seat assigned upon admission with floor & desk number marked on their Smart ID card.' },
    { q: 'Are lockers included in membership plans?', a: 'Personal lockable storage lockers are included in Full Day & Quarterly packages, or available for a nominal monthly fee.' },
    { q: 'How does QR Code Attendance work?', a: 'You simply scan your digital student ID card QR at reception kiosk or via student portal to log check-in/check-out.' },
    { q: 'Can I switch my shift mid-month?', a: 'Yes, seat transfers and shift changes can be requested directly from student portal or via library owner.' }
  ];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingFormData.name.trim() || !bookingFormData.phone.trim()) return;

    if (onSignUpStudent && selectedPlanForBook) {
      const cleanPhone = bookingFormData.phone.replace(/[^0-9]/g, '');
      const created = onSignUpStudent({
        name: bookingFormData.name.trim(),
        phone: bookingFormData.phone.trim(),
        email: `${cleanPhone}@studyzone.com`,
        targetExam: bookingFormData.exam.trim() || 'UPSC / Competitive Exams',
        planId: selectedPlanForBook.id,
        planName: selectedPlanForBook.title,
        shift: selectedPlanForBook.shift || 'fullday',
        totalPaid: 0,
        pendingFee: selectedPlanForBook.price,
        status: 'active',
        notes: 'Online Self-Registered via Seat Enrollment Form'
      });
      setCreatedStudentDetails(created);
    }
    setBookingSubmitted(true);
  };

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-semibold tracking-wide">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Premium Single-Branch Study Center</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                Achieve Exam Excellence at{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                  {settings.libraryName}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Experience pin-drop silent reading halls, climate-controlled AC zones, ergonomic desks, and instant visual seat booking. Built specifically for serious aspirants preparing for UPSC, NEET, JEE, CA & Competitive Exams.
              </p>

              {/* Live Occupancy Ticker */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Live Seat Status</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {availableSeatsCount} Available / {totalSeatsCount} Total Seats
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-28 bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${occupancyPercentage}%` }} />
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{occupancyPercentage}% Full</span>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => setActiveTab && setActiveTab('plans')}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  View Membership Plans
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>

                <button
                  onClick={() => onOpenLogin('student')}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3.5 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                  Student Portal
                </button>

                <button
                  onClick={() => onOpenLogin('admin')}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3.5 rounded-2xl text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Admin Login
                </button>
              </div>

            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Visual Card Stack */}
                <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80"
                    alt="StudyZone Library Interior"
                    className="w-full h-64 sm:h-72 object-cover"
                  />
                  
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        Air Conditioned Hall
                      </span>
                      <span className="text-xs font-bold text-slate-500">Shift Timings: 24/7</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Individual Ergonomic Desks
                    </h3>

                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2 shrink-0" /> Personal Power Socket & Desk LED Light</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2 shrink-0" /> High-Density Sound Insulation</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2 shrink-0" /> Smart QR ID Card & Attendance Log</li>
                    </ul>

                    <button
                      onClick={() => onOpenLogin('owner')}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      Library Owner Management Login →
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">World-Class Facilities</h2>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Everything You Need for Uninterrupted Study
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Designed to ensure long study sessions remain comfortable, silent, and highly productive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {facilities.map((fac, idx) => {
            const IconComponent = fac.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-md hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{fac.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{fac.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Membership Plans Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/60 py-16 rounded-3xl border border-slate-200/60 dark:border-slate-800">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Transparent Pricing</h2>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Select Your Shift & Plan
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Flexible monthly and quarterly passes tailored to your study schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col p-6 rounded-3xl bg-white dark:bg-slate-800 border ${
                plan.shift === 'fullday'
                  ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-xl'
                  : 'border-slate-200 dark:border-slate-700 shadow-md'
              }`}
            >
              {plan.shift === 'fullday' && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold tracking-wide uppercase shadow-sm">
                  ★ Most Popular
                </span>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.title}</h3>
                <span className="inline-block mt-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-md">
                  {plan.shiftTiming}
                </span>
              </div>

              <div className="my-4">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {settings.currencySymbol}{plan.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 ml-1">/ {plan.durationDays} Days</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">{plan.description}</p>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 mb-8 flex-1">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedPlanForBook(plan)}
                className={`w-full py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  plan.shift === 'fullday'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Enroll / Reserve Seat
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Rules & Code of Conduct */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Library Code of Conduct</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Strict Silent Environment Policy</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We uphold strict rules to guarantee every aspirant receives a quiet, peaceful space for intense concentration.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Mobile Silence Mode', desc: 'All phones must remain on silent / vibrate. Calls permitted only in cafeteria.' },
              { title: 'Fixed Assigned Seats', desc: 'Occupants must use their designated seat number printed on ID card.' },
              { title: 'Cleanliness & Order', desc: 'No food items allowed inside reading halls. Clean desks required after shift.' },
              { title: 'Smart QR Entry', desc: 'Scan student ID card upon entry & exit for accurate attendance recording.' }
            ].map((rule, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold text-sm flex items-center justify-center mb-3">
                  0{idx + 1}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{rule.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Student Reviews</h2>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">Trusted by Top Rankers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-4">
              <div className="flex items-center space-x-1 text-amber-400">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic">"{test.text}"</p>
              <div className="flex items-center space-x-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <img src={test.avatar} alt={test.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{test.name}</h4>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400">{test.exam}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Frequently Asked Questions</h2>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Have Questions? We Have Answers.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                <HelpCircle className="w-4 h-4 text-blue-600 mr-2 shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 pl-6 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Visit Our Reading Center</span>
            <h2 className="text-3xl font-extrabold">{settings.libraryName}</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Drop by for a 1-day free trial pass or book your seat online!
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <p className="flex items-center"><MapPin className="w-4 h-4 text-blue-400 mr-2 shrink-0" /> {settings.address}, {settings.city}, {settings.state} - {settings.pincode}</p>
              <p className="flex items-center"><Clock className="w-4 h-4 text-blue-400 mr-2 shrink-0" /> {settings.workingHours}</p>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20StudyZone,%20I%20want%20to%20inquire%20about%20seat%20admission`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-5 py-3 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat on WhatsApp Now
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 relative">
            {/* Embedded Google Map iframe */}
            <iframe
              title={`${settings.libraryName} Location Map`}
              src={
                settings.mapEmbedUrl ||
                `https://maps.google.com/maps?q=${encodeURIComponent(
                  `${settings.address}, ${settings.city}, ${settings.state} ${settings.pincode}`
                )}&t=&z=15&ie=UTF8&iwloc=&output=embed`
              }
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </section>

      {/* Staff & Admin Access Portal Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-800 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Branch Management Console</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Library Staff & Admin Access Portal
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                Receptionists, shift managers, and library desk supervisors created by the owner can sign in here. Admins have protected access strictly limited to the specific operational modules checked and granted by the library owner.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
                  <span className="text-[11px] font-extrabold text-indigo-300 block">QR Attendance</span>
                  <span className="text-[10px] text-slate-400 block">Instant In/Out check</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
                  <span className="text-[11px] font-extrabold text-indigo-300 block">Seat Allocations</span>
                  <span className="text-[10px] text-slate-400 block">Live map assignment</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
                  <span className="text-[11px] font-extrabold text-indigo-300 block">Fee Receipts</span>
                  <span className="text-[10px] text-slate-400 block">UPI & cash collections</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
                  <span className="text-[11px] font-extrabold text-indigo-300 block">Owner Control</span>
                  <span className="text-[10px] text-slate-400 block">Restrict anytime</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3.5 justify-center">
              <button
                onClick={() => onOpenLogin('admin')}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Login to Admin Portal</span>
              </button>

              <button
                onClick={() => onOpenLogin('owner')}
                className="w-full py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Owner Master Login</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Seat Inquiry Modal */}
      {selectedPlanForBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reserve Seat Inquiry</h3>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{selectedPlanForBook.title}</span>
              </div>
              <button
                onClick={() => setSelectedPlanForBook(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {bookingSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Seat Inquiry Received!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Our library manager will call you back within 15 minutes to confirm seat availability.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={bookingFormData.name}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={bookingFormData.phone}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Target Exam / College</label>
                  <input
                    type="text"
                    placeholder="e.g. UPSC / NEET / CA / GATE"
                    value={bookingFormData.exam}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, exam: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    Submit Seat Request
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

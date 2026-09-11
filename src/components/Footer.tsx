import React from 'react';
import {
  User,
  GraduationCap,
  MapPin,
  Phone,
  Calendar,
  Award
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      id="main-app-footer"
      className="relative z-10 w-full bg-white/80 backdrop-blur-xl text-neutral-950 border-t border-blue-100 mt-10 py-8 px-4 sm:px-6 lg:px-8 shadow-sm"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header inside Footer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-blue-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
                Official Festival Exhibit
              </span>
              <span className="text-xs text-neutral-500 font-semibold">Class-10 Category</span>
            </div>
            <h3 className="text-base font-extrabold text-neutral-950 tracking-tight font-['Outfit']">
              Omni Curve AI
            </h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              Mathematics Behind Artificial Intelligence: Pattern Recognition & Decision Making
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-700 bg-blue-50/70 px-3.5 py-1.5 rounded-xl border border-blue-200/80 shadow-2xs font-semibold">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Math National Festival 2026</span>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Student Information */}
          <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider font-['Outfit']">
              <User className="w-3.5 h-3.5" />
              <span>Student Details</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-neutral-950">Sheikh Tajbid Ahmmed Joy</div>
              <div className="text-xs text-neutral-600 font-mono">Roll: 10B-04 (2026)</div>
              <div className="text-xs text-neutral-500">Class-10 Representative</div>
            </div>
          </div>

          {/* Card 2: Educational Institution */}
          <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider font-['Outfit']">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>School & College</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-neutral-950">
                St. Gregory's High School & College
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>82 Municipal Rd, Dhaka 1100</span>
              </div>
            </div>
          </div>

          {/* Card 3: Contact & Event Registry */}
          <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-2xs space-y-2 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider font-['Outfit']">
              <Phone className="w-3.5 h-3.5" />
              <span>Contact & Registry</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-neutral-950 font-mono">01603428167</div>
              <div className="text-xs text-neutral-600 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Math National Festival 2026 (Category: Class-10)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-3 border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2">
          <span>
            OmniCurve AI • Real-Time Normal Equations Mathematical Regression
          </span>
          <span>© 2026 Sheikh Tajbid Ahmmed Joy</span>
        </div>
      </div>
    </footer>
  );
};

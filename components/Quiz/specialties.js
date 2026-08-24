// components/Quiz/specialties.js
import {
  Building2,
  HardHat,
  Calculator,
  PencilRuler,
  Wrench,
  Zap,
  Plug,
  PenTool,
  Fan,
  Cog,
  Compass,
  Route,
  Landmark,
  RefreshCw,
  Mountain,
} from 'lucide-react';

export const specialties = [
  {
    id: 'civil-supervision',
    name: 'عمران نظارت',
    icon: Building2,
    description: 'نظارت بر اجرای پروژه‌های عمرانی'
  },
  {
    id: 'civil-execution',
    name: 'عمران اجرا',
    icon: HardHat,
    description: 'اجرای عملیات ساختمانی و عمرانی'
  },
  {
    id: 'civil-calculation',
    name: 'عمران محاسبات',
    icon: Calculator,
    description: 'محاسبات سازه‌ای و طراحی'
  },
  {
    id: 'architecture-supervision',
    name: 'معماری نظارت',
    icon: PencilRuler,
    description: 'نظارت بر اجرای معماری'
  },
  {
    id: 'architecture-execution',
    name: 'معماری اجرا',
    icon: Wrench,
    description: 'اجرای جزئیات معماری'
  },
  {
    id: 'electrical-supervision',
    name: 'تاسیسات برق نظارت',
    icon: Zap,
    description: 'نظارت بر تاسیسات برقی'
  },
  {
    id: 'electrical-execution',
    name: 'تاسیسات برق اجرا',
    icon: Plug,
    description: 'اجرای تاسیسات برقی'
  },
  {
    id: 'electrical-design',
    name: 'تاسیسات برق طراحی',
    icon: PenTool,
    description: 'طراحی سیستم‌های برقی'
  },
  {
    id: 'mechanical-supervision',
    name: 'تاسیسات مکانیک نظارت',
    icon: Fan,
    description: 'نظارت بر تاسیسات مکانیکی'
  },
  {
    id: 'mechanical-execution',
    name: 'تاسیسات مکانیک اجرا',
    icon: Cog,
    description: 'اجرای تاسیسات مکانیکی'
  },
  {
    id: 'mechanical-design',
    name: 'تاسیسات مکانیک طراحی',
    icon: Compass,
    description: 'طراحی سیستم‌های مکانیکی'
  },
  {
    id: 'surveying',
    name: 'نقشه برداری',
    icon: Compass,
    description: 'عملیات نقشه‌برداری و ژئوماتیک'
  },
  {
    id: 'traffic',
    name: 'ترافیک',
    icon: Route,
    description: 'مهندسی ترافیک و حمل و نقل'
  },
  {
    id: 'urban-planning',
    name: 'شهرسازی',
    icon: Landmark,
    description: 'برنامه‌ریزی شهری و منطقه‌ای'
  },
  {
    id: 'civil-rehabilitation',
    name: 'عمران بهسازی',
    icon: RefreshCw,
    description: 'بهسازی و مقاوم‌سازی سازه‌ها'
  },
  {
    id: 'civil-excavation',
    name: 'عمران گودبرداری',
    icon: Mountain,
    description: 'گودبرداری و سازه‌های نگهبان'
  }
];
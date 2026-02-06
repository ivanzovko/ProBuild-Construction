import { 
  User, Building2, MapPin, FileText,
  Zap, Droplets, Paintbrush, Construction, Home, Layers, Hammer,
  Wind, Thermometer, Trash2, Shovel, Box
} from "lucide-react";

export const SORT_OPTIONS = [
  { id: "rating-desc", label: "Highest Rating" },
  { id: "rating-asc", label: "Lowest Rating" },
  { id: "name-asc", label: "Name (A-Z)" },
  { id: "name-desc", label: "Name (Z-A)" },
];

export const STEPS = [
  { id: 1, title: "Owner", desc: "Personal information", icon: User },
  { id: 2, title: "Company", desc: "Legal business details", icon: Building2 },
  { id: 3, title: "Service Area", desc: "Where do you work?", icon: MapPin },
  { id: 4, title: "Verification", desc: "Documents & Hours", icon: FileText },
];

export const COUNTIES = [
  "Bjelovarsko-bilogorska",
  "Brodsko-posavska",
  "Dubrovačko-neretvanska",
  "Grad Zagreb",
  "Istarska",
  "Karlovačka",
  "Koprivničko-križevačka",
  "Krapinsko-zagorska",
  "Ličko-senjska",
  "Međimurska",
  "Osječko-baranjska",
  "Požeško-slavonska",
  "Primorsko-goranska",
  "Sisačko-moslavačka",
  "Splitsko-dalmatinska",
  "Šibensko-kninska",
  "Varaždinska",
  "Virovitičko-podravska",
  "Vukovarsko-srijemska",
  "Zadarska",
  "Zagrebačka"
];

export const INITIAL_WORKING_HOURS = [
  { day: 'Monday', open: '08:00', close: '16:00', closed: false },
  { day: 'Tuesday', open: '08:00', close: '16:00', closed: false },
  { day: 'Wednesday', open: '08:00', close: '16:00', closed: false },
  { day: 'Thursday', open: '08:00', close: '16:00', closed: false },
  { day: 'Friday', open: '08:00', close: '16:00', closed: false },
  { day: 'Saturday', open: '00:00', close: '00:00', closed: true },
  { day: 'Sunday', open: '00:00', close: '00:00', closed: true },
];

export const CATEGORY_GROUPS = [
  {
    group: "Construction",
    items: [
      { id: "mason", title: "Mason", icon: <Construction size={18} /> },
      { id: "excavator", title: "Excavator", icon: <Shovel size={18} /> },
      { id: "reinforcement", title: "Reinforcement", icon: <Box size={18} /> },
      { id: "roofer", title: "Roofer", icon: <Home size={18} /> },
    ]
  },
  {
    group: "Installations",
    items: [
      { id: "electrician", title: "Electrician", icon: <Zap size={18} /> },
      { id: "plumber", title: "Plumber", icon: <Droplets size={18} /> },
      { id: "hvac", title: "HVAC Installer", icon: <Wind size={18} /> },
      { id: "heating", title: "Heating", icon: <Thermometer size={18} /> },
      { id: "chimney", title: "Chimney Sweep", icon: <Trash2 size={18} /> },
    ]
  },
  {
    group: "Finishing",
    items: [
      { id: "finishing_works", title: "Facade & Plaster", icon: <Paintbrush size={18} /> },
      { id: "tiler", title: "Tiler", icon: <Layers size={18} /> },
      { id: "flooring", title: "Flooring", icon: <Hammer size={18} /> },
      { id: "screed", title: "Screed", icon: <Layers size={18} /> },
    ]
  }
];

export const COUNTRY_CODES = [
  { code: "+43", label: "Austria", flag: "🇦🇹" },
  { code: "+32", label: "Belgium", flag: "🇧🇪" },
  { code: "+387", label: "BiH", flag: "🇧🇦" },
  { code: "+359", label: "Bulgaria", flag: "🇧🇬" },
  { code: "+385", label: "Croatia", flag: "🇭🇷" },
  { code: "+357", label: "Cyprus", flag: "🇨🇾" },
  { code: "+420", label: "Czech Republic", flag: "🇨🇿" },
  { code: "+45", label: "Denmark", flag: "🇩🇰" },
  { code: "+372", label: "Estonia", flag: "🇪🇪" },
  { code: "+358", label: "Finland", flag: "🇫🇮" },
  { code: "+33", label: "France", flag: "🇫🇷" },
  { code: "+49", label: "Germany", flag: "🇩🇪" },
  { code: "+30", label: "Greece", flag: "🇬🇷" },
  { code: "+36", label: "Hungary", flag: "🇭🇺" },
  { code: "+353", label: "Ireland", flag: "🇮🇪" },
  { code: "+39", label: "Italy", flag: "🇮🇹" },
  { code: "+371", label: "Latvia", flag: "🇱🇻" },
  { code: "+370", label: "Lithuania", flag: "🇱🇹" },
  { code: "+352", label: "Luxembourg", flag: "🇱🇺" },
  { code: "+356", label: "Malta", flag: "🇲🇹" },
  { code: "+31", label: "Netherlands", flag: "🇳🇱" },
  { code: "+48", label: "Poland", flag: "🇵🇱" },
  { code: "+351", label: "Portugal", flag: "🇵🇹" },
  { code: "+40", label: "Romania", flag: "🇷🇴" },
  { code: "+381", label: "Serbia", flag: "🇷🇸" },
  { code: "+421", label: "Slovakia", flag: "🇸🇰" },
  { code: "+386", label: "Slovenia", flag: "🇸🇮" },
  { code: "+34", label: "Spain", flag: "🇪🇸" },
  { code: "+46", label: "Sweden", flag: "🇸🇪" },
  { code: "+41", label: "Switzerland", flag: "🇨🇭" }
].sort((a, b) => a.label.localeCompare(b.label));

export const getFlagUrl = (flag: string) => {
  const code = Array.from(flag)
    .map(char => char.codePointAt(0)!.toString(16))
    .join("-");
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${code}.png`;
};
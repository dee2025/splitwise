import {
  Briefcase,
  CalendarDays,
  Heart,
  Home,
  MapPin,
  Users,
} from "lucide-react";

export const GROUP_TYPE_OPTIONS = [
  {
    id: "trip",
    label: "Trip",
    description: "Vacation, travel, and tour expenses",
    icon: MapPin,
    image: "/images/group-types/trip.png",
    border: "border-blue-500",
    tone: "border-blue-500/25 bg-blue-500/10 text-blue-300",
    example: "Manali Trip",
  },
  {
    id: "home",
    label: "Home",
    description: "Roommates, rent, bills, and shared living",
    icon: Home,
    image: "/images/group-types/home.png",
    border: "border-purple-500",
    tone: "border-purple-500/25 bg-purple-500/10 text-purple-300",
    example: "Flat Rent & Bills",
  },
  {
    id: "couple",
    label: "Couple",
    description: "Shared expenses with your partner",
    icon: Heart,
    image: "/images/group-types/couple.png",
    border: "border-rose-500",
    tone: "border-rose-500/25 bg-rose-500/10 text-rose-300",
    example: "Sarah & Mike",
  },
  {
    id: "event",
    label: "Event",
    description: "Parties, functions, and group plans",
    icon: CalendarDays,
    image: "/images/group-types/event.png",
    border: "border-amber-500",
    tone: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    example: "Birthday Party",
  },
  {
    id: "office",
    label: "Office",
    description: "Work, teams, and office spending",
    icon: Briefcase,
    image: "/images/group-types/office.png",
    border: "border-cyan-500",
    tone: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
    example: "Office Lunch",
  },
];

const GROUP_TYPE_CONFIG = GROUP_TYPE_OPTIONS.reduce((result, item) => {
  result[item.id] = item;
  return result;
}, {});

const LEGACY_TYPE_MAP = {
  other: "event",
  general: "event",
  work: "office",
};

export const GROUP_TYPE_IDS = GROUP_TYPE_OPTIONS.map((item) => item.id);

export function normalizeGroupType(type) {
  const normalized = String(type || "").trim().toLowerCase();
  if (GROUP_TYPE_CONFIG[normalized]) return normalized;
  return LEGACY_TYPE_MAP[normalized] || "event";
}

export function getGroupTypeConfig(group = {}) {
  const type = normalizeGroupType(group.type);
  return (
    GROUP_TYPE_CONFIG[type] || {
      id: "event",
      label: "Event",
      description: "Group expenses",
      icon: Users,
      image: "/images/group-types/event.png",
      border: "border-gray-500",
      tone: "border-gray-500/25 bg-gray-500/10 text-gray-300",
      example: "Group Event",
    }
  );
}

export function getGroupDisplayImage(group = {}) {
  return group.image || getGroupTypeConfig(group).image;
}

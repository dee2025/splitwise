// utils/groupUtils.js
import {
  Briefcase,
  Home,
  MapPin,
  Users,
  Utensils,
} from "lucide-react";

export function getGroupTypeConfig(group) {
  const groupName = group.name?.toLowerCase() || "";

  if (groupName.includes("trip") || groupName.includes("travel")) {
    return {
      icon: MapPin,
      label: "Trip",
      border: "border-blue-500",
    };
  } else if (
    groupName.includes("lunch") ||
    groupName.includes("food") ||
    groupName.includes("dinner")
  ) {
    return {
      icon: Utensils,
      label: "Food",
      border: "border-green-500",
    };
  } else if (
    groupName.includes("room") ||
    groupName.includes("home") ||
    groupName.includes("flat")
  ) {
    return {
      icon: Home,
      label: "Home",
      border: "border-purple-500",
    };
  } else if (groupName.includes("office") || groupName.includes("work")) {
    return {
      icon: Briefcase,
      label: "Work",
      border: "border-orange-500",
    };
  } else {
    return {
      icon: Users,
      label: "General",
      border: "border-gray-500",
    };
  }
}
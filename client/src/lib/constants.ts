export const DOCUMENT_CATEGORIES = [
  { value: "manual", label: "Manual", icon: "BookOpen" },
  { value: "checklist", label: "Checklist", icon: "CheckSquare" },
  { value: "guide", label: "Guide", icon: "FileText" },
] as const;

export const DOCUMENT_STATUSES = [
  { value: "draft", label: "Draft", color: "amber" },
  { value: "published", label: "Published", color: "green" },
  { value: "archived", label: "Archived", color: "gray" },
] as const;

export const DEFAULT_USER = {
  id: "user-1",
  username: "Admin User",
  role: "admin",
  avatarUrl: null,
};

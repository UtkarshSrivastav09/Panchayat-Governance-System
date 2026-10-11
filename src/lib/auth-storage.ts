export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "farmer" | "officer";
  village?: string;
  district?: string;
  state?: string;
  phone?: string;
  abha_id?: string;
  department?: string;
  designation?: string;
  created_at: string;
  password?: string;
}

export function updateUserSession(updates: Partial<UserProfile>): UserProfile | null {
  const current = getUserSession();
  if (!current) return null;
  const updated = { ...current, ...updates };
  saveUserSession(updated);
  return updated;
}

const STORAGE_KEY = "gram_sahayak_user_session";
const REGISTRY_KEY = "gram_sahayak_registered_users";
export const SESSION_COOKIE_NAME = "gram_sahayak_session";

// NO dummy accounts! Only real users registered by the user will exist in the portal.
const DEFAULT_AUTHORIZED_ACCOUNTS: UserProfile[] = [];

export function saveUserSession(user: UserProfile) {
  if (typeof window === "undefined") return;

  try {
    const { password, ...safeUser } = user;
    const serialized = JSON.stringify(safeUser);
    localStorage.setItem(STORAGE_KEY, serialized);

    // Save in cookie for server and middleware access
    document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(
      serialized
    )}; path=/; max-age=2592000; SameSite=Lax`;
  } catch (err) {
    console.warn("Error saving user session:", err);
  }
}

export function getUserSession(): UserProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }

    const cookies = document.cookie.split("; ");
    const userCookie = cookies.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
    if (userCookie) {
      const val = decodeURIComponent(userCookie.split("=")[1]);
      return JSON.parse(val);
    }
  } catch (err) {
    console.warn("Error reading user session:", err);
  }

  return null;
}

export function clearUserSession() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch (err) {
    console.warn("Error clearing user session:", err);
  }
}

// Register user locally and synchronize with account registry
export function registerAccountLocally(user: UserProfile) {
  if (typeof window === "undefined") return;

  try {
    const existing = getRegisteredAccounts();
    const updated = [
      user,
      ...existing.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase()),
    ];
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Error storing user in registry:", err);
  }
}

export function getRegisteredAccounts(): UserProfile[] {
  if (typeof window === "undefined") return DEFAULT_AUTHORIZED_ACCOUNTS;

  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        return list;
      }
    }
  } catch (err) {
    console.warn("Error fetching registered accounts:", err);
  }

  return DEFAULT_AUTHORIZED_ACCOUNTS;
}

// Strictly validate credentials against real registered accounts
export function verifyCredentials(
  identifier: string,
  pass: string,
  role: "farmer" | "officer"
): UserProfile | null {
  const cleanId = identifier.trim().toLowerCase();
  const accounts = getRegisteredAccounts();

  // Find exact match by email or phone and role
  const found = accounts.find((acc) => {
    const matchEmail = acc.email?.toLowerCase() === cleanId;
    const matchPhone = acc.phone && acc.phone.trim() === cleanId;
    return (matchEmail || matchPhone) && acc.role === role;
  });

  if (!found) {
    // If not found, strictly return null. NEVER return dummy user!
    return null;
  }

  // Check password strictly
  if (found.password && found.password !== pass) {
    return null;
  }

  return found;
}

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "student" | null;

type AuthState = {
  session: Session | null;
  user: User | null;
  role: Role;
  studentId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  role: null,
  studentId: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) {
        setRole(null);
        setStudentId(null);
        setLoading(false);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: roles }, { data: student }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", uid),
        supabase
          .from("students")
          .select("id")
          .eq("user_id", uid)
          .eq("is_active", true)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      const isAdmin = (roles ?? []).some((r) => r.role === "admin");
      setRole(isAdmin ? "admin" : "student");
      setStudentId(student?.id ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
    setStudentId(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, role, studentId, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !password || !serviceRoleKey) {
  throw new Error(
    "Set ADMIN_EMAIL, ADMIN_PASSWORD and SUPABASE_SERVICE_ROLE_KEY before running this script.",
  );
}

const supabase = createClient(process.env.SUPABASE_URL, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: users, error: listError } = await supabase.auth.admin.listUsers();
if (listError) throw listError;

const existing = users.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
let user = existing;

if (user) {
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  user = data.user;
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Арсений" },
  });
  if (error) throw error;
  user = data.user;
}

const { error: roleError } = await supabase
  .from("user_roles")
  .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
if (roleError) throw roleError;

console.log(`Admin user is ready: ${user.email}`);

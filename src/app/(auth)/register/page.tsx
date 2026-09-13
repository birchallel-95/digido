import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  return <RegisterForm googleEnabled={googleEnabled} />;
}

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="card-soft p-8">
        <h1 className="text-2xl font-heading font-bold">Login</h1>
        <p className="mt-2" style={{ color: "var(--sd-slate)" }}>
          V1: UI first. We’ll connect Supabase Auth next.
        </p>

        <div className="mt-6 space-y-3">
          <input className="w-full rounded-2xl border px-4 py-3" placeholder="Email" />
          <input className="w-full rounded-2xl border px-4 py-3" placeholder="Password" type="password" />
        </div>

        <button className="btn btn-primary mt-6 w-full justify-center">Login</button>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href="/register/forgot" className="underline">
            Forgot password?
          </Link>
          <Link href="/register/client" className="underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
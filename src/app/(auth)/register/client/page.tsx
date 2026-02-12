import Link from "next/link";

export default function RegisterClientPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="card-soft p-8">
        <h1 className="text-2xl font-heading font-bold">Opprett konto</h1>
        <p className="mt-2" style={{ color: "var(--sd-slate)" }}>
          V1: Enkel registrering. Vi kobler på e-postbekreftelse via Supabase etterpå.
        </p>

        <div className="mt-6 space-y-3">
          <input className="w-full rounded-2xl border px-4 py-3" placeholder="Navn" />
          <input className="w-full rounded-2xl border px-4 py-3" placeholder="E-post" />
          <input className="w-full rounded-2xl border px-4 py-3" placeholder="Passord" type="password" />
        </div>

        <Link href="/register/email-sent" className="btn btn-primary mt-6 w-full justify-center">
          Registrer
        </Link>

        <p className="mt-4 text-sm" style={{ color: "var(--sd-slate)" }}>
          Har du konto?{" "}
          <Link href="/login" className="underline">
            Logg inn
          </Link>
        </p>
      </div>
    </div>
  );
}
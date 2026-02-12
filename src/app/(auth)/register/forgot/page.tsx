import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="card-soft p-8">
        <h1 className="text-2xl font-heading font-bold">Glemt passord</h1>
        <p className="mt-2" style={{ color: "var(--sd-slate)" }}>
          Skriv inn e-posten din, så sender vi en lenke for å sette nytt passord.
        </p>

        <div className="mt-6 space-y-3">
          <input className="w-full rounded-2xl border px-4 py-3" placeholder="E-post" />
        </div>

        <button className="btn btn-primary mt-6 w-full justify-center">Send lenke</button>

        <p className="mt-4 text-sm" style={{ color: "var(--sd-slate)" }}>
          <Link href="/login" className="underline">
            Tilbake til innlogging
          </Link>
        </p>
      </div>
    </div>
  );
}
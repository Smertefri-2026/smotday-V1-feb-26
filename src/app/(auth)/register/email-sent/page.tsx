import Link from "next/link";

export default function EmailSentPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="card-soft p-8">
        <h1 className="text-2xl font-heading font-bold">Sjekk e-posten din</h1>
        <p className="mt-3" style={{ color: "var(--sd-slate)" }}>
          Vi har sendt en bekreftelseslenke. Når du har bekreftet, kan du logge inn.
        </p>

        <Link href="/login" className="btn btn-primary mt-6 w-full justify-center">
          Til innlogging
        </Link>
      </div>
    </div>
  );
}
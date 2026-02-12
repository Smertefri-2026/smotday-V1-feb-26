export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hero-grad">
      <div className="container-app py-10">{children}</div>
    </div>
  );
}
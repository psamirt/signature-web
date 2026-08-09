import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-foreground">Aura Signature</h1>
        <p className="mb-6 text-sm text-muted-foreground">Panel de gestión</p>
        <LoginForm />
      </div>
    </div>
  );
}

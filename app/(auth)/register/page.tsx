"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    router.replace("/pending");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Crea account</h2>
        <p className="text-sm leading-6 text-muted">
          Registrati. Se non sei admin, il tuo accesso resterà in attesa di approvazione.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium text-ink">
            Nome completo
          </label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Mario Rossi"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nome@azienda.com"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-ink">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Almeno 6 caratteri"
            minLength={6}
            required
          />
        </div>
        {error ? (
          <div className="rounded-control border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Registrazione in corso..." : "Registrati"}
        </Button>
      </form>

      <p className="text-sm text-muted">
        Hai già un account?{" "}
        <Link href="/login" className="font-medium text-action">
          Vai al login
        </Link>
      </p>
    </div>
  );
}

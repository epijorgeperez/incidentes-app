'use client'

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return user ? (
    <div className="flex items-center gap-4">
      ¡Hola {user.email}!
      <button
        onClick={handleSignOut}
        className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
      >
        Logout
      </button>
    </div>
  ) : (
    <div className="flex gap-2">
      <Link
        href="/login"
        className="h-8 flex items-center justify-center rounded-md no-underline text-sm font-medium px-4"
      >
        Login
      </Link>
      <Link
        href="/signup"
        className="h-8 flex items-center justify-center rounded-md no-underline bg-black text-white text-sm font-medium px-4"
      >
        Sign up
      </Link>
    </div>
  );
}
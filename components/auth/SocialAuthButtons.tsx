"use client";

import { signIn, type ClientSafeProvider } from "next-auth/react";

type SocialAuthButtonsProps = {
  callbackUrl: string;
  providers: {
    google?: ClientSafeProvider;
    facebook?: ClientSafeProvider;
  };
};

export function SocialAuthButtons({ callbackUrl, providers }: SocialAuthButtonsProps) {
  if (!providers.google && !providers.facebook) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4">
      {providers.google ? (
        <button
          aria-label="Tiếp tục với Google"
          className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.96] dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:bg-slate-800"
          onClick={() => signIn("google", { callbackUrl })}
          title="Tiếp tục với Google"
          type="button"
        >
          <GoogleIcon />
        </button>
      ) : null}

      {providers.facebook ? (
        <button
          aria-label="Tiếp tục với Facebook"
          className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white text-blue-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.96] dark:border-white/10 dark:bg-slate-950/70 dark:text-blue-300 dark:hover:bg-slate-800"
          onClick={() => signIn("facebook", { callbackUrl })}
          title="Tiếp tục với Facebook"
          type="button"
        >
          <span className="text-xl font-black leading-none">f</span>
        </button>
      ) : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.43Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.51c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.07v2.6A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.41 13.89A6 6 0 0 1 6.1 12c0-.66.11-1.3.31-1.89v-2.6H3.07A10 10 0 0 0 2 12c0 1.61.39 3.13 1.07 4.49l3.34-2.6Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.99c1.47 0 2.78.5 3.82 1.49l2.87-2.87C16.96 3 14.7 2 12 2a10 10 0 0 0-8.93 5.51l3.34 2.6C7.2 7.75 9.4 5.99 12 5.99Z"
        fill="#EA4335"
      />
    </svg>
  );
}

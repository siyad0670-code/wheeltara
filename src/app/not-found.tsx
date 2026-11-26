import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
        <p className="mt-2 text-slate-600">
          The spin wheel page you are looking for does not exist.
        </p>
        <Link
          href="/en/"
          className="mt-5 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
        >
          Go to Spin Wheel
        </Link>
      </body>
    </html>
  );
}
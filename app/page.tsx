import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect users directly to the specific portfolio page
  redirect('/cm8txjdfe0000t7cfh4i8mh5s');

  // The code below will not be reached due to the redirect
  return null;
}


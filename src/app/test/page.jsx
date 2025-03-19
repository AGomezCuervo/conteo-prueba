"use server"

import { getProducts } from "@/lib/actions";

export default async function TestPage() {

const sendEmail = await fetch('http://localhost:3000/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: 'gomezantoniojose1@gmail.com',
      subject: 'Password Reset',
      text: 'Here is your password reset link: ...',
    }),
  });

  const data = await sendEmail.json();
  console.log(data);

  return <p>Este es un test</p>
}

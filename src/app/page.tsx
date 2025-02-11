import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import LandingPage from "~/app/components/LandingPage";


export default async function Home() {

  return (
      <LandingPage/>
  );
}

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import logo from "./logo.svg";
import logofooter from "./logop.svg";

type LogoProps = {
  width?: string;
};

export const Logo = ({ width = "w-[110px]" }: LogoProps) => {
  return (
    <Link href="/" className="inline-block">
      <Image
        src={logo}
        alt="logo"
        width={160}
        height={60}
        priority
        className={cn("h-auto", width)}
      />
    </Link>
  );
};

export const LogoFooter = ({ width = "w-[100px]" }: LogoProps) => {
  return (
    <Link href="/" className="inline-block">
      <Image
        src={logofooter}
        alt="logo"
        width={120}
        height={40}
        priority
        className={cn("h-auto", width)}
      />
    </Link>
  );
};

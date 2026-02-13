"use client";

import Link from "next/link";
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Linkedin as LinkedinIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
  isAbsolute?: boolean;
}

export function Footer({ className, isAbsolute = false }: FooterProps) {
  return (
    <footer
      className={cn(
        "w-full bg-gradient-to-t from-[#F1F8F5]/95 to-[#F1F8F5]/75 backdrop-blur-md border-t border-[#1E4B35]/10 flex flex-col items-center justify-center py-6 z-40",
        isAbsolute ? "absolute bottom-0 left-0" : "relative",
        className
      )}>
      {/* Social Media Layer */}
      <div className="flex items-center gap-6 mb-4">
        <a
          href="#"
          aria-label="Visit our Facebook page"
          className="p-2 text-gray-500 hover:text-[#1E4B35] transition-colors group">
          <FacebookIcon className="w-5 h-5" />
        </a>
        <a
          href="#"
          aria-label="Visit our Instagram page"
          className="p-2 text-gray-500 hover:text-[#1E4B35] transition-colors group">
          <InstagramIcon className="w-5 h-5" />
        </a>
        <a
          href="#"
          aria-label="Visit our Twitter page"
          className="p-2 text-gray-500 hover:text-[#1E4B35] transition-colors group">
          <TwitterIcon className="w-5 h-5" />
        </a>
        <a
          href="#"
          aria-label="Visit our LinkedIn page"
          className="p-2 text-gray-500 hover:text-[#1E4B35] transition-colors group">
          <LinkedinIcon className="w-5 h-5" />
        </a>
      </div>

      <div className="flex flex-col items-center justify-center space-y-4 text-gray-500 text-xs font-light w-full">
        <div className="flex items-center flex-wrap justify-center gap-x-6 gap-y-2">
          <Link
            href="#"
            className="hover:text-[#1E4B35] hover:underline transition-colors">
            Contact us
          </Link>
          <Link
            href="#"
            className="hover:text-[#1E4B35] hover:underline transition-colors">
            Privacy & security
          </Link>
          <Link
            href="#"
            className="hover:text-[#1E4B35] hover:underline transition-colors">
            Terms of use
          </Link>
          <Link
            href="#"
            className="hover:text-[#1E4B35] hover:underline transition-colors">
            Accessibility
          </Link>
          <Link
            href="#"
            className="hover:text-[#1E4B35] hover:underline transition-colors">
            About Aurum Vault
          </Link>
          <Link
            href="#"
            className="hover:text-[#1E4B35] hover:underline transition-colors">
            Careers
          </Link>
        </div>

        <div className="flex flex-col items-center gap-1 opacity-80">
          <p>Member FDIC. Equal Housing Lender.</p>
          <p>&copy; 2026 Aurum Vault N.A. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

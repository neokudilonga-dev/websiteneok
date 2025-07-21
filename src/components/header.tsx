"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import SchoolSelector from "./school-selector";
import Cart from "./cart";
import type { School } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  schools: School[];
  selectedSchool?: School;
  onSchoolChange: (schoolId: string) => void;
}

export default function Header({
  schools,
  selectedSchool,
  onSchoolChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-headline inline-block text-xl font-bold">
              BiblioAngola
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <div className="hidden md:block">
              <SchoolSelector
                schools={schools}
                selectedSchool={selectedSchool}
                onSchoolChange={onSchoolChange}
              />
            </div>
            <Cart />
            <Link href="/admin">
              <Button variant="ghost" size="sm">Admin</Button>
            </Link>
          </nav>
        </div>
      </div>
      <div className="container pb-2 md:hidden">
         <SchoolSelector
            schools={schools}
            selectedSchool={selectedSchool}
            onSchoolChange={onSchoolChange}
          />
      </div>
    </header>
  );
}

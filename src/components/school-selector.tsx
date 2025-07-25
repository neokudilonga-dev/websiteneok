"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { School } from "@/lib/types";
import { useLanguage } from "@/context/language-context";

interface SchoolSelectorProps {
  schools: School[];
  selectedSchool?: School;
  onSchoolChange: (schoolId: string) => void;
  isLoading?: boolean;
}

export default function SchoolSelector({
  schools,
  selectedSchool,
  onSchoolChange,
  isLoading
}: SchoolSelectorProps) {
    const { language, t } = useLanguage();

  return (
    <Select onValueChange={onSchoolChange} value={selectedSchool?.id}>
      <SelectTrigger className="w-full md:w-[280px]" disabled={isLoading}>
        <SelectValue placeholder={isLoading ? "A carregar escolas..." : "Selecione a sua escola"} />
      </SelectTrigger>
      <SelectContent>
        {schools.map((school) => (
          <SelectItem key={school.id} value={school.id}>
            {school.name[language] || school.name.pt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

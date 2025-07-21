"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { School } from "@/lib/types";

interface SchoolSelectorProps {
  schools: School[];
  selectedSchool?: School;
  onSchoolChange: (schoolId: string) => void;
}

export default function SchoolSelector({
  schools,
  selectedSchool,
  onSchoolChange,
}: SchoolSelectorProps) {
  return (
    <Select onValueChange={onSchoolChange} value={selectedSchool?.id}>
      <SelectTrigger className="w-full md:w-[280px]">
        <SelectValue placeholder="Select your school" />
      </SelectTrigger>
      <SelectContent>
        {schools.map((school) => (
          <SelectItem key={school.id} value={school.id}>
            {school.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { schools as initialSchools } from "@/lib/data";
import type { School } from "@/lib/types";
import { AddEditSchoolSheet } from "@/components/admin/add-edit-school-sheet";

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | undefined>(
    undefined
  );

  const handleAddSchool = () => {
    setSelectedSchool(undefined);
    setSheetOpen(true);
  };

  const handleEditSchool = (school: School) => {
    setSelectedSchool(school);
    setSheetOpen(true);
  };

  const handleDeleteSchool = (schoolId: string) => {
    // In a real app, you'd call an API here.
    setSchools(schools.filter((s) => s.id !== schoolId));
  };

  const handleSaveChanges = (school: School) => {
    // In a real app, you'd call an API here.
    if (selectedSchool) {
      setSchools(schools.map((s) => (s.id === school.id ? school : s)));
    } else {
      // For demo, using a simplified ID generation
      setSchools([...schools, { ...school, id: `school-${Date.now()}` }]);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Schools</CardTitle>
            <CardDescription>
              Manage the schools your store supports.
            </CardDescription>
          </div>
          <Button onClick={handleAddSchool}>
            <PlusCircle className="mr-2" />
            Add New School
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{school.id}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEditSchool(school)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteSchool(school.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddEditSchoolSheet
        isOpen={isSheetOpen}
        setIsOpen={setSheetOpen}
        school={selectedSchool}
        onSaveChanges={handleSaveChanges}
      />
    </>
  );
}

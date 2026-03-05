
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, CheckCircle, XCircle, ChevronUp, ChevronDown, Save } from "lucide-react";
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
import type { School } from "@/lib/types";
import { AddEditSchoolSheet } from "@/components/admin/add-edit-school-sheet";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/context/data-context";
import { useLanguage } from "@/context/language-context";

interface SchoolsPageClientProps {
    initialSchools: School[];
}

export default function SchoolsPageClient({ initialSchools }: SchoolsPageClientProps) {
  const { addSchool, updateSchool, deleteSchool, setSchools, saveSchoolOrder } = useData();
  const { t, language } = useLanguage();

  const [localSchools, setLocalSchools] = useState<School[]>(initialSchools);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSchools(initialSchools);
    setLocalSchools(initialSchools);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSchools]);

  const moveSchool = (index: number, direction: 'up' | 'down') => {
    const newSchools = [...localSchools];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newSchools.length) return;
    
    [newSchools[index], newSchools[targetIndex]] = [newSchools[targetIndex], newSchools[index]];
    setLocalSchools(newSchools);
    setHasChanges(true);
  };

  const handleSaveOrder = async () => {
    await saveSchoolOrder(localSchools);
    setHasChanges(false);
  };

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
    deleteSchool(schoolId);
  };

  const handleSaveChanges = (school: School) => {
    if (selectedSchool) {
      updateSchool(school);
    } else {
      addSchool(school);
    }
  };

  const renderCheck = (value: boolean | undefined) => {
     return value ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
        <XCircle className="h-5 w-5 text-destructive" />
    )
  }
  
  const getSchoolName = (school: School) => {
    if (!school || !school.name) return 'No Name';
    // If name is an object (i18n), use the current language
    if (typeof school.name === 'object' && school.name !== null) {
      const nameObj = school.name as { pt?: string; en?: string; [key: string]: string | undefined };
      return nameObj[language] || nameObj.pt || nameObj.en || 'Unnamed School';
    }
    return school.name || 'Unnamed School';
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{t('schools_page.title')}</CardTitle>
          <div className="flex gap-2">
            {hasChanges && (
              <Button variant="outline" className="border-primary text-primary" onClick={handleSaveOrder}>
                <Save className="mr-2 h-4 w-4" />
                {t('common.save')}
              </Button>
            )}
            <Button onClick={handleAddSchool}>
              <PlusCircle className="mr-2" />
              {t('schools_page.add_new_school')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>{t('schools_page.school_name')}</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>{t('schools_page.abbreviation')}</TableHead>
                <TableHead>{t('schools_page.pickup_at_school')}</TableHead>
                <TableHead>{t('schools_page.pickup_at_location')}</TableHead>
                <TableHead>{t('schools_page.recommended_plan')}</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">{t('common.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localSchools.map((school, index) => (
                <TableRow key={school.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveSchool(index, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveSchool(index, 'down')}
                        disabled={index === localSchools.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{getSchoolName(school)}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{school.id}</TableCell>
                   <TableCell>
                      <Badge variant="secondary">{school.abbreviation}</Badge>
                   </TableCell>
                  <TableCell>
                    {renderCheck(school.allowPickup)}
                  </TableCell>
                   <TableCell>
                    {renderCheck(school.allowPickupAtLocation)}
                  </TableCell>
                   <TableCell>
                    {renderCheck(school.hasRecommendedPlan)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">{t('common.toggle_menu')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEditSchool(school)}
                        >
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteSchool(school.id)}
                        >
                          {t('common.delete')}
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


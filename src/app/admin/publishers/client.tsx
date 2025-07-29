
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { useData } from "@/context/data-context";
import { useLanguage } from "@/context/language-context";

interface PublishersPageClientProps {
    initialPublishers: string[];
}

export default function PublishersPageClient({ initialPublishers }: PublishersPageClientProps) {
  const { publishers, addPublisher, deletePublisher, setPublishers } = useData();
  const { t } = useLanguage();
  const [newPublisher, setNewPublisher] = useState('');

  useEffect(() => {
    setPublishers(initialPublishers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPublishers]);

  const handleAddPublisher = () => {
    if (newPublisher && !publishers.includes(newPublisher)) {
        addPublisher(newPublisher);
        setNewPublisher('');
    }
  };

  const handleDeletePublisher = (publisherToDelete: string) => {
    deletePublisher(publisherToDelete);
  };


  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>{t('publishers_page.title')}</CardTitle>
            <CardDescription>{t('publishers_page.description')}</CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    {t('publishers_page.add_publisher')}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>{t('publishers_page.dialog_title')}</AlertDialogTitle>
                <AlertDialogDescription>
                    {t('publishers_page.dialog_description')}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <Input 
                    value={newPublisher} 
                    onChange={(e) => setNewPublisher(e.target.value)} 
                    placeholder={t('publishers_page.publisher_name_placeholder')}
                />
                <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleAddPublisher}>{t('common.add')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('publishers_page.publisher_name')}</TableHead>
                <TableHead className="w-[100px] text-right">
                  <span className="sr-only">{t('common.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publishers.map((publisher) => (
                <TableRow key={publisher}>
                  <TableCell className="font-medium">{publisher}</TableCell>
                  <TableCell className="text-right">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">{t('publishers_page.delete_publisher')}</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t('common.action_cannot_be_undone_publisher')}
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePublisher(publisher)} className="bg-destructive hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

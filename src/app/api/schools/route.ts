
import { firestore } from "@/lib/firebase-admin";
import { School } from "@/lib/types";
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const logError = (error: unknown, context: string) => {
  const logFilePath = path.join(process.cwd(), 'src/lib/error.log');
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const logEntry = `${timestamp} - ${context}: ${errorMessage}\n`;

  fs.appendFileSync(logFilePath, logEntry);
};

export async function GET() {
    try {
    const schoolsCollection = firestore.collection("schools");
        const schoolsSnapshot = await schoolsCollection.get();
        const schools: School[] = [];

        schoolsSnapshot.forEach(doc => {
            const data = doc.data();
            schools.push({
                id: doc.id,
                name: typeof data.name === 'object' ? data.name : data.name,
                description: typeof data.description === 'object' ? data.description : data.description,
                abbreviation: data.abbreviation || '',
                allowPickup: !!data.allowPickup,
                allowPickupAtLocation: !!data.allowPickupAtLocation,
                hasRecommendedPlan: !!data.hasRecommendedPlan,
            });
        });

        return NextResponse.json(schools);
    } catch (error) {
        logError(error, "Error fetching schools in GET function");
        return NextResponse.json(
          { error: "Server Error: Failed to fetch schools" },
          { status: 500 }
        );
    }
}

export async function POST(request: Request) {
  try {
    const body: School = await request.json();

    const { id, ...schoolData } = body;
    const schoolDataWithDescription = {
      description: { pt: "", en: "" },
      ...schoolData,
    };
    if (!id) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const schoolRef = firestore.collection('schools').doc(id);
    await schoolRef.set(schoolDataWithDescription);

    return NextResponse.json({ id, ...schoolDataWithDescription }, { status: 201 });
  } catch (error) {
    logError(error, "Error adding school in POST function");
    return NextResponse.json({ error: 'Failed to add school' }, { status: 500 });
  }
}

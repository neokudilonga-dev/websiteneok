import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const gamesCol = collection(db, "games");
    const gameSnapshot = await getDocs(gamesCol);
    const gameList = gameSnapshot.docs.map((doc) => {
      const data = doc.data();
      // Exclude image links
      const { images, ...rest } = data;
      return rest;
    });

    const worksheet = XLSX.utils.json_to_sheet(gameList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Games");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=games.xlsx",
      },
    });
  } catch (error) {
    console.error("Error exporting games:", error);
    return NextResponse.json({ error: "Failed to export games" }, { status: 500 });
  }
}

import { firestore } from '../src/lib/firebase-admin';

/**
 * This script renames the "outros" category to "Auxiliares Didáticos" (PT) / "Didactic Aids" (EN)
 * and updates all products/reading plan items that use "outros" as a status or grade.
 */
async function migrate() {
  console.log('Starting migration...');

  if (!firestore) {
    console.error('Firestore not initialized');
    return;
  }

  // 1. Rename category document if it exists
  const categoriesRef = firestore.collection('categories');
  const outrosCatSnap = await categoriesRef.doc('outros').get();
  const OutrosCatSnap = await categoriesRef.doc('Outros').get();

  if (outrosCatSnap.exists || OutrosCatSnap.exists) {
    const data = outrosCatSnap.exists ? outrosCatSnap.data() : OutrosCatSnap.data();
    console.log('Renaming category document...');
    await categoriesRef.doc('auxiliares_didaticos').set({
      ...data,
      name: {
        pt: 'Auxiliares Didáticos',
        en: 'Didactic Aids'
      }
    });
    if (outrosCatSnap.exists) await categoriesRef.doc('outros').delete();
    if (OutrosCatSnap.exists) await categoriesRef.doc('Outros').delete();
  }

  // 2. Update all products with status "outros"
  const productsRef = firestore.collection('products');
  const productsSnap = await productsRef.where('status', '==', 'outros').get();
  console.log(`Found ${productsSnap.size} products with status "outros". Updating...`);
  
  const batch = firestore.batch();
  productsSnap.docs.forEach(doc => {
    batch.update(doc.ref, { status: 'didactic_aids' });
  });
  await batch.commit();

  // 3. Update all reading plan items with status "outros" or grade "outros"
  const rpRef = firestore.collection('readingPlan');
  
  // Status "outros"
  const rpStatusSnap = await rpRef.where('status', '==', 'outros').get();
  console.log(`Found ${rpStatusSnap.size} reading plan items with status "outros". Updating...`);
  const batch2 = firestore.batch();
  rpStatusSnap.docs.forEach(doc => {
    batch2.update(doc.ref, { status: 'didactic_aids' });
  });
  await batch2.commit();

  // Grade "outros" (case insensitive)
  const rpGradeSnap = await rpRef.get();
  const batch3 = firestore.batch();
  let gradeCount = 0;
  rpGradeSnap.docs.forEach(doc => {
    const data = doc.data();
    if (data.grade && typeof data.grade === 'string' && (data.grade.toLowerCase() === 'outros' || data.grade.toLowerCase() === 'others')) {
      batch3.update(doc.ref, { grade: 'didactic_aids' });
      gradeCount++;
    }
  });
  if (gradeCount > 0) {
    console.log(`Updating ${gradeCount} reading plan items with grade "outros"...`);
    await batch3.commit();
  }

  console.log('Migration completed successfully.');
}

migrate().catch(console.error);

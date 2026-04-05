
import 'server-only';

import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Hardcoded service account for development
const serviceAccount = {
  projectId: 'biblioangola',
  clientEmail: 'firebase-adminsdk-fbsvc@biblioangola.iam.gserviceaccount.com',
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDfjzUhRD/Cjo1r\nanpincoxyJwvIhk6ayQmeZ2FeXV9KlKeJd6+88p3/+HYZTabeSDViSZWiHZ98zjU\n/QFquWlsrFqffph8F1RLWOlzkoBE8qo3/Q9xsa5ttbx9jrMPYgqevjRIRrbB653b\nCWBNNysbaATHR/RKw3Icf7Q3FuS0i4gqB4HS2z76/Ptj+7DDNqrUIi6fSw3YNF9q\ns/nAcSJRQJ/pJzip+99uaCPyTVxYDBe/FcVpEhHyWv2rIZJZjc1osgXmDOcyDe+5\n4IFeqUnf+9ZMTjONdyMCc8Z4tNjCdRmlkKi2VZC0CwbV5SUEWaH6uoGyh3jx0bRZ\n2ZK5LhnVAgMBAAECggEAOBhqh/TknNCBOsVGfU1DiXdhfVAsjWSJ9x+H/5BpAyWm\nAmnVOQvaL38k79QBvkRIEVyvIoJuXQ81IPh1LQ7mHa8ntCKjZ2vBKoDeXzIQ/nv3\na0IT6H7hmkTCTa0LUB5VNNzcKJCZ1hHlk6sIH4fqyJ8yp8Bt0360OONwWGxlqclq\n+QoIFzQ5dIuk8OWASVV5XRf/jTdBLfOUzsZfwJTj7nx4D436dxOqKQHHur+dsMy5\nfv9oNxN2sc633D/DlHDBIGzXvzx3EwQPzoRT7Mf9djXfdeCPPjeMWKFhaKYuETTG\nHpOQxtOPGG6VBtCwhuExx6v47a/jH0KAMtDizB2xpwKBgQD9cABBdLB3wqrkvDU7\nQJU1p11Hj/gpqoB3pnCmGn0TTOrMRJ0FXaKU4lie6decWhVj/mqOR3wjns3ffglD\nGKbxerNtT/3A4uZn/Si6qAdZJmhNyVf0PoFDB/31Ud+eRhF7DgonKYNwO7J1u57n\n9Lr31zSck+HQ5V1RYptUjHIwvwKBgQDh0d6yL6GCWFlpyQdBhm7SQILK+QTAdqPp\n2N8eRJeGb/CBPFiKKgM69B1k+KdPYr/Ef/LIoB2a/T8NTS1769vqAffWSWrAeX71\nzFxzRxG+EKnetnl4x4a8yQOm6qPGXpxnnBlxPKyMTnF3uqu/u9D/6vhYhunUXfjV\n7U1NfEDGawKBgADX0IhnNPcRBLSCE8NAsb5d8id8yRyKXqcHPLSwvd3EkbtgNw1/\nhDzui9DrgjYY7p1IiV4zyqvrqU+nAazhdhyzhclFTNjJaG7MHsiQKoYXZJ1toAdF\n9fQdILEiNpY2MXSxVUNQFgnXiP5vQ1YOMFkGtDwZGdUyDh9pLo8XcIHNAoGBALq2\n+NeEIprPyj55hZJcQU1/IaYJ+C/a6PT16KXyOQdjjwyMhPjYfAtGxPcz0cMF92HW\nGTxhh5kbRAMPiUgpYJBASFfaJHY4/wzliJuYa8cnqA0J+64t6+40ltxwrjHbEJ9q\npm7GqDTqt08z/cZu2QSBmA46nySE/raDm6Mx1a05AoGBANiq3kLr2yB5RLLxEu1/\ndxSlrrFemk7xOtPxe8HenMxCP+IAnpXjCNAbgwaIFPKZ99sPiqNmiwy/96ngIPKX\nDjs3YVm3Sq5PAkgvJ4WL+ol6AZ1mcP0U/OqWqalBIU7r1OmAXC0SzBrv9daIL3M4\nauf5A9DlfEPcFjnAGkQwb0Q5\n-----END PRIVATE KEY-----"
};

let _auth: Auth | null = null;
let _firestore: Firestore | null = null;

function ensureInitialized() {
  if (!_auth || !_firestore) {
    if (!getApps().length) {
      try {
        console.log('[firebase-admin] Initializing with hardcoded service account');
        console.log('[firebase-admin] Project ID:', serviceAccount.projectId);
        console.log('[firebase-admin] Client Email:', serviceAccount.clientEmail);
        initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.projectId,
        });
        console.log('[firebase-admin] Firebase Admin initialized successfully');
      } catch (error) {
        console.error('[firebase-admin] Firebase Admin initialization error:', error);
        console.warn('[firebase-admin] Using mock mode due to initialization error');
      }
    }
    if (getApps().length > 0) {
      _auth = getAuth();
      _firestore = getFirestore();
      console.log('[firebase-admin] Auth and Firestore services initialized');
    } else {
      console.error('[firebase-admin] Failed to initialize Firebase - no apps created');
    }
  }
}

// Initialize immediately
try {
  ensureInitialized();
} catch (error) {
  console.error('[firebase-admin] Fatal initialization error:', error);
}

// Export with non-null type assertions - these will throw at runtime if not initialized
export const auth = _auth as unknown as Auth;
export const firestore = _firestore as unknown as Firestore;

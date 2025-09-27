
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  "type": "service_account",
  "project_id": "biblioangola",
  "private_key_id": "57cf20c150df25cc278b62354baf119212519838",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCfAoUxH13PO/uV\nKJNxepc5z8XqMHLsDrYABdOY9DTp0djtWdzpdhTTnSG01boaWg2hZZMVBqRhGCW6\ndXQQlIgJ40edUxu4aGJuu2lwVnauoICIExHXnoGrHyBx1wCdRtCKgmMrqJWnAWAe\nEx0HzXQn9CTCmvuw+76j/M9dFkJmKSinGfO8PbqtlZvJiL7uLsfvMHKo5sF325cO\nBLtm8JPtj6fO3K2Nklw4+udrcSRLTCTRVo9LpL6wkUc/kH+tKBnqhsdjdZNOeGNn\n78oOP5sdfgGE9x3qFlj/Rcvs0pwFn0vGmhpH1+D8hxXj/i2mXcjb44lGBXAyj+kW\nDqfvUtm7AgMBAAECggEAC7sg3m3k+tv/BJMYxZ94trAods2aPOYc8UV8xeUGXlW3\n/lLJ5INsp+wIx5GZCEaqiMS4pC14RR2F8wqlRG/g1XHqH6Y4/lLdKDQ1ZC9M1DWH\n3gIiJ9ku0dQbDasCBZhq3D0gWeE3IToNwEpCsweqUSRG7gCHHxiDiQ+msMRqo6S5\n00ax5haS3qzsx1lguFiAcGvVwzJy1/vrxM/uJ+Ufq+zEpU40VRXp2iSyyamzP31L\np9vOjMDaK1biyFmudpYi4ZO9LDY0z3wynK0oW68cRvX6OcmL9DlIEeg5+X3W+02U\nv6qy+jgnjWbRrr7sh1MmO9AB8lBREn++ghHd7ZX9mQKBgQDcXijXHpAFC6eiJAtc\n4Z1BqfNibOXk9/JoLnj9k15dX3JDAkrITXxckTWro4JW9AdJ71U/iOTIMd/MNEiz\ny3l992Dl7OG+LkDTLEpxV0qtf4NVzkpesL4hNsHJvlzu21+CJL6J4xNhUOzR1Jfo\nCBK94io5JVxGPhu5XzdxS1MdxwKBgQC4uIbxebPM+BXtIuneRytjAS/RHptA3WAQ\nEnGxci+zghKP8nzyk+Nv9BdbvfPxVcH2Mglxngk++DROjkzjpAUMG3YAz4JAuyPq\nMnH8Yg63Lvz9lR5Hk0oeTj6nZFEeJZzrSyjHrMTUF31Mm5Jcy8q42zam5CDN463m\nBYAdhQd0bQKBgFnbHyYQdUNJbFJGBkgaSwgyZ2az5s4FeFeY04b6Z1kFiU7fiWTB\ni7snDs5s/sG8AZjZOVaN2FP1Wj8m9poxltmRXHaEr8vfillRTw2GPZIfU4tScarI\nwM5ESKKdt8FBvGER4IvTBt0ApYAuAr7/Q70fkn34yPZvbtiYhb/xqfOTAoGAG2Eu\nj0hMwErdZSLRq2K9KBom7kYtGPY3MOqq83RLYb4b5j45CvOkuIljlPOY3uKpN0a/\nY5nbIPxFNIefGfbL0LmZShF36wRSFHqZrqESMVDDqwqZTF6mk8thOgqCg4drtOyV\nBNO08QLyTZKZpSuHxtKnTSFvQ1VGB1w1WyrGqhkCgYBhTVRWk4qv6F+GB9n2j2f/\nebzZu3U1/s1rGhAEiEQuoI1hmT0wSyMGR525lgokJJ9o6bLIWw/QQkF5QtMWal8c\nveQffkdwcd2jH9xTS51A9ubd6xWdjqlO2fsZ1xIO/EyAfLQPLgemTzQArsoAmUUv\nVX2LYtsbqKB8JkUL/h+gqQ==\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
  "client_email": "firebase-adminsdk-fbsvc@biblioangola.iam.gserviceaccount.com",
};

// Initialize Firebase Admin SDK
if (!getApps().length) {
  console.log('[firebase-admin] Initializing Firebase Admin SDK...');
  initializeApp({
    credential: cert(JSON.stringify(serviceAccount)),
  });
  console.log('[firebase-admin] Firebase Admin SDK initialized successfully.');
}

const auth = getAuth();
const firestore = getFirestore();

export { auth, firestore };

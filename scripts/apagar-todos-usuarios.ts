import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Configuração do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCq_Qnb-cDsWzij6bj39g-uaaKY7Ild9cw",
  authDomain: "gesto-de-turnover.firebaseapp.com",
  projectId: "gesto-de-turnover",
  storageBucket: "gesto-de-turnover.appspot.com",
  messagingSenderId: "523995517168",
  appId: "1:523995517168:web:6479f21037d1aa8ebcb235"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

async function apagarTodosUsuarios() {
  const usersCol = collection(db, 'users');
  const snapshot = await getDocs(usersCol);
  let count = 0;
  for (const userDoc of snapshot.docs) {
    await deleteDoc(doc(db, 'users', userDoc.id));
    console.log(`Usuário ${userDoc.id} apagado.`);
    count++;
  }
  console.log(`Total de usuários apagados: ${count}`);
}

apagarTodosUsuarios().then(() => {
  console.log('Processo concluído.');
  process.exit(0);
});

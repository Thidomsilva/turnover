import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';


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

async function criarUsuarios() {
  const usuarios = [
    { email: 'marlon.carvalho@eletropolar.com.br', senha: 'marlon123', nome: 'Marlon', role: 'user' },
    { email: 'karin@sagacy.com.br', senha: 'karin123', nome: 'Karin', role: 'user' },
    { email: 'marcos@sagacy.com.br', senha: 'marcos123', nome: 'Marcos', role: 'user' },
    { email: 'larissa.eduarda@eletropolar.com.br', senha: 'larissa123', nome: 'Larissa', role: 'user' },
    { email: 'paulo@eletropolar.com.br', senha: 'paulo123', nome: 'Paulo', role: 'user' },
    { email: 'thiago@sagacy.com.br', senha: 'thiago123', nome: 'Thiago', role: 'admin' },
  ];

  for (const usuario of usuarios) {
    await addDoc(collection(db, 'users'), usuario);
    console.log(`Usuário ${usuario.email} criado.`);
  }
}

criarUsuarios().then(() => {
  console.log('Todos os usuários foram criados.');
  process.exit(0);
});

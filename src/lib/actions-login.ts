'use server';

import type { User } from "./types";

// Lista de usuários permitidos codificada diretamente.
// A senha é o primeiro nome em minúsculas + 123.
const allowedUsers: Omit<User, 'uid'>[] = [
    {
        name: 'Thiago Sagacy',
        email: 'thiago@sagacy.com.br',
        password: 'thiago123',
        role: 'Administrador'
    },
    {
        name: 'Marlon Carvalho',
        email: 'marlon.carvalho@eletropolar.com.br',
        password: 'marlon123',
        role: 'Usuário'
    },
    {
        name: 'Paulo',
        email: 'paulo@eletropolar.com.br',
        password: 'paulo123',
        role: 'Usuário'
    },
    {
        name: 'Larissa Eduarda',
        email: 'larissa.eduarda@eletropolar.com.br',
        password: 'larissa123',
        role: 'Usuário'
    },
    {
        name: 'Marcos',
        email: 'marcos@sagacy.com.br',
        password: 'marcos123',
        role: 'Usuário'
    },
    {
        name: 'Usuário Padrão',
        email: 'usuario@sagacy.com.br',
        password: 'usuario123',
        role: 'Usuário'
    }
];

/**
 * Faz o login de um usuário verificando as credenciais em uma lista codificada.
 * @param email O email do usuário.
 * @param password A senha do usuário.
 * @returns Os dados do usuário se as credenciais forem válidas, caso contrário, nulo.
 */
export async function loginUserAction(email: string, password: string): Promise<Omit<User, 'uid' | 'password'> | null> {
  try {
    if (!email || !password) {
      return null;
    }

    const foundUser = allowedUsers.find(
      user => user.email.toLowerCase() === email.toLowerCase() && user.password === password
    );

    if (foundUser) {
      console.log(`Login successful for ${email}`);
      // Retorna o usuário sem o UID, pois não estamos usando Firebase Auth aqui.
      // E também sem a senha, por segurança.
      const { password: _, ...userToReturn } = foundUser;
      return userToReturn;
    } else {
      console.log(`Login failed: Invalid credentials for email ${email}`);
      return null;
    }
  } catch (error) {
    console.error("Error in loginUserAction: ", error);
    return null;
  }
}

/**
 * Retorna a lista de usuários codificados.
 */
export async function getHardcodedUsers(): Promise<Omit<User, 'password' | 'uid'>[]> {
    return allowedUsers.map(u => {
        const { password, ...user } = u;
        return user;
    });
}
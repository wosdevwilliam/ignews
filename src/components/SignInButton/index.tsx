import { FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

// Para login apos ter configurado o NextAuth
import { signIn, signOut, useSession } from 'next-auth/client';

import styles from './styles.module.scss';

export function SignInButton() {
    const [session] = useSession();

    console.log(session);

    // Verificar se está logado
    return session ? (
        <button
            type="button"
            className={styles.SignInButton}
            onClick={() => signOut()}
        >
            <FaGithub color="#04d361" />
            {session.user.name}
            <FiX color="#737380" className={styles.closeIcon}/>
        </button>

    ): (
        <button
            type = "button"
            className = {styles.SignInButton}
            onClick={() => signIn('github')}
        >
            <FaGithub color="#eba417" />
            Sign in with Github
        </button >
    )
}
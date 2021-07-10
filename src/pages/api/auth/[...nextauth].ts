import { query as q } from 'faunadb';

import NextAuth from 'next-auth';
import { session } from 'next-auth/client';
import Providers from 'next-auth/providers';

import { fauna } from '../../../services/fauna';

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user'
    }),
  ],

  // Corrigindo o error do JWT_GENERATED_SIGNING_KEY - Ver Documentação NextAuth.Js sobre JWT
  /*  jwt: {
     signingKey: process.env.SIGNING_KEY,
   }, */

  callbacks: {
    async session(session) {
      // Buscar se o usuario tem seção ativa ou não
      try {
        const userActiveSubscription = await fauna.query(
          q.Get(
           q.Intersection([
            q.Match(
              q.Index('subscription_by_user_ref'),
              q.Select(
                "ref",
                q.Get(
                  q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email)
                  )
                )
              )
            ),
            q.Match(
              q.Index('subscription_by_status'),
              "active"
            )
            ])
          )
        )
  
        return {
          ...session,
          activeSubscription: userActiveSubscription
        }

      } catch {
        return {
          ...session,
          activeSubscription: null
        }

      }
    },

    async signIn(user, account, profile) {
      const { email } = user

      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index('user_by_email'),
                  q.Casefold(user.email)
                )
              )
            ),
            q.Create(
              q.Collection('users'),
              { data: { email } }
            ),
            q.Get(
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(user.email)
              )
            )
          )
        )

        return true
      } catch {
        return false
      }
    },
  }
})
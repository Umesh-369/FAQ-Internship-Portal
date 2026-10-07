import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register') || nextUrl.pathname.startsWith('/admin/login');
      const isAdminRoute = nextUrl.pathname.startsWith('/admin') && !nextUrl.pathname.startsWith('/admin/login');
      
      // Protected user routes
      const isDashboardRoute = 
        nextUrl.pathname.startsWith('/dashboard') || 
        nextUrl.pathname.startsWith('/raise-query') || 
        nextUrl.pathname.startsWith('/suggest-faq') || 
        nextUrl.pathname.startsWith('/query-status');

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        // Verify role is admin
        return auth?.user?.role === 'admin';
      }

      if (isDashboardRoute) {
        if (!isLoggedIn) return false;
        return true;
      }

      if (isAuthRoute) {
        if (isLoggedIn) {
          // Redirect logged in users away from auth pages
          if (auth?.user?.role === 'admin') {
            return Response.redirect(new URL('/admin/dashboard', nextUrl));
          }
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return true;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;


import { MainNav } from '@/components/main-nav';
import { Search } from '@/components/search';
import { UserNav } from '@/components/user-nav';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 md:px-8">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <Search />
            <UserNav />
          </div>
        </div>
      </div>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          {children}
      </main>
      <footer className="py-4 px-8 text-center text-xs text-muted-foreground">
        <p>Desenvolvido por: thiago@sagacy.com.br</p>
      </footer>
    </div>
  );
}

import { LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { logout } from "../actions/auth";

const LogoutButton = ({ slug }: { slug: string }) => (
  <form action={logout.bind(null, slug)}>
    <Button type="submit" variant="ghost" size="sm" className="rounded-full">
      <LogOutIcon />
      Sair
    </Button>
  </form>
);

export default LogoutButton;

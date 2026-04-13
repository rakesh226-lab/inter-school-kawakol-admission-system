import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ADMIN_USERNAME = "interschoolkawakol";
const ADMIN_PASSWORD = "InterSchool@951";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (
      formData.username === ADMIN_USERNAME &&
      formData.password === ADMIN_PASSWORD
    ) {
      sessionStorage.setItem("adminAuthenticated", "true");
      // Clear all cached query data so admin dashboard fetches fresh data
      await queryClient.invalidateQueries();
      await queryClient.removeQueries({ queryKey: ["allApplications"] });
      toast.success("Admin login successful");
      navigate({ to: "/admin/dashboard" });
    } else {
      toast.error("Invalid admin credentials");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-center">
            Authorized personnel only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter admin username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                data-ocid="admin_login.username.input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                data-ocid="admin_login.password.input"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-ocid="admin_login.submit_button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Login as Admin"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

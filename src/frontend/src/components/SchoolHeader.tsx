import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Shield } from "lucide-react";

export default function SchoolHeader() {
  const navigate = useNavigate();

  return (
    <header className="relative text-white shadow-lg overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/assets/uploads/2f479a0a-c6d1-4a72-a0c8-c075657194eb-1.jpg')",
        }}
        aria-hidden="true"
      />
      {/* Dark overlay for readability */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/50 to-black/65"
        aria-hidden="true"
      />
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-4">
          <img
            src="/assets/generated/school-logo.dim_1024x1024.png"
            alt="ISK Logo"
            className="h-20 w-20 md:h-24 md:w-24 object-contain drop-shadow-lg"
          />
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight drop-shadow-md">
              राजकीयकृत उच्च माध्यमिक विद्यालय कौआकोल - (नवादा)
            </h1>
            <p className="text-base md:text-lg font-semibold text-white/90 drop-shadow-md mt-0.5">
              मॉडल स्कूल कौआकोल - (नवादा) - 805106
            </p>
            <p className="text-lg md:text-xl font-semibold text-yellow-300 drop-shadow-md mt-0.5">
              स्थापित - 1957 ई.
            </p>
            <p className="text-sm md:text-base text-white/90 mt-1 drop-shadow-sm">
              RAJKIYAKRIT UCHCH MADHYAMIK VIDYALAYA KAWAKOL - (NAWADA)
            </p>
          </div>
        </div>

        {/* Admin Login button — top-right corner */}
        <div className="absolute top-4 right-4 md:top-5 md:right-5">
          <Button
            variant="outline"
            size="sm"
            data-ocid="header.admin_login_button"
            onClick={() => navigate({ to: "/admin/login" })}
            className="border-white/50 bg-white/10 text-white hover:bg-white/25 hover:border-white/80 hover:text-white backdrop-blur-sm transition-all duration-200 gap-1.5 text-xs md:text-sm"
          >
            <Shield className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Admin Login
          </Button>
        </div>
      </div>
    </header>
  );
}

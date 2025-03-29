import { useState, useEffect } from "react";
import { Link } from "wouter";
import { DoctorProfile } from "@/types";
import { useQuery } from "@tanstack/react-query";
import DoctorCard from "@/components/doctors/doctor-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DoctorList() {
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

  // Fetch featured doctors (limited to 3 for homepage)
  const { data: doctors = [], isLoading } = useQuery<DoctorProfile[]>({
    queryKey: ['/api/doctors', { available: true }],
  });

  // Calculate pagination values
  const totalPages = Math.ceil(doctors.length / itemsPerPage);
  const paginatedDoctors = doctors.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Reset to page 1 when doctors change
  useEffect(() => {
    setPage(1);
  }, [doctors.length]);

  // Handle pagination
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // If there are no doctors or loading, show a loading state
  if (isLoading) {
    return (
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-10">
            <h2 className="text-3xl font-bold text-neutral-900">Médicos disponibles</h2>
            <p className="mt-4 max-w-2xl text-xl text-neutral-500 lg:mx-auto">
              Cargando médicos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-10">
          <h2 className="text-3xl font-bold text-neutral-900">Médicos destacados</h2>
          <p className="mt-4 max-w-2xl text-xl text-neutral-500 lg:mx-auto">
            Selecciona el médico que mejor se adapte a tus necesidades
          </p>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedDoctors.length > 0 ? (
            paginatedDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-neutral-500">No hay médicos disponibles en este momento</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <nav className="inline-flex shadow-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 1}
                className="rounded-l-md"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1">Anterior</span>
              </Button>

              {Array.from({ length: totalPages }).map((_, index) => (
                <Button
                  key={index}
                  variant={page === index + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(index + 1)}
                  className="rounded-none"
                >
                  {index + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="rounded-r-md"
              >
                <span className="mr-1">Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        )}

        {/* View all doctors link */}
        <div className="mt-8 text-center">
          <Link href="/doctors">
            <Button variant="link" className="text-primary-500">
              Ver todos los médicos disponibles
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Star } from "lucide-react";

interface RatingFormProps {
  appointmentId: number;
  revieweeId: number;
  onSuccess?: () => void;
}

const reviewSchema = z.object({
  rating: z.number().min(1, "Por favor, selecciona una calificación").max(5),
  comment: z.string().min(3, "El comentario es demasiado corto").max(500, "El comentario es demasiado largo"),
});

export default function RatingForm({ appointmentId, revieweeId, onSuccess }: RatingFormProps) {
  const { toast } = useToast();
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const submitReview = useMutation({
    mutationFn: async (data: z.infer<typeof reviewSchema>) => {
      const response = await apiRequest("POST", "/api/reviews", {
        appointmentId,
        revieweeId,
        rating: data.rating,
        comment: data.comment,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reseña enviada",
        description: "Gracias por compartir tu experiencia",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: [`/api/doctors/${revieweeId}`] });
      
      if (onSuccess) {
        onSuccess();
      }
      
      form.reset();
    },
    onError: (error) => {
      console.error("Error submitting review:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar la reseña. Inténtalo de nuevo.",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof reviewSchema>) => {
    submitReview.mutate(data);
  };

  const handleStarClick = (rating: number) => {
    form.setValue("rating", rating);
  };

  const handleStarHover = (rating: number) => {
    setHoveredRating(rating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const renderStars = () => {
    const stars = [];
    const currentRating = hoveredRating || form.getValues().rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-8 w-8 cursor-pointer ${
            i <= currentRating ? "text-yellow-400 fill-current" : "text-neutral-300"
          }`}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleStarLeave}
        />
      );
    }

    return stars;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={() => (
            <FormItem>
              <FormLabel>Calificación</FormLabel>
              <FormControl>
                <div className="flex space-x-1">
                  {renderStars()}
                </div>
              </FormControl>
              <FormDescription>
                {form.getValues().rating === 0
                  ? "Selecciona una calificación"
                  : `Has seleccionado ${form.getValues().rating} ${
                      form.getValues().rating === 1 ? "estrella" : "estrellas"
                    }`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentario</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Comparte tu experiencia con este profesional"
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormDescription>
                Tu opinión ayuda a otros pacientes a elegir el médico adecuado
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={submitReview.isPending || form.getValues().rating === 0}
        >
          {submitReview.isPending ? "Enviando..." : "Enviar reseña"}
        </Button>
      </form>
    </Form>
  );
}

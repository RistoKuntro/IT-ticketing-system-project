// client/src/components/TicketForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "./FormField";

const schema = z.object({
  title: z
    .string()
    .min(5, "Pealkiri peab olema vähemalt 5 tähemärki")
    .max(100, "Pealkiri on liiga pikk"),
  description: z
    .string()
    .min(10, "Kirjeldus peab olema vähemalt 10 tähemärki")
    .max(1000, "Kirjeldus on liiga pikk"),
});

type FormData = z.infer<typeof schema>;

interface TicketFormProps {
  onSubmit: (data: { title: string; description: string }) => Promise<void>;
  onCancel: () => void;
}

export default function TicketForm({ onSubmit, onCancel }: TicketFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Pealkiri" error={errors.title?.message} required>
        <input
          {...register("title")}
          className="input"
          placeholder="Lühike probleemi kirjeldus"
        />
      </FormField>
      
      <FormField label="Kirjeldus" error={errors.description?.message} required>
        <textarea
          {...register("description")}
          className="input"
          rows={4}
          placeholder="Kirjelda probleemi täpsemalt..."
        />
      </FormField>
      

      
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Tühista
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Salvestamine..." : "Loo pilet"}
        </button>
      </div>
    </form>
  );
}
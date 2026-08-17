import type { Activity } from "../types/activity";

export const activities: Activity[] = [
  {
    id: "1",
    title: "Corrida no Parque",
    description: "Treino leve de corrida ao ar livre.",
    category: "Corrida",
    date: "2025-05-10T07:00:00",
    location: "Parque da Cidade",
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5",

    organizer: "João Silva",

    participants: 20,

    maxParticipants: 20,

    requiresApproval: false,

    status: "open",
  },

  {
    id: "2",
    title: "Pedal de Domingo",
    description: "Passeio de bike em grupo.",
    category: "Ciclismo",
    date: "2025-05-12T08:30:00",
    location: "Orla da Praia",
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b",

    organizer: "Maria Souza",

    participants: 8,

    maxParticipants: 15,

    requiresApproval: true,

    status: "open",
  },

  {
    id: "3",
    title: "Yoga ao nascer do sol",
    description: "Aula coletiva de yoga para iniciantes.",
    category: "Yoga",
    date: "2025-05-15T06:00:00",
    location: "Praça Central",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773",

    organizer: "Ana Lima",

    participants: 16,

    maxParticipants: 25,

    requiresApproval: false,

    status: "open",
  },
];
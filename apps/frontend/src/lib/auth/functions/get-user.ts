import { useQuery } from "@tanstack/react-query";

// Client-side hook for getting user data
export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("/api/user");
      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      return (data as { user: any }).user;
    },
  });
}

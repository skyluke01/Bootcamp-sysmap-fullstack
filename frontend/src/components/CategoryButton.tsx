import { Button } from "./ui/button";

type CategoryButtonProps = {
  category: string;
  onClick: () => void;
};

export function CategoryButton({
  category,
  onClick,
}: CategoryButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="
        rounded-full
        hover:border-emerald-500
        hover:text-emerald-600
      "
    >
      {category}
    </Button>
  );
}
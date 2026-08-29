import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { Button } from "#/shared/components/ui/button";
import { cn } from "#/shared/utils/cn";

type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

type PaginationProps = {
  className?: string;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  page: number;
  totalPages: number;
};

function getPaginationItems(page: number, totalPages: number): Array<PaginationItem> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, "end-ellipsis", totalPages];
  }

  if (page >= totalPages - 2) {
    return [1, "start-ellipsis", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "start-ellipsis", page - 1, page, page + 1, "end-ellipsis", totalPages];
}

function Pagination({
  className,
  isLoading = false,
  onPageChange,
  page,
  totalPages,
}: PaginationProps) {
  const paginationItems = getPaginationItems(page, totalPages);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-end gap-2", className)}>
      <Button
        aria-label="Go to previous page"
        disabled={isLoading || !hasPreviousPage}
        onClick={() => onPageChange(page - 1)}
        type="button"
        variant="outline"
      >
        <ChevronLeft className="size-4" />
        Prev
      </Button>

      <div className="flex items-center gap-1">
        {paginationItems.map((item) =>
          typeof item === "number" ? (
            <Button
              aria-current={item === page ? "page" : undefined}
              aria-label={`Go to page ${item}`}
              disabled={isLoading}
              key={item}
              onClick={() => onPageChange(item)}
              size="icon"
              type="button"
              variant={item === page ? "primary" : "outline"}
            >
              {item}
            </Button>
          ) : (
            <span
              aria-hidden="true"
              className="text-muted flex size-9 items-center justify-center"
              key={item}
            >
              <MoreHorizontal className="size-4" />
            </span>
          ),
        )}
      </div>

      <Button
        aria-label="Go to next page"
        disabled={isLoading || !hasNextPage}
        onClick={() => onPageChange(page + 1)}
        type="button"
        variant="outline"
      >
        Next
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}

export { Pagination };

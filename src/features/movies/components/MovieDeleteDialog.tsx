// Movie delete is intentionally disabled in the admin UI for now.
export const isMovieDeleteDisabled = true;
//
// import { Trash2 } from "lucide-react";
// import { useState } from "react";
//
// import { moviesApi } from "../services/moviesApi";
// import type { Movie } from "../types/movieTypes";
//
// import { Button } from "#/shared/components/ui/button";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "#/shared/components/ui/dialog";
// import { toast } from "#/shared/components/ui/toast";
// import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
//
// type MovieDeleteDialogProps = {
//   movie: Movie;
//   onDeleted: () => void;
//   size?: "md" | "sm";
// };
//
// export function MovieDeleteDialog({ movie, onDeleted, size = "md" }: MovieDeleteDialogProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//
//   async function handleDeleteMovie() {
//     setIsDeleting(true);
//     setErrorMessage(null);
//
//     try {
//       await moviesApi.delete(movie.id);
//       toast.success({ title: "Movie Deleted." });
//       setIsOpen(false);
//       onDeleted();
//     } catch (error) {
//       setErrorMessage(getApiErrorMessage(error, "Unable To Delete Movie."));
//     } finally {
//       setIsDeleting(false);
//     }
//   }
//
//   return (
//     <Dialog onOpenChange={setIsOpen} open={isOpen}>
//       <DialogTrigger asChild>
//         <Button size={size} type="button" variant="destructive">
//           <Trash2 className="size-4" />
//           Delete
//         </Button>
//       </DialogTrigger>
//
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Delete Movie?</DialogTitle>
//           <DialogDescription>
//             This Will Soft Delete {movie.title} And Remove It From Admin Movie Lists.
//           </DialogDescription>
//         </DialogHeader>
//
//         {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}
//
//         <DialogFooter>
//           <DialogClose asChild>
//             <Button disabled={isDeleting} type="button" variant="outline">
//               Cancel
//             </Button>
//           </DialogClose>
//           <Button
//             disabled={isDeleting}
//             onClick={handleDeleteMovie}
//             type="button"
//             variant="destructive"
//           >
//             <Trash2 className="size-4" />
//             {isDeleting ? "Deleting..." : "Delete Movie"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

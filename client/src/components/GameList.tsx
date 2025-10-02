import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import GameInfo from "./GameInfo";
import { Button } from "./ui/button";

const GameList = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { isPending, data, error } = useQuery({
    queryKey: ["games", currentPage, 3],
    queryFn: async () => {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/game/all?page=${currentPage}&limit=3`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }
      const data = await response.json();
      console.log({ data });
      return data;
    },
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (error) {
    return <p className="text-red-500">Error loading games: {error.message}</p>;
  }

  return (
    <div className="flex flex-col justify-center items-center">
      {/* Pagination Controls */}
      <div className="flex justify-between items-center p-4 rounded-lg">
        {data?.pagination && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!data.pagination.hasPrevPage}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {data.pagination.currentPage} of {data.pagination.totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!data.pagination.hasNextPage}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Games List */}
      {isPending && <p className="text-gray-500">Loading...</p>}
      {data?.games && data.games.length > 0 ? (
        <div className="flex flex-col gap-4 justify-center items-center">
          {data.games.map((game: any) => (
            <div key={game._id}>
              <GameInfo game={game} />
            </div>
          ))}
        </div>
      ) : (
        !isPending && <p className="text-gray-500">No games found</p>
      )}

      {/* Total Games Info */}
      {data?.pagination && (
        <div className="text-center text-sm text-gray-500">
          Showing {data.games.length} of {data.pagination.totalGames} games
        </div>
      )}
    </div>
  );
};

export default GameList;

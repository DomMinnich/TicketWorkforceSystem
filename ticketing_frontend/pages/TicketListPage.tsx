import React, { useEffect, useState, useCallback, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Ticket, TicketDepartment } from "../types";
import * as ticketService from "../services/ticketService";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Select } from "../components/common/Select";
import TicketCard from "../components/tickets/TicketCard";
import { useNotifications } from "../hooks/useNotifications";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { DEPARTMENTS } from "../constants";
import { useAuth } from "../hooks/useAuth";

const TicketListPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [includeShimmer, setIncludeShimmer] = useState(true);
  const { addNotification } = useNotifications();

  // New state variables for filters and pagination
  const [statusFilter, setStatusFilter] = useState("open");
  const [sortBy, setSortBy] = useState("date_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [allFetchedTickets, setAllFetchedTickets] = useState<Ticket[]>([]);
  const TICKETS_PER_PAGE = 15;

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: {
        search?: string;
        department?: string;
        include_shimmer?: boolean;
        status?: string;
        sort_by?: string;
      } = {};

      if (searchTerm) params.search = searchTerm;
      if (departmentFilter) params.department = departmentFilter;
      if (user?.role === "admin") {
        params.include_shimmer = includeShimmer;
      } else {
        params.include_shimmer = false;
      }

      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (sortBy) {
        params.sort_by = sortBy;
      }

      console.log("Fetching tickets with params:", params);

      const fetchedTicketsFromApi = await ticketService.getTickets(params);
      setAllFetchedTickets(fetchedTicketsFromApi);
      setCurrentPage(1); // Reset to first page whenever new full list is fetched
    } catch (err: any) {
      setError(err.message || "Failed to fetch tickets");
      addNotification(err.message || "Failed to fetch tickets", "error");
      setAllFetchedTickets([]);
    } finally {
      setLoading(false);
    }
  }, [
    searchTerm,
    departmentFilter,
    statusFilter, // Make sure this is included
    sortBy, // Make sure this is included
    includeShimmer,
    user?.role,
    addNotification,
  ]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    // This effect handles pagination and fetching comment counts for the current page's tickets
    const updateDisplayedTicketsAndFetchComments = async () => {
      if (allFetchedTickets.length === 0) {
        setTickets([]);
        return;
      }

      const indexOfLastTicket = currentPage * TICKETS_PER_PAGE;
      const indexOfFirstTicket = indexOfLastTicket - TICKETS_PER_PAGE;
      const currentTicketsSlice = allFetchedTickets.slice(
        indexOfFirstTicket,
        indexOfLastTicket
      );

      if (currentTicketsSlice.length > 0) {
        // Fetch comment counts only for the tickets on the current page
        const ticketsWithCounts = await Promise.all(
          currentTicketsSlice.map(async (ticket) => {
            try {
              const countData = await ticketService.getCommentsCount(ticket.id);
              return { ...ticket, total_comments: countData.total_comments };
            } catch (commentError) {
              console.warn(
                `Failed to fetch comment count for ticket ${ticket.id}:`,
                commentError
              );
              return { ...ticket, total_comments: 0 }; // Default to 0 if count fails
            }
          })
        );
        setTickets(ticketsWithCounts);
      } else {
        setTickets([]); // If slice is empty (e.g., page out of bounds)
      }
    };

    updateDisplayedTicketsAndFetchComments();
  }, [allFetchedTickets, currentPage, TICKETS_PER_PAGE]);

  const departmentOptions = [
    { value: "", label: "All Departments" },
    ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
  ];
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
  ];
  const sortByOptions = [
    { value: "date_desc", label: "Newest First" },
    { value: "date_asc", label: "Oldest First" },
  ];

  const totalPages = Math.ceil(allFetchedTickets.length / TICKETS_PER_PAGE);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Handlers for filter changes - these should trigger immediate re-fetch
  const handleSearchTermChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Optional: Add debouncing here for search
  };

const handleDepartmentFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
  setDepartmentFilter(e.target.value);
};

const handleIncludeShimmerChange = (e: ChangeEvent<HTMLInputElement>) => {
  setIncludeShimmer(e.target.checked);
};

const handleStatusFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
  setStatusFilter(e.target.value);
};

const handleSortByChange = (e: ChangeEvent<HTMLSelectElement>) => {
  setSortBy(e.target.value);
};

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Tickets
        </h1>
        <Link to="/tickets/new">
          <Button variant="primary" icon={<PlusIcon className="h-5 w-5" />}>
            Create New Ticket
          </Button>
        </Link>
      </div>

      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6 items-end">
          <Input
            label="Search Tickets"
            id="search-tickets"
            type="text"
            placeholder="Search by title, description, user..."
            value={searchTerm}
            onChange={handleSearchTermChange}
            icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
          />
          <Select
            label="Filter by Department"
            id="department-filter"
            options={departmentOptions}
            value={departmentFilter}
            onChange={handleDepartmentFilterChange}
          />
          <Select
            label="Filter by Status"
            id="status-filter"
            options={statusOptions}
            value={statusFilter}
            onChange={handleStatusFilterChange}
          />
          <Select
            label="Sort By"
            id="sort-by-filter"
            options={sortByOptions}
            value={sortBy}
            onChange={handleSortByChange}
          />
          {user?.role === "admin" && (
            <div className="flex items-center space-x-2 mt-2 sm:mt-0 sm:col-span-2 lg:col-span-1 xl:col-span-full">
              {" "}
              <input
                type="checkbox"
                id="includeShimmer"
                checked={includeShimmer}
                onChange={handleIncludeShimmerChange}
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label
                htmlFor="includeShimmer"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Include Admin Only Tickets
              </label>
            </div>
          )}
        </div>
        {/* Remove or make the manual refresh button optional */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={fetchTickets}
            variant="ghost"
            className="w-full sm:w-auto"
          >
            Manual Refresh
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center mt-8">
          <LoadingSpinner size="lg" />
        </div>
      )}
      {error && (
        <p className="text-center text-red-500 dark:text-red-400">{error}</p>
      )}

      {!loading && !error && allFetchedTickets.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
          No tickets found matching your criteria.
        </p>
      )}

      {!loading && !error && tickets.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-4">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                variant="secondary"
              >
                Previous
              </Button>
              <span className="text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                variant="secondary"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
      {/* Case where allFetchedTickets > 0 but current page tickets is 0 (e.g. after filtering, current page is now out of bounds) */}
      {!loading &&
        !error &&
        allFetchedTickets.length > 0 &&
        tickets.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
            No tickets on this page. Page {currentPage} of {totalPages}.
          </p>
        )}
    </div>
  );
};

export default TicketListPage;

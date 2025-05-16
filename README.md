//
  const fetchSampleRequests = useCallback(async () => {
    setSampleLoading(true);
    try {
      const filterParams = new URLSearchParams({
        page: sampleCurrentPage.toString(),
        limit: samplePagination.limit.toString(),
        search: encodeURIComponent(sampleSearchTerm),
        ...(filters.sample.status && {
          delivery_status: filters.sample.status,
        }),
        ...(filters.sample.coffeeVariety && {
          coffee_variety: filters.sample.coffeeVariety,
        }),
        ...(filters.sample.dateFrom && { date_from: filters.sample.dateFrom }),
        ...(filters.sample.dateTo && { date_to: filters.sample.dateTo }),
      }).toString();

      const response: any = await apiService().get(
        `/buyers/samples/get-sample-requests?${filterParams}`,
      );
      if (response.success && response.data) {
        setSampleRequests(response.data.sample_requests || null);
        setSamplePagination({
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          total: response.data.pagination.total,
          total_pages: response.data.pagination.total_pages,
        });
        setFetchedTabs((prev) => ({ ...prev, sample: true }));
      } else {
        setSampleError("Failed to fetch sample requests");
        setSampleRequests(null);
      }
    } catch (err: unknown) {
      const errorResponse = err as APIErrorResponse;
      setSampleError(errorResponse.error?.message || "An error occurred");
      setSampleRequests(null);
      errorMessage(errorResponse);
    } finally {
      setSampleLoading(false);
    }
  }, [sampleCurrentPage, sampleSearchTerm, filters.sample]);

  const fetchBids = useCallback(async () => {
    if (loading) return;

    setBidLoading(true);
    try {
      const filterParams = new URLSearchParams({
        page: bidCurrentPage.toString(),
        limit: bidPagination.limit.toString(),
        search: encodeURIComponent(bidSearchTerm),
        ...(filters.bids.status && { status: filters.bids.status }),
        ...(filters.bids.coffeeVariety && {
          coffee_variety: filters.bids.coffeeVariety,
        }),
        ...(filters.bids.dateFrom && { date_from: filters.bids.dateFrom }),
        ...(filters.bids.dateTo && { date_to: filters.bids.dateTo }),
      }).toString();

      const response: any = await apiService().get(
        `/buyers/bids/get-all-bids?${filterParams}`,
      );
      if (response.success) {
        setBids(response.data.bids || []);
        setBidPagination(
          response.data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            total_pages: 0,
          },
        );
        setFetchedTabs((prev) => ({ ...prev, bids: true }));
      } else {
        setBidError("Failed to fetch bids");
      }
    } catch (err: unknown) {
      const errorResponse = err as APIErrorResponse;
      setBidError(errorResponse.error?.message || "An error occurred");
      errorMessage(errorResponse);
    } finally {
      setBidLoading(false);
    }
  }, [bidCurrentPage, bidSearchTerm, filters.bids, loading]);

  const fetchFavorites = useCallback(async () => {
    if (!user?.id) {
      setFavoritesError("User not authenticated");
      setFavoritesLoading(false);
      return;
    }

    setFavoritesLoading(true);
    try {
      const filterParams = new URLSearchParams({
        page: favoritesCurrentPage.toString(),
        limit: favoritesPagination.limit.toString(),
        search: encodeURIComponent(favoritesSearchTerm),
        ...(filters.favorites.listingStatus && {
          listing_status: filters.favorites.listingStatus,
        }),
        ...(filters.favorites.dateFrom && {
          date_from: filters.favorites.dateFrom,
        }),
        ...(filters.favorites.dateTo && { date_to: filters.favorites.dateTo }),
      }).toString();

      const response: any = await apiService().get(
        `/buyers/listings/favorites/get-favorite-listings?${filterParams}`,
      );
      if (response.success) {
        setFavorites(response.data.favorites || []);
        setFavoritesPagination(
          response.data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            total_pages: 0,
          },
        );
        setFetchedTabs((prev) => ({ ...prev, favorites: true }));
      } else {
        setFavoritesError("Failed to fetch favorites");
      }
    } catch (err: unknown) {
      const errorResponse = err as APIErrorResponse;
      setFavoritesError(errorResponse.error?.message || "An error occurred");
      errorMessage(errorResponse);
    } finally {
      setFavoritesLoading(false);
    }
  }, [favoritesCurrentPage, favoritesSearchTerm, filters.favorites, user?.id]);

  useEffect(() => {
    if (activeTab === "current" && !fetchedTabs.current) {
      fetchActiveOrders();
    }
  }, [activeTab, fetchActiveOrders, fetchedTabs.current]);

  useEffect(() => {
    if (activeTab === "historical" && !fetchedTabs.historical) {
      fetchHistoricalOrders();
    }
  }, [activeTab, fetchHistoricalOrders, fetchedTabs.historical]);

  useEffect(() => {
    if (activeTab === "sample" && !fetchedTabs.sample) {
      fetchSampleRequests();
    }
  }, [activeTab, fetchSampleRequests, fetchedTabs.sample]);

  useEffect(() => {
    if (activeTab === "bids" && !fetchedTabs.bids) {
      fetchBids();
    }
  }, [activeTab, fetchBids, fetchedTabs.bids]);

  useEffect(() => {
    if (activeTab === "favorites" && !fetchedTabs.favorites) {
      fetchFavorites();
    }
  }, [activeTab, fetchFavorites, fetchedTabs.favorites]);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setExpandedOrderId(null);
  };

  const handleFilterChange = (
    tab: string,
    filter:
      | OrderFilterState
      | SampleFilterState
      | BidFilterState
      | FavoriteFilterState,
  ) => {
    setFilters((prev) => ({ ...prev, [tab]: filter }));
    setFetchedTabs((prev) => ({ ...prev, [tab]: false }));
    if (tab === "current") setActiveCurrentPage(1);
    if (tab === "historical") setHistoryCurrentPage(1);
    if (tab === "sample") setSampleCurrentPage(1);
    if (tab === "bids") setBidCurrentPage(1);
    if (tab === "favorites") setFavoritesCurrentPage(1);
  };

  const handleActiveSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, current: false }));
    fetchActiveOrders();
  };

  const handleHistorySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHistoryCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, historical: false }));
    fetchHistoricalOrders();
  };

  const handleSampleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSampleCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, sample: false }));
    fetchSampleRequests();
  };

  const handleBidSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setBidCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, bids: false }));
    fetchBids();
  };

  const handleFavoritesSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFavoritesCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, favorites: false }));
    fetchFavorites();
  };

  const openReviewModal = (order: Order, type: string) => {
    setSelectedOrder(order);
    setShowReviewModal(true);
    setReviewType(type || "add");
  };

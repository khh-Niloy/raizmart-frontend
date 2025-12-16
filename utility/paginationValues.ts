export const paginationValues = (searchParams: URLSearchParams) => {
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const sort = searchParams.get("sort") || "newest";
  return { page, limit, sort };
};

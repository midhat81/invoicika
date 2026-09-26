namespace WebAPI.Helpers
{
    public class PaginationResult<T>
    {
        public PaginationResult(IEnumerable<T> items, int totalCount, int currentPage, int pageSize)
        {
            Items = items;
            TotalCount = totalCount;
            CurrentPage = currentPage;
            PageSize = pageSize;
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        }

        public IEnumerable<T> Items { get; }
        public int TotalCount { get; }
        public int CurrentPage { get; }
        public int PageSize { get; }
        public int TotalPages { get; }
    }
}

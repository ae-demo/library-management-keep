function buildBooksPageLink(int pageLimit, int pageOffset, string? title, string? author, boolean? read, int? rating) returns string {
    string link = string `/books?limit=${pageLimit}&offset=${pageOffset}`;
    if title is string {
        link += "&title=" + title;
    }
    if author is string {
        link += "&author=" + author;
    }
    if read is boolean {
        link += "&read=" + read.toString();
    }
    if rating is int {
        link += "&rating=" + rating.toString();
    }
    return link;
}

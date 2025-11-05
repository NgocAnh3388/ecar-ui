export class UserSearch {
    searchValue: string;
    page: number;
    size: number;

    constructor(searchValue: string, page: number, size: number) {
        this.searchValue = searchValue;
        this.page = page;
        this.size = size;
    }
}
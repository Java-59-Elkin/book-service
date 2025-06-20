import {Author} from "../model/index.js";

export const findPublishersByAuthor = async (req, res) => {
    try {
        const {author} = req.params;
        const authorRecord = await Author.findByPk(author);
        if (!authorRecord) {
            return res.status(404). json({error: "Author not found"});
        }

        const books = await authorRecord.getBooks();
        const publisher = [...new Set(books.map(book => book.publisher))];
        return res.json(publisher);
    } catch {
        console.error('Error finding books by author', e);
        return res.status(500).json({error: 'Failed to find books by author'
        })
    }
}
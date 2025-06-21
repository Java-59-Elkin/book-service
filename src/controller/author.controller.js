import {Author, Book} from "../model/index.js";
import {sequelize} from "../config/database.js";

export const findBookAuthors = async (req, res) => {
    try {
        const {isbn} = req.params;
        const book = await Book.findByPk(isbn);
        if(!book) {
            return res.status(404).json({error: "Book not found"});
        }
        const authors = await book.getAuthors();
        const response = authors.map(author => ({
            name: author.name,
            birthDate: author.birthDate
        }))
        return res.json(response);
    } catch (e) {
        console.error('Error finding book authors', e);
        return res.status(500).json({error: 'Failed to find book authors'
        })
    }
}

export const removeAuthor = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {author} = req.params;
        const authorRecord = await Author.findByPk(author, {
            transaction: t
        });
        if(!authorRecord) {
            return res.status(404).json({error: "Author not found"});
        }
        await authorRecord.setBooks([], { transaction: t });
        await authorRecord.destroy({transaction: t});
        await t.commit();
        return res.json(authorRecord);
    } catch (e) {
        await t.rollback();
        console.error('Error deleting author:', e.message, e.stack);
        return res.status(500).json({
            error: 'Failed to delete author'
        })
    }
}
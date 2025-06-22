import {Author, Book} from "../model/index.js";
import {Sequelize} from "sequelize";

export const findPublishersByAuthor = async (req, res) => {
    try {
        const {author} = req.params;
        const authorRecord = await Author.findByPk(author);
        if (!authorRecord) {
            return res.status(404). json({error: "Author not found"});
        }
        const books = await Book.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('publisher')), 'publisher']
            ],
            include: [
                {
                    model: Author,
                    as: 'authors',
                    where: { name: author },
                    through: { attributes: [] }
                }
            ],
            raw: true
        });

        const publisher = books.map(book => book.publisher);
        return res.json(publisher);
    } catch (e) {
        console.error('Error finding books by author', e);
        return res.status(500).json({error: 'Failed to find books by author'
        })
    }
}

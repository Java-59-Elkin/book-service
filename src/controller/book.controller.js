import { sequelize } from "../config/database.js";
import { Book, Author, Publisher } from "../model/index.js";

export const addBook = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { isbn, title, publisher, authors } = req.body;

        // Проверка на дублирование книги
        const existingBook = await Book.findByPk(isbn, { transaction: t });
        if (existingBook) {
            await t.rollback();
            return res.status(409).json({
                error: `Book with ISBN ${isbn} already exists`
            });
        }

        // Найти или создать издателя
        let publisherRecord = await Publisher.findByPk(publisher);
        if (!publisherRecord) {
            publisherRecord = await Publisher.create(
                { publisherName: publisher },
                { transaction: t }
            );
        }

        // Найти или создать авторов
        const authorRecords = [];
        for (const author of authors) {
            const [authorRecord] = await Author.findOrCreate({
                where: { name: author.name },
                defaults: { birthDate: author.birthDate },
                transaction: t
            });
            authorRecords.push(authorRecord);
        }

        // Создание книги (без publisher)
        const book = await Book.create(
            { isbn, title },
            { transaction: t }
        );

        // Привязка publisher через ассоциацию
        await book.setPublisherDetails(publisherRecord, { transaction: t });

        // Привязка авторов
        await book.setAuthors(authorRecords, { transaction: t });

        await t.commit();
        return res.status(201).json({ message: 'Book added successfully', book });

    } catch (e) {
        await t.rollback();
        console.error('Error adding book:', e);
        return res.status(500).json({ error: 'Failed to add book' });
    }
};

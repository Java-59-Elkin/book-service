import Book from "./book.model.js";
import Publisher from "./publisher.model.js";
import Author from "./author.model.js";
import { sequelize } from "../config/database.js";

// Book and Author: Many-To-Many relationship
Book.belongsToMany(Author, {
    through: 'bookAuthor',
    foreignKey: 'isbn',
    otherKey: 'authorName',
    as: 'authors', // множество
});

Author.belongsToMany(Book, {
    through: 'bookAuthor',
    foreignKey: 'authorName',
    otherKey: 'isbn',
    as: 'books',
});

// Book and Publisher: Many-To-One relationship
Book.belongsTo(Publisher, {
    foreignKey: 'publisher',
    targetKey: 'publisherName',
    as: 'publisherDetails', // исправлена опечатка
});

Publisher.hasMany(Book, {
    foreignKey: 'publisher',
    sourceKey: 'publisherName',
    as: 'books',
});

const syncModels = async () => {
    try {
        await sequelize.sync({ alter: true }); // или { force: true } для полной пересборки
        console.log("Models have been synced successfully");
    } catch (e) {
        console.error("Unable to sync model", e);
    }
};

export { Book, Author, Publisher, syncModels };

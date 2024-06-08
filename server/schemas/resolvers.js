const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        // queries user
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id})
            }
            throw new AuthenticationError('You need to be logged in!')
        }, 
    },

    Mutation: {
        // creates a new user
        createUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        // logs in an existing user
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError;
            };

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw AuthenticationError;
            };

            const token = signToken(user);

            return { token, user };
        },
        // saves a book to saved books array
        saveBook: async (parent, { authors, description, bookId, image, link, title}, context) => {
            if (context.user) {
                const user = await User.findOneAndUpdate(
                    { _id: context.user._id},
                    { $addToSet: {
                        savedBooks: { authors: authors, description: description, bookId: bookId, image: image, link: link, title: title }
                    }},
                );

                return user;
            };
            throw AuthenticationError;
        },
        // removes book from savedBooks array
        deleteBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const user = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } }
                );

                return user;
            };
            throw AuthenticationError;
        },
    },
};

module.exports = resolvers;

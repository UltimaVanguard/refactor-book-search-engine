import { gql } from '@apollo/client';

// queries user
export const QUERY_ME = gql`
    query me{
        me {
            _id
            username
            email
            savedBooks {
                _id
                authors
                description
                bookId
                image
                link
                title
            }
        }
    }
`
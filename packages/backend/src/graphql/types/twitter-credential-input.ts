import { GraphQLString, GraphQLInputObjectType } from 'graphql';

const twitterCredentialInputType = new GraphQLInputObjectType({
  name: 'twitterCredentialInput',
  fields: {
    consumerKey: { type: GraphQLString },
    consumerSecret: { type: GraphQLString },
  }
})

export default twitterCredentialInputType;
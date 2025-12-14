import graphene
from projects.schema import Query as WorkspaceQuery, Mutation as WorkspaceMutation

class Query(WorkspaceQuery, graphene.ObjectType):
    pass

class Mutation(WorkspaceMutation, graphene.ObjectType):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)

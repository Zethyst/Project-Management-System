import graphene
from graphene_django import DjangoObjectType
from .models import Organization, Project, Task, TaskComment


class OrganizationType(DjangoObjectType):
    class Meta:
        model = Organization
        fields = '__all__'


class ProjectType(DjangoObjectType):
    class Meta:
        model = Project
        fields = '__all__'


class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = '__all__'


class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = '__all__'


class Query(graphene.ObjectType):
    # Organization queries
    organization_by_slug = graphene.Field(OrganizationType, slug=graphene.String(required=True))
    all_organizations = graphene.List(OrganizationType)
    
    # Project queries
    project = graphene.Field(ProjectType, id=graphene.ID(required=True))
    projects_by_org = graphene.List(ProjectType, org_slug=graphene.String(required=True))
    all_projects = graphene.List(ProjectType)
    
    # Task queries
    task = graphene.Field(TaskType, id=graphene.ID(required=True))
    tasks_by_project = graphene.List(TaskType, project_id=graphene.ID(required=True))
    
    # Comment queries
    comments_by_task = graphene.List(TaskCommentType, task_id=graphene.ID(required=True))

    def resolve_organization_by_slug(self, info, slug):
        try:
            return Organization.objects.get(slug=slug)
        except Organization.DoesNotExist:
            return None

    def resolve_all_organizations(self, info):
        return Organization.objects.all()

    def resolve_project(self, info, id):
        try:
            return Project.objects.get(id=id)
        except Project.DoesNotExist:
            return None

    def resolve_projects_by_org(self, info, org_slug):
        return Project.objects.filter(organization__slug=org_slug).order_by('-updated_at')

    def resolve_all_projects(self, info):
        return Project.objects.all().order_by('-updated_at')

    def resolve_task(self, info, id):
        try:
            return Task.objects.get(id=id)
        except Task.DoesNotExist:
            return None

    def resolve_tasks_by_project(self, info, project_id):
        return Task.objects.filter(project_id=project_id).order_by('-updated_at')

    def resolve_comments_by_task(self, info, task_id):
        return TaskComment.objects.filter(task_id=task_id).order_by('created_at')


class CreateProject(graphene.Mutation):
    class Arguments:
        organization_slug = graphene.String(required=True)
        name = graphene.String(required=True)
        status = graphene.String()
        priority = graphene.String()
        description = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)

    def mutate(self, info, organization_slug, name, status=None, priority=None, description=None, due_date=None):
        try:
            org = Organization.objects.get(slug=organization_slug)
            project = Project.objects.create(
                organization=org,
                name=name,
                status=status or 'active',
                priority=priority or 'medium',
                description=description or '',
                due_date=due_date
            )
            return CreateProject(project=project)
        except Organization.DoesNotExist:
            raise Exception(f"Organization with slug '{organization_slug}' not found")


class UpdateProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String()
        status = graphene.String()
        priority = graphene.String()
        description = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)

    def mutate(self, info, id, **kwargs):
        try:
            project = Project.objects.get(id=id)
            for field, value in kwargs.items():
                if value is not None:
                    setattr(project, field, value)
            project.save()
            return UpdateProject(project=project)
        except Project.DoesNotExist:
            raise Exception(f"Project with id '{id}' not found")


class DeleteProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            project = Project.objects.get(id=id)
            project.delete()
            return DeleteProject(success=True)
        except Project.DoesNotExist:
            return DeleteProject(success=False)


class CreateTask(graphene.Mutation):
    class Arguments:
        project_id = graphene.ID(required=True)
        title = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        priority = graphene.String()
        assignee_email = graphene.String()

    task = graphene.Field(TaskType)

    def mutate(self, info, project_id, title, description=None, status=None, priority=None, assignee_email=None):
        try:
            project = Project.objects.get(id=project_id)
            task = Task.objects.create(
                project=project,
                title=title,
                description=description or '',
                status=status or 'todo',
                priority=priority or 'medium',
                assignee_email=assignee_email or '',
            )
            return CreateTask(task=task)
        except Project.DoesNotExist:
            raise Exception(f"Project with id '{project_id}' not found")


class UpdateTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        status = graphene.String()
        priority = graphene.String()
        assignee_email = graphene.String()

    task = graphene.Field(TaskType)

    def mutate(self, info, id, **kwargs):
        try:
            task = Task.objects.get(id=id)
            for field, value in kwargs.items():
                if value is not None:
                    setattr(task, field, value)
            task.save()
            return UpdateTask(task=task)
        except Task.DoesNotExist:
            raise Exception(f"Task with id '{id}' not found")


class DeleteTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            task = Task.objects.get(id=id)
            task.delete()
            return DeleteTask(success=True)
        except Task.DoesNotExist:
            return DeleteTask(success=False)


class AddComment(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        content = graphene.String(required=True)
        author_email = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)

    def mutate(self, info, task_id, content, author_email):
        try:
            task = Task.objects.get(id=task_id)
            comment = TaskComment.objects.create(
                task=task,
                content=content,
                author_email=author_email,
            )
            return AddComment(comment=comment)
        except Task.DoesNotExist:
            raise Exception(f"Task with id '{task_id}' not found")


class CreateOrganization(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        slug = graphene.String(required=True)
        contact_email = graphene.String(required=True)

    organization = graphene.Field(OrganizationType)

    def mutate(self, info, name, slug, contact_email):
        organization, created = Organization.objects.get_or_create(
            slug=slug,
            defaults={
                'name': name,
                'contact_email': contact_email,
            }
        )
        if not created:
            # Update existing organization
            organization.name = name
            organization.contact_email = contact_email
            organization.save()
        return CreateOrganization(organization=organization)


class Mutation(graphene.ObjectType):
    create_organization = CreateOrganization.Field()
    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    delete_project = DeleteProject.Field()
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()
    add_comment = AddComment.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
